const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')
const util = require('util')

const { strapiQuery, postToStrapi, putToStrapi, getFromStrapi } = require("./strapiQueryMod.js")


const entuDataPath = path.join(__dirname, '..', 'data-transfer', 'from_entu')
const strapiDataPath = path.join(__dirname, '..', 'data-transfer', 'from_strapi')

const articles_from_strapi = yaml.safeLoad(fs.readFileSync(path.join(strapiDataPath, 'articles.yaml')))
const banners_from_strapi = yaml.safeLoad(fs.readFileSync(path.join(strapiDataPath, 'banners.yaml')))
const strapi_banner_types = yaml.safeLoad(fs.readFileSync(path.join(strapiDataPath, 'bannerTypes.yaml')))
const categories_from_strapi = yaml.safeLoad(fs.readFileSync(path.join(strapiDataPath, 'categories.yaml')))
const coverages_from_strapi = yaml.safeLoad(fs.readFileSync(path.join(strapiDataPath, 'coverages.yaml')))
const events_from_strapi = yaml.safeLoad(fs.readFileSync(path.join(strapiDataPath, 'events.yaml')))
const locations_from_strapi = yaml.safeLoad(fs.readFileSync(path.join(strapiDataPath, 'locations.yaml')))
const news_from_strapi = yaml.safeLoad(fs.readFileSync(path.join(strapiDataPath, 'news.yaml')))
const people_from_strapi = yaml.safeLoad(fs.readFileSync(path.join(strapiDataPath, 'people.yaml')))
const performances_from_strapi = yaml.safeLoad(fs.readFileSync(path.join(strapiDataPath, 'performances.yaml')))

async function bannerTypeToStrapi() {
    const dataJSON = path.join(entuDataPath, 'banner-type.json')

    let bannerJSON = JSON.parse(fs.readFileSync(dataJSON, 'utf-8'))

    let banner_type = bannerJSON.map(banner_type_entity => {
        return {
            "remote_id": banner_type_entity.id.toString(),
            "width": banner_type_entity.properties.width.values[0].db_value,
            "height": banner_type_entity.properties.height.values[0].db_value,
            "created_at": banner_type_entity.properties['entu-created-at'].values[0].db_value,
            "updated_at": banner_type_entity.properties['entu-changed-at'].values[0].db_value,
            "published_at": banner_type_entity.properties['entu-changed-at'].values[0].db_value,
            "name": banner_type_entity.displayname
        }
    })

    postToStrapi(banner_type, 'banner-types')
}

async function bannerToStrapi() {
    const dataJSON = path.join(entuDataPath, 'banner.json')

    let bannerJSON = JSON.parse(fs.readFileSync(dataJSON, 'utf-8'))


    let banner = bannerJSON.map(banner_entity => {
        let remote_id = (banner_entity.properties.type.values.length > 0 ? banner_entity.properties.type.values[0].db_value.toString() : null)
        let strapi_banner_type_id = strapi_banner_types.filter(strapi_banner => {
            if (remote_id !== null) {
                return banner_entity.properties.type.values[0].db_value.toString() === strapi_banner.remote_id
            } else {
                return null
            }
        })[0]

        starpi_banner_id = banners_from_strapi.filter(s_banner => {
            return s_banner.remote_id === banner_entity.id.toString()
        }).map(e => { return e.id })[0]

        return {
            "remote_id": banner_entity.id.toString(),
            // "image": { // hetkel ei impordi
            //     name: banner_entity.properties.photo.values[0].value
            // }
            "url": banner_entity.properties.url.values[0].db_value,
            "order": (banner_entity.properties.ordinal.values.length > 0 ? banner_entity.properties.ordinal.values[0].db_value.toString() : ''),
            "banner_type": strapi_banner_type_id,
            "created_at": banner_entity.properties['entu-created-at'].values[0].db_value,
            "updated_at": banner_entity.properties['entu-changed-at'].values[0].db_value,
            "published_at": banner_entity.properties['entu-changed-at'].values[0].db_value,
            "name": banner_entity.displayname,
            "start": (banner_entity.properties.start.values.length > 0 ? banner_entity.properties.start.values[0].db_value : null),
            "end": (banner_entity.properties.end.values.length > 0 ? banner_entity.properties.end.values[0].db_value : null),
            "id": starpi_banner_id
        }
    })

    // console.log(util.inspect(banner, null, 4))

    // PUT
    putToStrapi(banner, 'banners')

    // POST
    // postToStrapi(banner, 'banners')
}

