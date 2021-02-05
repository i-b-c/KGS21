'use strict';
/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/v3.x/concepts/configurations.html#bootstrap
 */

const chokidar = require('chokidar');
const jsonfile = require('jsonfile')
const { exec, execSync } = require('child_process');
const path = require('path')



function callRsync(){

    const put_command = `rsync -raz --progress /srv/strapi/strapi-development/public/uploads/ /srv/www/img-dynamic`;
    exec( put_command, (err, stdout, stderr) => {
      if (err) {
          console.log('vsjo problema');
          return
      }
    })
}

module.exports = () => {

    // Initialize watcher.
    const watcher = chokidar.watch('public/uploads', {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true,
        ignoreInitial: true
    });

    // Something to use when events are received.
    // const log = console.log.bind(console);
    // Add event listeners.
    watcher
      .on('add', path => {

           console.log(`RSYNC ACTIVATED AFTER ADD`)
           callRsync()

      })

      .on('unlink', path => {

           console.log(`RSYNC ACTIVATED AFTER FILE DELETE`);
           callRsync()

      })

}
