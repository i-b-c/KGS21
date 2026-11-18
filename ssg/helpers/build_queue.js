// @ts-check
// Build queue for site deploys triggered by Strapi saves.
//
// Strapi calls `enqueue` on every save. Each item is written as its own file into the
// queue directory, then the process waits for the build lock (build_lock.sh) and drains:
// it takes everything queued, prepares each item's data, and generates + deploys once.
// A burst of saves thus becomes one build; workers that get the lock to an empty queue
// exit at once. The queue is on disk, so it survives Strapi restarts.
//
// Usage: node helpers/build_queue.js enqueue <model> <id> <type>
//        (the `drain` command is internal: it must only run while holding the build lock)
//
// Runs on the server's Node 14: no node:test or newer syntax in this file.

const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const SSG_DIR = path.join(__dirname, '..')
const QUEUE_DIR = path.join(SSG_DIR, 'build_queue')
const LOG_FILE = path.join(SSG_DIR, 'logs', 'build.log')
const LOG_MAX_BYTES = 50 * 1024 * 1024
const NODE = process.execPath

/**
 * @typedef {{ model: string, id: number | string | null, type: string | null }} QueueItem
 * @typedef {{ label: string, steps: string[][] }} PreparedItem
 * @typedef {{ kind: 'none' } | { kind: 'full' } | { kind: 'targeted', items: PreparedItem[] }} Plan
 * @typedef {(argv: string[]) => boolean} Runner
 */

/**
 * Data steps per model for a targeted build, run from SSG_DIR. Each targeted helper adds
 * its pages to config.yaml's build paths, so several items can share one generation.
 * Models not listed here get a full build.
 *
 * @type {Record<string, (id: string, type: string) => string[][]>}
 */
const PREPARE_STEPS = {
    article: id => [[NODE, 'helpers/articles_from_yaml.js', '-t', id]],
    banner: () => [[NODE, 'helpers/banners_from_yaml.js', '-t']],
    event: (id, type) => type === 'project'
        ? [[NODE, 'helpers/projects_from_yaml.js', '-t']]
        : [
            [NODE, 'helpers/events_from_yaml.js', '-t', id],
            [NODE, 'helpers/performances_from_yaml.js', '-t', 'e', id],
            [NODE, 'helpers/calendar_json.js'],
        ],
    newscast: () => [[NODE, 'helpers/newscast_from_yaml.js', '-t']],
    performance: id => [
        [NODE, 'helpers/performances_from_yaml.js', '-t', id],
        [NODE, 'helpers/events_from_yaml.js', '-t', 'p', id],
        [NODE, 'helpers/calendar_json.js'],
    ],
    person: () => [
        [NODE, 'helpers/contact_persons_from_yaml.js', '-t'],
        [NODE, 'helpers/team_from_yaml.js'],
    ],
}

const RESET_PATHS = [NODE, 'helpers/reset_config_path_aliases.js']
const GENERATE = [NODE, './node_modules/entu-ssg/src/build.js', './config.yaml', 'full']
const DEPLOY = ['bash', './deploy.sh']
const FULL_BUILD = ['bash', './build.sh']

/**
 * @param {QueueItem} item
 * @returns {string}
 */
function itemLabel({ model, id, type }) {
    return `${model} ${id} ${type}`
}

/**
 * @param {QueueItem[]} items
 * @returns {Plan}
 */
function planBatch(items) {
    if (items.length === 0) {
        return { kind: 'none' }
    }
    if (items.some(item => !(item.model in PREPARE_STEPS))) {
        return { kind: 'full' }
    }
    /** @type {Map<string, PreparedItem>} */
    const unique = new Map()
    for (const item of items) {
        const label = itemLabel(item)
        if (!unique.has(label)) {
            unique.set(label, { label, steps: PREPARE_STEPS[item.model](String(item.id), String(item.type)) })
        }
    }
    return { kind: 'targeted', items: [...unique.values()] }
}

/**
 * Runs a plan. An item whose data step fails is skipped (its remaining steps too) so one
 * broken record cannot block everyone else's changes.
 *
 * @param {Plan} plan
 * @param {Runner} run
 * @returns {boolean} true when everything in the plan succeeded
 */
