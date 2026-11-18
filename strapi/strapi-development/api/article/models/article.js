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
  call_build 
} = require(helper_path)


const model_name = (__dirname.split('/').slice(-2)[0]);

async function make_duplicate(data) {
    delete data.slug_et
    delete data.slug_en
    data.duplicate = false
    await strapi.query('article').create( data )
}

module.exports = {
  lifecycles: {
    async afterCreate(result, data) {
      // console.log('afterCreate Result:', result, '\nObjekt loodud, käivitab kohe: ')
      delete(result.published_at)
      await strapi.query('article').update({id : result.id }, result)
    },
    async beforeUpdate(params, data) {
      // console.log('beforeUpdate', data)
      // if(data.duplicate) {
      //   await make_duplicate(data)
      // }

      // console.log('beforeUpdate', params)
      // console.log('\nparams enne', params, '\ndata enne', data);
      if(data.title_et){
        data.slug_et = data.title_et ? slugify( data.title_et + '-' + params.id ) : null
      }
      if(data.title_en){
        data.slug_en = data.title_en ? slugify( data.title_en + '-' + params.id ) : null
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
      // console.log('afterUpdate', {result, params, data})
      // console.log('\nparams', params, '\ndata', data, '\nresult', result)
      if (result.published_at || data.published_at === null) {
        console.log('Muudan strapidata ja build')
        call_build(result, model_name)

      }
    },
    afterDelete(result, params){
      // console.log('\nR', result, '\nparams', params)
      call_build(result, model_name)
    }
  }
};

