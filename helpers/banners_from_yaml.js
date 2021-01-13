const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')

const fetchDir = path.join(__dirname, '..', 'source', '_fetchdir')
const strapiDataDirPath = path.join(fetchDir, 'strapidata')
const strapiDataBannersPath = path.join(strapiDataDirPath, 'Banner.yaml')

const STRAPIDATA_BANNERS = yaml.safeLoad(fs.readFileSync(strapiDataBannersPath, 'utf8'))

const bannersYAMLPath = path.join(fetchDir, `banners.yaml`)
let allData = STRAPIDATA_BANNERS
allData.sort((a,b) => b.order - a.order)
console.log(`Banners from YAML`)
const bannersYAML = yaml.safeDump(allData, { 'indent': '4' })
fs.writeFileSync(bannersYAMLPath, bannersYAML, 'utf8')
