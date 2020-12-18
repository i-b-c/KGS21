const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')

const rootDir =  path.join(__dirname, '..')
const sourceDir = path.join(rootDir, 'source')
const fetchDir = path.join(sourceDir, '_fetchdir')
const labelsDir = path.join(fetchDir, 'labels')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))
const STRAPIDATA_LABELS = STRAPIDATA['LabelGroup']
const LANGUAGES = ['et', 'en']

// let article_index_template = `/_templates/magazine_index_template.pug`

allData = {}
for (const lang of LANGUAGES) {
    const labelsYAMLPath = path.join( sourceDir, `global.${lang}.yaml`)

    for( let name in STRAPIDATA_LABELS ){
        let bla = {}
        for( let label of STRAPIDATA_LABELS[name].label){
            // console.log(label.name, label[`value_${lang}`]);
            bla[label.name] = label[`value_${lang}`] || null
        }

        allData[STRAPIDATA_LABELS[name].name] = bla

    }
// console.log(allData);

    // console.log(JSON.stringify(allData, null, 4))

    // console.log(`${allData.length} labels from YAML (${lang}) ready for building`);
    let labels = yaml.safeLoad(fs.readFileSync(labelsYAMLPath, 'utf8'))

    labels.labels = allData
    // console.log(allData);

    const labelsYAML = yaml.safeDump(labels, { 'noRefs': true, 'indent': '4' });
    fs.writeFileSync(labelsYAMLPath, labelsYAML, 'utf8');
}
