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

module.exports = {
  lifecycles: {
    beforeUpdate(params, data) {
        // console.log('params', params, 'data', data)
      if(data.name){
        data.slug = data.name ? slugify(params.id + '-' + data.name) : null
      }
      if(data.published_at === null ) {
        let model_id = params.id
        delete_model(model_id, modelDirPath)
        call_build(params, model_name)
      }
    },
    afterUpdate(result, params, data) {
      if (result.published_at) {
        call_build(result, model_name)

      }
    },
    afterDelete(result, params){
      let model_id = result.id
      call_build(result, model_name)
    }
  }
};
