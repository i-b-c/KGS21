const { test } = require('node:test')
const assert = require('node:assert/strict')
const { formatPeriod, buildTeam } = require('./team.js')

test('formatPeriod: start and end', () => {
    assert.equal(formatPeriod({ start_year: 2023, end_year: 2025 }), '2023–2025')
})

test('formatPeriod: start only is open-ended', () => {
    assert.equal(formatPeriod({ start_year: 2019 }), '2019–')
})

test('formatPeriod: end only', () => {
    assert.equal(formatPeriod({ end_year: 2025 }), '–2025')
})

test('formatPeriod: same start and end year collapses', () => {
    assert.equal(formatPeriod({ start_year: 2024, end_year: 2024 }), '2024')
})

test('formatPeriod: no years gives empty string', () => {
    assert.equal(formatPeriod({}), '')
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
            people: [{ first_name: 'Eneli', last_name: 'J', extra_text_after_name_et: undefined, extra_text_after_name_en: undefined, years: '2019–' }],
        },
        {
            name_et: 'Juht', name_en: 'Director',
            people: [{ first_name: 'Kaie', last_name: 'K', extra_text_after_name_et: undefined, extra_text_after_name_en: undefined, years: '' }],
        },
    ])
})

test('buildTeam: same occupation repeated becomes one line with periods in input order', () => {
    const persons = [{
        id: 10, first_name: 'Maarja', last_name: 'K',
        extra_text_after_name_et: '(puhkusel)', extra_text_after_name_en: '(on leave)',
        occupation_periods: [
            { occupation: { id: 1 }, start_year: 2025, end_year: 2027 },
            { occupation: { id: 1 }, start_year: 2023, end_year: 2025 },
        ],
    }]
    assert.deepEqual(buildTeam(occupations, persons)[0].people, [{
        first_name: 'Maarja', last_name: 'K',
        extra_text_after_name_et: '(puhkusel)', extra_text_after_name_en: '(on leave)',
        years: '2025–2027, 2023–2025',
    }])
})

test('buildTeam: periods without years are left out of the years text', () => {
    const persons = [{
        id: 10, first_name: 'A', last_name: 'B',
        occupation_periods: [{ occupation: { id: 1 } }, { occupation: { id: 1 }, start_year: 2020 }],
    }]
    assert.equal(buildTeam(occupations, persons)[0].people[0].years, '2020–')
})

test('buildTeam: one person in several occupations appears under each', () => {
    const persons = [{
        id: 10, first_name: 'A', last_name: 'B',
        occupation_periods: [{ occupation: { id: 1 }, start_year: 2020 }, { occupation: { id: 2 }, end_year: 2019 }],
    }]
    const team = buildTeam(occupations, persons)
    assert.equal(team[0].people[0].years, '2020–')
    assert.equal(team[1].people[0].years, '–2019')
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
