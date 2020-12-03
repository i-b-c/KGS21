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


async function main() {
    // await bannerTypeToStrapi()
    // await bannerTypeFromStrapi()
    // await bannerToStrapi()
    // await categoriesToStrapi()

}

main()