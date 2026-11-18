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


// A coverage has no page of its own: it is shown on its performance's and event's pages,
// so those are what need rebuilding. (Moving a coverage to another performance leaves the
// old page stale until the nightly full build.)
function build_pages_showing(coverage) {
  if (coverage.performance) { call_build(coverage.performance, 'performance') }
  if (coverage.event) { call_build(coverage.event, 'event') }
}


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
    },
    afterUpdate(result, params, data) {
      if (result.published_at || data.published_at === null) {
        build_pages_showing(result)
      }
    },
    afterDelete(result, params){
      build_pages_showing(result)
    }
  }
};
