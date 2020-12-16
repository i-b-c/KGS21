let request = require('request');
var fs = require('fs');
const { strapiAuth } = require('./strapiAuth.js')

// // let file = new URL('https://saal.entu.ee/api2/file-21645')
// function GetPic(id){
//     var request = require('request');
//     var options = {
//       'method': 'GET',
//       'url': 'https://saal.entu.ee/api2/file-'+id,
//       'headers': {
//       }
//     };
//     request(options, function (error, response) {
//       if (error) throw new Error(error);
//       console.log(response.body);
//     });
// }

// GetPic()

var TOKEN = ''

async  function picsToStrapi(){
    if (TOKEN === '') {
        TOKEN = await strapiAuth() // TODO: setting global variable is no a good idea
         console.log('Bearer', TOKEN)
    }

    let options = {
      'method': 'POST',
      'url': 'https://a.saal.ee/upload',
      'headers': {
        'Authorization': `Bearer ${TOKEN}`
      },
      formData: {
        'files': {
          'value': fs.createReadStream('assets/images/testimage_landscape_full.jpg'),
          'options': {
            'filename': 'testimage_landscape_full.jpg',
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