async function categoriesToStrapi() {
    const dataJSON = path.join(entuDataPath, 'category.json')

    let categoryJSON = JSON.parse(fs.readFileSync(dataJSON, 'utf-8'))



    let category = categoryJSON.map(category_entity => {

        starpi_category_id = categories_from_strapi.filter(s_category => {
            return s_category.remote_id === category_entity.id.toString()
        }).map(e => { return e.id })[0]

        return {
            "remote_id": category_entity.id.toString(),
            "name_et": category_entity.properties['et-name'].values[0].db_value,
            "name_en": category_entity.properties['en-name'].values[0].db_value,
            "featured_on_front_page": false,
            "id": starpi_category_id
        }
    })
    // console.log(category);

    // PUT
    putToStrapi(category, 'categories')

    // POST
    // postToStrapi(category, 'categories')
}

async function personToStrapi() {
    const dataJSON = path.join(entuDataPath, 'person.json')

    let personJSON = JSON.parse(fs.readFileSync(dataJSON, 'utf-8'))

    let count = 0
    let people = personJSON.map(person_entity => {

        starpi_person_id = people_from_strapi.filter(s_person => {
            return s_person.remote_id === person_entity.id.toString()
        }).map(e => { return e.id })[0]

        count += 1
        return {
            "remote_id": person_entity.id.toString(),
            "first_name": (person_entity.properties.forename.values.length > 0 ? person_entity.properties.forename.values[0].db_value : null),
            "last_name": (person_entity.properties.surname.values.length > 0 ? person_entity.properties.surname.values[0].db_value : null),
            "email": (person_entity.properties.email.values.length > 0 ? person_entity.properties.email.values[0].db_value : null),
            'phone_number': (person_entity.properties.phone.values.length > 0 ? person_entity.properties.phone.values[0].db_value : null),
            'occupation': (person_entity.properties.occupation.values.length > 0 ? person_entity.properties.occupation.values[0].db_value : null),
            "order": (person_entity.properties.ordinal.values.length > 0 ? person_entity.properties.ordinal.values[0].db_value : null),
            "id": starpi_person_id

        }
    })
    // console.log(people, count);

    // PUT
    putToStrapi(people, 'people')

    // POST
    // postToStrapi(people, 'people')
}

let starpi_performance_id = ''

