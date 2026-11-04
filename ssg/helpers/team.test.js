const { test } = require('node:test')
const assert = require('node:assert/strict')
const yaml = require('js-yaml')
const { formatPeriod, formatPeriods, buildTeam } = require('./team.js')

test('formatPeriod: start and end', () => {
    assert.equal(formatPeriod({ start_year: 2023, end_year: 2025 }), '2023-2025')
})

test('formatPeriod: start only is open-ended', () => {
    assert.equal(formatPeriod({ start_year: 2019 }), '2019-')
})

test('formatPeriod: end only', () => {
    assert.equal(formatPeriod({ end_year: 2025 }), '-2025')
})

test('formatPeriod: same start and end year collapses', () => {
    assert.equal(formatPeriod({ start_year: 2024, end_year: 2024 }), '2024')
})

test('formatPeriod: no years gives empty string', () => {
    assert.equal(formatPeriod({}), '')
})

// Strapi lifecycle hooks write raw records into strapidata, where empty years are null.
test('formatPeriod: null years are treated as absent', () => {
    assert.equal(formatPeriod({ start_year: null, end_year: null }), '')
    assert.equal(formatPeriod({ start_year: 2019, end_year: null }), '2019-')
    assert.equal(formatPeriod({ start_year: null, end_year: 2025 }), '-2025')
})

test('formatPeriods: single period', () => {
    assert.equal(formatPeriods([{ start_year: 2023, end_year: 2027 }], 'ja'), '2023-2027')
})

test('formatPeriods: two periods joined with the conjunction', () => {
    assert.equal(
        formatPeriods([{ start_year: 2023, end_year: 2027 }, { start_year: 2027, end_year: 2029 }], 'ja'),
        '2023-2027 ja 2027-2029',
    )
})

test('formatPeriods: three or more use commas and the conjunction before the last', () => {
    assert.equal(
        formatPeriods([{ start_year: 2015, end_year: 2017 }, { start_year: 2019, end_year: 2021 }, { start_year: 2023 }], 'and'),
        '2015-2017, 2019-2021 and 2023-',
    )
})

test('formatPeriods: sorted chronologically by start year regardless of input order', () => {
    assert.equal(
        formatPeriods([{ start_year: 2027, end_year: 2029 }, { start_year: 2023, end_year: 2027 }], 'ja'),
        '2023-2027 ja 2027-2029',
    )
})

test('formatPeriods: end-only period is placed by its end year', () => {
    assert.equal(
        formatPeriods([{ start_year: 2020 }, { end_year: 2015 }], 'ja'),
        '-2015 ja 2020-',
    )
})

test('formatPeriods: periods without years are left out', () => {
    assert.equal(formatPeriods([{}, { start_year: 2020, end_year: null }, { start_year: null, end_year: null }], 'ja'), '2020-')
    assert.equal(formatPeriods([{}], 'ja'), '')
})

const occupations = [
    { id: 1, name_et: 'Kuraator', name_en: 'Curator' },
    { id: 2, name_et: 'Juht', name_en: 'Director' },
]

test('buildTeam: groups people under occupations in occupation order', () => {
    const persons = [
        { id: 10, first_name: 'Kaie', last_name: 'K', occupation_periods: [{ occupation: { id: 2 } }] },
        { id: 11, first_name: 'Eneli', last_name: 'J', occupation_periods: [{ occupation: { id: 1 }, start_year: 2019 }] },
    ]
    assert.deepEqual(buildTeam(occupations, persons), [
        {
            name_et: 'Kuraator', name_en: 'Curator',
            people: [{ first_name: 'Eneli', last_name: 'J', extra_text_after_name_et: null, extra_text_after_name_en: null, years_et: '2019-', years_en: '2019-' }],
        },
        {
            name_et: 'Juht', name_en: 'Director',
            people: [{ first_name: 'Kaie', last_name: 'K', extra_text_after_name_et: null, extra_text_after_name_en: null, years_et: '', years_en: '' }],
        },
    ])
})

test('buildTeam: same occupation repeated becomes one line with localized conjunction', () => {
    const persons = [{
        id: 10, first_name: 'Eneli', last_name: 'Järs',
        extra_text_after_name_et: '(puhkusel)', extra_text_after_name_en: '(on leave)',
        occupation_periods: [
            { occupation: { id: 1 }, start_year: 2027, end_year: 2029 },
            { occupation: { id: 1 }, start_year: 2023, end_year: 2027 },
        ],
    }]
    assert.deepEqual(buildTeam(occupations, persons)[0].people, [{
        first_name: 'Eneli', last_name: 'Järs',
        extra_text_after_name_et: '(puhkusel)', extra_text_after_name_en: '(on leave)',
        years_et: '2023-2027 ja 2027-2029',
        years_en: '2023-2027 and 2027-2029',
    }])
})

test('buildTeam: one person in several occupations appears under each with only that occupation\'s years', () => {
    const persons = [{
        id: 10, first_name: 'A', last_name: 'B',
        occupation_periods: [{ occupation: { id: 1 }, start_year: 2020 }, { occupation: { id: 2 }, end_year: 2019 }],
    }]
    const team = buildTeam(occupations, persons)
    assert.equal(team[0].people[0].years_et, '2020-')
    assert.equal(team[1].people[0].years_et, '-2019')
})

test('buildTeam: people without periods and empty occupations', () => {
    const persons = [{ id: 10, first_name: 'A', last_name: 'B' }]
    assert.deepEqual(buildTeam(occupations, persons).map(o => o.people), [[], []])
})

test('buildTeam: period pointing to a missing occupation is ignored', () => {
    const persons = [{ id: 10, first_name: 'A', last_name: 'B', occupation_periods: [{ occupation: { id: 99 } }] }]
    assert.deepEqual(buildTeam(occupations, persons).map(o => o.people), [[], []])
})

test('buildTeam: period with no occupation chosen is ignored', () => {
    const persons = [{ id: 10, first_name: 'A', last_name: 'B', occupation_periods: [{ start_year: 2020 }] }]
    assert.deepEqual(buildTeam(occupations, persons).map(o => o.people), [[], []])
})

test('buildTeam: raw lifecycle shape with null occupation is ignored', () => {
    const persons = [{ id: 10, first_name: 'A', last_name: 'B', occupation_periods: [{ occupation: null, start_year: null, end_year: null }] }]
    assert.deepEqual(buildTeam(occupations, persons).map(o => o.people), [[], []])
})

// team_from_yaml.js writes the result with js-yaml 3 safeDump, which rejects undefined.
test('buildTeam: output can be written with yaml.safeDump when optional fields are missing', () => {
    const persons = [{ id: 10, first_name: 'A', last_name: 'B', occupation_periods: [{ occupation: { id: 1 } }] }]
    assert.doesNotThrow(() => yaml.safeDump(buildTeam(occupations, persons)))
})
