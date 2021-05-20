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
    getFromStrapi,
    deleteFromStrapi
} = require("./strapiQueryMod.js")
const entuDataPath = path.join(__dirname, '..', 'data-transfer', 'from_entu')
const strapiDataPath = path.join(__dirname, '..', 'data-transfer', 'from_strapi')

const performances_from_strapi = yaml.safeLoad(fs.readFileSync(path.join(strapiDataPath, 'performances.yaml')))
const articles_from_strapi = yaml.safeLoad(fs.readFileSync(path.join(strapiDataPath, 'articles.yaml')))
const events_from_strapi = yaml.safeLoad(fs.readFileSync(path.join(strapiDataPath, 'events.yaml')))
const coverages_from_strapi = yaml.safeLoad(fs.readFileSync(path.join(strapiDataPath, 'coverages.yaml')))

const performancePicsJSON = JSON.parse(fs.readFileSync(path.join(entuDataPath, 'performance.pics.json'), 'utf-8'))
const echoPicsJSON = JSON.parse(fs.readFileSync(path.join(entuDataPath, 'echo.pics.json'), 'utf-8'))
const eventPicsJSON = JSON.parse(fs.readFileSync(path.join(entuDataPath, 'event.pics.json'), 'utf-8'))
const coverageJSON = JSON.parse(fs.readFileSync(path.join(entuDataPath, 'coverage.json'), 'utf-8'))

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
        // console.log('doRequest', JSON.stringify(options, 0,2))
        return new Promise(function(resolve, reject) {
            request(options, async function(error, response) {
                console.log(response.statusCode);
                if( response.statusCode === 200){
                    resolve ({id: JSON.parse(response.body)[0].id, error: null})
                } else {
                    resolve ({id: null, error: response.statusCode})
                }
            })
        })
    }

    async function GetId() {
        for (let retry = 0; retry < 3; retry++) {
            // console.log('try', retry)
            let res = await doRequest()
            if (res.error) {
                console.log('retry', retry, 'error code', res)
                continue
            }
            if (res.id) {
                console.log('success', res)
                media.id = res.id
                return
            }
        }
        throw new Error('fail')
    }


    await GetId();

}

// PERFORMANCE_MEDIA
const getStrapiPerformanceIds = () => {
    performancePicsJSON.map(performance_media => {
        performance_media.id = (performances_from_strapi.filter(s_performance => {
                return s_performance.remote_id === performance_media.entu_id.toString()
            })[0] || {}).id || null
        return performance_media
    })
}

async function send_pic_and_create_relation_performances() {
    getStrapiPerformanceIds()
    for (const performance of performancePicsJSON) {
        const strapi_performance_id = performance.id
        performance.performance_media = performance.medias
        delete performance.medias
        for (const media of performance.performance_media) {
            const media_versions = Object.keys(media)
            for (const media_version of media_versions) {
                console.log('Lisan performance', strapi_performance_id, 'juurde meedia Strapi ID')
                await sendPic(media[media_version]) // lisab meediale strapi id
                console.log('Lisasin performance', strapi_performance_id, 'juurde meedia Strapi ID: ', media[media_version].id)
                if (media[media_version].id === undefined){
                    throw new Error('shouldnt happen')
                }
            }
        }


        // console.log(JSON.stringify([performance], 0, 4))
        putToStrapi([performance], 'performances')
    }

}

// ARTICLE_MEDIA
const getStrapiArticleIds = () => {
    echoPicsJSON.map(article_media => {
        article_media.id = (articles_from_strapi.filter(s_article => {
                return s_article.remote_id === article_media.entu_id.toString()
            })[0] || {}).id || null
        return article_media
    })
}

