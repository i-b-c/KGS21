'use strict';
var HTMLparser = require('node-html-parser')


// module.exports = {};


/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

 const path = require('path');
 let helper_path = path.join(__dirname, '..', '..', '..', '/helpers/strapi_lifecycle_helpers')
 
 const { 
   slugify, 
   load_yaml, 
   modify_strapi_data_yaml, 
   delete_model, 
   call_build 
 } = require(helper_path)

const model_name = (__dirname.split('/').slice(-2)[0]);
const name_upperC = model_name.charAt(0).toUpperCase() + model_name.slice(1);
const modelDirPath = path.join('/srv', 'ssg', 'source', 'strapidata', `${name_upperC}.yaml`)

async function make_duplicate(data) {
    delete data.slug_et
    delete data.slug_en
    data.duplicate = false
    await strapi.query('performance').create( data )
}

module.exports = {

  lifecycles: {
    async afterCreate(result, data) {
      delete(result.published_at)
      await strapi.query('performance').update({id : result.id }, result)
    },
    async beforeUpdate(params, data) {

      if(data.duplicate) {
        await make_duplicate(data)
      }

      if (data.name_et) {
        data.slug_et = data.name_et ? slugify(data.name_et) + '-' + params.id : null
      } else if (data.subtitle_et) {
        data.slug_et = data.subtitle_et ? slugify(data.subtitle_et) + '-' + params.id : null
      } else if (data.X_headline_et){
        data.slug_et = data.X_headline_et ? slugify(data.X_headline_et) + '-' + params.id : null
      }

      if (data.name_en) {
        data.slug_en = data.name_en ? slugify(data.name_en) + '-' + params.id : null
      } else if (data.subtitle_en) {
        data.slug_en = data.subtitle_en ? slugify(data.subtitle_en) + '-' + params.id : null
      } else if (data.X_headline_en){
        data.slug_en = data.X_headline_en ? slugify(data.X_headline_en) + '-' + params.id : null
      }
      
      if (data.search_field === null || data.search_field === '') {
        if(!data.X_artist) {
          data.search_field = data.name_et
        }
        else if(!data.name_et) {
          data.search_field = data.X_artist
        }
        else {
          data.search_field = data.X_artist + ' ' + data.name_et
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
      // console.log('afterUpdate')

      if (result.published_at) {

        modify_strapi_data_yaml(result, modelDirPath)
        call_build(result, model_name)
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