async function performanceToStrapi() {
    const dataJSON = path.join(entuDataPath, 'performance.json')

    let performanceJSON = JSON.parse(fs.readFileSync(dataJSON, 'utf-8'))

    let performances = performanceJSON.map(performance_entity => {

        const performance_category_remote_ids = performance_entity.properties.category.values.map(entu_value => entu_value.db_value.toString())
        let performance_categories = categories_from_strapi.filter(strapi_category => {
            return performance_category_remote_ids.includes(strapi_category.remote_id)
        }).map(strapi_category => { return { id: strapi_category.id } })
        // console.log({performance_category_remote_ids, performance_categories});

        let photoGallery = performance_entity.properties['photo-gallery'].values.map(photo => {return photo.db_value} ).toString()
        let photo = performance_entity.properties.photo.values.map(photo => {return photo.db_value} ).toString()
        let photoOriginal = performance_entity.properties['photo-original'].values.map(photo => {return photo.db_value} ).toString()
        let photoMedium = performance_entity.properties['photo-medium'].values.map(photo => {return photo.db_value} ).toString()
        let photoBig = performance_entity.properties['photo-big'].values.map(photo => {return photo.db_value} ).toString()

        let entu_premiere_time = ''
        if (performance_entity.properties['premiere-time'].values.length === 0) {
            entu_premiere_time = null
        } else if (performance_entity.properties['premiere-time'].values[0].value === '') {
            entu_premiere_time = null
        } else {
            entu_premiere_time = performance_entity.properties['premiere-time'].values[0].value
        }


        let coverage_ids = coverages_from_strapi.filter( s_coverage => {
            let e_coverage_remote_ids = performance_entity.childs.filter( child => {
                return child.definition_keyname === 'coverage'
            }).map(e_coverage => e_coverage.id.toString())

            return e_coverage_remote_ids.includes(s_coverage.remote_id)
        }).map( e => e.id)

        let performance_videos = []
        if (performance_entity.properties.video.values.length > 0) {
            for( i=0; i < performance_entity.properties.video.values.length; i++){
                let video = {"content":  performance_entity.properties.video.values[i].db_value }
                performance_videos.push(video)
            }
        }

        let performance_audios = []
        if (performance_entity.properties.audio.values.length > 0) {
            for( i=0; i < performance_entity.properties.audio.values.length; i++){
                let audio = {"content":  performance_entity.properties.audio.values[i].db_value }
                performance_audios.push(audio)
            }
        }

        starpi_performance_id = performances_from_strapi.filter(s_performance => {
            return s_performance.remote_id === performance_entity.id.toString()
        }).map(e => { return e.id })[0]


        return {
            "remote_id": performance_entity.id.toString(),
            "name_et": (performance_entity.properties['et-name'].values.length > 0 ? performance_entity.properties['et-name'].values[0].db_value : null),
            "name_en": (performance_entity.properties['en-name'].values.length > 0 ? performance_entity.properties['en-name'].values[0].db_value : null),
            "subtitle_et": (performance_entity.properties['et-subtitle'].values.length > 0 ? performance_entity.properties['et-subtitle'].values[0].db_value : null),
            "subtitle_en": (performance_entity.properties['en-subtitle'].values.length > 0 ? performance_entity.properties['en-subtitle'].values[0].db_value : null),
            "categories": performance_categories,
            "coproduction": performance_entity.properties.coprod.values.length > 0 ? performance_entity.properties.coprod.values[0].db_value : null,
            "coproduction_importance": (performance_entity.properties.coprodOrdinal.values.length > 0 ? performance_entity.properties.coprodOrdinal.values[0].db_value : null),
            "front_page_promotion": (performance_entity.properties.featured.values.length > 0 ? performance_entity.properties.featured.values[0].db_value : null),
            "purchase_description_et": (performance_entity.properties['et-purchase-description'].values.length > 0 ? performance_entity.properties['et-purchase-description'].values[0].db_value : null),
            "purchase_description_en": (performance_entity.properties['en-purchase-description'].values.length > 0 ? performance_entity.properties['en-purchase-description'].values[0].db_value : null),
            "X_premiere_time": entu_premiere_time,
            "description_et": (performance_entity.properties['et-description'].values.length > 0 ? performance_entity.properties['et-description'].values[0].db_value : null),
            "description_en": (performance_entity.properties['en-description'].values.length > 0 ? performance_entity.properties['en-description'].values[0].db_value : null),
            "technical_info_et": (performance_entity.properties['et-technical-information'].values.length > 0 ? performance_entity.properties['et-technical-information'].values[0].db_value : null),
            "technical_info_en": (performance_entity.properties['en-technical-information'].values.length > 0 ? performance_entity.properties['en-technical-information'].values[0].db_value : null),
            "X_artist": (performance_entity.properties.artist.values.length > 0 ? performance_entity.properties.artist.values[0].db_value : ''),
            "X_producer": (performance_entity.properties.producer.values.length > 0 ? performance_entity.properties.producer.values[0].db_value : ''),
            "X_other_works": (performance_entity.properties.otherWork.values.length > 0 ? performance_entity.properties.otherWork.values[0].value : ''),
            "X_headline_et": (performance_entity.properties['et-supertitle'].values.length > 0 ? performance_entity.properties['et-supertitle'].values[0].db_value : null),
            "X_headline_en": (performance_entity.properties['en-supertitle'].values.length > 0 ? performance_entity.properties['en-supertitle'].values[0].db_value : null),
            "X_town_et": (performance_entity.properties['et-town'].values.length > 0 ? performance_entity.properties['et-town'].values[0].db_value : null),
            "X_town_en": (performance_entity.properties['en-town'].values.length > 0 ? performance_entity.properties['en-town'].values[0].db_value : null),
            "X_pictures": {
                "photoGallery": photoGallery,
                "photo": photo,
                "photoOriginal": photoOriginal,
                "photoMedium": photoMedium,
                "photoBig": photoBig
            },
            // "raiders":
            "coverages": coverage_ids,
            "videos": performance_videos,
            "audios": performance_audios,
            "id": starpi_performance_id

        }

    })

    performancesToPost = performances.filter(performance => {return performance.id === undefined})
    // console.log(JSON.stringify(performances.filter(p => p.X_town_et), null, 4))
    // console.log(performances.filter(p => p.X_town_et).map(t => t.X_town_et + ', ' + t.X_town_en + ' ' + t.remote_id + ' ' + t.id).join("\n"))
    for(performance of performancesToPost){
        // console.log(performance.remote_id)
    }

    // console.log(performances)
    // PUT
    putToStrapi(performances, 'performances')

    // POST
    // console.log(performancesToPost);
    // postToStrapi(performancesToPost, 'performances')

}

