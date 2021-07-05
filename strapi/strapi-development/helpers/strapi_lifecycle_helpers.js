const { execFile } = require('child_process')
const fs = require('fs')
const path = require('path')
const yaml = require('yaml')


function slugify(text)
{
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

function load_yaml(data_path) {
  const model_yaml = yaml.parse(fs.readFileSync(data_path, 'utf8'), {maxAliasCount: -1})
  return model_yaml
}

function modify_strapi_data_yaml(result, modelDirPath) {
  // load yaml to modify, data path as parameter
  let model_yaml = load_yaml(modelDirPath)
  const model_id = result.id

  for(let model_ix in model_yaml) {
    const model = model_yaml[model_ix]
    if(model.id === model_id) {
      console.log('Updated YAML:', result.id);
      model_yaml[model_ix] = result
      break
    }
  }
  let list_of_models = []
  for(let model_ix in model_yaml) {
    const model = model_yaml[model_ix]
    list_of_models.push(model.id)
  }
  if(!list_of_models.includes(result.id)){
    console.log('New YAML :', result.id)
    model_yaml.push(result)
  }

  fs.writeFileSync(modelDirPath, yaml.stringify(model_yaml.filter( e => e !== null), { indent: 4 }), 'utf8')
}

function delete_model(deleted_id, modelDirPath) {
  let model_yaml = load_yaml(modelDirPath)
  for (let model_ix in model_yaml) {
    const model = model_yaml[model_ix]
    if (model.id === deleted_id) {
      console.log(`Delete YAML:`, deleted_id)
      delete model_yaml[model_ix]
      break
    }
  }
  // fs.writeFileSync(modelDirPath, yaml.stringify(model_yaml, { indent: 4 }), 'utf8')
  fs.writeFileSync(modelDirPath, yaml.stringify(model_yaml.filter( e => e !== null), { indent: 4 }), 'utf8')

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
  console.log('Call build using file ', `/srv/ssg/build_${model_name}.sh`);
  if (fs.existsSync(`/srv/ssg/build_${model_name}.sh`)) {
    const child = execFile('bash', [`/srv/ssg/build_${model_name}.sh`, result_id, type], (error, stdout, stderr) => {
      if (error) {
        console.log({error, stdout, stderr})
        throw error;
      }
      console.log(stdout);
    })
  } else {
    const child = execFile('bash', [`/srv/ssg/build.sh`, result_id], (error, stdout, stderr) => {
      if (error) {
        throw error;
      }
      console.log(stdout);
    })
  }
}

exports.slugify = slugify
exports.load_yaml = load_yaml
exports.modify_strapi_data_yaml = modify_strapi_data_yaml
exports.delete_model = delete_model
exports.call_build = call_build

