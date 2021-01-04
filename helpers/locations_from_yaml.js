const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')

const fetchDir = path.join(__dirname, '..', 'source', '_fetchdir')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))
const STRAPIDATA_LOCATIONS = STRAPIDATA['Location']

const LANGUAGES = ['et', 'en']

for (const lang of LANGUAGES) {

    const locationsYAMLPath = path.join(fetchDir, `locations.${lang}.yaml`)
    let allData = STRAPIDATA_LOCATIONS.filter(e => e[`name_${lang}`])
    allData.sort((a,b) => b.order - a.order)
    console.log(`Locations from YAML`)
    const locationsYAML = yaml.safeDump(allData, { 'indent': '4' })
    fs.writeFileSync(locationsYAMLPath, locationsYAML, 'utf8')
}