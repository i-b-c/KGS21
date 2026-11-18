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
      await strapi.query('organistaion').update({id : result.id }, result)
    },
    beforeUpdate(params, data) {

      data.slug = data.name_et ? slugify(data.name_et) : null
    },
    afterUpdate(result, params, data) {
      if (result.published_at || data.published_at === null) {
        call_build(result, model_name)
        // console.log('\nparams', params, '\ndata', data, '\nresult', result)

      }
    },
    afterDelete(result, params){
      // console.log('\nR', result, '\nparams', params)
      call_build(result, model_name)
    }
  }
};
