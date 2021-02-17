'use strict';
var HTMLparser = require('node-html-parser')

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
    async afterCreate(result, data) {
      console.log('Result:', result, '\nObjekt loodud, teeb kohe: ')
      delete(result.published_at)
      await strapi.query('article').update({id : result.id }, result)
    },
    beforeUpdate(params, data) {
      console.log('beforeUpdate', params)
      // console.log('\nparams enne', params, '\ndata enne', data);
      if(data.title_et){
        data.slug_et = data.title_et ? slugify( data.title_et + '-' + params.id ) : null
      }
      if(data.title_en){
        data.slug_en = data.title_en ? slugify( data.title_en + '-' + params.id ) : null
      }
      if(data.published_at === null ) {
        console.log('Draf olek, kustutan strapidatast ja build')
        let model_id = params.id
        delete_model(model_id, modelDirPath)
        call_build(params, model_name)
      }
      if (data.audios) {
        let counter = 0
        for (let audio of data.audios) {
          counter++
          if (!HTMLparser.valid(audio.content)) {
            throw strapi.errors.badRequest("Can't save, audio " + counter + " html invalid!")
          }
        }
      }
      if (data.videos) {
        let counter = 0
        for (let video of data.videos) {
          counter++
          if (!HTMLparser.valid(video.content)) {
            throw strapi.errors.badRequest("Can't save, video " + counter + " html invalid!")
          }
        }
      }
    },
    afterUpdate(result, params, data) {
      console.log('afterUpdate', {result, params, data})

      // console.log('\nparams', params, '\ndata', data, '\nresult', result)
      if (result.published_at) {
        console.log('Muudan strapidata ja build')
        modify_strapi_data_yaml(result, modelDirPath)
        call_build(result, model_name)

      }
    },
    afterDelete(result, params){
      // console.log('\nR', result, '\nparams', params)
      let model_id = result.id
      delete_model(model_id, modelDirPath)
      call_build(result, model_name)
    }
  }
};