async function send_pic_and_create_relation_articles() {
    getStrapiArticleIds()
    for (const article of echoPicsJSON) {
        const strapi_article_id = article.id
        article.article_media = article.medias
        delete article.medias

        for (const media of article.article_media) {
            const media_versions = Object.keys(media)
            for (const media_version of media_versions) {
                console.log('Lisan article', strapi_article_id, 'juurde meedia Strapi ID')
                await sendPic(media[media_version]) // lisab meediale strapi id
                console.log('Lisasin article', strapi_article_id, 'juurde meedia Strapi ID: ', media[media_version].id)
                if (media[media_version].id === undefined){
                    throw new Error('shouldnt happen')
                }
            }
        }

        // for (const media of article_medias.article_media) {
        //     for ( let i = 0; i < Object.keys(media).length; i++){
        //         await sendPic(media[Object.keys(media)[i]]) // lisab meediale strapi id
        //         // console.log(media[Object.keys(media)[i]].id)
        //         if (media[Object.keys(media)[i]].id == undefined){
        //             // console.log(media[Object.keys(media)[i]])
        //             delete media[Object.keys(media)[i]]
        //             i--
        //         }

        //     }
        // }

        // console.log(JSON.stringify([article], 0, 4))
        putToStrapi([article], 'articles')
    }


}


// EVENT
const getStrapiEventIds = () => {
    eventPicsJSON.map(event_media => {
        event_media.id = (events_from_strapi.filter(s_event => {
                return s_event.remote_id === event_media.entu_id.toString()
            })[0] || {}).id || null
        return event_media
    })
}

async function send_pic_and_create_relation_events() {

    getStrapiEventIds()
    for (const event of eventPicsJSON) {
        const strapi_event_id = event.id
        event.event_media = event.medias
        delete event.medias

        for (const media of event.event_media) {
            const media_versions = Object.keys(media)
            for (const media_version of media_versions) {
                console.log('Lisan event', strapi_event_id, 'juurde meedia Strapi ID')
                await sendPic(media[media_version]) // lisab meediale strapi id
                console.log('Lisasin event', strapi_event_id, 'juurde meedia Strapi ID: ', media[media_version].id)
                if (media[media_version].id === undefined){
                    throw new Error('shouldnt happen')
                }
            }
        }

        console.log(JSON.stringify(event, 0, 4))
        putToStrapi(event, 'events')
    }
}

// LOGOS TO STRAPI
async function performance_logos_and_riders_from_entu(){
    let dataJSON = path.join(entuDataPath, 'performance.json')
    let performanceJSON = JSON.parse(fs.readFileSync(dataJSON, 'utf-8'))

    let get_strapi_performances = performanceJSON.map( e_performance => {
        let performance = performances_from_strapi.filter( s_performance => {
            // console.log('S', s_performance.remote_id, 'E', e_performance.id);
            return s_performance.remote_id === e_performance.id.toString()
        }).map( e => e.id)
        e_performance.strapi_id = performance
    })

    for (const performance of performanceJSON) {
        // console.log(performance.properties.logo.values)
        performance.logos = []
        for (const prop of performance.properties.logo.values) {
            // console.log(prop);
            await sendPic(prop)
        }

        for (const value of performance.properties.logo.values) {
            performance.logos.push(value.id)
        }
        performance.id = performance.strapi_id

        delete performance.displaypicture
        delete performance.displayname
        delete performance.properties
        delete performance.strapi_id

    }

    let perfJSON = []
    console.log(JSON.stringify(perfJSON, 0, 2))
    for (const perf of performanceJSON) {
        if (perf.logos.length > 0) {
            perfJSON.push(perf)
        }
    }
    // putToStrapi(perfJSON, 'performances')
}

async function coverage_media_to_strapi() {


    let get_strapi_coverages = coverageJSON.map( e_coverage => {
        let coverage = coverages_from_strapi.filter( s_coverage => {
            // console.log('S', s_coverage.remote_id, 'E', e_coverage.id)
            return s_coverage.remote_id === e_coverage.id.toString()
        }).map( e => e.id)
        e_coverage.strapi_id = coverage
    })

    for (const coverage of coverageJSON) {
        // console.log(coverage.properties.photo.values)
        coverage.media = []
        for (const prop of coverage.properties.photo.values) {
            // console.log(prop)
            await sendPic(prop)
        }

        for (const value of coverage.properties.photo.values) {
            // console.log(value);
            coverage.media.push(value.id)
        }
        coverage.id = coverage.strapi_id

        delete coverage.displaypicture
        delete coverage.displayname
        delete coverage.properties
        delete coverage.strapi_id
        delete coverage.childs

    }

    let coverage_JSON = []
    for (const coverage of coverageJSON) {
        if (coverage.media.length > 0) {
            coverage_JSON.push(coverage)
        }
    }
    console.log(JSON.stringify(coverage_JSON, 0, 2))

    putToStrapi(coverage_JSON, 'coverages')

}

