
var fs = require('fs');
var request = require('request');
const {strapiAuth} = require('./strapiAuth.js')
const https = require('follow-redirects').https;
var FormData = require('form-data');

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



    let options = {
        'method': 'POST',
        'url': 'https://a.saal.ee/upload',
        'headers': {
            'Authorization': `Bearer ${TOKEN}`
        },
        formData: {
            'files': {
                'value': fs.createReadStream('assets/images/testimage_hytt.jpg'),
                'options': {
                    'filename': 'testimage_hytt.jpg',
                    'contentType': null
                }
            }
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
    });

}

picsToStrapi()