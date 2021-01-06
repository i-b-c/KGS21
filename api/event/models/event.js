'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

function slugify(text)
{
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

module.exports = {
  lifecycles: {
    beforeUpdate(params, data) {

      data.slug_et = data.name_et ? slugify( data.name_et) + '-' + data.remote_id : null
      data.slug_en = data.name_en ? slugify( data.name_en) + '-' + data.remote_id : null
    },
  },
};
