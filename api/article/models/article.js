'use strict';
module.exports = {};


// /**
//  * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks)
//  * to customize this model
//  */
// const { execFile } = require('child_process');
// const fs = require('fs');
// const yaml = require('yaml');
// const path = require('path');

// function slugify(text)
// {
//     return text.toString().toLowerCase()
//         .replace(/\s+/g, '-')           // Replace spaces with -
//         .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
//         .replace(/\-\-+/g, '-')         // Replace multiple - with single -
//         .replace(/^-+/, '')             // Trim - from start of text
//         .replace(/-+$/, '');            // Trim - from end of text
// }

// function load_yaml() {
//   const model_name = (__dirname.split('/').slice(-2)[0]);
//   const name_upperC = model_name.charAt(0).toUpperCase() + model_name.slice(1);
//   const data_path = path.join('/srv', 'ssg', 'source', 'strapidata', `${name_upperC}.yaml`)
//   // console.log(data_path)
//   const model_yaml = yaml.parse(fs.readFileSync(data_path, 'utf8'), {maxAliasCount: -1})
  
//   return model_yaml
// }


// function modify_strapi_data_yaml(result) {
//   let model_yaml = load_yaml()
//   const model_id = result.id

//   for(let model_ix in model_yaml) {
//     const model = model_yaml[model_ix]
//     if(model.id === model_id) {
//       console.log('Updated ARTICLES YAML:', result.id);
//       model_yaml[model_ix] = result
//       break
//     } 
//     // else {
//     //   console.log('New object :', result)
//     //   model_yaml.push(result)
//     // }
//   }
//   console.log(fs.writeFileSync(data_path, yaml.stringify(model_yaml), 'utf8'))
// }

// // function delete_model(deleted_id) {
// //   for(let model_ix in model_yaml) {
// //     const model = model_yaml[model_ix]
// //     if(model.id === deleted_id) {
// //       console.log('Delete ARTICLES YAML:', deleted_id);
// //       console.log(model[deleted_id])
// //       // delete model[deleted_id]
// //       break
// //     }
// //   fs.writeFileSync(data_path, yaml.stringify(model_yaml), 'utf8')
// // }


// module.exports = {
//   lifecycles: {
//     beforeUpdate(params, data) {

//       // console.log('\nparams enne', params, '\ndata enne', data);
//       data.slug_et = data.title_et ? slugify( data.title_et + '-' + params.id ) : null
//       data.slug_en = data.title_en ? slugify( data.title_en + '-' + params.id ) : null
//     },
//     afterUpdate(result, params, data) {
//       if (result.published_at) {
//         // modify_strapi_data_yaml(result);
//         const model_name = (__dirname.split('/').slice(-2)[0])
//         // console.log('\nparams', params, '\ndata', data, '\nresult', result);
//         if (fs.existsSync(`/srv/ssg/build_${model_name}.sh`)) {
//           const child = execFile('bash', [`/srv/ssg/build_${model_name}.sh`, result.id], (error, stdout, stderr) => {
//             if (error) {
//               throw error;
//             }
//             console.log(stdout);
//           })
//         } else {
//           const child = execFile('bash', [`/srv/ssg/build.sh`, result.id], (error, stdout, stderr) => {
//             if (error) {
//               throw error;
//             }
//             console.log(stdout);
//           })
//         }
//       }
//     },
//     afterDelete(result, params){
//       // console.log('\nR', result, '\nparams', params)
//       // let model_id = result.id
//       // console.log(model_id)
//       // delete_model(model_id)
//     }
//   }
// };

