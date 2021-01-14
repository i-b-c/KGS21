'use strict';

/**
 * Module dependencies.
 */

// Public node modules.
const _ = require('lodash');
const request = require('request');

// Purest strategies.
const purest = require('purest')({ request });
const purestConfig = require('@purest/providers');
const { getAbsoluteServerUrl } = require('strapi-utils');
const jwt = require('jsonwebtoken');


const apiUserController = require('../controllers/user/api');  //c
const https = require('follow-redirects').https;



/**
 * Connect thanks to a third-party provider.
 *
 *
 * @param {String}    provider
 * @param {String}    access_token
 *
 * @return  {*}
 */

const connect = async (provider, query) => {

  const access_token = query.access_token || query.code || query.oauth_token;
  let providerSub = ''
  if (provider === 'google') {
    providerSub = jwt.decode(query.id_token).sub
  } else if (provider === 'facebook') {
    providerSub = (await fetchFBid(access_token)).id
  }


  return new Promise((resolve, reject) => {
    if (!access_token) {
      return reject([null, { message: 'No access_token.' }]);
    }

    // Get the profile.
    getProfile(provider, query, async (err, profile) => {
      if (err) {
        return reject([null, err]);
      }
      // We need at least the mail.
      if (!profile.email) {
        return reject([null, { message: 'Email was not available.' }]);
      }

      try {
        const users = await strapi.query('user', 'users-permissions').find({
          email: profile.email,
        });

        const advanced = await strapi
          .store({
            environment: '',
            type: 'plugin',
            name: 'users-permissions',
            key: 'advanced',
          })
          .get();

        let user = _.find(users, { provider });

        if (users.length > 0) {
          user = users[0]
          const connectedProviders = user.provider.split(',')
          if (!connectedProviders.includes(provider)) {
            mergeProviders(user, provider, providerSub)
          }
        }


        if (_.isEmpty(user) && !advanced.allow_register) {
          return resolve([
            null,
            [{ messages: [{ id: 'Auth.advanced.allow_register' }] }],
            'Register action is actualy not available.',
          ]);
        }

        if (!_.isEmpty(user)) {
          return resolve([user, null]);
        }

        if (
          !_.isEmpty(_.find(users, user => user.provider !== provider)) &&
          advanced.unique_email
        ) {
          return resolve([
            null,
            [{ messages: [{ id: 'Auth.form.error.email.taken7' }] }],
            'Email is already taken.',
          ]);
        }

        // Retrieve default role.
        const defaultRole = await strapi
          .query('role', 'users-permissions')
          .findOne({ type: advanced.default_role }, []);

        // Create the new user.
        const params = _.assign(profile, {
          provider: provider,
          role: defaultRole.id,
          confirmed: true,
          Provider_id: [{ userId: providerSub, provider: provider }]
        });
        const createdUser = await strapi.query('user', 'users-permissions').create(params);

        return resolve([createdUser, null]);
      } catch (err) {
        reject([null, err]);
      }
    });
  });
};

/**
 * Helper to get profiles
 *
 * @param {String}   provider
 * @param {Function} callback
 */

const getProfile = async (provider, query, callback) => {
  const access_token = query.access_token || query.code || query.oauth_token;

  const grant = await strapi
    .store({
      environment: '',
      type: 'plugin',
      name: 'users-permissions',
      key: 'grant',
    })
    .get();

  switch (provider) {

    case 'facebook': {
      const facebook = purest({
        provider: 'facebook',
        config: purestConfig,
      });

      facebook
        .query()
        .get('me?fields=name,email')
        .auth(access_token)
        .request((err, res, body) => {
          if (err) {
            callback(err);
          } else {
            callback(null, {
              username: body.email.toLowerCase(), //muutsin
              email: body.email.toLowerCase(),
            });
          }
        });
      break;
    }
    case 'google': {
      const google = purest({ provider: 'google', config: purestConfig });

      google
        .query('oauth')
        .get('tokeninfo')
        .qs({ access_token })
        .request((err, res, body) => {
          if (err) {
            callback(err);
          } else {
            callback(null, {
              username: body.email.toLowerCase(), //muutsin
              email: body.email.toLowerCase(),
            });
          }
        });
      break;
    }

    default:
      callback({
        message: 'Unknown provider.',
      });
      break;
  }
};

const buildRedirectUri = (provider = '') =>
  `${getAbsoluteServerUrl(strapi.config)}/connect/${provider}/callback`;

const mergeProviders = async (user, provider, providerSub) => {
  const params = {}
  params.params = { id: user.id }
  let provider_id = user.Provider_id
  provider_id.push({provider: provider, userId: providerSub})
  if (providerSub) {
    params.request = { body: { provider: user.provider + ',' + provider, Provider_id: provider_id } }
  } else {
    params.request = { body: { provider: user.provider + ',' + provider } }
  }
  const updatedUser = await apiUserController.update(params)
  return updatedUser
};

const fetchFBid = access_token => {

  return new Promise((resolve, reject) => {


    var options = {
      'method': 'GET',
      'hostname': 'graph.facebook.com',
      'path': `/me?fields=id&access_token=${access_token}`,
      'headers': {
      },
      'maxRedirects': 20
    };


    var req = https.request(options, (res) => {
      let responseid = ''
      res.on("data", function (chunk) {
        responseid += chunk
      });

      res.on("end", function () {
        responseid = JSON.parse(responseid)
        resolve(responseid)
      })
    })
    req.on('error', reject)
    req.end()
  })
}

module.exports = {
  connect,
  buildRedirectUri,
  mergeProviders
};
