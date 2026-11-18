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
   call_build 
 } = require(helper_path)


const model_name = (__dirname.split('/').slice(-2)[0]);

module.exports = {
  lifecycles: {
    async afterCreate(result, data) {
      delete(result.published_at)
      await strapi.query('banner_type').update({id : result.id }, result)
    },
    beforeUpdate(params, data) {
      // console.log('params', params, 'data', data);
      if(data.name){
        data.slug = data.name ? slugify(params.id + '-' + data.name) : null
      }
    },
    afterUpdate(result, params, data) {
      if (result.published_at || data.published_at === null) {
        call_build(result, model_name)

      }
    },
    afterDelete(result, params){
      call_build(result, model_name)
    }
  }
};
