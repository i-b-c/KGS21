const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')
const pathAliasesFunc = require('./path_aliases_func.js')

// REMOTE ID'S TO BUILD, LEAVE EMPTY FOR ALL OR COMMENT BELOW LINE OUT
// const fetchSpecific = ['6762', '5663', '6909', '6724', '6762', '5937']

const rootDir =  path.join(__dirname, '..')
const sourceDir = path.join(rootDir, 'source')
const fetchDir = path.join(sourceDir, '_fetchdir')
const LANGUAGES = ['et', 'en']
const strapiDataDirPath = path.join(fetchDir, 'strapidata')
const festivalsDirPath = path.join(fetchDir, `festivals`)
const residenciesDirPath = path.join(fetchDir, `residencies`)

const strapiDataCategoriesPath = path.join(strapiDataDirPath, `Category.yaml`)
const strapiDataPerformancesPath = path.join(strapiDataDirPath, `Performance.yaml`)
const strapiDataLocationsPath = path.join(strapiDataDirPath, `Location.yaml`)
const strapiDataCoveragesPath = path.join(strapiDataDirPath, `Coverage.yaml`)
const strapiDataEventsPath = path.join(strapiDataDirPath, `Event.yaml`)
const STRAPIDATA_CATEGORIES = yaml.safeLoad(fs.readFileSync(strapiDataCategoriesPath, 'utf8'))
const STRAPIDATA_PERFORMANCES = yaml.safeLoad(fs.readFileSync(strapiDataPerformancesPath, 'utf8')).map(e => {
    if (e.categories) {
        e.categories = e.categories.map(c => STRAPIDATA_CATEGORIES.filter(f => f.id === c.id))[0]
    }
    return e
})
const STRAPIDATA_LOCATIONS = yaml.safeLoad(fs.readFileSync(strapiDataLocationsPath, 'utf8'))
const STRAPIDATA_COVERAGES = yaml.safeLoad(fs.readFileSync(strapiDataCoveragesPath, 'utf8'))

const STRAPIDATA_EVENTS_YAML = yaml.safeLoad(fs.readFileSync(strapiDataEventsPath, 'utf8'))

const STRAPIDATA_EVENTS = STRAPIDATA_EVENTS_YAML.filter(e => !e.hide_from_page).map(ev => {
    ev.performance = ev.performance ? STRAPIDATA_PERFORMANCES.filter(e => e.id === ev.performance.id)[0] : null
    ev.location = ev.location ? STRAPIDATA_LOCATIONS.filter(e => e.id === ev.location.id)[0] : null
    ev.categories = ev.categories ? ev.categories.map(c => STRAPIDATA_CATEGORIES.filter(f => f.id === c.id)[0]) : null
    ev.coverages = ev.coverages ? ev.coverages.map(c => STRAPIDATA_COVERAGES.filter(f => f.id === c.id)[0]) : null
    ev.child_events = ev.child_events ? ev.child_events.map(c => STRAPIDATA_EVENTS_YAML.filter(f => f.id === c.id)[0]) : null
    return ev
})

const allPathAliases = []

