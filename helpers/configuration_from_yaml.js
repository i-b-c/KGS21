const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')

const sourceDir = path.join(__dirname, '..', 'source')
const fetchDir = path.join(sourceDir, '_fetchdir')
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


    if(STRAPIDATA_CONFIGURATION.bg_color && STRAPIDATA_CONFIGURATION.fg_color) {
        const globalDataPath = path.join(sourceDir, `global.${lang}.yaml`)
        const globalData = yaml.safeLoad(fs.readFileSync(globalDataPath, 'utf8'))

        globalData.site_colors = {
            bg_color: `#${STRAPIDATA_CONFIGURATION.bg_color}`,
            fg_color: `#${STRAPIDATA_CONFIGURATION.fg_color}`,
        }

        const globalDataYAML = yaml.safeDump(globalData, { 'indent': '4' });
        fs.writeFileSync(globalDataPath, globalDataYAML, 'utf8')

    }

}