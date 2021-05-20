const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')

const sourceDir = path.join(__dirname, '..', 'source')
const fetchDir = path.join(__dirname, '..', 'source', '_fetchdir')
const strapiDataDirPath = path.join(sourceDir, 'strapidata')
const strapiDataHallsPath = path.join(strapiDataDirPath, 'Hall.yaml')
const strapiDataTownsPath = path.join(strapiDataDirPath, 'Town.yaml')
const strapiDataCountriesPath = path.join(strapiDataDirPath, 'Country.yaml')
const strapiDataOrganisationsPath = path.join(strapiDataDirPath, 'Organisation.yaml')
const strapiDataLocationsPath = path.join(strapiDataDirPath, 'Location.yaml')

const STRAPIDATA_HALLS = yaml.safeLoad(fs.readFileSync(strapiDataHallsPath, 'utf8'))
const STRAPIDATA_TOWNS = yaml.safeLoad(fs.readFileSync(strapiDataTownsPath, 'utf8'))
const STRAPIDATA_COUNTRIES = yaml.safeLoad(fs.readFileSync(strapiDataCountriesPath, 'utf8'))
const STRAPIDATA_ORGANISATIONS = yaml.safeLoad(fs.readFileSync(strapiDataOrganisationsPath, 'utf8'))
const STRAPIDATA_LOCATIONS = yaml.safeLoad(fs.readFileSync(strapiDataLocationsPath, 'utf8')).map(e => {
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
    const locationsYAML = yaml.safeDump(allData, { 'noRefs': true, 'indent': '4' })
    fs.writeFileSync(locationsYAMLPath, locationsYAML, 'utf8')
}