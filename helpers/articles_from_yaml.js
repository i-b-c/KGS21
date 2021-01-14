const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')
const pathAliasesFunc = require('./path_aliases_func.js')
const addConfigPathAliases = require('./add_config_path_aliases.js')

const targeted = process.argv[2] === '-t' && process.argv[3] ? true : false
const target = [process.argv[3]]

const rootDir =  path.join(__dirname, '..')
const sourceDir = path.join(rootDir, 'source')
const fetchDir = path.join(sourceDir, '_fetchdir')
const articlesDir = path.join(fetchDir, 'articles')
const strapiDataDirPath = path.join(fetchDir, 'strapidata')
const strapiDataArticlesPath = path.join(strapiDataDirPath, 'Article.yaml')
const strapiDataPersonsPath = path.join(strapiDataDirPath, 'Person.yaml')
const strapiDataCategorysPath = path.join(strapiDataDirPath, 'Category.yaml')

const STRAPIDATA_PERSONS = yaml.safeLoad(fs.readFileSync(strapiDataPersonsPath, 'utf8'))
const STRAPIDATA_CATEGORIES = yaml.safeLoad(fs.readFileSync(strapiDataCategorysPath, 'utf8'))
const STRAPIDATA_ARTICLES_FROM_YAML = yaml.safeLoad(fs.readFileSync(strapiDataArticlesPath, 'utf8')).filter(e => e.publish_date)
const STRAPIDATA_ARTICLES = processArticles(STRAPIDATA_ARTICLES_FROM_YAML)

const LANGUAGES = ['et', 'en']

const allPathAliases = []

// 5350
// REMOTE ID'S TO BUILD, LEAVE EMPTY FOR ALL OR COMMENT BELOW LINE OUT
fetchSpecific = targeted ? target : []

let article_index_template = `/_templates/magazine_index_template.pug`

const targetedArticle = STRAPIDATA_ARTICLES.filter(a => a.id === target[0])[0] || []
const targetArticleRelations = targetedArticle.related ? targetedArticle.related.map(a => a.id) : []
targetArticleRelations.map(a => fetchSpecific.push(a))

for (const lang of LANGUAGES) {
    const articlesYAMLPath = path.join(fetchDir, `articles.${lang}.yaml`)
    let allData = []

    for (const article of STRAPIDATA_ARTICLES) {

        let createDir = typeof fetchSpecific === 'undefined' || !fetchSpecific.length || fetchSpecific.includes(article.id.toString()) ? true : false


        if (article[`title_${lang}`] && article.remote_id) {

            article.path = `magazine/${article.remote_id}`

            if (lang === 'et') {
                addAliases(article, [`${lang}/magazine/${article.remote_id}`])
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

                const articleYAML = yaml.safeDump(article, { 'noRefs': true, 'indent': '4' });
                const articleDir = path.join(articlesDir, article.id.toString())
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

function processArticles(STRAPIDATA_ARTICLES) {
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

    const RELATED = STRAPIDATA_ARTICLES.map(rel => {
        let related_articles = {
            id: rel.id,
            remote_id: rel.remote_id,
            title_et: rel.title_et,
            title_en: rel.title_en,
            categories: rel.categories ? rel.categories.map(c => c.id) : [],
            authors_cs: rel.authors ? rel.authors.map(a => `${a.first_name}${a.last_name ? ` ${a.last_name}` : ''}`).join(', ') : [],
            publish_date: rel.publish_date,
            // path: lang !== 'et' ? `magazine/${rel.remote_id}` : `${lang}/magazine/${rel.remote_id}`,
            path: `magazine/${rel.remote_id}`,
        }
        return related_articles
    })

    STRAPIDATA_ARTICLES.map(article => {

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
        return article
    })

    return STRAPIDATA_ARTICLES
}

function addAliases(oneEventData, pathAliases) {
    // oneEventData.aliases = pathAliases
    pathAliases.map(a => allPathAliases.push({from: a, to: oneEventData.path}))
}

pathAliasesFunc(fetchDir, allPathAliases, 'articles')

if (targeted) {
    const allTargets = fetchSpecific.map(a => `_fetchdir/articles/${a}`)
    allTargets.push(`magazine/`)
    addConfigPathAliases(allTargets)
}