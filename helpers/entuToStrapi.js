const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')
const util = require('util')

const { strapiQuery, postToStrapi, getFromStrapi } = require("./strapiQuery.js")


const entuDataPath = path.join(__dirname, '..', 'data-transfer', 'from_entu')

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


async function bannerTypeFromStrapi() {
    let data = await (getFromStrapi(banner-types))
    fs.writeFileSync(path.join(__dirname, '..', 'data-transfer', 'from_strapi', 'bannerTypes.yaml'), yaml.safeDump(data, { 'indent': '4' }), "utf8")
}

async function bannerToStrapi() {
    const dataJSON = path.join(entuDataPath, 'banner.json')

    let bannerJSON = JSON.parse(fs.readFileSync(dataJSON, 'utf-8'))

    let strapi_banner_types = yaml.safeLoad(fs.readFileSync(path.join(__dirname, '..', 'data-transfer', 'from_strapi', 'bannerTypes.yaml')))

    let banner = bannerJSON.map(banner_entity => {
        let remote_id = (banner_entity.properties.type.values.length > 0 ? banner_entity.properties.type.values[0].db_value.toString() : null)
        let strapi_banner_type_id = strapi_banner_types.filter( strapi_banner => {
            if (remote_id !== null){
                return banner_entity.properties.type.values[0].db_value.toString() === strapi_banner.remote_id
            } else {
                return null
            }
        } )[0]

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
            "end": (banner_entity.properties.end.values.length > 0 ? banner_entity.properties.end.values[0].db_value : null)
        }
    })

    console.log(util.inspect(banner, null, 4))

    postToStrapi(banner, 'banners')
}

async function categoriesToStrapi() {
    const dataJSON = path.join(entuDataPath, 'category.json')

    let categoryJSON = JSON.parse(fs.readFileSync(dataJSON, 'utf-8'))


    let category = categoryJSON.map(category_entity => {
        return {
            "remote_id": category_entity.id.toString(),
            "name_et": category_entity.properties['et-name'].values[0].db_value,
            "name_en": category_entity.properties['en-name'].values[0].db_value,
            "featured_on_front_page": false
        }
    })
    // console.log(category);

    postToStrapi(category, 'categories')
}

async function categoriesFromStrapi() {
    let data = await (getFromStrapi('categories'))
    fs.writeFileSync(path.join(__dirname, '..', 'data-transfer', 'from_strapi', 'categories.yaml'), yaml.safeDump(data, { 'indent': '4' }), "utf8")
}


async function personToStrapi() {
    const dataJSON = path.join(entuDataPath, 'person.json')

    let personJSON = JSON.parse(fs.readFileSync(dataJSON, 'utf-8'))

    let count = 0
    let people = personJSON.map(person_entity => {
        count += 1
        return {
            "remote_id": person_entity.id.toString(),
            "first_name": (person_entity.properties.forename.values.length > 0 ? person_entity.properties.forename.values[0].db_value : null),
            "last_name": (person_entity.properties.surname.values.length > 0 ? person_entity.properties.surname.values[0].db_value : null),
            "email": (person_entity.properties.email.values.length > 0 ? person_entity.properties.email.values[0].db_value : null),
            'phone_number': (person_entity.properties.phone.values.length > 0 ? person_entity.properties.phone.values[0].db_value : null),
            'occupation': (person_entity.properties.occupation.values.length > 0 ? person_entity.properties.occupation.values[0].db_value : null),
            "order": (person_entity.properties.ordinal.values.length > 0 ? person_entity.properties.ordinal.values[0].db_value : null)

        }
    })
    console.log(people, count);

    postToStrapi(people, 'people')
}

async function peopleFromStrapi() {
    let data = await (getFromStrapi('people'))
    fs.writeFileSync(path.join(__dirname, '..', 'data-transfer', 'from_strapi', 'people.yaml'), yaml.safeDump(data, { 'indent': '4' }), "utf8")
}

