const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')

const rootDir =  path.join(__dirname, '..')
const sourceDir = path.join(rootDir, 'source')
const fetchDir = path.join(sourceDir, '_fetchdir')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))
const STRAPIDATA_PERSONS = STRAPIDATA['Person']

let allData = STRAPIDATA_PERSONS
    .filter(e => e.order)
    .sort((a, b) => a.order-b.order)

const personsYAMLPath = path.join(fetchDir, `persons.yaml`)
const personsYAML = yaml.safeDump(allData, { 'indent': '4' });
fs.writeFileSync(personsYAMLPath, personsYAML, 'utf8');

console.log(`${allData.length} contact page persons from YAML`);