async function coveragesToStrapi() {
    const dataJSON = path.join(entuDataPath, 'coverage.json')

    let coverageJSON = JSON.parse(fs.readFileSync(dataJSON, 'utf-8'))

    let relations = yaml.safeLoad(fs.readFileSync(path.join(__dirname, '..', 'data-transfer', 'from_entu', 'coverage-rel-performance.yaml')))
    let coveragesFromStrapi = yaml.safeLoad(fs.readFileSync(path.join(strapiDataPath, 'coverages.yaml')))
    // console.log(coveragesFromStrapi)

    let coverages = coverageJSON.map(coverage_entity => {

        let coverage_id = coverage_entity.id.toString()

        let performance_id = (
            relations.filter(relation => coverage_id === relation.coverage_id)[0] || {}
        ).performance_id || null

        starpi_coverage_id = coverages_from_strapi.filter(s_coverage => {
            return s_coverage.remote_id === coverage_entity.id.toString()
        }).map(e => { return e.id })[0]

        return {
            "remote_id": coverage_id,
            "title": (coverage_entity.properties.title.values.length > 0 ? coverage_entity.properties.title.values[0].db_value : null),
            // "performance": performance_id,
            "source": (coverage_entity.properties.source.values.length > 0 ? coverage_entity.properties.source.values[0].db_value : null),
            "url": (coverage_entity.properties.url.values.length > 0 ? coverage_entity.properties.url.values[0].db_value : null),
            "content": (coverage_entity.properties.text.values.length > 0 ? coverage_entity.properties.text.values[0].db_value : null),
            "publish_date": (coverage_entity.properties.date.values.length > 0 ? coverage_entity.properties.date.values[0].db_value : null),
            "id": starpi_coverage_id
        }
    })
    // console.log(coverages)

    // PUT
    putToStrapi(coverages, 'coverages')

    // postToStrapi(coverages, 'coverages')
}

async function locationToStrapi() {
    const dataJSON = path.join(entuDataPath, 'location.json')

    let locationJSON = JSON.parse(fs.readFileSync(dataJSON, 'utf-8'))


    let locations = locationJSON.map(location_entity => {

        let entu_name = (location_entity.properties['et-name'].values.length > 0 ? location_entity.properties['et-name'].values[0].db_value : null)

        // let strapi_hall_id = halls_from_strapi.filter( strapi_hall => {
        //     if (entu_name !== null){
        //         return location_entity.properties['et-name'].values[0].db_value.toString().includes(strapi_hall.name_et)
        //     }
        // } ).map( element => { return { id: element.id}})[0]

        starpi_location_id = locations_from_strapi.filter(s_location => {
            return s_location.remote_id === location_entity.id.toString()
        }).map(e => { return e.id })[0]

        return {
            "remote_id": location_entity.id.toString(),
            "name_et": entu_name,
            "name_en": (location_entity.properties['en-name'].values.length > 0 ? location_entity.properties['en-name'].values[0].db_value : null),
            "description_et": (location_entity.properties['et-description'].values.length > 0 ? location_entity.properties['et-description'].values[0].db_value : null),
            "description_en": (location_entity.properties['en-description'].values.length > 0 ? location_entity.properties['en-description'].values[0].db_value : null),
            "id": starpi_location_id
        }
    })
    // console.log(locations)

    // PUT
    putToStrapi(locations, 'locations')

    // POST
    // postToStrapi(locations, 'locations')
}

