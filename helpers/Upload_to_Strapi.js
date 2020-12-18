var fs = require('fs');
var request = require('request');
const {
    strapiAuth
} = require('./strapiAuth.js')

const path = require('path')
const yaml = require('js-yaml')

const {
    strapiQuery,
    putToStrapi,
    getFromStrapi
} = require("./strapiQueryMod.js")
const entuDataPath = path.join(__dirname, '..', 'data-transfer', 'from_entu')

const strapiDataPath = path.join(__dirname, '..', 'data-transfer', 'from_strapi')
const performances_from_strapi = yaml.safeLoad(fs.readFileSync(path.join(strapiDataPath, 'performances.yaml')))

const dataJSON = path.join(entuDataPath, 'performance.pics.json')
let performancePicsJSON = JSON.parse(fs.readFileSync(dataJSON, 'utf-8'))

var TOKEN = ''


async function sendPic(entuPicId, pic_name) {
    if (TOKEN === '') {
        TOKEN = await strapiAuth()
    }

    let options = {
        'method': 'POST',
        'url': 'https://a.saal.ee/upload',
        'headers': {
            'Authorization': `Bearer ${TOKEN}`
        },
        formData: {
            'files': {
                'value': request.get('https://saal.entu.ee/api2/file-' + entuPicId),
                'options': {
                    'filename': pic_name,
                    'contentType': null
                }
            }
        }
    };

    function doRequest() {
        return new Promise(function(resolve, reject) {
            request(options, async function(error, response) {
                if (!error) {
                    // let strapiPicId = JSON.parse(response.body)[0].id
                    resolve(response.body)
                } else {
                    reject(error);
                }
            })

        })
    }

    async function GetId() {
        let res = await doRequest()
        console.log('res = ', res);
        return JSON.parse(res)[0].id
    }

        console.log(GetId());
    return await GetId();

}

async function send_pic_and_create_relation() {

    let performances = (performancePicsJSON.map(async performance_media => {
        if(performance_media.medias.length > 0){

            let strapi_id = performances_from_strapi.filter(s_performance => {
                return s_performance.remote_id === performance_media.entu_id.toString()
            }).map(e => e.id)[0]

            let performance_media_from_entu = []

            for (media of performance_media.medias) {

                let keys = Object.keys(media)

                let media_object = {}
                for (key of keys) {

                    media_object[key] = { id: await sendPic(media[key].db_value, media[key].value) }
                }
                performance_media_from_entu.push(media_object)
            }

            // console.log("performance media from entu", performance_media_from_entu)

            return {
                "id": strapi_id,
                "performance_media": performance_media_from_entu
            }
        } else {
            console.log('tyhi')
            return []
        }
    }))

    if( performances.length > 0){

        let  perf_objs = await Promise.all(performances)
        console.log(perf_objs)

        // putToStrapi(perf_objs, 'performances')

    }

}

send_pic_and_create_relation()



