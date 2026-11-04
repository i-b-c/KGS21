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
 *   extra_text_after_name_et?: string | null,
 *   extra_text_after_name_en?: string | null,
 *   occupation_periods?: OccupationPeriod[],
 * }} Person
 * @typedef {{ id: number, name_et: string, name_en: string }} Occupation
 * @typedef {{
 *   first_name: string,
 *   last_name: string,
 *   extra_text_after_name_et: string | null,
 *   extra_text_after_name_en: string | null,
 *   years_et: string,
 *   years_en: string,
 * }} TeamMember
 * @typedef {{ name_et: string, name_en: string, people: TeamMember[] }} TeamOccupation
 */

const CONJUNCTIONS = { et: 'ja', en: 'and' }

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
    return `${start_year ?? ''}-${end_year ?? ''}`
}

/**
 * @param {OccupationPeriod} period
 * @returns {period is OccupationPeriod & ({ start_year: number } | { end_year: number })}
 */
function hasYears(period) {
    return period.start_year != null || period.end_year != null
}

/**
 * Periods in chronological order: by start year, or by end year when only that is known.
 * Joined like "2015-2017, 2019-2021 ja 2023-". Periods without years are left out.
 *
 * @param {OccupationPeriod[]} periods
 * @param {string} conjunction
 * @returns {string}
 */
function formatPeriods(periods, conjunction) {
    /** @param {OccupationPeriod & ({ start_year: number } | { end_year: number })} period */
    const sortYear = period => /** @type {number} */ (period.start_year ?? period.end_year)
    const texts = periods
        .filter(hasYears)
        .sort((a, b) => sortYear(a) - sortYear(b))
        .map(formatPeriod)
    if (texts.length <= 1) {
        return texts.join('')
    }
    return `${texts.slice(0, -1).join(', ')} ${conjunction} ${texts[texts.length - 1]}`
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
                // null, not undefined: team_from_yaml.js dumps this with js-yaml, which rejects undefined
                extra_text_after_name_et: person.extra_text_after_name_et ?? null,
                extra_text_after_name_en: person.extra_text_after_name_en ?? null,
                years_et: formatPeriods(periods, CONJUNCTIONS.et),
                years_en: formatPeriods(periods, CONJUNCTIONS.en),
            }]
        }),
    }))
}

module.exports = { formatPeriod, formatPeriods, buildTeam }