async function performanceToStrapi() {
    const dataJSON = path.join(entuDataPath, 'performance.json')

    let performanceJSON = JSON.parse(fs.readFileSync(dataJSON, 'utf-8'))

    let strapi_categories = yaml.safeLoad(fs.readFileSync(path.join(__dirname, '..', 'data-transfer', 'from_strapi', 'categories.yaml')))
    let strapi_people = yaml.safeLoad(fs.readFileSync(path.join(__dirname, '..', 'data-transfer', 'from_strapi', 'people.yaml')))


    let performances = performanceJSON.map(performance_entity => {

        let performance_remote_id = (performance_entity.properties.category.values.length > 0 ? performance_entity.properties.category.values[0].db_value.toString() : null)
        let strapi_category_id = strapi_categories.filter( strapi_category => {
            if (performance_remote_id !== null){
                return performance_entity.properties.category.values[0].db_value.toString().includes(strapi_category.remote_id)
            }
        } ).map( element => { return { id: element.id}})[0]

        let artist_remote_id = ( performance_entity.properties.artist.values > 0 ? performance_entity.properties.artist.values[0].db_value : null )

        // let strapi_artist_ids =

        return {
            "remote_id": performance_entity.id.toString(),
            "name_et": ( performance_entity.properties['et-name'].values.length > 0 ? performance_entity.properties['et-name'].values[0].db_value : null ),
            "name_en": ( performance_entity.properties['en-name'].values.length > 0 ? performance_entity.properties['en-name'].values[0].db_value : null ),
            "subtitle_et": ( performance_entity.properties['et-subtitle'].values.length > 0 ? performance_entity.properties['et-subtitle'].values[0].db_value : null ),
            "subtitle_en": ( performance_entity.properties['en-subtitle'].values.length > 0 ? performance_entity.properties['en-subtitle'].values[0].db_value : null ),
            "categories": strapi_category_id,
            "coproduction": performance_entity.properties.coprod.values.length > 0 ? performance_entity.properties.coprod.values[0].db_value : null,
            "coproduction_importance": ( performance_entity.properties.coprodOrdinal.values.length > 0 ? performance_entity.properties.coprodOrdinal.values[0].db_value : null ),
            // "artists": strapi_artist_ids,
            // "producers":
            "front_page_promotion": ( performance_entity.properties.featured.values.length > 0 ? performance_entity.properties.featured.values[0].db_value : null ),
            "purchase_description_et": ( performance_entity.properties['et-purchase-description'].values.length > 0 ? performance_entity.properties['et-purchase-description'].values[0].db_value : null ),
            "purchase_description_en": ( performance_entity.properties['en-purchase-description'].values.length > 0 ? performance_entity.properties['en-purchase-description'].values[0].db_value : null ),
            // "premiere":
            "other_works": ( performance_entity.properties.otherWork.values.length > 0 ? performance_entity.properties.otherWork.values[0].db_value : null ),
            "description_et": ( performance_entity.properties['et-description'].values.length > 0 ? performance_entity.properties['et-description'].values[0].db_value : null ),
            "description_en": ( performance_entity.properties['en-description'].values.length > 0 ? performance_entity.properties['en-description'].values[0].db_value : null ),
            "technical_info_et": ( performance_entity.properties['et-technical-information'].values.length > 0 ? performance_entity.properties['et-technical-information'].values[0].db_value : null ),
            "technical_info_en": ( performance_entity.properties['en-technical-information'].values.length > 0 ? performance_entity.properties['en-technical-information'].values[0].db_value : null )
            // "published": true

        }
    })
    console.log(performances)

    // postToStrapi(performances, 'performances')
}

// async function coveragesToStrapi() {
//     const dataJSON = path.join(entuDataPath, 'coverage.json')

//     let coverageJSON = JSON.parse(fs.readFileSync(dataJSON, 'utf-8'))

//     let performance_ids = yaml.safeLoad(fs.readFileSync(path.join(__dirname, '..', 'data-transfer', 'from_strapi', 'bannerTypes.yaml')))



//     let coverages = coverageJSON.map(coverage_entity => {
//         let remote_id = coverage_entity.id
//         let strapi_banner_type_id = strapi_banner_types.filter( strapi_banner => {
//             if (remote_id !== null){
//                 return banner_entity.properties.type.values[0].db_value.toString() === strapi_banner.remote_id
//             } else {
//                 return null
//             }
//         } )[0]



//         return {
//             "remote_id": remote_id.toString(),
//             "title": (coverage_entity.properties.title.values.length > 0 ? coverage_entity.properties.title.values[0].db_value : null),
//             // "performance": "",
//             "source": (coverage_entity.properties.source.values.length > 0 ? coverage_entity.properties.source.values[0].db_value : null),
//             "url": (coverage_entity.properties.url.values.length > 0 ? coverage_entity.properties.url.values[0].db_value : null),
//             "content": (coverage_entity.properties.text.values.length > 0 ? coverage_entity.properties.text.values[0].db_value : null),
//             "date_published": (coverage_entity.properties.date.values.length > 0 ? coverage_entity.properties.date.values[0].db_value : null)
//         }
//     })
//     console.log(coverages);

//     // postToStrapi(coverages, 'coverages')
// }



async function main() {
    // await bannerTypeToStrapi()
    // await bannerTypeFromStrapi()
    // await bannerToStrapi()
    // await categoriesToStrapi()
    // await categoriesFromStrapi()
    // await personToStrapi()
    // await peopleFromStrapi()

    await performanceToStrapi()
    // await coveragesToStrapi()

}

main()