async function articlesToStrapi() {
    const dataJSON = path.join(entuDataPath, 'echo.json')

    let echoJSON = JSON.parse(fs.readFileSync(dataJSON, 'utf-8'))

    let articles = echoJSON.map(article_entity => {

        let strapi_category_ids = article_entity.properties.category.values.map(e_category => {
            let entu_id = e_category.db_value
            let strapi_categories = categories_from_strapi.filter(s_category => {
                return s_category.remote_id === entu_id.toString()
            })
            let strapi_category_id = (strapi_categories[0] || {}).id || null
            return { id: strapi_category_id }
        })

        let strapi_people_ids = article_entity.properties.author.values.map(e_author => {
            let strapi_people = people_from_strapi.filter(strapi_person => {
                return e_author.db_value.toString() === strapi_person.remote_id
            })

            let strapi_person_id = (strapi_people[0] || {}).id || null
            return { id: strapi_person_id }
        })

        let starpi_article_id = articles_from_strapi.filter(s_article => {
            return s_article.remote_id === article_entity.id.toString()
        }).map(e => { return e.id })[0]


        let article_videos = []
        if (article_entity.properties.video.values.length > 0) {
            for( i=0; i < article_entity.properties.video.values.length; i++){
                let video = {"content":  article_entity.properties.video.values[i].db_value }
                article_videos.push(video)
            }
        }

        let article_audios = []
        if (article_entity.properties.audio.values.length > 0) {
            for( i=0; i < article_entity.properties.audio.values.length; i++){
                let audio = {"content":  article_entity.properties.audio.values[i].db_value }
                article_audios.push(audio)
            }
        }

        let photo = article_entity.properties.photo.values.map(photo => {return photo.db_value} ).toString()
        let photoOriginal = article_entity.properties['photo-original'].values.map(photo => {return photo.db_value} ).toString()
        let photoMedium = article_entity.properties['photo-medium'].values.map(photo => {return photo.db_value} ).toString()
        let photoBig = article_entity.properties['photo-big'].values.map(photo => {return photo.db_value} ).toString()

        return {
            "remote_id": article_entity.id.toString(),
            "title_et": (article_entity.properties['et-title'].values.length > 0 ? article_entity.properties['et-title'].values[0].db_value : null),
            "title_en": (article_entity.properties['en-title'].values.length > 0 ? article_entity.properties['en-title'].values[0].db_value : null),
            "subtitle_et": (article_entity.properties['et-subtitle'].values.length > 0 ? article_entity.properties['et-subtitle'].values[0].db_value : null),
            "subtitle_en": (article_entity.properties['en-subtitle'].values.length > 0 ? article_entity.properties['en-subtitle'].values[0].db_value : null),
            "publish_date": (article_entity.properties.date.values.length > 0 ? article_entity.properties.date.values[0].db_value : null),
            "front_page_promotion": (article_entity.properties.featured.values.length > 0 ? article_entity.properties.featured.values[0].db_value : null),
            "categories": strapi_category_ids,
            "authors": strapi_people_ids,
            "hide_gallery": (article_entity.properties['hide-gallery'].values.length > 0 ? article_entity.properties['hide-gallery'].values[0].db_value : null),
            "photo_article": (article_entity.properties['pics-only'].values.length > 0 ? article_entity.properties['pics-only'].values[0].db_value : null),
            "audio": article_audios,
            "video": article_videos,
            "content_et": (article_entity.properties['et-contents'].values.length > 0 ? article_entity.properties['et-contents'].values[0].db_value : null),
            "content_en": (article_entity.properties['en-contents'].values.length > 0 ? article_entity.properties['en-contents'].values[0].db_value : null),
            "created_at": article_entity.properties['entu-created-at'].values[0].db_value,
            "updated_at": article_entity.properties['entu-changed-at'].values[0].db_value,
            "published_at": article_entity.properties['entu-changed-at'].values[0].db_value,
            "X_pictures": {
                "photo": photo,
                "photoOriginal": photoOriginal,
                "photoMedium": photoMedium,
                "photoBig": photoBig
            },
            "id": starpi_article_id

        }
    })

    for (article of articles){
        // console.log(article.id)
        // console.log(article.X_pictures);
    }

    articlesToPost = articles.filter(article => {return article.id === undefined})
    for(article of articlesToPost){
        // console.log(article.remote_id)
    }


    // console.log(util.inspect(articles, null, 4))

    // PUT
    putToStrapi(articles, 'articles')

    // POST
    // postToStrapi(articlesToPost, 'articles')
}

