const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')

const rootDir =  path.join(__dirname, '..')
const sourceDir = path.join(rootDir, 'source')
const fetchDir = path.join(sourceDir, '_fetchdir')
const strapiDataDirPath = path.join(fetchDir, 'strapidata')
const strapiDataPersonsPath = path.join(strapiDataDirPath, 'Person.yaml')
const STRAPIDATA_PERSONS = yaml.safeLoad(fs.readFileSync(strapiDataPersonsPath, 'utf8'))

let allData = STRAPIDATA_PERSONS
    .filter(e => e.order)
    .sort((a, b) => a.order-b.order)

const personsYAMLPath = path.join(fetchDir, `persons.yaml`)
const personsYAML = yaml.safeDump(allData, { 'indent': '4' });
fs.writeFileSync(personsYAMLPath, personsYAML, 'utf8');

console.log(`${allData.length} contact page persons from YAML`);