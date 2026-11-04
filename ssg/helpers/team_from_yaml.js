const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')
const { buildTeam } = require('./team.js')

const sourceDir = path.join(__dirname, '..', 'source')
const fetchDir = path.join(sourceDir, '_fetchdir')
const strapiDataDirPath = path.join(sourceDir, 'strapidata')
const readStrapiData = (modelName) => yaml.safeLoad(fs.readFileSync(path.join(strapiDataDirPath, `${modelName}.yaml`), 'utf8'))

const team = buildTeam(readStrapiData('Occupation'), readStrapiData('Person'))

fs.writeFileSync(path.join(fetchDir, 'team.yaml'), yaml.safeDump(team, { 'indent': '4' }), 'utf8')

console.log(`${team.length} team occupations from YAML`)
