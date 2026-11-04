// @ts-check
// One-off migration: copies the old Occupation <-> Person many-to-many links into
// Person.occupation_periods (without years). Dry run by default; pass --apply to write.
//
// Usage: StrapiUserName=... StrapiPassword=... node helpers/migrate_occupation_periods.js [--apply]

/**
 * @typedef {{ id: number }} Ref
 * @typedef {{ id: number, people: Ref[] }} OldOccupation
 * @typedef {{ id: number, occupation_periods?: unknown[] }} OldPerson
 * @typedef {{ id: number, occupation_periods: { occupation: number }[] }} PersonUpdate
 */

/**
 * @param {OldOccupation[]} occupations
 * @param {OldPerson[]} persons
 * @returns {PersonUpdate[]}
 */
function planMigration(occupations, persons) {
    return persons
        .filter(person => (person.occupation_periods ?? []).length === 0)
        .map(person => ({
            id: person.id,
            occupation_periods: occupations
                .filter(occupation => occupation.people.some(p => p.id === person.id))
                .map(occupation => ({ occupation: occupation.id })),
        }))
        .filter(update => update.occupation_periods.length > 0)
}

async function main() {
    const { getModel, putModel } = require('./strapiQuery.js')
    const apply = process.argv.includes('--apply')

    const occupations = await getModel('Occupation')
    const persons = await getModel('Person')
    const updates = planMigration(occupations, persons)

    console.log(`\n${updates.length} persons to update:`)
    for (const update of updates) {
        console.log(`  person ${update.id} -> occupations ${update.occupation_periods.map(p => p.occupation).join(', ')}`)
    }

    if (!apply) {
        console.log('\nDry run. Pass --apply to write.')
        return
    }
    await putModel('Person', updates)
    console.log('\nDone.')
}

if (require.main === module) {
    main()
}

module.exports = { planMigration }
