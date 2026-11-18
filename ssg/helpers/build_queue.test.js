const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { planBatch, runPlan, enqueueItem, takeItems, rotateLog } = require('./build_queue.js')

const NODE = process.execPath

test('planBatch: targeted steps per item, in queue order', () => {
    const plan = planBatch([
        { model: 'event', id: 4020, type: 'program' },
        { model: 'person', id: 12, type: null },
    ])
    assert.deepEqual(plan, {
        kind: 'targeted',
        items: [
            {
                label: 'event 4020 program',
                steps: [
                    [NODE, 'helpers/events_from_yaml.js', '-t', '4020'],
                    [NODE, 'helpers/performances_from_yaml.js', '-t', 'e', '4020'],
                    [NODE, 'helpers/calendar_json.js'],
                ],
            },
            {
                label: 'person 12 null',
                steps: [
                    [NODE, 'helpers/contact_persons_from_yaml.js', '-t'],
                    [NODE, 'helpers/team_from_yaml.js'],
                ],
            },
        ],
    })
})

test('planBatch: repeated saves of the same item build it once', () => {
    const plan = planBatch([
        { model: 'event', id: 4014, type: 'guest' },
        { model: 'event', id: 4015, type: 'guest' },
        { model: 'event', id: 4014, type: 'guest' },
    ])
    assert.equal(plan.kind, 'targeted')
    assert.deepEqual(plan.items.map(i => i.label), ['event 4014 guest', 'event 4015 guest'])
})

test('planBatch: project events use the projects step', () => {
    const plan = planBatch([{ model: 'event', id: 7, type: 'project' }])
    assert.deepEqual(plan.items[0].steps, [[NODE, 'helpers/projects_from_yaml.js', '-t']])
})

test('planBatch: performance, article, banner and newscast steps', () => {
    const plan = planBatch([
        { model: 'performance', id: 2086, type: null },
        { model: 'article', id: 692, type: null },
        { model: 'banner', id: 3, type: null },
        { model: 'newscast', id: 9, type: null },
    ])
    assert.deepEqual(plan.items.map(i => i.steps), [
        [
            [NODE, 'helpers/performances_from_yaml.js', '-t', '2086'],
            [NODE, 'helpers/events_from_yaml.js', '-t', 'p', '2086'],
            [NODE, 'helpers/calendar_json.js'],
        ],
        [[NODE, 'helpers/articles_from_yaml.js', '-t', '692']],
        [[NODE, 'helpers/banners_from_yaml.js', '-t']],
        [[NODE, 'helpers/newscast_from_yaml.js', '-t']],
    ])
})

test('planBatch: any model without targeted steps makes the whole batch a full build', () => {
    const plan = planBatch([
        { model: 'event', id: 4020, type: 'program' },
        { model: 'configuration', id: 1, type: null },
    ])
    assert.deepEqual(plan, { kind: 'full' })
})

test('planBatch: empty queue plans nothing', () => {
    assert.deepEqual(planBatch([]), { kind: 'none' })
})

const RESET = [NODE, 'helpers/reset_config_path_aliases.js']
const GENERATE = [NODE, './node_modules/entu-ssg/src/build.js', './config.yaml', 'full']
const DEPLOY = ['bash', './deploy.sh']

/** Records commands; fails the ones whose joined argv is in `failing`. */
function fakeRunner(failing = []) {
    /** @type {string[][]} */
    const calls = []
    return {
        calls,
        /** @param {string[]} argv */
        run: argv => { calls.push(argv); return !failing.includes(argv.join(' ')) },
    }
}

test('runPlan: targeted batch prepares every item, then generates and deploys once', () => {
    const { calls, run } = fakeRunner()
    const plan = planBatch([{ model: 'banner', id: 1, type: null }, { model: 'newscast', id: 2, type: null }])
    assert.equal(runPlan(plan, run), true)
    assert.deepEqual(calls, [
        RESET,
        [NODE, 'helpers/banners_from_yaml.js', '-t'],
        [NODE, 'helpers/newscast_from_yaml.js', '-t'],
        GENERATE,
        RESET,
        DEPLOY,
    ])
})

test('runPlan: a failing item is skipped and the rest still deploys', () => {
    const failingStep = [NODE, 'helpers/performances_from_yaml.js', '-t', '2086'].join(' ')
    const { calls, run } = fakeRunner([failingStep])
    const plan = planBatch([{ model: 'performance', id: 2086, type: null }, { model: 'banner', id: 1, type: null }])
    assert.equal(runPlan(plan, run), false)
    assert.deepEqual(calls, [
        RESET,
        [NODE, 'helpers/performances_from_yaml.js', '-t', '2086'], // remaining steps of this item are skipped
        [NODE, 'helpers/banners_from_yaml.js', '-t'],
        GENERATE,
        RESET,
        DEPLOY,
    ])
})

test('runPlan: when every item fails nothing is generated or deployed', () => {
    const failingStep = [NODE, 'helpers/banners_from_yaml.js', '-t'].join(' ')
    const { calls, run } = fakeRunner([failingStep])
    assert.equal(runPlan(planBatch([{ model: 'banner', id: 1, type: null }]), run), false)
    assert.deepEqual(calls, [RESET, [NODE, 'helpers/banners_from_yaml.js', '-t'], RESET])
})

test('runPlan: failed generation resets aliases and does not deploy', () => {
    const { calls, run } = fakeRunner([GENERATE.join(' ')])
    assert.equal(runPlan(planBatch([{ model: 'banner', id: 1, type: null }]), run), false)
    assert.deepEqual(calls, [RESET, [NODE, 'helpers/banners_from_yaml.js', '-t'], GENERATE, RESET])
})

test('runPlan: full plan runs build.sh', () => {
    const { calls, run } = fakeRunner()
    assert.equal(runPlan({ kind: 'full' }, run), true)
    assert.deepEqual(calls, [['bash', './build.sh']])
})

function tempDir() {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'build-queue-test-'))
}

test('enqueueItem/takeItems: items come back in enqueue order and the queue is emptied', () => {
    const dir = tempDir()
    enqueueItem(dir, { model: 'event', id: 1, type: 'program' })
    enqueueItem(dir, { model: 'person', id: 2, type: null })
    enqueueItem(dir, { model: 'event', id: 1, type: 'program' })
    assert.deepEqual(takeItems(dir), [
        { model: 'event', id: 1, type: 'program' },
        { model: 'person', id: 2, type: null },
        { model: 'event', id: 1, type: 'program' },
    ])
    assert.deepEqual(takeItems(dir), [])
})

test('enqueueItem: creates the queue directory', () => {
    const dir = path.join(tempDir(), 'nested', 'queue')
    enqueueItem(dir, { model: 'banner', id: 1, type: null })
    assert.equal(takeItems(dir).length, 1)
})

test('takeItems: missing queue directory is an empty queue', () => {
    assert.deepEqual(takeItems(path.join(tempDir(), 'does-not-exist')), [])
})

test('rotateLog: moves a log over the size limit aside', () => {
    const dir = tempDir()
    const log = path.join(dir, 'build.log')
    fs.writeFileSync(log, 'x'.repeat(20))
    rotateLog(log, 10)
    assert.equal(fs.existsSync(log), false)
    assert.equal(fs.readFileSync(log + '.1', 'utf8').length, 20)
})

test('rotateLog: leaves a small or missing log alone', () => {
    const dir = tempDir()
    const log = path.join(dir, 'build.log')
    rotateLog(log, 10)
    fs.writeFileSync(log, 'x')
    rotateLog(log, 10)
    assert.equal(fs.readFileSync(log, 'utf8'), 'x')
})
