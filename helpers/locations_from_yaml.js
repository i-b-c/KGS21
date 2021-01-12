const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')

const fetchDir = path.join(__dirname, '..', 'source', '_fetchdir')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))
const STRAPIDATA_HALLS = STRAPIDATA['Hall']
const STRAPIDATA_TOWNS = STRAPIDATA['Town']
const STRAPIDATA_COUNTRIES = STRAPIDATA['Country']
const STRAPIDATA_ORGANISATIONS = STRAPIDATA['Organisation']
const STRAPIDATA_LOCATIONS = STRAPIDATA['Location'].map(e => {
    e.hall = e.hall ? STRAPIDATA_HALLS.filter(f => f.id === e.hall.id)[0] : null
    e.town = e.town ? STRAPIDATA_TOWNS.filter(f => f.id === e.town.id)[0] : null
    e.country = e.country ? STRAPIDATA_COUNTRIES.filter(f => f.id === e.country.id)[0] : null
    e.theater = e.theater ? STRAPIDATA_ORGANISATIONS.filter(f => f.id === e.theater.id)[0] : null
    return e
})

const LANGUAGES = ['et', 'en']

for (const lang of LANGUAGES) {

    const locationsYAMLPath = path.join(fetchDir, `locations.${lang}.yaml`)
    let allData = STRAPIDATA_LOCATIONS.filter(e => e[`name_${lang}`])
    allData.sort((a,b) => b.order - a.order)
    console.log(`Locations from YAML`)
    const locationsYAML = yaml.safeDump(allData, { 'indent': '4' })
    fs.writeFileSync(locationsYAMLPath, locationsYAML, 'utf8')
}