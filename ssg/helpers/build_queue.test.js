const { test } = require('node:test')
const assert = require('node:assert/strict')
const { execSync } = require('child_process')
const { stepRunner } = require('./build_queue.js')

test('stepRunner: success and failure exit codes', async () => {
    const run = stepRunner(process.env)
    assert.equal(await run({ argv: ['true'], timeoutMs: 5000 }), true)
    assert.equal(await run({ argv: ['false'], timeoutMs: 5000 }), false)
})

test('stepRunner: a missing command fails instead of throwing', async () => {
    assert.equal(await stepRunner(process.env)({ argv: ['/nonexistent/cmd'], timeoutMs: 5000 }), false)
})

test('stepRunner: a timed-out step is killed with its whole process tree', async () => {
    const marker = `kgs-timeout-test-${process.pid}`
    const started = Date.now()
    // bash starts a grandchild; both must die, or the grandchild would keep the build lock
    const ok = await stepRunner(process.env)({ argv: ['bash', '-c', `(sleep 30; echo ${marker}) & sleep 31; wait # ${marker}`], timeoutMs: 300 })
    assert.equal(ok, false)
    assert.ok(Date.now() - started < 5000)
    await new Promise(resolve => setTimeout(resolve, 200))
    const left = execSync(`pgrep -f "${marker}" || true`).toString().trim()
    assert.equal(left, '')
})
