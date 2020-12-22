const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')

const rootDir =  path.join(__dirname, '..')
const sourceDir = path.join(rootDir, 'source')
const fetchDir = path.join(sourceDir, '_fetchdir')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))
const STRAPIDATA_EVENTS = STRAPIDATA['Event']
const LANGUAGES = ['et', 'en']


const strapi_projects = STRAPIDATA_EVENTS
    .filter((event) => event.type === 'project')
    .sort((a, b) => (a.order || 0) - (b.order || 0))

for (const lang of LANGUAGES) {
    const projects = []

    for (const strapi_project of strapi_projects) {
        const project = {
            id: strapi_project.id,
            order: strapi_project.order || null,
            name: strapi_project['name_' + lang],
            description: strapi_project['description_' + lang],
        }
        projects.push(project)
    }
    const projectsYAMLPath = path.join(fetchDir, `projects.${lang}.yaml`)
    const projectsYAML = yaml.safeDump(projects, { 'noRefs': true, 'indent': '4' })
    fs.writeFileSync(projectsYAMLPath, projectsYAML, 'utf8')
}

