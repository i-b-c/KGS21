const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')

const rootDir =  path.join(__dirname, '..')
const sourceDir = path.join(rootDir, 'source')
const fetchDir = path.join(sourceDir, '_fetchdir')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))
const STRAPIDATA_NEWSCASTS = STRAPIDATA['Newscast']
const LANGUAGES = ['et', 'en']

for (const lang of LANGUAGES) {
    const newscastsYAMLPath = path.join(fetchDir, `newscasts.${lang}.yaml`)
    let allData = STRAPIDATA_NEWSCASTS
        .filter(e => e[`title_${lang}`] && e[`content_${lang}`])
        .sort((a, b) => new Date(b.publish_time) - new Date(a.publish_time))

    console.log(`${allData.length} newscasts from YAML (${lang})`);
    const newscastsYAML = yaml.safeDump(allData, { 'indent': '4' });
    fs.writeFileSync(newscastsYAMLPath, newscastsYAML, 'utf8');
}