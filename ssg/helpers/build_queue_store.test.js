const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs')
const os = require('os')
const path = require('path')
const store = require('./build_queue_store.js')

function tempQueue() {
    return path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'build-queue-store-')), 'queue')
}

/** @param {string} dir */
const names = dir => fs.existsSync(dir) ? fs.readdirSync(dir).filter(n => n.endsWith('.json')) : []

const EVENT = { model: 'event', id: '4020', type: 'program' }
const PERSON = { model: 'person', id: '12', type: 'null' }

test('enqueue + takeDue: items come back oldest first and move to processing', () => {
    const dir = tempQueue()
    store.enqueue(dir, EVENT, 1000)
    store.enqueue(dir, PERSON, 2000)
    const taken = store.takeDue(dir, 5000)
    assert.deepEqual(taken.map(t => t.item), [
        { ...EVENT, attempts: 0, notBefore: 0, enqueuedAt: 1000 },
        { ...PERSON, attempts: 0, notBefore: 0, enqueuedAt: 2000 },
    ])
    assert.equal(names(path.join(dir, 'pending')).length, 0)
    assert.equal(names(path.join(dir, 'processing')).length, 2)
})

test('takeDue: items enqueued after the take stay pending', () => {
    const dir = tempQueue()
    store.enqueue(dir, EVENT, 1000)
    const taken = store.takeDue(dir, 5000)
    store.enqueue(dir, PERSON, 6000)
    assert.equal(taken.length, 1)
    assert.deepEqual(store.takeDue(dir, 7000).map(t => t.item.model), ['person'])
})

test('takeDue: missing queue is empty', () => {
    assert.deepEqual(store.takeDue(tempQueue(), 0), [])
})

test('complete: removes the processing files', () => {
    const dir = tempQueue()
    store.enqueue(dir, EVENT, 1000)
    store.complete(store.takeDue(dir, 5000))
    assert.equal(names(path.join(dir, 'processing')).length, 0)
    assert.equal(names(path.join(dir, 'pending')).length, 0)
})

test('retry: requeues with backoff, not due before it', () => {
    const dir = tempQueue()
    store.enqueue(dir, EVENT, 1000)
    const [entry] = store.takeDue(dir, 5000)
    assert.equal(store.retry(dir, entry, 10_000), 'retrying')
    assert.deepEqual(store.takeDue(dir, 10_000 + store.backoffMs(1) - 1), [])
    const [again] = store.takeDue(dir, 10_000 + store.backoffMs(1))
    assert.equal(again.item.attempts, 1)
    assert.equal(again.item.enqueuedAt, 1000)
})

test('retry: backoff grows per attempt', () => {
    assert.ok(store.backoffMs(2) > store.backoffMs(1))
    assert.ok(store.backoffMs(store.MAX_ATTEMPTS - 1) > store.backoffMs(2))
})

test('retry: after MAX_ATTEMPTS the item moves to failed', () => {
    const dir = tempQueue()
    store.enqueue(dir, EVENT, 1000)
    let now = 5000
    for (let attempt = 1; attempt < store.MAX_ATTEMPTS; attempt++) {
        const [entry] = store.takeDue(dir, now)
        assert.equal(store.retry(dir, entry, now), 'retrying')
        now += store.backoffMs(attempt)
    }
    const [last] = store.takeDue(dir, now)
    assert.equal(store.retry(dir, last, now), 'failed')
    assert.deepEqual(store.takeDue(dir, Number.MAX_SAFE_INTEGER), [])
    assert.deepEqual(store.status(dir).failed.map(i => i.model), ['event'])
})

test('recoverProcessing: items left by a dead drain go back to pending with an attempt counted', () => {
    const dir = tempQueue()
    store.enqueue(dir, EVENT, 1000)
    store.takeDue(dir, 5000) // the drain that took this one died
    assert.equal(store.recoverProcessing(dir), 1)
    const [entry] = store.takeDue(dir, 6000)
    assert.equal(entry.item.attempts, 1)
})

test('recoverProcessing: an item that keeps killing drains ends up failed', () => {
    const dir = tempQueue()
    store.enqueue(dir, EVENT, 1000)
    for (let i = 0; i < store.MAX_ATTEMPTS; i++) {
        store.takeDue(dir, Number.MAX_SAFE_INTEGER)
        store.recoverProcessing(dir)
    }
    assert.deepEqual(store.takeDue(dir, Number.MAX_SAFE_INTEGER), [])
    assert.equal(store.status(dir).failed.length, 1)
})

test('clearCoveredBefore: a full build covers pending and failed items queued before it', () => {
    const dir = tempQueue()
    store.enqueue(dir, EVENT, 1000)
    store.enqueue(dir, PERSON, 2000)
    const [first] = store.takeDue(dir, 3000).filter(t => t.item.model === 'event')
    first.item.attempts = store.MAX_ATTEMPTS - 1
    store.retry(dir, first, 3000) // event -> failed/
    // person went back to processing in the take above; put it back as a retry
    store.recoverProcessing(dir)
    store.enqueue(dir, { model: 'banner', id: '1', type: 'null' }, 9000)
    assert.equal(store.clearCoveredBefore(dir, 5000), 2)
    const s = store.status(dir)
    assert.deepEqual(s.pending.map(i => i.model), ['banner'])
    assert.deepEqual(s.failed, [])
})

test('build dir marker', () => {
    const dir = tempQueue()
    assert.equal(store.isBuildDirIncomplete(dir), false)
    store.markBuildDirIncomplete(dir)
    assert.equal(store.isBuildDirIncomplete(dir), true)
    store.clearBuildDirIncomplete(dir)
    assert.equal(store.isBuildDirIncomplete(dir), false)
})

test('status: pending, processing and failed lists', () => {
    const dir = tempQueue()
    store.enqueue(dir, EVENT, 1000)
    store.takeDue(dir, 5000)
    store.enqueue(dir, PERSON, 6000)
    const s = store.status(dir)
    assert.deepEqual(s.pending.map(i => i.model), ['person'])
    assert.deepEqual(s.processing.map(i => i.model), ['event'])
    assert.deepEqual(s.failed, [])
    assert.equal(s.buildDirIncomplete, false)
})
