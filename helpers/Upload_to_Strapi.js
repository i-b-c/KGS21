
var fs = require('fs');
var request = require('request');
const {strapiAuth} = require('./strapiAuth.js')
// const https = require('follow-redirects').https;

var TOKEN = ''


async function picsToStrapi() {
    if (TOKEN === '') {
        TOKEN = await strapiAuth()
    }
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

function sendPic(entu_db_value){
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
        console.log(response.body);
        let picId = JSON.parse(response.body)[0].id
        console.log("id ", picId)

        //teeb responsis oleva data põhjal uue päringu seose loomiseks
    });

    }
}

// picsToStrapi()

const path = require('path')
const yaml = require('js-yaml')

const { strapiQuery, putToStrapi, getFromStrapi } = require("./strapiQueryMod.js")
const entuDataPath = path.join(__dirname, '..', 'data-transfer', 'from_entu')

const strapiDataPath = path.join(__dirname, '..', 'data-transfer', 'from_strapi')
const performances_from_strapi = yaml.safeLoad(fs.readFileSync(path.join(strapiDataPath, 'performances.yaml')))

const dataJSON = path.join(entuDataPath, 'performance.pics.json')
let performancePicsJSON = JSON.parse(fs.readFileSync(dataJSON, 'utf-8'))

function strapi_relation_creation(){

    let performance = performancePicsJSON.map( performance_medias => {

        let strapi_id = performances_from_strapi.filter( s_performance => {
            return s_performance.remote_id === performance_medias.entu_id.toString()
        }).map( e => e.id)[0]

        let performance_media_from_entu = []

            for (media of performance_medias.medias) {
                let keys = Object.keys(media)

                let media_object = {}
                for (key of keys) {
                    // console.log(“media key: “, key)
                    // console.log(“media id:“, media[key].db_value)

                    media_object[key] = {
                        id: media[key].db_value
                    }

                }
                performance_media_from_entu.push( media_object )
            }

        return {
            "s_id": strapi_id,
            "remote_id": performance_medias.entu_id,
            "performance_media" : performance_media_from_entu
    }
    })



    console.log(JSON.stringify(performance, 0, 4));
}


