
const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')
const addConfigPathAliases = require('./add_config_path_aliases.js')
const replaceImgPaths = require('./replace_img_paths.js')

const targeted = process.argv[2] === '-t' ? true : false
const rootDir =  path.join(__dirname, '..')
const sourceDir = path.join(rootDir, 'source')
const fetchDir = path.join(sourceDir, '_fetchdir')
const strapiDataDirPath = path.join(sourceDir, 'strapidata')
const strapiDataNewscastsPath = path.join(strapiDataDirPath, 'Newscast.yaml')
const STRAPIDATA_NEWSCASTS = yaml.safeLoad(fs.readFileSync(strapiDataNewscastsPath, 'utf8'))
const LANGUAGES = ['et', 'en']

for (const lang of LANGUAGES) {
    const newscastsYAMLPath = path.join(fetchDir, `newscasts.${lang}.yaml`)
    let allData = STRAPIDATA_NEWSCASTS
        .filter(e => e[`title_${lang}`] && e[`content_${lang}`] && e.publish_time)
        .sort((a, b) => new Date(b.publish_time) - new Date(a.publish_time))

    if (allData[`content_${lang}`]) { allData[`content_${lang}`] = replaceImgPaths(allData[`content_${lang}`])}

    console.log(`${allData.length} newscasts from YAML (${lang})`);
    const newscastsYAML = yaml.safeDump(allData, { 'noRefs': true, 'indent': '4' });
    fs.writeFileSync(newscastsYAMLPath, newscastsYAML, 'utf8');
}

if (targeted) {
    addConfigPathAliases(['about/'])
    addConfigPathAliases(['newscasts_archive/'])
}
