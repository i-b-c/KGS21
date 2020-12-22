const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')

const fetchDir = path.join(__dirname, '..', 'source', '_fetchdir')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))
const STRAPIDATA_CONFIGURATION = STRAPIDATA['Configuration'][0]
const LANGUAGES = ['et', 'en']


for (const lang of LANGUAGES) {
    const configurationYAMLPath = path.join(fetchDir, `configuration.${lang}.yaml`)
    let allData = STRAPIDATA_CONFIGURATION
    console.log(`Configurations from YAML (${lang})`)
    const configurationsYAML = yaml.safeDump(allData, { 'indent': '4' })
    fs.writeFileSync(configurationYAMLPath, configurationsYAML, 'utf8')
}