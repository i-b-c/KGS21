// @ts-check

/**
 * Shapes below mirror Person.yaml in strapidata, which has two writers: a_fetch.js cleanup
 * (drops empty values, so fields are absent) and the Strapi afterUpdate hook (writes raw
 * records, so empty fields are null). Both are valid inputs.
 *
 * @typedef {{ id: number }} Ref
 * @typedef {{ occupation?: Ref | null, start_year?: number | null, end_year?: number | null }} OccupationPeriod
 * @typedef {{
 *   id: number,
 *   first_name: string,
 *   last_name: string,
 *   extra_text_after_name_et?: string,
 *   extra_text_after_name_en?: string,
 *   occupation_periods?: OccupationPeriod[],
 * }} Person
 * @typedef {{ id: number, name_et: string, name_en: string }} Occupation
 * @typedef {{
 *   first_name: string,
 *   last_name: string,
 *   extra_text_after_name_et: string | undefined,
 *   extra_text_after_name_en: string | undefined,
 *   years: string,
 * }} TeamMember
 * @typedef {{ name_et: string, name_en: string, people: TeamMember[] }} TeamOccupation
 */

/**
 * @param {OccupationPeriod} period
 * @returns {string}
 */
function formatPeriod({ start_year, end_year }) {
    if (start_year == null && end_year == null) {
        return ''
    }
    if (start_year === end_year) {
        return String(start_year)
    }
    return `${start_year ?? ''}–${end_year ?? ''}`
}

/**
 * Groups persons under occupations via each person's occupation_periods.
 * A person with several periods in one occupation gets one entry listing all periods.
 *
 * @param {Occupation[]} occupations
 * @param {Person[]} persons
 * @returns {TeamOccupation[]}
 */
function buildTeam(occupations, persons) {
    return occupations.map(occupation => ({
        name_et: occupation.name_et,
        name_en: occupation.name_en,
        people: persons.flatMap(person => {
            const periods = (person.occupation_periods ?? [])
                .filter(period => period.occupation?.id === occupation.id)
            if (periods.length === 0) {
                return []
            }
            return [{
                first_name: person.first_name,
                last_name: person.last_name,
                extra_text_after_name_et: person.extra_text_after_name_et,
                extra_text_after_name_en: person.extra_text_after_name_en,
                years: periods.map(formatPeriod).filter(Boolean).join(', '),
            }]
        }),
    }))
}

module.exports = { formatPeriod, buildTeam }
