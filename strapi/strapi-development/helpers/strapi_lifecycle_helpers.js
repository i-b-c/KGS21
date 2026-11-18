const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const SSG_BUILD_QUEUE = '/srv/ssg/helpers/build_queue.js'
const SSG_BUILD_LOG = '/srv/ssg/logs/build.log'


function slugify(text)
{
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

function call_build(result, model_name) {
  let result_id = null
  if(result.id){
    result_id = result.id
  }

  let type = null
  if(result.type){
    type = result.type
  }

  // The SSG build queue merges saves that arrive while a build runs into one build.
  // It runs detached so builds survive Strapi restarts; output goes to its own log.
  const args = [SSG_BUILD_QUEUE, 'enqueue', model_name, String(result_id), String(type)]
  console.log(`Queueing site build: ${model_name} ${result_id} ${type} (log: ${SSG_BUILD_LOG})`)
  fs.mkdirSync(path.dirname(SSG_BUILD_LOG), { recursive: true })
  const log_fd = fs.openSync(SSG_BUILD_LOG, 'a')
  spawn(process.execPath, args, { detached: true, stdio: ['ignore', log_fd, log_fd] }).unref()
  fs.closeSync(log_fd)
}

exports.slugify = slugify
exports.call_build = call_build

