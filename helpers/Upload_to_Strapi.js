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
const articles_from_strapi = yaml.safeLoad(fs.readFileSync(path.join(strapiDataPath, 'articles.yaml')))

// const dataJSON = path.join(entuDataPath, 'performance.pics.json')
// let performancePicsJSON = JSON.parse(fs.readFileSync(dataJSON, 'utf-8'))

const dataJSON = path.join(entuDataPath, 'echo.pics.json')
let echoPicsJSON = JSON.parse(fs.readFileSync(dataJSON, 'utf-8'))

var TOKEN = ''


async function sendPic(media) {
    // console.log("sendPic Media ", media)

    const entuPicId = media.db_value
    const pic_name = media.value

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
     console.log('ENTU PIC ID ', entuPicId);
    function doRequest() {
        return new Promise(function(resolve, reject) {
            request(options, async function(error, response) {
                console.log(response.statusCode);
                if( response.statusCode === 413){
                    console.log('StatusCode:', response.statusCode, 'Request Entity Too Large')
                }
                if (error){
                    reject(error)
                } else {
                    resolve(response.body)
                }
            })
        })
    }

    async function GetId() {
        try {
            let res = await doRequest()
            // console.log('res = ', res);
            media.id = JSON.parse(res)[0].id
        } catch (error) {
            // console.log('Error: ', error);
        }

    }


    await GetId();

}

// const getStrapiIds = () => {
//     performancePicsJSON.map(performance_media => {
//         performance_media.id = (performances_from_strapi.filter(s_performance => {
//                 return s_performance.remote_id === performance_media.entu_id.toString()
//             })[0] || {}).id || null
//         return performance_media
//     })
// }

const getStrapiIds = () => {
    echoPicsJSON.map(article_media => {
        article_media.id = (articles_from_strapi.filter(s_article => {
                return s_article.remote_id === article_media.entu_id.toString()
            })[0] || {}).id || null
        return article_media
    })
}

// async function send_pic_and_create_relation() {
//     getStrapiIds()
//     for (const performance_medias of performancePicsJSON) {
//         const strapi_id = performance_medias.id
//         performance_medias.performance_media = performance_medias.medias
//         delete performance_medias.medias
//         for (const media of performance_medias.performance_media) {
//             for ( let i = 0; i < Object.keys(media).length; i++){
//                 await sendPic(media[Object.keys(media)[i]]) // lisab meediale strapi id
//                 // console.log(media[Object.keys(media)[i]].id)
//                 if (media[Object.keys(media)[i]].id == undefined){
//                     // console.log(media[Object.keys(media)[i]])
//                     delete media[Object.keys(media)[i]]
//                     i--
//                 }

//             }
//         }

//         // console.log(JSON.stringify(performance_medias, 0, 4));
//     }


//     console.log(JSON.stringify(performancePicsJSON, 0, 4))
//     putToStrapi(performancePicsJSON, 'performances')
// }

async function send_pic_and_create_relation() {
    getStrapiIds()
    for (const article_medias of echoPicsJSON) {
        const strapi_id = article_medias.id
        article_medias.article_media = article_medias.medias
        delete article_medias.medias
        for (const media of article_medias.article_media) {
            for ( let i = 0; i < Object.keys(media).length; i++){
                await sendPic(media[Object.keys(media)[i]]) // lisab meediale strapi id
                // console.log(media[Object.keys(media)[i]].id)
                if (media[Object.keys(media)[i]].id == undefined){
                    // console.log(media[Object.keys(media)[i]])
                    delete media[Object.keys(media)[i]]
                    i--
                }

            }
        }

        // console.log(JSON.stringify(article_medias, 0, 4));
    }


    console.log(JSON.stringify(echoPicsJSON, 0, 4))
    putToStrapi(echoPicsJSON, 'articles')
}



send_pic_and_create_relation()


// KIRJUTA STAPI PERFORMANCE_MEDIA TYHJAKS

// let performance = performancePicsJSON.map( perf => {

//     let strapi_id = performances_from_strapi.filter(s_performance => {
//         return s_performance.remote_id === perf.entu_id.toString()
//     }).map( e => e.id )

//     return {
//         "id": strapi_id,
//         "performance_media": []
//     }


// })

// console.log(performance)
// putToStrapi(performance, 'performances')
