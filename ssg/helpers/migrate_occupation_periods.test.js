const { test } = require('node:test')
const assert = require('node:assert/strict')
const { planMigration } = require('./migrate_occupation_periods.js')

test('planMigration: turns occupation.people links into yearless periods per person', () => {
    const occupations = [{ id: 1, people: [{ id: 10 }, { id: 11 }] }, { id: 2, people: [{ id: 10 }] }]
    const persons = [{ id: 10 }, { id: 11 }]
    assert.deepEqual(planMigration(occupations, persons), [
        { id: 10, occupation_periods: [{ occupation: 1 }, { occupation: 2 }] },
        { id: 11, occupation_periods: [{ occupation: 1 }] },
    ])
})

test('planMigration: skips persons who already have periods, so reruns are safe', () => {
    const occupations = [{ id: 1, people: [{ id: 10 }, { id: 11 }] }]
    const persons = [{ id: 10, occupation_periods: [{ id: 5, occupation: { id: 1 } }] }, { id: 11, occupation_periods: [] }]
    assert.deepEqual(planMigration(occupations, persons), [{ id: 11, occupation_periods: [{ occupation: 1 }] }])
})

test('planMigration: links to persons that no longer exist are dropped', () => {
    assert.deepEqual(planMigration([{ id: 1, people: [{ id: 99 }] }], []), [])
})
