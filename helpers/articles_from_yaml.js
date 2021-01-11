const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')
const pathAliasesFunc = require('./path_aliases_func.js')

// REMOTE ID'S TO BUILD, LEAVE EMPTY FOR ALL OR COMMENT BELOW LINE OUT
// const fetchSpecific = ['6931', '6884', '4546', '4343']

const rootDir =  path.join(__dirname, '..')
const sourceDir = path.join(rootDir, 'source')
const fetchDir = path.join(sourceDir, '_fetchdir')
const articlesDir = path.join(fetchDir, 'articles')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))
const STRAPIDATA_ARTICLES = STRAPIDATA['Article'].filter(e => e.publish_date)
const STRAPIDATA_PERSONS = STRAPIDATA['Person']
const STRAPIDATA_CATEGORIES = STRAPIDATA['Category']
const LANGUAGES = ['et', 'en']

const allPathAliases = []

let article_index_template = `/_templates/magazine_index_template.pug`

STRAPIDATA_ARTICLES.sort((a, b) => {
    return new Date(b.publish_date) - new Date(a.publish_date)
})

// Front page promo to first
STRAPIDATA_ARTICLES.sort((a, b) => {
    if (a.front_page_promotion) {
        return -1
    } else {
        return 1
    }
})

STRAPIDATA_ARTICLES.map(ar => {
    ar.authors = ar.authors ? ar.authors.map(a => STRAPIDATA_PERSONS.filter(e => a.id === e.id)[0]) : null
    ar.categories = ar.categories ? ar.categories.map(a => STRAPIDATA_CATEGORIES.filter(e => a.id === e.id)[0]) : null
})

for (const lang of LANGUAGES) {
    const articlesYAMLPath = path.join(fetchDir, `articles.${lang}.yaml`)
    let allData = []

    const RELATED = STRAPIDATA_ARTICLES.map(rel => {
        let related_articles = {
            id: rel.id,
            remote_id: rel.remote_id,
            [`title_${lang}`]: rel[`title_${lang}`],
            categories: rel.categories ? rel.categories.map(c => c.id) : [],
            authors_cs: rel.authors ? rel.authors.map(a => `${a.first_name}${a.last_name ? ` ${a.last_name}` : ''}`).join(', ') : [],
            publish_date: rel.publish_date,
            // path: lang !== 'et' ? `magazine/${rel.remote_id}` : `${lang}/magazine/${rel.remote_id}`,
            path: `magazine/${rel.remote_id}`,
        }
        return related_articles
    })

    for (const article of STRAPIDATA_ARTICLES) {

        let createDir = typeof fetchSpecific === 'undefined' || !fetchSpecific.length || fetchSpecific.includes(article.remote_id) ? true : false

        if (article[`title_${lang}`] && article.remote_id) {

            article.path = `magazine/${article.remote_id}`

            if (lang === 'et') {
                addAliases(article, [`${lang}/magazine/${article.remote_id}`])
            }

            if (article.X_pictures) {
                article.X_pictures = sort_pictures(article.X_pictures)
            }

            if (article.article_media) {
                article.hero_images = article.article_media.filter(h => h.hero_image).map(h => h.hero_image.url) || null
            }
            if (createDir) {
                if (article.authors && article.authors.length) {
                    article.authors_cs = article.authors
                        .map(a => `${a.first_name}${a.last_name ? ` ${a.last_name}` : ''}`)
                        .join(', ')
                }

                if (article.categories) {
                    let relatedArticles = RELATED.filter(a => {
                        if (a.categories && a.remote_id !== article.remote_id) {
                            return a.categories.some(s => article.categories.
                                map(ac => ac.id)
                                .includes(s))
                        } else {
                            return false
                        }
                    })
                    if (relatedArticles.length) {
                        article.related = relatedArticles.sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date))
                    }
                }

                const articleYAML = yaml.safeDump(article, { 'noRefs': true, 'indent': '4' });
                const articleDir = path.join(articlesDir, article.remote_id)
                const articleYAMLPath = path.join(articleDir, `data.${lang}.yaml`)

                fs.mkdirSync(articleDir, { recursive: true });
                fs.writeFileSync(articleYAMLPath, articleYAML, 'utf8');

                if (fs.existsSync(`${sourceDir}${article_index_template}`)) {
                    fs.writeFileSync(`${articleDir}/index.pug`, `include ${article_index_template}`)
                } else {
                    console.log(`ERROR: Article index template missing`);
                }
            }
            allData.push(article)
        }
    }

    console.log(`${allData.length} articles from YAML (${lang}) ready for building`);
    const articlesYAML = yaml.safeDump(allData, { 'noRefs': true, 'indent': '4' });
    fs.writeFileSync(articlesYAMLPath, articlesYAML, 'utf8');
}

function sort_pictures(pics) {

    for (const key in pics) {
        if (key !== 'id' && pics[key].length) {
            let picsKeys = pics[key].includes(',') ? pics[key].split(',') : [pics[key]]
            pics[key] = picsKeys.sort((a, b) => a-b).join(',')
        }
    }
    return JSON.parse(JSON.stringify(pics))

}

function addAliases(oneEventData, pathAliases) {
    // oneEventData.aliases = pathAliases
    pathAliases.map(a => allPathAliases.push({from: a, to: oneEventData.path}))
}

pathAliasesFunc(fetchDir, allPathAliases, 'articles')