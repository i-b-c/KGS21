const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')
const pathAliasesFunc = require('./path_aliases_func.js')
const addConfigPathAliases = require('./add_config_path_aliases.js')
const replaceImgPaths = require('./replace_img_paths.js')

// REMOTE ID'S TO BUILD, LEAVE EMPTY FOR ALL OR COMMENT BELOW LINE OUT
// const fetchSpecific = ['6865', '6858', '6538', '5429', '5810', '6821', '3842', '6913']

const rootDir = path.join(__dirname, '..')
const sourceDir = path.join(rootDir, 'source')
const fetchDir = path.join(sourceDir, '_fetchdir')
const performancesDir = path.join(fetchDir, 'performances')

const strapiDataDirPath = path.join(sourceDir, 'strapidata')
const strapiDataEventsPath = path.join(strapiDataDirPath, 'Event.yaml')
const strapiDataCategoriesPath = path.join(strapiDataDirPath, 'Category.yaml')
const strapiDataCoveragesPath = path.join(strapiDataDirPath, 'Coverage.yaml')
const strapiDataPerformancesPath = path.join(strapiDataDirPath, 'Performance.yaml')

const STRAPIDATA_EVENTS = yaml.safeLoad(fs.readFileSync(strapiDataEventsPath, 'utf8')).filter(e => !e.hide_from_page)
const STRAPIDATA_CATEGORIES = yaml.safeLoad(fs.readFileSync(strapiDataCategoriesPath, 'utf8'))
const STRAPIDATA_COVERAGES = yaml.safeLoad(fs.readFileSync(strapiDataCoveragesPath, 'utf8'))
const STRAPIDATA_PERFORMANCES = yaml.safeLoad(fs.readFileSync(strapiDataPerformancesPath, 'utf8')).map(p => {

    p.events = STRAPIDATA_EVENTS.filter(e => {
        if (e.performance) {
            return e.performance.id === p.id
        } else {
            return false
        }
    })

    // if (p.events) {
    //     p.events = p.events.map(pe => {
    //         return STRAPIDATA_EVENTS.filter(e => e.id === pe.id)[0]
    //     }).filter(u => u)
    // }
    p.categories = p.categories ? p.categories.map(c => STRAPIDATA_CATEGORIES.filter(f => f.id === c.id)[0]) : null
    p.coverages = p.coverages ? p.coverages.map(c => STRAPIDATA_COVERAGES.filter(f => f.id === c.id)[0]) : null
    return p
})

const targeted = process.argv[2] === '-t' && process.argv[3] ? true : false
const eventPerformanceId = (STRAPIDATA_PERFORMANCES.filter(e => e.events && (e.events.map(ev => ev.id.toString()).includes(process.argv[4])))[0] || []).id
const target = process.argv[3] && process.argv[3] === 'e' && process.argv[4] ? (eventPerformanceId ? eventPerformanceId.toString() : null) : process.argv[3]

const fetchSpecific = targeted ? [target] : []

console.log(
    'EventperformanceID ', eventPerformanceId,
    '; TARGETED ', targeted,
    '; Arv3 ', process.argv[3],
    '; Argv4 ', process.argv[4],
    '; argv4 type ', typeof process.argv[4],
    '; SPECIFIC: ', fetchSpecific,
    '; ID ', eventPerformanceId,
    '; TYPE ', typeof eventPerformanceId
    )


const allPathAliases = []

const LANGUAGES = ['et', 'en']

let performance_index_template = `/_templates/performance_index_template.pug`

