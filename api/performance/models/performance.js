'use strict';
var HTMLParser = require('node-html-parser')


// module.exports = {};


/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

const path = require('path');
const {
  slugify,
  load_yaml,
  modify_strapi_data_yaml,
  delete_model,
  call_build
} = require('/srv/strapi/strapi-development/helpers/strapi_lifecycle_helpers.js')

const model_name = (__dirname.split('/').slice(-2)[0]);
const name_upperC = model_name.charAt(0).toUpperCase() + model_name.slice(1);
const modelDirPath = path.join('/srv', 'ssg', 'source', 'strapidata', `${name_upperC}.yaml`)

module.exports = {
  lifecycles: {
    beforeUpdate(params, data) {
      console.log(data.search_field)
      if (data.name_et) {
        data.slug_et = data.name_et ? slugify(data.name_et) + '-' + params.id : null
        data.slug_en = data.name_en ? slugify(data.name_en) + '-' + params.id : null
      } else if (data.subtitle_et) {
        data.slug_et = data.subtitle_et ? slugify(data.subtitle_et) + '-' + params.id : null
        data.slug_en = data.subtitle_en ? slugify(data.subtitle_en) + '-' + params.id : null
      } else {
        data.slug_et = data.X_headline_et ? slugify(data.X_headline_et) + '-' + params.id : null
        data.slug_en = data.X_headline_en ? slugify(data.X_headline_en) + '-' + params.id : null
      }
      if (data.search_field === null || data.search_field === '') {
        if (!data.X_artist) {
          data.search_field = data.name_et.trim()
        }
        if (!data.name_et) {
          data.search_field = data.X_artist.trim()
        }
        else {
          data.search_field = data.X_artist.trim() + ' ' + data.name_et.trim()
        }
      }
      if (data.published_at === null) {
        let model_id = params.id
        delete_model(model_id, modelDirPath)
        call_build(params, model_name)
      }
      if (data.other_works) {
        data.other_works_back = data.other_works
      }
     if (data.videos){
       for (let video of data.videos){
       video.content = (HTMLParser.parse(video.content)).toString()
       }
     }
    },
    afterUpdate(result, params, data) {
      if (result.published_at) {

        // modify_strapi_data_yaml(result, modelDirPath)
        // call_build(result, model_name)
        // console.log('\nparams', params, '\ndata', data, '\nresult', result)
      }
    },
    afterDelete(result, params) {
      // console.log('\nR', result, '\nparams', params)
      let model_id = result.id
      delete_model(model_id, modelDirPath)
      call_build(result, model_name)
    }
  }
}
