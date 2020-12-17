
var fs = require('fs');
var request = require('request');
const {strapiAuth} = require('./strapiAuth.js')
// const https = require('follow-redirects').https;

var TOKEN = ''


// async function picsToStrapi() {

    // `Bearer ${TOKEN}`

    // let options = {
    //   'method': 'POST',
    //   'hostname': 'a.saal.ee',
    //   'path': '/upload',
    //   'headers': {
    //     'Authorization': `Bearer ${TOKEN}`
    //   },
    //   'maxRedirects': 20
    // };

    // const req = https.request(options, (res) => {
    //   let chunks = [];

    //   res.on("data", (chunk) => {
    //     chunks.push(chunk);
    //   });

    //   res.on("end", (chunk) => {
    //     let body = Buffer.concat(chunks);
    //     console.log(body.toString());
    //   });

    //   res.on("error", (error) => {
    //     console.error(error);
    //   });
    // });

    // var postData = new FormData();
    // postData.append('files', fs.createReadStream('assets/images/testimage_landscape_full.jpg'));

    // let postData = "------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"files\"; filename=\"social classroom app.png\"\r\nContent-Type: \"{Insert_File_Content_Type}\"\r\n\r\n" + fs.readFileSync('/Users/Mariann/Desktop/social classroom app.png') + "\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--";

    // req.setHeader('content-type', 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW');

    // req.write(postData);

    // req.end();

async function sendPic(entuPicId){

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
                'value': request.get('https://saal.entu.ee/api2/file-'+ entuPicId),
                'options': {
                    'filename': 'screenshot.png',
                    'contentType': null
                }
            }
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        // console.log(response.body);
        let strapiPicId = null
        strapiPicId = JSON.parse(response.body)[0].id
        console.log("id ", strapiPicId)

        return strapiPicId

        //teeb responsis oleva data põhjal uue päringu seose loomiseks
    });

}
// }

// picsToStrapi()

const path = require('path')
const yaml = require('js-yaml')

const { strapiQuery, putToStrapi, getFromStrapi } = require("./strapiQueryMod.js")
const entuDataPath = path.join(__dirname, '..', 'data-transfer', 'from_entu')

const strapiDataPath = path.join(__dirname, '..', 'data-transfer', 'from_strapi')
const performances_from_strapi = yaml.safeLoad(fs.readFileSync(path.join(strapiDataPath, 'performances.yaml')))

const dataJSON = path.join(entuDataPath, 'performance.pics.json')
let performancePicsJSON = JSON.parse(fs.readFileSync(dataJSON, 'utf-8'))

async function send_pic_and_create_relation(){

    let performance = await Promise.all( performancePicsJSON.map( async performance_media => {

        let strapi_id = performances_from_strapi.filter( s_performance => {
            return s_performance.remote_id === performance_media.entu_id.toString()
        }).map( e => e.id)[0]

        let performance_media_from_entu = []

        for (media of performance_media.medias) {
            let keys = Object.keys(media)

            let media_object = {}
            for (key of keys) {
                // console.log(“media key: “, key)
                // console.log(“media id:“, media[key].db_value)

                let strapi_id = await sendPic(media[key].db_value)

                console.log(strapi_id);
                //if( media[key].db_value) // kui on j6udnud siiani, siis v6ta see db_value ja postita pilt, tagasta id
                media_object[key] = {
                    id: strapi_id // siia tagasta pildi strapi id mitte db_value
                }

            }
            performance_media_from_entu.push( media_object )
        }

        console.log(performance_media_from_entu);

        return {
            "id": strapi_id,
            "remote_id": performance_media.entu_id,
            "performance_media" : performance_media_from_entu
    }
    }))

    console.log(JSON.stringify(performance, 0, 4));

    putToStrapi(performance, 'performanses')
}

send_pic_and_create_relation()
