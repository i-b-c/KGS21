'use strict';


/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */
const { execFile } = require('child_process');
const fs = require('fs');
const yaml = require('yaml');
const path = require('path');

function slugify(text)
{
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

function modify_strapi_data_yaml(result) {
  const model_name = (__dirname.split('/').slice(-2)[0]);
  const name_upperC = model_name.charAt(0).toUpperCase() + model_name.slice(1);
  const data_path = path.join('/srv', 'ssg', 'source', 'strapidata', `${name_upperC}.yaml`)
  const model_yaml = yaml.parse(fs.readFileSync(data_path, 'utf8'))
  const model_id = result.id

  for(let model_ix in model_yaml) {
    const model = model_yaml[model_ix]
    if(model.id === model_id) {
      model_yaml[model_ix] = result
      break
    }
  }

  console.log(fs.writeFileSync(data_path, yaml.stringify(model_yaml), 'utf8'))
}

module.exports = {
  lifecycles: {
    beforeUpdate(params, data) {

      data.slug = data.name_et ? slugify(data.name_et) : null

    },
    afterUpdate(result, params, data) {
      if (result.published_at) {
        modify_strapi_data_yaml(result);
        const model_name = (__dirname.split('/').slice(-2)[0])
        // console.log(model_name)
        if (fs.existsSync(`/srv/ssg/build_${model_name}.sh`)) {
          const child = execFile('bash', [`/srv/ssg/build_${model_name}.sh`, result.id], (error, stdout, stderr) => {
            if (error) {
              throw error;
            }
            console.log(stdout);
          })
        } else {
          const child = execFile('bash', [`/srv/ssg/build.sh`, result.id], (error, stdout, stderr) => {
            if (error) {
              throw error;
            }
            console.log(stdout);
          })
        }
      }
    }
  }
};

