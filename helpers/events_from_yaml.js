const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')

const rootDir =  path.join(__dirname, '..')
const sourceDir = path.join(rootDir, 'source')
const fetchDir = path.join(sourceDir, '_fetchdir')
const LANGUAGES = ['et', 'en']
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))
const STRAPIDATA_EVENTS = STRAPIDATA['Event'].filter(e => !e.hide_from_page)
const STRAPIDATA_PERFORMANCE = STRAPIDATA['Performance']

for (const lang of LANGUAGES) {

    const categoriesYAMLPath = path.join(fetchDir, `categories.${lang}.yaml`)
    const categories = yaml.safeLoad(fs.readFileSync(categoriesYAMLPath, 'utf8'))
        .filter(c => c.featured_on_front_page)
        .map(c => c.remote_id)
    let allData = []


    for(oneEvent of STRAPIDATA_EVENTS) {
        let performance = STRAPIDATA_PERFORMANCE.filter(p => p.events && p.events.map(e => e.id).includes(oneEvent.id))[0] || []
        let eventDate = new Date(oneEvent.start_time)
        let performancePremiere = performance.X_premiere_time ? new Date(performance.X_premiere_time) : null
        let oneEventData = {
            id: oneEvent.id,
            performance_remote_id: performance.remote_id || null,
            [`performance_name_${lang}`]: performance[`name_${lang}`] || null,
            [`performance_slug_${lang}`]: performance[`slug_${lang}`] || null,
            [`performance_X_headline_${lang}`]: performance[`X_headline_${lang}`] || null,
            [`performance_subtitle_${lang}`]: performance[`subtitle_${lang}`] || null,
            performance_X_premiere_time: performance.X_premiere_time != null ? new Date(performancePremiere.setHours(performancePremiere.getHours()-2)).toISOString() : null,
            performance_X_artist: performance.X_artist || null,
            performance_X_producer: performance.X_producer || null,
            [`performance_X_town_${lang}`]: performance[`X_town_${lang}`] || null,
            peformance_categories: performance.categories ? performance.categories.map(c => c.remote_id).filter(c => categories.includes(c)) : null,
            remote_id: oneEvent.remote_id || null,
            type: oneEvent.type || null,
            start_time: oneEvent.start_time || null,
            end_time: oneEvent.end_time || null,
            [`name_${lang}`]: oneEvent[`name_${lang}`] || null,
            [`description_${lang}`]: oneEvent[`description_${lang}`] || null,
            [`technical_info_${lang}`]: oneEvent[`technical_info_${lang}`] || null,
            [`location_${lang}`]: oneEvent[`location_${lang}`] || null,
            resident: oneEvent.resident || null,
            duration: oneEvent.duration || null,
            conversation: oneEvent.conversation || null,
            video: oneEvent.video || null,
            remote_id: oneEvent.remote_id || null,
            X_ticket_info: oneEvent.X_ticket_info || null,
            start_date_string: oneEvent.start_date_string || null,
            canceled: oneEvent.canceled || false,
            start_date_string: `${('0' + eventDate.getDate()).slice(-2)}.${('0' + (eventDate.getMonth()+1)).slice(-2)}.${eventDate.getFullYear()}`
        }
        allData.push(oneEventData)

    }
    // console.log(allData)
    let allDataSortedFiltered = allData.filter(p => p.start_time).sort((a, b) => new Date(a.start_time)-new Date(b.start_time))
    console.log(`${allDataSortedFiltered.length} events from YAML (${lang})`);
    const eventsYAMLPath = path.join(sourceDir, '_fetchdir', `events.${lang}.yaml`)
    const eventsYAML = yaml.safeDump(allDataSortedFiltered, {'noRefs': true, 'indent': '4' });
    fs.writeFileSync(eventsYAMLPath, eventsYAML, 'utf8');
}
