const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')

function pathAliasesToYAML(fetchDir, allPathAliases, typeName) {

    const pathAliasesYAMLpath = path.join(fetchDir, 'path_aliases.yaml')
    const pathAliasesYAML = fs.existsSync(pathAliasesYAMLpath)

    if (!pathAliasesYAML) {
        const oneObject = {}
        oneObject[typeName] = allPathAliases
        const thisYAML = yaml.safeDump(oneObject, { 'noRefs': true, 'indent': '4' })
        fs.writeFileSync(`${fetchDir}/path_aliases.yaml`, thisYAML, 'utf8')
    } else {
        let pathAliasesYAMLData = yaml.safeLoad(fs.readFileSync(pathAliasesYAMLpath, 'utf8'))
        pathAliasesYAMLData[typeName] = allPathAliases
        const thisYAML = yaml.safeDump(pathAliasesYAMLData, { 'noRefs': true, 'indent': '4' })
        fs.writeFileSync(`${fetchDir}/path_aliases.yaml`, thisYAML, 'utf8')
    }

}

module.exports = pathAliasesToYAML