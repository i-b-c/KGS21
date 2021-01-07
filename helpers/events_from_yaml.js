const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')

const rootDir =  path.join(__dirname, '..')
const sourceDir = path.join(rootDir, 'source')
const fetchDir = path.join(sourceDir, '_fetchdir')
const LANGUAGES = ['et', 'en']
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const festivalsDirPath = path.join(sourceDir, '_fetchdir', `festivals`)
const residenciesDirPath = path.join(sourceDir, '_fetchdir', `residencies`)

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
        let combined_coverages = null
        if (oneEvent.coverages) {
            combined_coverages = oneEvent.coverages.concat(performance.coverages || 0)
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
            [`description_${lang}`]: oneEvent[`description_${lang}`] || null,
            [`technical_info_${lang}`]: oneEvent[`technical_info_${lang}`] || null,
            location: oneEvent.location || null,
            resident: oneEvent.resident || null,
            duration: oneEvent.duration || null,
            conversation: oneEvent.conversation || null,
            videos: oneEvent.videos || null,
            audios: oneEvent.audios || null,
            categories: oneEvent.categories || null,
            remote_id: oneEvent.remote_id || null,
            X_ticket_info: oneEvent.X_ticket_info || null,
            canceled: oneEvent.canceled || false,
            start_date_string: `${('0' + eventDate.getDate()).slice(-2)}.${('0' + (eventDate.getMonth()+1)).slice(-2)}.${eventDate.getFullYear()}`,
            image_hero: oneEvent.event_media ? oneEvent.event_media.filter(e => e.hero_image).map(u => u.hero_image.url)[0] || null : null,
            image_medium: oneEvent.event_media ? oneEvent.event_media.filter(e => e.gallery_image_medium).map(u => u.gallery_image_medium.url)[0] || null : null,
            event_media: oneEvent.event_media || null,
            child_events: oneEvent.child_events ? festival_child_events(oneEvent.child_events, lang) : null,
            coverages: oneEvent.coverages || null,
            coverage_dates: oneEvent.coverages ? coveragesByDate(combined_coverages) : null,
        }

        if (oneEventData.type === 'festival') {

            // Festival program page / landing page
            oneEventData.path = `festival/${oneEventData.remote_id}/program/`

            // if (lang === 'et') {
            //     oneEventData.aliases = [
            //         `et/festival/${oneEventData.remote_id}/program/`,
            //         `festival/${oneEventData.remote_id}/`,
            //         `et/festival/${oneEventData.remote_id}/`
            //         ]
            // }
            const festivalYAML = yaml.safeDump(oneEventData, {'noRefs': true, 'indent': '4' });
            const oneFestivalDirPath = path.join(festivalsDirPath, oneEventData.remote_id)
            fs.mkdirSync(oneFestivalDirPath, { recursive: true });
            fs.writeFileSync(`${oneFestivalDirPath}/data.${lang}.yaml`, festivalYAML, 'utf8');
            fs.writeFileSync(`${oneFestivalDirPath}/index.pug`, `include /_templates/festival_index_template.pug`)

            // Festival about page
            oneEventData.path = `festival/${oneEventData.remote_id}/about/`

            // if (lang === 'et') {
            //     oneEventData.aliases = [`et/festival/${oneEventData.remote_id}/about/`]
            // } else {
            //     delete oneEventData.aliases
            // }

            const festivalAboutYAML = yaml.safeDump(oneEventData, {'noRefs': true, 'indent': '4' });
            fs.mkdirSync(`${oneFestivalDirPath}/about/`, { recursive: true });
            fs.writeFileSync(`${oneFestivalDirPath}/about/data.${lang}.yaml`, festivalAboutYAML, 'utf8');
            fs.writeFileSync(`${oneFestivalDirPath}/about/index.pug`, `include /_templates/festival_about_index_template.pug`)


            // Festival tickets page
            oneEventData.path = `festival/${oneEventData.remote_id}/tickets/`

            // if (lang === 'et') {
            //     oneEventData.aliases = [`et/festival/${oneEventData.remote_id}/tickets/`]
            // } else {
            //     delete oneEventData.aliases
            // }

            const festivalTicketsYAML = yaml.safeDump(oneEventData, {'noRefs': true, 'indent': '4' });
            fs.mkdirSync(`${oneFestivalDirPath}/tickets/`, { recursive: true });
            fs.writeFileSync(`${oneFestivalDirPath}/tickets/data.${lang}.yaml`, festivalTicketsYAML, 'utf8');
            fs.writeFileSync(`${oneFestivalDirPath}/tickets/index.pug`, `include /_templates/festival_tickets_index_template.pug`)

            // Festival press page
            oneEventData.path = `festival/${oneEventData.remote_id}/press/`

            // if (lang === 'et') {
            //     oneEventData.aliases = [`et/festival/${oneEventData.remote_id}/press/`]
            // } else {
            //     delete oneEventData.aliases
            // }

            const festivalPressYAML = yaml.safeDump(oneEventData, {'noRefs': true, 'indent': '4' });
            fs.mkdirSync(`${oneFestivalDirPath}/press/`, { recursive: true });
            fs.writeFileSync(`${oneFestivalDirPath}/press/data.${lang}.yaml`, festivalPressYAML, 'utf8');
            fs.writeFileSync(`${oneFestivalDirPath}/press/index.pug`, `include /_templates/festival_press_index_template.pug`)


            // Reset for alldata writing
            oneEventData.path = `festival/${oneEventData.remote_id}/program/`
            // if (lang === 'et') {
            //     oneEventData.aliases = [`et/festival/${oneEventData.remote_id}/program/`]
            // }

        }

        if (oneEventData.type === 'residency') {
            oneEventData.path = `resident/${oneEventData.remote_id}`
            oneEventData.data = {categories: `/_fetchdir/categories.${lang}.yaml`}
            // if (lang === 'et') {
            //     oneEventData.aliases = [`et/resident/${oneEventData.remote_id}`]
            // }
            const residencyYAML = yaml.safeDump(oneEventData, {'noRefs': true, 'indent': '4' });
            const oneResidencyDirPath = path.join(residenciesDirPath, oneEventData.remote_id)
            fs.mkdirSync(oneResidencyDirPath, { recursive: true });
            fs.writeFileSync(`${oneResidencyDirPath}/data.${lang}.yaml`, residencyYAML, 'utf8');

            fs.writeFileSync(`${oneResidencyDirPath}/index.pug`, `include /_templates/resident_index_template.pug`)

        }

        allData.push(oneEventData)

    }
    // console.log(allData)
    let allDataSortedFiltered = allData.filter(p => p.start_time).sort((a, b) => new Date(a.start_time)-new Date(b.start_time))
    console.log(`${allDataSortedFiltered.length} events (incl. festivals, residencies, tours) from YAML (${lang})`);
    const eventsYAMLPath = path.join(sourceDir, '_fetchdir', `events.${lang}.yaml`)
    const eventsYAML = yaml.safeDump(allDataSortedFiltered, {'noRefs': true, 'indent': '4' });
    fs.writeFileSync(eventsYAMLPath, eventsYAML, 'utf8');
}