async function eventsToStrapi() {

    const dataJSON = path.join(entuDataPath, 'event.json')
    let eventJSON = JSON.parse(fs.readFileSync(dataJSON, 'utf-8'))
    let relations = yaml.safeLoad(fs.readFileSync(path.join(entuDataPath, 'entu_kaustad_syndmused.yaml')), 'utf-8')

    let events = eventJSON.map(event_entity => {

        let strapi_category_ids = event_entity.properties.category.values.map(e_category => {
            let entu_id = e_category.db_value
            let strapi_categories = categories_from_strapi.filter(s_category => {
                return s_category.remote_id === entu_id.toString()
            })
            let strapi_category_id = (strapi_categories[0] || {}).id || null
            return { id: strapi_category_id }
        })

        let entu_performance_id = (event_entity.properties.performance.values.length > 0 ? event_entity.properties.performance.values[0].db_value.toString() : null)

        let strapi_performance = null
        if (entu_performance_id !== null) {

            strapi_performance = performances_from_strapi.filter(strapi_performance => {
                return entu_performance_id === strapi_performance.remote_id
            }).map(element => { return { id: element.id } })[0]
            // console.log({entu_performance_id, tmp, strapi_performance_id});
        }

        let entu_location = ((event_entity.properties['saal-location'].values.length > 0 ? event_entity.properties['saal-location'].values[0].db_value : '') === null ? "" : (event_entity.properties['saal-location'].values.length > 0 ? event_entity.properties['saal-location'].values[0].db_value : ''))

        let strapi_location_id = locations_from_strapi.filter( s_location => {
            return s_location.remote_id === entu_location.toString()

        }).map( e => { return e.id })[0] || null

        let strapi_event_id = events_from_strapi.filter(s_event => {
            return s_event.remote_id === event_entity.id.toString()
        }).map(e => { return e.id })[0] || null

        let eventType = null

        for (let type in relations){
            if (relations[type].syndmused.includes(event_entity.id )){
                eventType = type
            }
        }

        let event_videos = []
        if (event_entity.properties.video.values.length > 0) {
            for( i=0; i < event_entity.properties.video.values.length; i++){
                let video = {"content":  event_entity.properties.video.values[i].db_value }
                event_videos.push(video)
            }
        }

        let event_audios = []
        if (event_entity.properties.audio.values.length > 0) {
            for( i=0; i < event_entity.properties.audio.values.length; i++){
                let audio = {"content":  event_entity.properties.audio.values[i].db_value }
                event_audios.push(audio)
            }
        }

        let coverage_ids = coverages_from_strapi.filter( s_coverage => {
            let e_coverage_remote_ids = event_entity.childs.filter( child => {
                return child.definition_keyname === 'coverage'
            }).map(e_coverage => e_coverage.id.toString())

            return e_coverage_remote_ids.includes(s_coverage.remote_id)
        }).map( e => e.id)


        let x_ticket_info =
        {
            "pl_link_et": (event_entity.properties['et-pl-link'].values.length > 0 ? event_entity.properties['et-pl-link'].values[0].db_value : null),
            "pl_link_en": (event_entity.properties['en-pl-link'].values.length > 0 ? event_entity.properties['en-pl-link'].values[0].db_value : null),
            "ticket_api": (event_entity.properties['ticket-api'].values.length > 0 ? event_entity.properties['ticket-api'].values[0].db_value : null),
            "min_price": (event_entity.properties['min-price'].values.length > 0 ? event_entity.properties['min-price'].values[0].db_value : null),
            "max_price": (event_entity.properties['max-price'].values.length > 0 ? event_entity.properties['max-price'].values[0].db_value : null),
            "sales_status": (event_entity.properties['sales-status'].values.length > 0 ? event_entity.properties['sales-status'].values[0].db_value : null),
            "pl_id": (event_entity.properties['pl-id'].values.length > 0 ? (event_entity.properties['pl-id'].values[0].db_value).toString() : null),
            "price": (event_entity.properties['price'].values.length > 0 ? event_entity.properties['price'].values[0].db_value : null),
            "onsite_price": (event_entity.properties['onsite-price'].values.length > 0 ? event_entity.properties['onsite-price'].values[0].db_value : null)
        }


        return {
            "remote_id": event_entity.id.toString(),
            "categories": strapi_category_ids,
            "name_et": (event_entity.properties['et-name'].values.length > 0 ? event_entity.properties['et-name'].values[0].db_value : null),
            "name_en": (event_entity.properties['en-name'].values.length > 0 ? event_entity.properties['en-name'].values[0].db_value : null),
            "subtitle_et": (event_entity.properties['et-subtitle'].values.length > 0 ? event_entity.properties['et-subtitle'].values[0].db_value : null),
            "subtitle_en": (event_entity.properties['en-subtitle'].values.length > 0 ? event_entity.properties['en-subtitle'].values[0].db_value : null),
            "resident": (event_entity.properties.resident.values.length > 0 ? event_entity.properties.resident.values[0].db_value : null),
            "performance": strapi_performance,
            "type": eventType,
            "hide_from_page": (event_entity.properties.nopublish.values.length > 0 ? event_entity.properties.nopublish.values[0].db_value : null),
            "canceled": (event_entity.properties.canceled.values.length > 0 ? event_entity.properties.canceled.values[0].db_value : null),
            "conversation": (event_entity.properties.talk.values.length > 0 ? event_entity.properties.talk.values[0].db_value : null),
            "X_ticket_info": x_ticket_info,
            "start_time": (event_entity.properties['start-time'].values.length > 0 ? event_entity.properties['start-time'].values[0].db_value : null),
            "end_time": (event_entity.properties['end-time'].values.length > 0 ? event_entity.properties['end-time'].values[0].db_value : null),
            "duration": (event_entity.properties['duration'].values.length > 0 ? event_entity.properties['duration'].values[0].db_value : null),
            "location": strapi_location_id,
            "X_location_et": (event_entity.properties['et-location'].values.length > 0 ? event_entity.properties['et-location'].values[0].db_value : null),
            "X_location_en": (event_entity.properties['en-location'].values.length > 0 ? event_entity.properties['en-location'].values[0].db_value : null),
            "description_et": (event_entity.properties['et-description'].values.length > 0 ? event_entity.properties['et-description'].values[0].db_value : null),
            "description_en": (event_entity.properties['en-description'].values.length > 0 ? event_entity.properties['en-description'].values[0].db_value : null),
            "technical_info_et": (event_entity.properties['et-technical-information'].values.length > 0 ? event_entity.properties['et-technical-information'].values[0].db_value : null),
            "technical_info_en": (event_entity.properties['en-technical-information'].values.length > 0 ? event_entity.properties['en-technical-information'].values[0].db_value : null),
            "online": (event_entity.properties.online.values.length > 0 ? event_entity.properties.online.values[0].db_value : null),
            "video": event_videos,
            "audio": event_audios,
            "coverages": coverage_ids,
            "order": (event_entity.properties.ordinal.values.length > 0 ? event_entity.properties.ordinal.values[0].db_value : null),
            "id": strapi_event_id

        }
    })

    // let eventsToPost = events.filter( e => e.id === undefined)
    // console.log(eventsToPost);

    // for (let i = 0; i < 10; i++) {
    //     console.log(JSON.stringify(events, null, 4))

    // }

    // // PUT
    putToStrapi(events, 'events')

    // // POST
    // postToStrapi(eventsToPost, 'events')
}

