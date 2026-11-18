const { test } = require('node:test')
const assert = require('node:assert/strict')
const { planBatch, runPlan, FULL_BUILD_MODEL } = require('./build_plan.js')

const NODE = process.execPath
const item = (model, id, type = 'null') => ({ model, id, type, attempts: 0, notBefore: 0, enqueuedAt: 0 })

/** @param {import('./build_plan.js').Plan} plan */
const argvs = plan => plan.kind === 'targeted' ? plan.items.map(i => i.steps.map(s => s.argv)) : []

test('planBatch: targeted steps per item, in queue order, duplicates once', () => {
    const plan = planBatch([item('event', '4020', 'program'), item('person', '12'), item('event', '4020', 'program')], false)
    assert.equal(plan.kind, 'targeted')
    assert.deepEqual(plan.kind === 'targeted' && plan.items.map(i => i.label), ['event 4020 program', 'person 12 null'])
    assert.deepEqual(argvs(plan), [
        [
            [NODE, 'helpers/events_from_yaml.js', '-t', '4020'],
            [NODE, 'helpers/performances_from_yaml.js', '-t', 'e', '4020'],
            [NODE, 'helpers/calendar_json.js'],
        ],
        [
            [NODE, 'helpers/contact_persons_from_yaml.js', '-t'],
            [NODE, 'helpers/team_from_yaml.js'],
        ],
    ])
})

test('planBatch: per-model steps', () => {
    const plan = planBatch([
        item('event', '7', 'project'),
        item('performance', '2086'),
        item('article', '692'),
        item('banner', '3'),
        item('newscast', '9'),
        item('occupation', '1'),
    ], false)
    assert.deepEqual(argvs(plan), [
        [[NODE, 'helpers/projects_from_yaml.js', '-t']],
        [
            [NODE, 'helpers/performances_from_yaml.js', '-t', '2086'],
            [NODE, 'helpers/events_from_yaml.js', '-t', 'p', '2086'],
            [NODE, 'helpers/calendar_json.js'],
        ],
        [[NODE, 'helpers/articles_from_yaml.js', '-t', '692']],
        [[NODE, 'helpers/banners_from_yaml.js', '-t']],
        [[NODE, 'helpers/newscast_from_yaml.js', '-t']],
        [
            [NODE, 'helpers/contact_persons_from_yaml.js', '-t'],
            [NODE, 'helpers/team_from_yaml.js'],
        ],
    ])
})

test('planBatch: a model without targeted steps makes the batch a full build', () => {
    assert.deepEqual(planBatch([item('event', '1', 'program'), item('configuration', '1')], false),
        { kind: 'full', labels: ['event 1 program', 'configuration 1 null'] })
    assert.deepEqual(planBatch([item(FULL_BUILD_MODEL, '0')], false), { kind: 'full', labels: [`${FULL_BUILD_MODEL} 0 null`] })
})

test('planBatch: an incomplete build dir forces a full build', () => {
    assert.deepEqual(planBatch([item('banner', '1')], true), { kind: 'full', labels: ['banner 1 null'] })
})

test('planBatch: nothing queued plans nothing', () => {
    assert.deepEqual(planBatch([], false), { kind: 'none' })
})

const FETCH = [NODE, 'helpers/a_fetch.js']
const RESET = [NODE, 'helpers/reset_config_path_aliases.js']
const GENERATE = [NODE, './node_modules/entu-ssg/src/build.js', './config.yaml', 'full']
const DEPLOY = ['bash', './deploy.sh']
const FULL = ['bash', './build.sh']

/** Records commands; fails those whose joined argv is in `failing`. */
function fakeRunner(failing = []) {
    /** @type {string[][]} */
    const calls = []
    return {
        calls,
        /** @param {{ argv: string[], timeoutMs: number }} step */
        run: async step => {
            assert.ok(step.timeoutMs > 0)
            calls.push(step.argv)
            return !failing.includes(step.argv.join(' '))
        },
    }
}

const banner = () => planBatch([item('banner', '1'), item('newscast', '2')], false)

test('runPlan: fetch first, prepare every item, then generate and deploy once', async () => {
    const { calls, run } = fakeRunner()
    assert.deepEqual(await runPlan(banner(), run), { failed: [], buildDirSuspect: false })
    assert.deepEqual(calls, [
        FETCH, RESET,
        [NODE, 'helpers/banners_from_yaml.js', '-t'],
        [NODE, 'helpers/newscast_from_yaml.js', '-t'],
        GENERATE, RESET, DEPLOY,
    ])
})

test('runPlan: failed fetch fails every item and builds nothing', async () => {
    const { calls, run } = fakeRunner([FETCH.join(' ')])
    assert.deepEqual(await runPlan(banner(), run), { failed: ['banner 1 null', 'newscast 2 null'], buildDirSuspect: false })
    assert.deepEqual(calls, [FETCH])
})

test('runPlan: a failing item is skipped and the rest still deploys', async () => {
    const { calls, run } = fakeRunner([[NODE, 'helpers/banners_from_yaml.js', '-t'].join(' ')])
    assert.deepEqual(await runPlan(banner(), run), { failed: ['banner 1 null'], buildDirSuspect: false })
    assert.deepEqual(calls, [
        FETCH, RESET,
        [NODE, 'helpers/banners_from_yaml.js', '-t'],
        [NODE, 'helpers/newscast_from_yaml.js', '-t'],
        GENERATE, RESET, DEPLOY,
    ])
})

test('runPlan: remaining steps of a failed item are skipped', async () => {
    const failing = [NODE, 'helpers/performances_from_yaml.js', '-t', '5'].join(' ')
    const { calls, run } = fakeRunner([failing])
    await runPlan(planBatch([item('performance', '5')], false), run)
    assert.deepEqual(calls, [FETCH, RESET, [NODE, 'helpers/performances_from_yaml.js', '-t', '5'], RESET])
})

test('runPlan: when every item fails nothing is generated or deployed', async () => {
    const { calls, run } = fakeRunner([[NODE, 'helpers/banners_from_yaml.js', '-t'].join(' ')])
    const result = await runPlan(planBatch([item('banner', '1')], false), run)
    assert.deepEqual(result, { failed: ['banner 1 null'], buildDirSuspect: false })
    assert.deepEqual(calls, [FETCH, RESET, [NODE, 'helpers/banners_from_yaml.js', '-t'], RESET])
})

test('runPlan: failed generation fails all items and marks the build dir suspect', async () => {
    const { calls, run } = fakeRunner([GENERATE.join(' ')])
    assert.deepEqual(await runPlan(banner(), run), { failed: ['banner 1 null', 'newscast 2 null'], buildDirSuspect: true })
    assert.deepEqual(calls.slice(-2), [GENERATE, RESET])
})

test('runPlan: failed deploy fails all items; build dir is fine', async () => {
    const { run } = fakeRunner([DEPLOY.join(' ')])
    assert.deepEqual(await runPlan(banner(), run), { failed: ['banner 1 null', 'newscast 2 null'], buildDirSuspect: false })
})

test('runPlan: full build', async () => {
    const plan = { kind: 'full', labels: ['configuration 1 null', 'banner 2 null'] }
    const ok = fakeRunner()
    assert.deepEqual(await runPlan(plan, ok.run), { failed: [], buildDirSuspect: false })
    assert.deepEqual(ok.calls, [FULL])
    const failing = fakeRunner([FULL.join(' ')])
    assert.deepEqual(await runPlan(plan, failing.run), { failed: ['configuration 1 null', 'banner 2 null'], buildDirSuspect: true })
})