for (const lang of LANGUAGES) {
    const STRAPIDATA_PERFORMANCES_C = JSON.parse(JSON.stringify(STRAPIDATA_PERFORMANCES))
    const performancesYAMLPath = path.join(fetchDir, `performances.${lang}.yaml`)
    let allData = []

    for (const performance of STRAPIDATA_PERFORMANCES_C) {

        let createDir = typeof fetchSpecific === 'undefined' || !fetchSpecific.length || fetchSpecific.includes(performance.id.toString()) ? true : false

        if (performance[`slug_${lang}`] || performance.remote_id) {

            performance.path = performance[`slug_${lang}`] || performance.remote_id ? (performance[`slug_${lang}`] ? `performance/${performance[`slug_${lang}`]}` : `performance/${performance.remote_id}`) : null

            if (performance.performance_media) {
                performance.hero_images = performance.performance_media.filter(h => h.hero_image).map(h => h.hero_image.url) || null
                performance.medium_images = performance.performance_media.filter(h => h.gallery_image_medium).map(h => h.gallery_image_medium.url) || null
            }

            if (createDir) {
                if (performance.other_works) {
                    performance.other_works = performance.other_works.map(p => {
                        const otherWork = STRAPIDATA_PERFORMANCES_C.filter(a => a.id === p.id)[0]
                        if (otherWork && otherWork[`name_${lang}`] && (otherWork[`slug_${lang}`] || otherWork.remote_id)) {
                            return {
                                [`name_${lang}`]: otherWork[`name_${lang}`],
                                [`path_${lang}`]: otherWork[`slug_${lang}`] || otherWork.remote_id ? (otherWork[`slug_${lang}`] ? `performance/${otherWork[`slug_${lang}`]}` : `performance/${otherWork.remote_id}`) : null
                            }
                        } else {
                            return null
                        }
                    }).filter(a => a !== null)
                }

                if (lang === 'et') {
                    addAliases(performance, [`et/performance/${performance.remote_id}`])
                }

                if (performance[`slug_${lang}`]) {
                    let slug = performance[`slug_${lang}`]
                    if (performance.aliases) {
                        addAliases(performance, [`et/performance/${slug}`])
                    } else {
                        addAliases(performance, [`performance/${slug}`])
                    }
                }

                if (performance[`description_${lang}`]) { performance[`description_${lang}`] = replaceImgPaths(performance[`description_${lang}`]) }
                if (performance[`technical_info_${lang}`]) { performance[`technical_info_${lang}`] = replaceImgPaths(performance[`technical_info_${lang}`]) }

                if (performance.events) {

                    let minToMaxSortedEvents = performance.events.sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
                    performance.minToMaxEvents = minToMaxSortedEvents.map(e => {
                        e.location = e[`X_location_${lang}`] ? e[`X_location_${lang}`] : null
                        return e
                    })
                    let eventsCopy = JSON.parse(JSON.stringify(performance.events))

                    let maxToMinSortedEvents = eventsCopy.sort((a, b) => new Date(b.start_time) - new Date(a.start_time))
                    performance.maxToMinEvents = maxToMinSortedEvents
                    delete performance.events
                }

                if (performance.coverages) {
                    performance.coverages = performance.coverages.sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date))
                }

                performance.data = { categories: `/_fetchdir/categories.${lang}.yaml` }

                const performanceYAML = yaml.safeDump(performance, { 'noRefs': true, 'indent': '4' });
                const performanceDir = path.join(performancesDir, performance.id.toString())
                const performanceYAMLPath = path.join(performanceDir, `data.${lang}.yaml`)

                if (targeted) { console.log('TARGETED: ', performance.id); }

                fs.mkdirSync(performanceDir, { recursive: true });
                fs.writeFileSync(performanceYAMLPath, performanceYAML, 'utf8');

                if (fs.existsSync(`${sourceDir}${performance_index_template}`)) {
                    fs.writeFileSync(`${performanceDir}/index.pug`, `include ${performance_index_template}`)
                } else {
                    console.log(`ERROR: Performance index template missing`);
                }
            }

            if (performance.events) { delete performance.events }

            allData.push(performance)

        }
    }

    console.log(`${allData.length} performances from YAML (${lang}) ready for building`);
    const performancesYAML = yaml.safeDump(allData, { 'noRefs': true, 'indent': '4' });
    fs.writeFileSync(performancesYAMLPath, performancesYAML, 'utf8');
}

function addAliases(oneEventData, pathAliases) {
    // oneEventData.aliases = pathAliases
    pathAliases.map(a => allPathAliases.push({ from: a, to: oneEventData.path }))
}

pathAliasesFunc(fetchDir, allPathAliases, 'performances')

if (targeted) {
    const allTargets = fetchSpecific.filter(a => a).map(a => `_fetchdir/performances/${a}`)
    allTargets.push(`co_productions/`)
    addConfigPathAliases(allTargets)
}