function eventRemote2Strapi(remote_id) {
    for (const event of events_from_strapi) {
        if (event.remote_id === remote_id.toString()){
            return event.id
        }
    }
}

async function eventChildRelationToStrapi(){
    const relationJSON = yaml.safeLoad(fs.readFileSync(path.join(entuDataPath, 'entu_festivalid.yaml')))

    const strapi_relations = []
    for(let parent_remote_id in relationJSON){
        const strapi_relation = {}
        // console.log('siin', parent_remote_id)
        const child_ids = relationJSON[parent_remote_id].map(child_remote_id => eventRemote2Strapi(child_remote_id))
        // strapi_relations[eventRemote2Strapi(parent_remote_id)] = child_ids
        strapi_relation.id = eventRemote2Strapi(parent_remote_id)
        strapi_relation.child_events = child_ids
        strapi_relations.push(strapi_relation)

    }

    putToStrapi(strapi_relations, 'events')
    console.log({relationJSON, strapi_relations})
}

async function newsToStrapi() {

    const dataJSON = path.join(entuDataPath, 'news.json')

    let newsJSON = JSON.parse(fs.readFileSync(dataJSON, 'utf-8'))

    let news = newsJSON.map(news_entity => {

        let strapi_news_id = news_from_strapi.filter(s_news => {
            return s_news.remote_id === news_entity.id.toString()
        }).map(e => { return e.id })[0]

        return {
            "remote_id": news_entity.id.toString(),
            "title_et": (news_entity.properties['et-title'].values.length > 0 ? news_entity.properties['et-title'].values[0].db_value : null),
            "title_en": (news_entity.properties['en-title'].values.length > 0 ? news_entity.properties['en-title'].values[0].db_value : null),
            "content_et": (news_entity.properties['et-body'].values.length > 0 ? news_entity.properties['et-body'].values[0].db_value : null),
            "content_en": (news_entity.properties['en-body'].values.length > 0 ? news_entity.properties['en-body'].values[0].db_value : null),
            "related_media": (news_entity.properties['sw-media'].values.length > 0 ? news_entity.properties['sw-media'].values[0].db_value : null),

            "created_at": (news_entity.properties['entu-created-at'].values.length > 0 ? news_entity.properties['entu-created-at'].values[0].db_value : null),
            "updated_at": (news_entity.properties['entu-changed-at'].values.length > 0 ? news_entity.properties['entu-changed-at'].values[0].db_value : null),
            "published_at": (news_entity.properties.time.values.length > 0 ? news_entity.properties.time.values[0].db_value : null),
            "id": strapi_news_id

        }
    })
    // console.log(util.inspect(news, null, 4))

    // PUT
    putToStrapi(news, 'newscasts')

    // POST
    // postToStrapi(news, 'newscasts')
}

