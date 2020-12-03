const fs = require('fs')
// const yaml = require('js-yaml')
const path = require('path')
const http = require('http')
const { strapiAuth } = require('./strapiAuth.js')
// const { spin } = require("./spinner")

const StrapiHost = "206.81.21.173"


// const STRAPI_URL = process.env['StrapiHost']
// const DATAMODEL_PATH = path.join(__dirname, '..', 'docs', 'datamodel.yaml')
// const DATAMODEL = yaml.safeLoad(fs.readFileSync(DATAMODEL_PATH, 'utf8'))

var TOKEN = ''

async function strapiQuery(options, dataObject = false) {
    // spin.start()
    if (TOKEN === '') {
        TOKEN = await strapiAuth() // TODO: setting global variable is no a good idea
        console.log('Bearer', TOKEN)
    }
    options.headers['Authorization'] = `Bearer ${TOKEN}`
    options['host'] = StrapiHost
    // options['host'] = process.env['StrapiHost']
    // options.timeout = 30000

    console.log(options, JSON.stringify((dataObject) || ''))
    return new Promise((resolve, reject) => {
        const request = http.request(options, (response) => {
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


    let _path = `http://${StrapiHost}/${model}`
    let results = []
    for (const element of data) {
        const options = {
            headers: { 'Content-Type': 'application/json' },
            path: _path,
            method: 'POST'
        }
    console.log(element);

    results.push(await strapiQuery(options, element))
    }

    return results
}

async function getFromStrapi() {

    const _path = `http://${StrapiHost}/${model}`

    const options = {
        headers: { 'Content-Type': 'application/json' },
        path: _path,
        method: 'GET',
    }

    const strapi_data = await strapiQuery(options)

    return strapi_data
}

// async function putModel(model, data) {
//     if (! model in DATAMODEL) {
//         console.log('WARNING: no such model: "', model, '".' )
//         return false
//     }
//     if (! '_path' in DATAMODEL[model]) {
//         console.log('WARNING: no path to model: "', model, '".' )
//         return false
//     }

//     const _path = `http://${STRAPI_URL}${DATAMODEL[model]['_path']}`
//     let results = []
//     for (const element of data) {
//         const options = {
//             headers: { 'Content-Type': 'application/json' },
//             path: _path + '/' + element.id,
//             method: 'PUT'
//         }
//         // console.log('=== putModel', options, element)
//         results.push(await strapiQuery(options, element))
//     }
//     return results
// }


exports.strapiQuery = strapiQuery
exports.postToStrapi = postToStrapi
exports.getFromStrapi = getFromStrapi
// exports.putModel = putModel
