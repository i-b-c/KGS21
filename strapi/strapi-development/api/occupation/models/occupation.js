'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

const path = require('path');
const { call_build } = require(path.join(__dirname, '..', '..', '..', '/helpers/strapi_lifecycle_helpers'))

const model_name = (__dirname.split('/').slice(-2)[0]);

module.exports = {
  lifecycles: {
    afterUpdate(result, params, data) {
      if (result.published_at || data.published_at === null) {
        call_build(result, model_name)
      }
    },
    afterDelete(result, params) {
      call_build(result, model_name)
    }
  }
};