function runPlan(plan, run) {
    if (plan.kind === 'none') {
        return true
    }
    if (plan.kind === 'full') {
        return run(FULL_BUILD)
    }

    run(RESET_PATHS)
    let prepared = 0
    for (const item of plan.items) {
        if (item.steps.every(step => run(step))) {
            prepared++
        } else {
            log(`Skipping ${item.label}: a data step failed`)
        }
    }
    if (prepared === 0) {
        run(RESET_PATHS)
        return false
    }
    const generated = run(GENERATE)
    run(RESET_PATHS)
    if (!generated) {
        log('Generation failed, not deploying')
        return false
    }
    return run(DEPLOY) && prepared === plan.items.length
}

/**
 * Writes the item as its own file; the rename makes it appear atomically, so a drain
 * never reads a half-written item and never loses one written while it drains.
 *
 * @param {string} queueDir
 * @param {QueueItem} item
 */
function enqueueItem(queueDir, item) {
    fs.mkdirSync(queueDir, { recursive: true })
    // Zero-padded so names sort chronologically as plain strings.
    const name = `${String(Date.now()).padStart(15, '0')}-${String(process.hrtime.bigint()).padStart(20, '0')}-${process.pid}`
    const tmpPath = path.join(queueDir, `.${name}.tmp`)
    fs.writeFileSync(tmpPath, JSON.stringify(item))
    fs.renameSync(tmpPath, path.join(queueDir, `${name}.json`))
}

/**
 * Removes and returns every queued item, oldest first.
 *
 * @param {string} queueDir
 * @returns {QueueItem[]}
 */
function takeItems(queueDir) {
    if (!fs.existsSync(queueDir)) {
        return []
    }
    const files = fs.readdirSync(queueDir)
        .filter(name => name.endsWith('.json'))
        .sort()
    return files.map(name => {
        const filePath = path.join(queueDir, name)
        const item = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        fs.unlinkSync(filePath)
        return item
    })
}

/**
 * @param {string} logFile
 * @param {number} maxBytes
 */
function rotateLog(logFile, maxBytes) {
    if (fs.existsSync(logFile) && fs.statSync(logFile).size > maxBytes) {
        fs.renameSync(logFile, `${logFile}.1`)
    }
}

/** @param {string} message */
function log(message) {
    console.log(`[build-queue ${new Date().toISOString()} pid ${process.pid}] ${message}`)
}

/** @type {Runner} */
function runInSsgDir(argv) {
    log(`$ ${argv.join(' ')}`)
    const result = spawnSync(argv[0], argv.slice(1), { cwd: SSG_DIR, stdio: 'inherit' })
    if (result.status !== 0) {
        log(`Failed (exit ${result.status}${result.error ? `, ${result.error.message}` : ''}): ${argv.join(' ')}`)
        return false
    }
    return true
}

/**
 * @param {string[]} args
 * @returns {QueueItem}
 */
function parseEnqueueArgs(args) {
    if (args.length !== 3) {
        throw new Error(`usage: build_queue.js enqueue <model> <id> <type>, got: ${args.join(' ')}`)
    }
    const [model, id, type] = args
    return { model, id, type }
}

function main() {
    const [command, ...args] = process.argv.slice(2)
    if (command === 'enqueue') {
        const item = parseEnqueueArgs(args)
        enqueueItem(QUEUE_DIR, item)
        log(`Queued ${itemLabel(item)}, waiting for build lock`)
        // build_lock.sh is the single definition of the lock; drain runs while holding it.
        const result = spawnSync('bash', ['-c', 'DIR="$1"; source "$1/build_lock.sh" && exec "$2" "$3" drain', '_', SSG_DIR, NODE, __filename], { stdio: 'inherit' })
        process.exit(result.status === null ? 1 : result.status)
    }
    if (command === 'drain') {
        if (process.env.KGS_BUILD_LOCK_HELD !== '1') {
            throw new Error('drain must run while holding the build lock (see build_lock.sh)')
        }
        let allSucceeded = true
        for (let items = takeItems(QUEUE_DIR); items.length > 0; items = takeItems(QUEUE_DIR)) {
            rotateLog(LOG_FILE, LOG_MAX_BYTES)
            const plan = planBatch(items)
            log(`Building ${items.length} queued save(s) as: ${plan.kind === 'targeted' ? plan.items.map(i => i.label).join(', ') : plan.kind}`)
            allSucceeded = runPlan(plan, runInSsgDir) && allSucceeded
        }
        log('Queue empty')
        process.exit(allSucceeded ? 0 : 1)
    }
    throw new Error(`unknown command: ${command}`)
}

if (require.main === module) {
    main()
}

module.exports = { planBatch, runPlan, enqueueItem, takeItems, rotateLog, LOG_FILE, PREPARE_STEPS }
