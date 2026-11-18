// @ts-check
// On-disk queue of site builds requested by Strapi saves.
//
//   <dir>/pending/     waiting to be built (a retried item waits until its notBefore)
//   <dir>/processing/  taken by the running drain; removed only once its build is deployed
//   <dir>/failed/      gave up after MAX_ATTEMPTS; shown by `build_queue.js status`
//
// An item is deleted only after the build containing it deployed, so a drain that dies
// (crash, kill, reboot) leaves its items in processing/ for the next drain to recover.
// Every write goes to a temp file first and is renamed into place, so a reader never
// sees a half-written item. Only the drain (holding the build lock) moves files; enqueue
// only adds new ones.
//
// Runs on the server's Node 14.

const fs = require('fs')
const path = require('path')

const MAX_ATTEMPTS = 5
const BUILD_DIR_INCOMPLETE = 'build_dir_incomplete'

/**
 * @typedef {{ model: string, id: string, type: string }} BuildRequest
 * @typedef {BuildRequest & { attempts: number, notBefore: number, enqueuedAt: number }} QueueItem
 * @typedef {{ file: string, item: QueueItem }} TakenItem
 * @typedef {{
 *   pending: QueueItem[],
 *   processing: QueueItem[],
 *   failed: QueueItem[],
 *   buildDirIncomplete: boolean,
 * }} QueueStatus
 */

/** @param {number} attempt the attempt that just failed, from 1 */
function backoffMs(attempt) {
    return 2 ** attempt * 60 * 1000
}

/** @param {string} dir @param {'pending' | 'processing' | 'failed'} state */
function stateDir(dir, state) {
    return path.join(dir, state)
}

/**
 * @param {string} targetDir
 * @param {string} name
 * @param {QueueItem} item
 */
function writeItem(targetDir, name, item) {
    fs.mkdirSync(targetDir, { recursive: true })
    const tmpPath = path.join(targetDir, `.${name}.tmp`)
    fs.writeFileSync(tmpPath, JSON.stringify(item))
    fs.renameSync(tmpPath, path.join(targetDir, name))
}

/**
 * Oldest first: names start with the zero-padded enqueue time.
 *
 * @param {string} targetDir
 * @returns {string[]}
 */
function itemNames(targetDir) {
    if (!fs.existsSync(targetDir)) {
        return []
    }
    return fs.readdirSync(targetDir).filter(name => name.endsWith('.json')).sort()
}

/**
 * @param {string} file
 * @returns {QueueItem}
 */
function readItem(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
}

/**
 * @param {string} dir
 * @param {BuildRequest} request
 * @param {number} now
 */
function enqueue(dir, request, now) {
    const name = `${String(now).padStart(15, '0')}-${String(process.hrtime.bigint()).padStart(20, '0')}-${process.pid}.json`
    writeItem(stateDir(dir, 'pending'), name, { ...request, attempts: 0, notBefore: 0, enqueuedAt: now })
}

/**
 * Moves every due pending item to processing/ and returns them, oldest first.
 *
 * @param {string} dir
 * @param {number} now
 * @returns {TakenItem[]}
 */
function takeDue(dir, now) {
    const pendingDir = stateDir(dir, 'pending')
    const processingDir = stateDir(dir, 'processing')
    /** @type {TakenItem[]} */
    const taken = []
    for (const name of itemNames(pendingDir)) {
        const item = readItem(path.join(pendingDir, name))
        if (item.notBefore > now) {
            continue
        }
        fs.mkdirSync(processingDir, { recursive: true })
        const file = path.join(processingDir, name)
        fs.renameSync(path.join(pendingDir, name), file)
        taken.push({ file, item })
    }
    return taken
}

/** @param {TakenItem[]} taken items whose build deployed */
function complete(taken) {
    for (const { file } of taken) {
        fs.unlinkSync(file)
    }
}

/**
 * Counts a failed attempt: back to pending after a backoff, or to failed/ for good.
 *
 * @param {string} dir
 * @param {TakenItem} entry
 * @param {number} now
 * @returns {'retrying' | 'failed'}
 */
function retry(dir, { file, item }, now) {
    const attempts = item.attempts + 1
    const name = path.basename(file)
    const outcome = attempts >= MAX_ATTEMPTS ? 'failed' : 'retrying'
    const notBefore = outcome === 'failed' ? item.notBefore : now + backoffMs(attempts)
    writeItem(stateDir(dir, outcome === 'failed' ? 'failed' : 'pending'), name, { ...item, attempts, notBefore })
    fs.unlinkSync(file)
    return outcome
}

/**
 * Items in processing/ when a drain starts were left by a drain that died mid-build (the
 * lock guarantees no other drain is running). They go back to pending, due at once, with
 * the attempt counted so an item that keeps killing drains ends up in failed/.
 *
 * @param {string} dir
 * @returns {number} recovered items
 */
function recoverProcessing(dir) {
    const processingDir = stateDir(dir, 'processing')
    const names = itemNames(processingDir)
    for (const name of names) {
        const file = path.join(processingDir, name)
        const item = readItem(file)
        const attempts = item.attempts + 1
        writeItem(stateDir(dir, attempts >= MAX_ATTEMPTS ? 'failed' : 'pending'), name, { ...item, attempts })
        fs.unlinkSync(file)
    }
    return names.length
}

/**
 * A successful full build deploys everything as of its fetch, which happens after it
 * started; any pending or failed item enqueued before that start is covered by it.
 *
 * @param {string} dir
 * @param {number} time when the full build started
 * @returns {number} removed items
 */
function clearCoveredBefore(dir, time) {
    let removed = 0
    for (const state of /** @type {const} */ (['pending', 'failed'])) {
        const targetDir = stateDir(dir, state)
        for (const name of itemNames(targetDir)) {
            const file = path.join(targetDir, name)
            if (readItem(file).enqueuedAt < time) {
                fs.unlinkSync(file)
                removed++
            }
        }
    }
    return removed
}

/**
 * build/ holds the whole site and every deploy mirrors it to the live site (rsync
 * --delete). After a full build wiped it, or a generation died part-way, it cannot be
 * trusted until a full build succeeds.
 *
 * @param {string} dir
 */
function markBuildDirIncomplete(dir) {
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, BUILD_DIR_INCOMPLETE), new Date().toISOString())
}

/** @param {string} dir */
function clearBuildDirIncomplete(dir) {
    fs.rmSync(path.join(dir, BUILD_DIR_INCOMPLETE), { force: true })
}

/** @param {string} dir */
function isBuildDirIncomplete(dir) {
    return fs.existsSync(path.join(dir, BUILD_DIR_INCOMPLETE))
}

/**
 * @param {string} dir
 * @returns {QueueStatus}
 */
function status(dir) {
    /** @param {'pending' | 'processing' | 'failed'} state */
    const items = state => itemNames(stateDir(dir, state)).map(name => readItem(path.join(stateDir(dir, state), name)))
    return {
        pending: items('pending'),
        processing: items('processing'),
        failed: items('failed'),
        buildDirIncomplete: isBuildDirIncomplete(dir),
    }
}

module.exports = {
    MAX_ATTEMPTS,
    backoffMs,
    enqueue,
    takeDue,
    complete,
    retry,
    recoverProcessing,
    clearCoveredBefore,
    markBuildDirIncomplete,
    clearBuildDirIncomplete,
    isBuildDirIncomplete,
    status,
}
