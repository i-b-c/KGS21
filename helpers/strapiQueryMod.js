const fs = require('fs')
// const yaml = require('js-yaml')
const path = require('path')
const https = require('https')
const { strapiAuth } = require('./strapiAuth.js')
// const { spin } = require("./spinner")
const StrapiHost = 'a.saal.ee'
// const STRAPI_URL = process.env['StrapiHost']
// const DATAMODEL_PATH = path.join(__dirname, '..', 'docs', 'datamodel.yaml')
// const DATAMODEL = yaml.safeLoad(fs.readFileSync(DATAMODEL_PATH, 'utf8'))
var TOKEN = ''
async function strapiQuery(options, dataObject = false) {
    // spin.start()
    if (TOKEN === '') {
        TOKEN = await strapiAuth() // TODO: setting global variable is no a good idea
        // console.log('Bearer', TOKEN)
    }
    options.headers['Authorization'] = `Bearer ${TOKEN}`
    options['host'] = StrapiHost
    // options['host'] = process.env['StrapiHost']
    // options.timeout = 30000
    // console.log(options, JSON.stringify((dataObject) || ''))
    return new Promise((resolve, reject) => {
        const request = https.request(options, (response) => {
            response.setEncoding('utf8')
            let allData = ''
            response.on('data', function (chunk) {
                allData += chunk
                // process.stdout.write(spin())
            })
            response.on('end', async function () {
                // spin.stop()
                // if (!options.full_model_fetch) {
                //     process.stdout.write({GET:'?', PUT:'+', POST:'o', DELETE:'X'}[options.method])
                // }
                if (response.statusCode === 200) {
                    resolve(JSON.parse(allData))
                // } else if (response.statusCode === 500) {
                //     console.log('\nStatus', response.statusCode, options, JSON.stringify((dataObject) || ''))
                //     let resolved = await strapiQuery(options, dataObject)
                //     resolve(resolved)
                } else {
                    console.log('\nStatus', response.statusCode, options, JSON.stringify((dataObject) || ''))
                    resolve([])
                }
            })
            response.on('error', function (thisError) {
                // spin.stop()
                console.log('\nE:1', thisError)
                reject(thisError)
            })
        })
        request.on('error', async function (thisError) {
            // spin.stop()
            if (thisError.code === 'ETIMEDOUT') {
                process.stdout.write('r')
                let resolved = await strapiQuery(options, dataObject)
                resolve(resolved)
            } else if (thisError.code === 'ECONNRESET') {
                process.stdout.write('r')
                let resolved = await strapiQuery(options, dataObject)
                resolve(resolved)
            } else {
                console.log('\nE:2', thisError)
                reject
            }
        })
        if (dataObject) {
            request.write(JSON.stringify(dataObject))
        }
        request.end()
    })
}
const isObject = item => {
    return (item && typeof item === 'object' && !Array.isArray(item))
}
async function postToStrapi(data, model) {
    let _path = `https://${StrapiHost}/${model}`
    let results = []
    for (const element of data) {
        const options = {
            headers: { 'Content-Type': 'application/json' },
            path: _path,
            method: 'POST'
        }
    // console.log(element)
    results.push(await strapiQuery(options, element))
    }
    return results
}
async function putToStrapi(data, model) {
    let _path = `https://${StrapiHost}/${model}`
    let results = []
    for (const element of data) {
        const options = {
            headers: { 'Content-Type': 'application/json' },
            path: _path + '/' + element.id,
            method: 'PUT'
        }
    console.log("in put to strapi", element, options.path)
    results.push(await strapiQuery(options, element))
    }
    return results
}
async function getFromStrapi(model) {
    const _path = `https://${StrapiHost}/${model}?_limit=-1`
    const options = {
        headers: { 'Content-Type': 'application/json' },
        path: _path,
        method: 'GET',
    }
    const strapi_data = await strapiQuery(options)
    return strapi_data
}

async function deleteFromStrapi(model) {
    const _path = `https://${StrapiHost}/${model}`
    const options = {
        headers: { 'Content-Type': 'application/json' },
        path: _path,
        method: 'DELETE',
    }
    const strapi_data = await strapiQuery(options)
    return strapi_data
}
exports.strapiQuery = strapiQuery
exports.postToStrapi = postToStrapi
exports.putToStrapi = putToStrapi
exports.getFromStrapi = getFromStrapi
exports.deleteFromStrapi = deleteFromStrapi