// @ts-check
// What a batch of queued saves turns into, and running it.
//
// A targeted batch fetches all data fresh from Strapi first, then prepares each item,
// then generates and deploys once. Because items are taken from the queue before the
// fetch starts, every save committed before the fetch is in the built data, and any later
// save is still queued for the next batch: no save is built from stale data.
//
// Runs on the server's Node 14.

const NODE = process.execPath
const MINUTE = 60 * 1000

/** Queue model that asks for a full build (nightly job, `npm run build`). */
const FULL_BUILD_MODEL = 'full'

/**
 * @typedef {import('./build_queue_store.js').QueueItem} QueueItem
 * @typedef {{ argv: string[], timeoutMs: number }} Step
 * @typedef {{ label: string, steps: Step[] }} PreparedItem
 * @typedef {{ kind: 'none' }
 *   | { kind: 'full', labels: string[] }
 *   | { kind: 'targeted', items: PreparedItem[] }} Plan
 * @typedef {{ failed: string[], buildDirSuspect: boolean }} PlanResult
 * @typedef {(step: Step) => Promise<boolean>} Runner
 */

/** @param {string[]} argv @returns {Step} */
const dataStep = argv => ({ argv, timeoutMs: 10 * MINUTE })

const FETCH = { argv: [NODE, 'helpers/a_fetch.js'], timeoutMs: 10 * MINUTE }
const RESET_PATHS = { argv: [NODE, 'helpers/reset_config_path_aliases.js'], timeoutMs: MINUTE }
const GENERATE = { argv: [NODE, './node_modules/entu-ssg/src/build.js', './config.yaml', 'full'], timeoutMs: 60 * MINUTE }
const DEPLOY = { argv: ['bash', './deploy.sh'], timeoutMs: 30 * MINUTE }
const FULL_BUILD = { argv: ['bash', './build.sh'], timeoutMs: 150 * MINUTE }

/** @type {string[][]} */
const PERSON_STEPS = [
    [NODE, 'helpers/contact_persons_from_yaml.js', '-t'],
    [NODE, 'helpers/team_from_yaml.js'],
]

/**
 * Data steps per model for a targeted build. Each targeted helper adds its pages to
 * config.yaml's build paths, so several items share one generation. Models not listed
 * here get a full build.
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
    occupation: () => PERSON_STEPS,
    performance: id => [
        [NODE, 'helpers/performances_from_yaml.js', '-t', id],
        [NODE, 'helpers/events_from_yaml.js', '-t', 'p', id],
        [NODE, 'helpers/calendar_json.js'],
    ],
    person: () => PERSON_STEPS,
}

/** @param {QueueItem} item */
function itemLabel({ model, id, type }) {
    return `${model} ${id} ${type}`
}

/**
 * @param {QueueItem[]} items
 * @param {boolean} buildDirIncomplete only a full build can repair build/
 * @returns {Plan}
 */
function planBatch(items, buildDirIncomplete) {
    if (items.length === 0) {
        return { kind: 'none' }
    }
    const labels = [...new Set(items.map(itemLabel))]
    if (buildDirIncomplete || items.some(item => !(item.model in PREPARE_STEPS))) {
        return { kind: 'full', labels }
    }
    return {
        kind: 'targeted',
        items: labels.map(label => {
            const item = /** @type {QueueItem} */ (items.find(i => itemLabel(i) === label))
            return { label, steps: PREPARE_STEPS[item.model](item.id, item.type).map(dataStep) }
        }),
    }
}

/**
 * @param {Plan} plan
 * @param {Runner} run
 * @param {(message: string) => void} log
 * @returns {Promise<PlanResult>} labels that did not reach the live site, and whether
 *   build/ may now be inconsistent (only a full build can fix that)
 */
async function runPlan(plan, run, log = () => {}) {
    if (plan.kind === 'none') {
        return { failed: [], buildDirSuspect: false }
    }
    if (plan.kind === 'full') {
        const ok = await run(FULL_BUILD)
        return { failed: ok ? [] : plan.labels, buildDirSuspect: !ok }
    }

    const all = plan.items.map(item => item.label)
    if (!await run(FETCH)) {
        log('Fetch from Strapi failed, building nothing')
        return { failed: all, buildDirSuspect: false }
    }
    await run(RESET_PATHS)
    /** @type {string[]} */
    const failed = []
    for (const item of plan.items) {
        let ok = true
        for (const step of item.steps) {
            if (!await run(step)) {
                ok = false
                break
            }
        }
        if (!ok) {
            log(`Skipping ${item.label}: a data step failed`)
            failed.push(item.label)
        }
    }
    if (failed.length === plan.items.length) {
        await run(RESET_PATHS)
        return { failed, buildDirSuspect: false }
    }
    const generated = await run(GENERATE)
    await run(RESET_PATHS)
    if (!generated) {
        log('Generation failed, not deploying')
        return { failed: all, buildDirSuspect: true }
    }
    if (!await run(DEPLOY)) {
        log('Deploy failed')
        return { failed: all, buildDirSuspect: false }
    }
    return { failed, buildDirSuspect: false }
}

module.exports = { FULL_BUILD_MODEL, planBatch, runPlan, itemLabel }