for (const lang of LANGUAGES) {

    const categoriesYAMLPath = path.join(fetchDir, `categories.${lang}.yaml`)
    const categories = yaml.safeLoad(fs.readFileSync(categoriesYAMLPath, 'utf8'))
        .filter(c => c.featured_on_front_page)
        .map(c => c.remote_id)
    let allData = []


    for(oneEvent of STRAPIDATA_EVENTS) {

        // let performance = STRAPIDATA_PERFORMANCES.filter(p => p.events && p.events.map(e => e.id).includes(oneEvent.id))[0] || []
        let performance = oneEvent.performance || []

        let combined_coverages = null

        let createDir = typeof fetchSpecific === 'undefined' || !fetchSpecific.length || fetchSpecific.includes(oneEvent.remote_id) ? true : false

        if (oneEvent.coverages) {
            performance.coverages = performance.coverages ? performance.coverages.map(c => STRAPIDATA_COVERAGES.filter(sc => sc.id === c.id)[0]) : []
            combined_coverages = oneEvent.coverages.concat(performance.coverages)
        } else if (performance.coverages) {
            combined_coverages = performance.coverages
        }

        let oneEventData = {
            id: oneEvent.id,
            performance_remote_id: performance.remote_id || null,
            [`performance_name_${lang}`]: performance[`name_${lang}`] || null,
            [`performance_slug_${lang}`]: performance[`slug_${lang}`] || null,
            [`performance_X_headline_${lang}`]: performance[`X_headline_${lang}`] || null,
            [`performance_subtitle_${lang}`]: performance[`subtitle_${lang}`] || null,
            performance_X_artist: performance.X_artist || null,
            performance_X_producer: performance.X_producer || null,
            [`performance_X_town_${lang}`]: performance[`X_town_${lang}`] || null,
            peformance_categories: performance.categories ? performance.categories.map(c => c.remote_id).filter(c => categories.includes(c)) : null,
            remote_id: oneEvent.remote_id || null,
            type: oneEvent.type || null,
            start_time: oneEvent.start_time || null,
            end_time: oneEvent.end_time || null,
            premiere: oneEvent.premiere || null,
            [`name_${lang}`]: oneEvent[`name_${lang}`] || null,
            [`X_headline_${lang}`]: oneEvent[`X_headline_${lang}`] || null,
            [`subtitle_${lang}`]: oneEvent[`subtitle_${lang}`] || null,
            location: oneEvent.location ? (oneEvent.location[`name_${lang}`] || null) : null,
            X_location: oneEvent[`X_location_${lang}`] || null,
            resident: oneEvent.resident || null,
            categories: oneEvent.categories || null,
            X_ticket_info: oneEvent.X_ticket_info || null,
            canceled: oneEvent.canceled || false,
            image_medium: oneEvent.event_media ? oneEvent.event_media.filter(e => e.gallery_image_medium).map(u => u.gallery_image_medium.url)[0] || null : null,
        }

        allData.push(oneEventData)

        if (createDir) {
            oneEventData[`description_${lang}`] = oneEvent[`description_${lang}`] || null
            oneEventData[`technical_info_${lang}`] = oneEvent[`technical_info_${lang}`] || null
            oneEventData.duration = oneEvent.duration || null
            oneEventData.conversation = oneEvent.conversation || null
            oneEventData.videos = oneEvent.videos || null
            oneEventData.audios = oneEvent.audios || null
            oneEventData.image_hero = oneEvent.event_media ? oneEvent.event_media.filter(e => e.hero_image).map(u => u.hero_image.url)[0] || null : null
            oneEventData.event_media = oneEvent.event_media || null
            oneEventData.child_events = oneEvent.child_events ? festival_child_events(oneEvent.child_events, lang) : null
            oneEventData.coverages = oneEvent.coverages || null
            oneEventData.coverage_dates = oneEvent.coverages ? coveragesByDate(combined_coverages) : null
        }

        if (oneEventData.type === 'festival') { createFestival(oneEventData, lang, createDir) }

        if (oneEventData.type === 'residency') { createResidency(oneEventData, lang, createDir) }


    }
    let allDataSortedFiltered = allData.filter(p => p.start_time).sort((a, b) => new Date(a.start_time)-new Date(b.start_time))
    console.log(`${allDataSortedFiltered.length} events (incl. festivals, residencies, tours) from YAML (${lang})`);
    const eventsYAMLPath = path.join(sourceDir, '_fetchdir', `events.${lang}.yaml`)
    const eventsYAML = yaml.safeDump(allDataSortedFiltered, {'noRefs': true, 'indent': '4' });
    fs.writeFileSync(eventsYAMLPath, eventsYAML, 'utf8');
}

function createResidency(oneEventData, lang, createDir) {

    oneEventData.path = `resident/${oneEventData.remote_id}`
    oneEventData.data = { categories: `/_fetchdir/categories.${lang}.yaml` }
    if (lang === 'et') {
        addAliases(oneEventData, [`et/resident/${oneEventData.remote_id}`])
    }
    if (createDir) { createDirAndFiles(oneEventData, lang, residenciesDirPath, null, 'resident') }

}

