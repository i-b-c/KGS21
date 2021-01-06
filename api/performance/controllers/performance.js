'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const { sanitizeEntity } = require('strapi-utils');


module.exports = {

async my(ctx) {
    let {Favorites: favorites} = ctx.state.user
    favorites = favorites.map(item => item.performance_id)
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.performance.search(ctx.query);
    } else {
      entities = await strapi.services.performance.find({id_in: favorites});
    }

    entities = entities.map((entity) => {
        let sanitizedMyPerformance = {}
        sanitizedMyPerformance.id = entity.id
        sanitizedMyPerformance.start_time = entity.start_time
        sanitizedMyPerformance.name_et = entity.name_et
        sanitizedMyPerformance.name_en = entity.name_en
        sanitizedMyPerformance.headline_et = entity.headline_et
        sanitizedMyPerformance.headline_en = entity.headline_en
        sanitizedMyPerformance.slug_et = entity.slug_et
        sanitizedMyPerformance.slug_en = entity.slug_en
        sanitizedMyPerformance.artist = entity.artist
        sanitizedMyPerformance.producer = entity.producer
        sanitizedMyPerformance.remote_id = entity.remote_id
        return sanitizedMyPerformance})
        
    return entities.map(entity => sanitizeEntity(entity, { model: strapi.models.performance }));

  },
}