const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')

const sourceDir = path.join(__dirname, '..', 'source')
const fetchDir = path.join(sourceDir, '_fetchdir')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))
const STRAPIDATA_SIMPLE_ARTICLES = STRAPIDATA['SimpleArticle']
const STRAPIDATA_CONFIGURATIONS = STRAPIDATA['Configuration'].map(e => {
    e.about_article = e.about_article ? STRAPIDATA_SIMPLE_ARTICLES.filter(a => a.id === e.about_article.id)[0] : null
    e.corona_article = e.corona_article ? STRAPIDATA_SIMPLE_ARTICLES.filter(a => a.id === e.corona_article.id)[0] : null
    e.council_article = e.council_article ? STRAPIDATA_SIMPLE_ARTICLES.filter(a => a.id === e.council_article.id)[0] : null
    return e
})[0]

const LANGUAGES = ['et', 'en']

for (const lang of LANGUAGES) {
    const configurationYAMLPath = path.join(fetchDir, `configuration.${lang}.yaml`)
    let allData = STRAPIDATA_CONFIGURATIONS
    console.log(`Configurations from YAML (${lang})`)
    const configurationsYAML = yaml.safeDump(allData, { 'noRefs': true, 'indent': '4' })
    fs.writeFileSync(configurationYAMLPath, configurationsYAML, 'utf8')


    if(STRAPIDATA_CONFIGURATIONS.bg_color && STRAPIDATA_CONFIGURATIONS.fg_color) {
        const globalDataPath = path.join(sourceDir, `global.${lang}.yaml`)
        const globalData = yaml.safeLoad(fs.readFileSync(globalDataPath, 'utf8'))

        globalData.site_colors = {
            bg_color: `#${STRAPIDATA_CONFIGURATIONS.bg_color}`,
            fg_color: `#${STRAPIDATA_CONFIGURATIONS.fg_color}`,
        }

        const globalDataYAML = yaml.safeDump(globalData, { 'indent': '4' });
        fs.writeFileSync(globalDataPath, globalDataYAML, 'utf8')

    }

}