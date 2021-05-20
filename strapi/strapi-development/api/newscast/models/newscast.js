'use strict';
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

module.exports = {
  lifecycles: {
    async afterCreate(result, data) {
      delete(result.published_at)
      await strapi.query('newscast').update({id : result.id }, result)
    },
    beforeUpdate(params, data) {

      // console.log('params', params, 'data', data);
      if(data.title_et){
        data.slug_et = data.title_et ? slugify(data.title_et) + '-' + params.id : null
      }
      if(data.title_en){
        data.slug_en = data.title_en ? slugify(data.title_en) + '-' + params.id : null
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
