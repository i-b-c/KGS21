'use strict';
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
      delete(result.published_at)
      await strapi.query('coverage').update({id : result.id }, result)
    },
    beforeUpdate(params, data) {
      // console.log('params', params, 'data', data);
      if(data.title){
        data.slug = data.title ? slugify( data.title)+ '-' + params.id : null
      }
      if(data.published_at === null ) {
        let model_id = params.id
        delete_model(model_id, modelDirPath)
        call_build(params, model_name)
      }      
    },
    afterUpdate(result, params, data) {
      if (result.published_at) {
        modify_strapi_data_yaml(result, modelDirPath)
        call_build(result, model_name)
        // console.log('\nparams', params, '\ndata', data, '\nresult', result)

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
