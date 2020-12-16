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

      console.log('params', params, 'data', data);
      data.slug_et = data.name_et ? slugify( data.name_et) : null
      data.slug_en = data.name_en ? slugify( data.name_en) : null
    },
  },
};
