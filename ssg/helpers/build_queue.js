// @ts-check
// Site build queue. Every Strapi save enqueues a build request; queued requests are built
// in batches, one batch at a time, and only removed from the queue once deployed.
//
//   node helpers/build_queue.js enqueue <model> <id> <type>   queue a save, then drain
//   node helpers/build_queue.js full                          queue a full build, then drain
//   node helpers/build_queue.js kick                          drain if no build is running (cron)
//   node helpers/build_queue.js status                        show the queue
//
// `enqueue` and `full` wait for the build lock (build_lock.sh) and then drain: take every
// due item, build them as one batch (build_plan.js), repeat until nothing is due. Workers
// that get the lock to an empty queue just exit, so a burst of saves becomes one build.
// `kick` (cron, every few minutes and at boot) picks up retries that came due and items
// left by a drain that died. See build_queue_store.js for the queue's guarantees.
//
// Runs on the server's Node 14.

const fs = require('fs')
const path = require('path')
const { spawn, spawnSync } = require('child_process')
const store = require('./build_queue_store.js')
const { FULL_BUILD_MODEL, planBatch, runPlan, itemLabel } = require('./build_plan.js')

const SSG_DIR = path.join(__dirname, '..')
const QUEUE_DIR = path.join(SSG_DIR, 'build_queue')
const LOG_FILE = path.join(SSG_DIR, 'logs', 'build.log')
const LOG_MAX_BYTES = 50 * 1024 * 1024
// The build fetches from Strapi as this API user; Strapi's own .env is where it is kept.
const STRAPI_ENV_FILE = '/srv/strapi/strapi-development/.env'
const CREDENTIAL_KEYS = ['StrapiUserName', 'StrapiPassword']

/**
 * @typedef {import('./build_plan.js').Step} Step
 * @typedef {import('./build_queue_store.js').BuildRequest} BuildRequest
 * @typedef {import('./build_queue_store.js').QueueItem} QueueItem
 */

/** @param {string} message */
function log(message) {
    console.log(`[build-queue ${new Date().toISOString()} pid ${process.pid}] ${message}`)
}

/**
 * Reads the Strapi API credentials so every drain can fetch, whoever started it (Strapi,
 * cron or a person).
 *
 * @returns {Record<string, string>}
 */