function festival_child_events(child_events_data, lang) {
    return child_events_data.map(ch => {
        let child_event = STRAPIDATA_EVENTS.filter(e => e.id === ch.id)[0] || []
        let event_performance = STRAPIDATA_PERFORMANCE.filter(p => p.events && p.events.map(e => e.id).includes(child_event.id))[0] || []
        let eventDate = new Date(oneEvent.start_time)

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
            location: child_event.location || null,
            conversation: child_event.conversation || null,
            remote_id: child_event.remote_id || null,
            X_ticket_info: child_event.X_ticket_info || null,
            canceled: child_event.canceled || false,
            [`name_${lang}`]: child_event[`name_${lang}`] || null,
            [`subtitle_${lang}`]: child_event[`subtitle_${lang}`] || null,
            [`X_headline_${lang}`]: child_event[`X_headline_${lang}`] || null,
            X_artist: child_event.X_artist || null,
            start_date_string: `${('0' + eventDate.getDate()).slice(-2)}.${('0' + (eventDate.getMonth()+1)).slice(-2)}.${eventDate.getFullYear()}`,
        }
        // performance_coverage_dates: event_performance.coverages ? coveragesByDate(event_performance.coverages) : null,
    }).sort((a, b) => new Date(a.start_time) - new Date(b.start_time))


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