const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')

const rootDir =  path.join(__dirname, '..')
const sourceDir = path.join(rootDir, 'source')
const fetchDir = path.join(sourceDir, '_fetchdir')
const performancesDir = path.join(fetchDir, 'performances')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))
const STRAPIDATA_PERFORMANCES = STRAPIDATA['Performance']
const STRAPIDATA_LOCATIONS = STRAPIDATA['Location']

const LANGUAGES = ['et', 'en']

let performance_index_template = `/_templates/performance_index_template.pug`

for (const lang of LANGUAGES) {
    const performancesYAMLPath = path.join(fetchDir, `performances.${lang}.yaml`)
    let allData = []

    for (const performance of STRAPIDATA_PERFORMANCES) {

        // Kommenteeri sisse kui soovid ainult konkreetsete remote_id'dega performanceid ehitada

        // if (['6865', '6858', '6538', '5429', '5810', '6796', '3842'].includes(performance.remote_id)){

        // } else {
        //     continue
        // }

        if (performance.remote_id) {

            performance.path = `performance/${performance.remote_id}`

            if (lang === 'et') {
                performance.aliases = [`et/performance/${performance.remote_id}`]
            }

            if (performance[`slug_${lang}`]) {
                let slug = performance[`slug_${lang}`]
                if (performance.aliases) {
                    performance.aliases.push(`et/performance/${slug}`)
                } else {
                    performance.aliases = [`performance/${slug}`]
                }
            }

            if (performance.events){

                for (const event of performance.events){
                    let eventDate = new Date(event.start_time)
                    event.start_date_string = `${('0' + eventDate.getDate()).slice(-2)}.${('0' + (eventDate.getMonth()+1)).slice(-2)}.${eventDate.getFullYear()}`

                    if (event.location) {
                        event.location = STRAPIDATA_LOCATIONS.filter(l => l.id === event.location)[0] || null
                    }

                }


                let minToMaxSortedEvents = performance.events.sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
                performance.minToMaxEvents = minToMaxSortedEvents
                let eventsCopy = JSON.parse(JSON.stringify(performance.events))

                let maxToMinSortedEvents = eventsCopy.sort((a, b) => new Date(b.start_time) - new Date(a.start_time))
                performance.maxToMinEvents = maxToMinSortedEvents

                delete performance.events
            }

            if (performance.X_pictures) {
                performance.X_pictures = sort_pictures(performance.X_pictures)
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
                allData.push(performance)
            } else {
                console.log(`ERROR: Performance index template missing`);
            }
            if (performance[`X_headline_${lang}`]){
                // console.log(`${performance.id}, ${performance.remote_id}`);
            }

        }
    }

    console.log(`${allData.length} performances from YAML (${lang}) ready for building`);
    const performancesYAML = yaml.safeDump(allData, {'noRefs': true, 'indent': '4' });
    fs.writeFileSync(performancesYAMLPath, performancesYAML, 'utf8');
}

function sort_pictures(pics) {

    for (const key in pics) {
        if (key !== 'id' && pics[key].length) {
            let picsKeys = pics[key].includes(',') ? pics[key].split(',') : [pics[key]]
            pics[key] = picsKeys.sort((a, b) => a-b).join(',')
        }
    }
    return JSON.parse(JSON.stringify(pics))

}

