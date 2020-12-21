const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')

const rootDir =  path.join(__dirname, '..')
const sourceDir = path.join(rootDir, 'source')
const fetchDir = path.join(sourceDir, '_fetchdir')

const LANGUAGES = ['et', 'en']


for (const lang of LANGUAGES) {
    const performancesYAMLPath = path.join(fetchDir, `performances.${lang}.yaml`)
    const performances = yaml.safeLoad(fs.readFileSync(performancesYAMLPath, 'utf8'))
        .filter(p => p.minToMaxEvents)

    let allData = []


    for(performance of performances) {
        for (oneEvent of performance.minToMaxEvents) {
            let oneEventData = {
                id: oneEvent.id,
                performance_remote_id: performance.remote_id || null,
                [`performance_name_${lang}`]: performance[`name_${lang}`] || null,
                [`performance_slug_${lang}`]: performance[`slug_${lang}`] || null,
                [`performance_X_headline_${lang}`]: performance[`X_headline_${lang}`] || null,
                [`performance_subtitle_${lang}`]: performance[`subtitle_${lang}`] || null,
                performance_X_premiere_time: performance.X_premiere_time || null,
                performance_X_artist: performance.X_artist || null,
                performance_X_producer: performance.X_producer || null,
                [`performance_X_town_${lang}`]: performance[`X_town_${lang}`] || null,
                peformance_categories: performance.categories || null,
                remote_id: oneEvent.remote_id || null,
                type: oneEvent.type || null,
                start_time: oneEvent.start_time || null,
                [`location_${lang}`]: oneEvent[`location_${lang}`] || null,
                remote_id: oneEvent.remote_id || null,
                X_ticket_info: oneEvent.X_ticket_info || null,
                start_date_string: oneEvent.start_date_string || null,
                canceled: oneEvent.canceled || false
            }
            allData.push(oneEventData)

        }
    }
    let allDataSortedFiltered = allData.filter(p => p.start_time).sort((a, b) => new Date(a.start_time)-new Date(b.start_time))
    console.log(`${allDataSortedFiltered.length} events from peformances YAML (${lang})`);
    const eventsYAMLPath = path.join(sourceDir, '_fetchdir', `events.${lang}.yaml`)
    const eventsYAML = yaml.safeDump(allDataSortedFiltered, {'noRefs': true, 'indent': '4' });
    fs.writeFileSync(eventsYAMLPath, eventsYAML, 'utf8');
}