function createFestival(oneEventData, lang, createDir) {

    let festivalHomePath = `festival/${oneEventData.remote_id}/`
    // FESTIVAL PROGRAM/LANDING PAGE
    oneEventData.path = `${festivalHomePath}program/`

    if (lang === 'et') {
        addAliases(oneEventData, [`et/${festivalHomePath}program/`,])
        addAliases(oneEventData, [`${festivalHomePath}`])
        addAliases(oneEventData, [`et/${festivalHomePath}`])
    }

    if (createDir) { createDirAndFiles(oneEventData, lang, festivalsDirPath, null, 'festival') }


    // FESTIVAL ABOUT PAGE
    oneEventData.path = `${festivalHomePath}about/`

    if (lang === 'et') {
        addAliases(oneEventData, [`et/${festivalHomePath}about/`])
    } else {
        // delete oneEventData.aliases
    }

    if (createDir) { createDirAndFiles(oneEventData, lang, festivalsDirPath, 'about', 'festival_about') }


    // FESTIVAL TICKETS PAGE
    oneEventData.path = `${festivalHomePath}tickets/`

    if (lang === 'et') {
        addAliases(oneEventData, [`et/${festivalHomePath}tickets/`])
    } else {
        // delete oneEventData.aliases
    }

    if (createDir) { createDirAndFiles(oneEventData, lang, festivalsDirPath, 'tickets', 'festival_tickets') }


    // FESTIVAL PRESS PAGE
    oneEventData.path = `${festivalHomePath}press/`

    if (lang === 'et') {
        addAliases(oneEventData, [`et/${festivalHomePath}press/`])
    } else {
        // delete oneEventData.aliases
    }

    if (createDir) { createDirAndFiles(oneEventData, lang, festivalsDirPath, 'press', 'festival_press') }


    // RESET FOR ALLDATA WRITING
    oneEventData.path = `${festivalHomePath}program/`
    if (lang === 'et') {
        addAliases(oneEventData, [`et/${festivalHomePath}program/`])
    }

}

function festival_child_events(child_events_data, lang) {
    return child_events_data.map(ch => {
        let child_event = STRAPIDATA_EVENTS.filter(e => e.id === ch.id)[0] || []
        let event_performance = STRAPIDATA_PERFORMANCES.filter(p => p.events && p.events.map(e => e.id).includes(child_event.id))[0] || []

        return {
            id: child_event.id,
            performance_remote_id: event_performance.remote_id || null,
            start_time: child_event.start_time || null,
            premiere: child_event.premiere || null,
            [`performance_name_${lang}`]: event_performance[`name_${lang}`] || null,
            [`performance_slug_${lang}`]: event_performance[`slug_${lang}`] || null,
            [`performance_X_headline_${lang}`]: event_performance[`X_headline_${lang}`] || null,
            [`performance_subtitle_${lang}`]: event_performance[`subtitle_${lang}`] || null,
            performance_X_artist: event_performance.X_artist || null,
            performance_X_producer: event_performance.X_producer || null,
            [`performance_X_town_${lang}`]: event_performance[`X_town_${lang}`] || null,
            location: child_event.location ? child_event.location[`name_${lang}`] : null,
            X_location: child_event[`X_location_${lang}`] || null,
            conversation: child_event.conversation || null,
            remote_id: child_event.remote_id || null,
            X_ticket_info: child_event.X_ticket_info || null,
            canceled: child_event.canceled || false,
            [`name_${lang}`]: child_event[`name_${lang}`] || null,
            [`subtitle_${lang}`]: child_event[`subtitle_${lang}`] || null,
            [`X_headline_${lang}`]: child_event[`X_headline_${lang}`] || null,
            X_artist: child_event.X_artist || null,
        }
    }).sort((a, b) => new Date(a.start_time) - new Date(b.start_time))


}

function createDirAndFiles(oneEventData, lang, dirPath, addPath, indexTemplateType) {
    const thisYAML = yaml.safeDump(oneEventData, { 'noRefs': true, 'indent': '4' })
    const onePath = addPath ? path.join(dirPath, oneEventData.remote_id, addPath) : path.join(dirPath, oneEventData.remote_id)
    fs.mkdirSync(onePath, { recursive: true })
    fs.writeFileSync(`${onePath}/data.${lang}.yaml`, thisYAML, 'utf8')

    fs.writeFileSync(`${onePath}/index.pug`, `include /_templates/${indexTemplateType}_index_template.pug`)
}

function coveragesByDate(coverages) {
    sorted_coverages = coverages.sort((a, b) => new Date(a.publish_date)-new Date(b.publish_date))
    coverages_array = {}
    coverge_dates = sorted_coverages.map(d => {
        if (d.publish_date) {
            coverages_array[d.publish_date] = sorted_coverages.filter(c =>  c.publish_date && d.publish_date && d.publish_date.substr(0,10) === c.publish_date.substr(0,10))
        }
    })
    return coverages_array || null
}

function addAliases(oneEventData, pathAliases) {
    // oneEventData.aliases = pathAliases
    pathAliases.map(a => allPathAliases.push({from: a, to: oneEventData.path}))
}

pathAliasesFunc(fetchDir, allPathAliases, 'events')