function readStrapiCredentials() {
    const lines = fs.readFileSync(STRAPI_ENV_FILE, 'utf8').split('\n')
    /** @type {Record<string, string>} */
    const credentials = {}
    for (const key of CREDENTIAL_KEYS) {
        const line = lines.find(l => l.startsWith(`${key}=`))
        if (line === undefined) {
            throw new Error(`${key} missing from ${STRAPI_ENV_FILE}`)
        }
        credentials[key] = line.slice(key.length + 1).trim().replace(/^(['"])(.*)\1$/, '$2')
    }
    return credentials
}

/**
 * Runs a step from SSG_DIR in its own process group, so a timeout kills the whole tree
 * (and with it its copy of the build lock's fd).
 *
 * @param {NodeJS.ProcessEnv} env
 * @returns {(step: Step) => Promise<boolean>}
 */
function stepRunner(env) {
    return ({ argv, timeoutMs }) => new Promise(resolve => {
        log(`$ ${argv.join(' ')}`)
        const child = spawn(argv[0], argv.slice(1), { cwd: SSG_DIR, stdio: 'inherit', detached: true, env })
        const timer = setTimeout(() => {
            log(`Timed out after ${timeoutMs / 60000} min, killing: ${argv.join(' ')}`)
            process.kill(-(/** @type {number} */ (child.pid)), 'SIGKILL')
        }, timeoutMs)
        child.on('error', error => {
            clearTimeout(timer)
            log(`Could not start ${argv.join(' ')}: ${error.message}`)
            resolve(false)
        })
        child.on('exit', (code, signal) => {
            clearTimeout(timer)
            if (code !== 0) {
                log(`Failed (${signal ? `signal ${signal}` : `exit ${code}`}): ${argv.join(' ')}`)
            }
            resolve(code === 0)
        })
    })
}

/** @param {string} logFile @param {number} maxBytes */
function rotateLog(logFile, maxBytes) {
    if (fs.existsSync(logFile) && fs.statSync(logFile).size > maxBytes) {
        fs.renameSync(logFile, `${logFile}.1`)
    }
}

/**
 * Must run while holding the build lock: it is the only process that moves queue files.
 *
 * @returns {Promise<boolean>} true when everything it built reached the live site
 */
async function drain() {
    if (process.env.KGS_BUILD_LOCK_HELD !== '1') {
        throw new Error('drain must run while holding the build lock (see build_lock.sh)')
    }
    const run = stepRunner({ ...process.env, ...readStrapiCredentials() })

    const recovered = store.recoverProcessing(QUEUE_DIR)
    if (recovered > 0) {
        log(`Recovered ${recovered} item(s) left by a drain that did not finish`)
    }

    let allDeployed = true
    for (let taken = store.takeDue(QUEUE_DIR, Date.now()); taken.length > 0; taken = store.takeDue(QUEUE_DIR, Date.now())) {
        rotateLog(LOG_FILE, LOG_MAX_BYTES)
        const plan = planBatch(taken.map(t => t.item), store.isBuildDirIncomplete(QUEUE_DIR))
        const startedAt = Date.now()
        const labels = plan.kind === 'targeted' ? plan.items.map(i => i.label) : plan.kind === 'full' ? plan.labels : []
        log(`Building ${taken.length} queued save(s) as ${plan.kind} build: ${labels.join(', ')}`)

        if (plan.kind === 'full') {
            store.markBuildDirIncomplete(QUEUE_DIR) // build.sh starts by wiping build/
        }
        const result = await runPlan(plan, run, log)
        if (result.buildDirSuspect) {
            store.markBuildDirIncomplete(QUEUE_DIR)
            log('build/ may be inconsistent: the next batch will be a full build')
        } else if (plan.kind === 'full') {
            store.clearBuildDirIncomplete(QUEUE_DIR)
            const cleared = store.clearCoveredBefore(QUEUE_DIR, startedAt)
            if (cleared > 0) {
                log(`Full build deployed; dropped ${cleared} queued or failed item(s) it covered`)
            }
        }

        const failed = new Set(result.failed)
        store.complete(taken.filter(t => !failed.has(itemLabel(t.item))))
        for (const entry of taken.filter(t => failed.has(itemLabel(t.item)))) {
            const outcome = store.retry(QUEUE_DIR, entry, Date.now())
            log(outcome === 'failed'
                ? `GAVE UP on ${itemLabel(entry.item)} after ${store.MAX_ATTEMPTS} attempts (see: build_queue.js status)`
                : `Will retry ${itemLabel(entry.item)} (attempt ${entry.item.attempts + 2} of ${store.MAX_ATTEMPTS})`)
        }
        allDeployed = allDeployed && failed.size === 0
        log(failed.size === 0 ? 'Batch deployed' : `Batch done, ${failed.size} item(s) not deployed`)
    }
    return allDeployed
}

/**
 * Re-runs this file's `drain` while holding the build lock. build_lock.sh is the single
 * definition of the lock; with `nonBlocking` the drain is skipped if a build is running
 * (that build's drain picks up whatever is due when it loops).
 *
 * @param {boolean} nonBlocking
 * @returns {number} exit code
 */
function drainUnderLock(nonBlocking) {
    const script = 'DIR="$1"; source "$1/build_lock.sh" && exec "$2" "$3" drain'
    const env = { ...process.env, KGS_BUILD_LOCK_NONBLOCK: nonBlocking ? '1' : '' }
    const result = spawnSync('bash', ['-c', script, '_', SSG_DIR, process.execPath, __filename], { stdio: 'inherit', env })
    return result.status === null ? 1 : result.status
}

/** @param {string[]} args @returns {BuildRequest} */
function parseEnqueueArgs(args) {
    if (args.length !== 3) {
        throw new Error(`usage: build_queue.js enqueue <model> <id> <type>, got: ${args.join(' ')}`)
    }
    const [model, id, type] = args
    return { model, id, type }
}

function printStatus() {
    const s = store.status(QUEUE_DIR)
    /** @param {QueueItem} i */
    const line = i => `  ${itemLabel(i)}  (queued ${new Date(i.enqueuedAt).toISOString()}, attempts ${i.attempts}${i.notBefore > Date.now() ? `, retry after ${new Date(i.notBefore).toISOString()}` : ''})`
    console.log(`build/ incomplete (next batch is a full build): ${s.buildDirIncomplete}`)
    /** @type {[string, QueueItem[]][]} */
    const groups = [['pending', s.pending], ['processing', s.processing], ['failed', s.failed]]
    for (const [name, items] of groups) {
        console.log(`${name}: ${items.length}`)
        items.forEach(i => console.log(line(i)))
    }
}

async function main() {
    const [command, ...args] = process.argv.slice(2)
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true })
    switch (command) {
        case 'enqueue': {
            const request = parseEnqueueArgs(args)
            store.enqueue(QUEUE_DIR, request, Date.now())
            log(`Queued ${request.model} ${request.id} ${request.type}`)
            process.exit(drainUnderLock(false))
        }
        case 'full':
            store.enqueue(QUEUE_DIR, { model: FULL_BUILD_MODEL, id: '0', type: 'null' }, Date.now())
            log('Queued full build')
            process.exit(drainUnderLock(false))
        case 'kick':
            process.exit(drainUnderLock(true))
        case 'drain':
            process.exit(await drain() ? 0 : 1)
        case 'status':
            printStatus()
            return
        default:
            throw new Error(`unknown command: ${command}`)
    }
}

module.exports = { stepRunner }

if (require.main === module) {
    main().catch(error => {
        log(`Error: ${error.stack || error}`)
        process.exit(1)
    })
}