async function labelsToStrapi() {

    let labelsYAML = yaml.safeLoad(fs.readFileSync(path.join(__dirname, '..', 'data-transfer', 'from_entu', 'locales.yaml')))

    let labels = []

    for (label in labelsYAML) {
        let underlabels = []

        for (underlabel in labelsYAML[label]) {
            underlabels.push(
                {
                    name: underlabel,
                    value_en: labelsYAML[label][underlabel].en,
                    value_et: labelsYAML[label][underlabel].et
                }
            )
        }
        labels.push(
            {
                name: label,
                label: underlabels
            }
        )
    }

    // console.log(util.inspect(labels, { showHidden: false, depth: null }))

    postToStrapi(labels, 'label-groups')
}

async function fromStrapi(cType, yamlName) {
    let data = await (getFromStrapi(cType))

    if (cType.includes('-')) {
        cType = cType.replace(cType[cType.indexOf('-') + 1], cType[cType.indexOf('-') + 1].toUpperCase())
        cType = cType.replace('-', '')
    }
    let filename = yamlName || cType

    fs.writeFileSync(path.join(strapiDataPath, filename + '.yaml'), yaml.safeDump(data, { 'indent': '4' }), "utf8")
}

async function main() {

    // await bannerTypeToStrapi()
    // await bannerToStrapi()
    // await categoriesToStrapi()
    // await personToStrapi()
    // await performanceToStrapi()
    // await coveragesToStrapi()
    // await locationToStrapi()
    // await eventsToStrapi()
    // await eventChildRelationToStrapi()
    // await newsToStrapi()
    // await labelsToStrapi()
    // await articlesToStrapi()

    // await fromStrapi('banner-types')
    // await fromStrapi('banners')
    // await fromStrapi('categories')
    // await fromStrapi('people')
    // await fromStrapi('performances')
    // await fromStrapi('coverages')
    // await hallFromStrapi('halls')
    // await fromStrapi('locations')
    // await fromStrapi('articles')
    // await fromStrapi('events')
    // await fromStrapi('label-groups')
    // await fromStrapi('newscasts', 'news')
}

main()
