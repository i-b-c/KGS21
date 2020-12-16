const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')

const rootDir =  path.join(__dirname, '..')
const sourceDir = path.join(rootDir, 'source')
const fetchDir = path.join(sourceDir, '_fetchdir')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))
const STRAPIDATA_CATEGORIES = STRAPIDATA['Category']
const LANGUAGES = ['et', 'en']

for (const lang of LANGUAGES) {
    const categoriesYAMLPath = path.join(fetchDir, `categories.${lang}.yaml`)
    let allData = STRAPIDATA_CATEGORIES.filter(e => e[`name_${lang}`])

    let sortedByRemoteIdAllData = allData.sort((a, b) => a.remote_id - b.remote_id)
    allData= sortedByRemoteIdAllData

    console.log(`${allData.length} categories_from_YAML (${lang})`);
    const categoriesYAML = yaml.safeDump(allData, { 'indent': '4' });
    fs.writeFileSync(categoriesYAMLPath, categoriesYAML, 'utf8');
}