// EVENT PIC TO STRAPI enam ei kasuta??
async function event_pic_and_relation_to_strapi() {

    const dataJSON = path.join(entuDataPath, 'event.json')
    let eventJSON = JSON.parse(fs.readFileSync(dataJSON, 'utf-8'))

    let strapi_id = eventJSON.map( e_event => {
        let event = events_from_strapi.filter( s_event => {
            return e_event.id.toString() === s_event.remote_id
        }).map( e => e.id)
        e_event.strapi_id = event
    })

    for (const event of eventJSON) {

        event.media = {}
        if(event.properties['photo-gallery'].values.length > 0 || event.properties['photo-original'].values.length > 0 || event.properties['photo'].values.length > 0 || event.properties['photo-big'].values.length > 0){
            event.media.gallery_image_medium = event.properties['photo-gallery'].values
            event.media.original_image = event.properties['photo-original'].values
            event.media.hero_image = event.properties['photo'].values
            event.media.gallery_image_large = event.properties['photo-big'].values

        }

        if( Object.keys(event.media).length < 1){
            delete event.media
        }

        // for( const element of event.properties['photo-gallery']){
        //     console.log(element )
        // }

        if( event.properties.performance.values.length > 0){
            // event.performance = event.properties.performance.values
            delete event
        }
        delete event.properties

        if( event.media ){
            console.log(JSON.stringify(event, 0, 2))

        }
    }
}

// KIRJUTA STRAPI PERFORMANCE_MEDIA TYHJAKS
async function delete_media_relation_performances() {
    let performance = performancePicsJSON.map( perf => {

        let strapi_id = performances_from_strapi.filter(s_performance => {
            return s_performance.remote_id === perf.entu_id.toString()
        }).map( e => e.id )

        return {
            "id": strapi_id,
            "performance_media": [],
            "logos": []
        }

    })

    console.log(performance)
    putToStrapi(performance, 'performances')

}

async function delete_media_relation_articles() {

    let article = echoPicsJSON.map( e_article => {

        let strapi_id = articles_from_strapi.filter(s_article => {
            return s_article.remote_id === e_article.entu_id.toString()
        }).map( e => e.id )

        return {
            "id": strapi_id,
            "article_media": []
        }

    })

    console.log(article)
    putToStrapi(article, 'articles')
}

async function delete_media_relation_events() {

    let event = eventPicsJSON.map( e_event => {

        let strapi_id = events_from_strapi.filter(s_event => {
            return s_event.remote_id === e_event.entu_id.toString()
        }).map( e => e.id )

        return {
            "id": strapi_id,
            "event_media": []
        }

    })

    console.log(event)
    putToStrapi(event, 'events')
}

async function delete_covetage_media_relation() {

    let coverage = coverageJSON.map( e_coverage => {

        let strapi_id = coverages_from_strapi.filter(s_coverage => {
            return s_coverage.remote_id === e_coverage.entu_id.toString()
        }).map( e => e.id )

        return {
            "id": strapi_id,
            "media": []
        }

    })

    console.log(coverage)
    putToStrapi(coverage, 'coverages')
}

async function delete_no_relation_media() {
    const all_media_from_strapi = await getFromStrapi('upload/files')

    let no_relation = all_media_from_strapi.filter( media => {
        return media.related.length === 0 
    }).map( strapi_id => strapi_id.id)

    for( let id of no_relation){
        console.log(`Delete media file from Strapi, id- ${id}, no relation found`)
        await deleteFromStrapi(`upload/files/${id}`)
    }
}

async function main() {
    await send_pic_and_create_relation_performances()
    await send_pic_and_create_relation_articles()
    // await send_pic_and_create_relation_events()

    await performance_logos_and_riders_from_entu()
    await coverage_media_to_strapi()

    // await delete_media_relation_performances()
    // await delete_media_relation_articles()
    // await delete_media_relation_events()
    // await delete_coverage_media_relations()
    await delete_no_relation_media()

}

main()