const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')
const pathAliasesFunc = require('./path_aliases_func.js')

// REMOTE ID'S TO BUILD, LEAVE EMPTY FOR ALL OR COMMENT BELOW LINE OUT
// const fetchSpecific = ['6865', '6858', '6538', '5429', '5810', '6821', '3842', '6913']

const rootDir =  path.join(__dirname, '..')
const sourceDir = path.join(rootDir, 'source')
const fetchDir = path.join(sourceDir, '_fetchdir')
const performancesDir = path.join(fetchDir, 'performances')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))
const STRAPIDATA_EVENTS = STRAPIDATA['Event'].filter(e => !e.hide_from_page)
const STRAPIDATA_CATEGORIES = STRAPIDATA['Category']
const STRAPIDATA_PERFORMANCES = STRAPIDATA['Performance'].map(p => {
    if (p.events) {
        p.events = p.events.map( pe => {
            return STRAPIDATA_EVENTS.filter(e => e.id === pe.id)[0]
        }).filter(u => u)
    }
    p.categories = p.categories ? p.categories.map(c => STRAPIDATA_CATEGORIES.filter(f => f.id === c.id)[0]) : null
    return p
})

const allPathAliases = []

const LANGUAGES = ['et', 'en']

let performance_index_template = `/_templates/performance_index_template.pug`

for (const lang of LANGUAGES) {
    const performancesYAMLPath = path.join(fetchDir, `performances.${lang}.yaml`)
    let allData = []

    for (const performance of STRAPIDATA_PERFORMANCES) {

        // Kommenteeri sisse kui soovid ainult konkreetsete remote_id'dega performanceid ehitada

        let createDir = typeof fetchSpecific === 'undefined' || !fetchSpecific.length || fetchSpecific.includes(performance.remote_id) ? true : false

        if (performance.remote_id) {

            performance.path = `performance/${performance.remote_id}`

            if (performance.performance_media) {
                performance.hero_images = performance.performance_media.filter(h => h.hero_image).map(h => h.hero_image.url) || null
                performance.medium_images = performance.performance_media.filter(h => h.hero_image).map(h => h.hero_image.url) || null
            }

            if (createDir) {
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

                if (performance.events){

                    let minToMaxSortedEvents = performance.events.sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
                    performance.minToMaxEvents = minToMaxSortedEvents.map(e => {
                        if (e.location) {
                            e.location = e.location[`name_${lang}`] ? e.location[`name_${lang}`] : null
                        }
                        return e
                    })
                    let eventsCopy = JSON.parse(JSON.stringify(performance.events))

                    let maxToMinSortedEvents = eventsCopy.sort((a, b) => new Date(b.start_time) - new Date(a.start_time))
                    performance.maxToMinEvents = maxToMinSortedEvents
                    delete performance.events
                }

                if (performance.coverages) {
                    performance.coverages = performance.coverages.sort((a, b) => new Date(b.publish_date)-new Date(a.publish_date))
                }

                performance.data = { categories: `/_fetchdir/categories.${lang}.yaml`}

                const performanceYAML = yaml.safeDump(performance, {'noRefs': true, 'indent': '4' });
                const performanceDir = path.join(performancesDir, performance.remote_id)
                const performanceYAMLPath = path.join(performanceDir, `data.${lang}.yaml`)

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
    const performancesYAML = yaml.safeDump(allData, {'noRefs': true, 'indent': '4' });
    fs.writeFileSync(performancesYAMLPath, performancesYAML, 'utf8');
}

function addAliases(oneEventData, pathAliases) {
    // oneEventData.aliases = pathAliases
    pathAliases.map(a => allPathAliases.push({from: a, to: oneEventData.path}))
}

pathAliasesFunc(fetchDir, allPathAliases, 'performances')
