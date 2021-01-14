const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')
const addConfigPathAliases = require('./add_config_path_aliases.js')

const targeted = process.argv[2] === '-t' && process.argv[3] ? true : false
const rootDir =  path.join(__dirname, '..')
const sourceDir = path.join(rootDir, 'source')
const fetchDir = path.join(sourceDir, '_fetchdir')
const strapiDataDirPath = path.join(fetchDir, 'strapidata')
const strapiDataEventsPath = path.join(strapiDataDirPath, 'Event.yaml')
const STRAPIDATA_EVENTS = yaml.safeLoad(fs.readFileSync(strapiDataEventsPath, 'utf8'))
const LANGUAGES = ['et', 'en']

const strapi_projects = STRAPIDATA_EVENTS
    .filter((event) => event.type === 'project')
    .sort((a, b) => (a.order || 0) - (b.order || 0))

const isProject = strapi_projects.map(p => p.id.toString()).includes(process.argv[3])

if ((isProject && targeted) || !targeted) {

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

    if (targeted) {
        addConfigPathAliases(['projects/'])
    }

}