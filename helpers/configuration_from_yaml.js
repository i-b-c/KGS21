const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')
const replaceImgPaths = require('./replace_img_paths.js')

const sourceDir = path.join(__dirname, '..', 'source')
const fetchDir = path.join(sourceDir, '_fetchdir')
const strapiDataDirPath = path.join(sourceDir, 'strapidata')
const strapiDataSimpleArticlesPath = path.join(strapiDataDirPath, 'SimpleArticle.yaml')
const strapiDataConfigurationsPath = path.join(strapiDataDirPath, 'Configuration.yaml')
const STRAPIDATA_SIMPLE_ARTICLES = yaml.safeLoad(fs.readFileSync(strapiDataSimpleArticlesPath, 'utf8'))
const STRAPIDATA_CONFIGURATIONS = yaml.safeLoad(fs.readFileSync(strapiDataConfigurationsPath, 'utf8')).map(e => {
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

    if(allData.about_article[`content_${lang}`]) { allData.about_article[`content_${lang}`] = replaceImgPaths(allData.about_article[`content_${lang}`]) }
    if(allData.corona_article[`content_${lang}`]) { allData.corona_article[`content_${lang}`] = replaceImgPaths(allData.corona_article[`content_${lang}`]) }
    if(allData.council_article[`content_${lang}`]) { allData.council_article[`content_${lang}`] = replaceImgPaths(allData.council_article[`content_${lang}`]) }

    const configurationsYAML = yaml.safeDump(allData, { 'noRefs': true, 'indent': '4' })
    fs.writeFileSync(configurationYAMLPath, configurationsYAML, 'utf8')


    if(allData.bg_color && allData.fg_color) {
        const globalDataPath = path.join(sourceDir, `global.${lang}.yaml`)
        const globalData = yaml.safeLoad(fs.readFileSync(globalDataPath, 'utf8'))
        globalData.site_colors = {
            bg_color: `#${allData.bg_color}`,
            fg_color: `#${allData.fg_color}`,
        }

        const globalDataYAML = yaml.safeDump(globalData, { 'indent': '4' });
        fs.writeFileSync(globalDataPath, globalDataYAML, 'utf8')

    }

}