const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')

const rootDir =  path.join(__dirname, '..')
const sourceDir = path.join(rootDir, 'source')
const fetchDir = path.join(sourceDir, '_fetchdir')
const articlesDir = path.join(fetchDir, 'articles')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))
const STRAPIDATA_ARTICLES = STRAPIDATA['Article']
const LANGUAGES = ['et', 'en']

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

for (const lang of LANGUAGES) {
    const articlesYAMLPath = path.join(fetchDir, `articles.${lang}.yaml`)
    let allData = []

    for (const article of STRAPIDATA_ARTICLES) {

        // var selectedFetch = ['4046', '4047', '6626', '6487']
        // if (selectedFetch.includes(article.remote_id)) {

        // } else {
        //     continue
        // }

        if (article[`title_${lang}`] && article.remote_id) {
            if (lang !== 'et') {
                article.path = `magazine/${article.remote_id}`
            } else {
                article.path = `${lang}/magazine/${article.remote_id}`
            }

            if (article.authors && article.authors.length) {
                article.authors_cs = article.authors
                    .map(a => `${a.first_name}${a.last_name ? ` ${a.last_name}` : ''}`)
                    .join(', ')
            }

            let articleDate = new Date(article.publish_date)
            article.publish_date_string = `${('0' + articleDate.getDate()).slice(-2)}.${('0' + (articleDate.getMonth()+1)).slice(-2)}.${articleDate.getFullYear()}`

            if (article.X_pictures) {
                article.X_pictures = sort_pictures(article.X_pictures)
            }

            const articleYAML = yaml.safeDump(article, { 'indent': '4' });
            const articleDir = path.join(articlesDir, article.remote_id)
            const articleYAMLPath = path.join(articleDir, `data.${lang}.yaml`)

            fs.mkdirSync(articleDir, { recursive: true });
            fs.writeFileSync(articleYAMLPath, articleYAML, 'utf8');

            if (fs.existsSync(`${sourceDir}${article_index_template}`)) {
                fs.writeFileSync(`${articleDir}/index.pug`, `include ${article_index_template}`)
                allData.push(article)
            } else {
                console.log(`ERROR: Article index template missing`);
            }
        }
    }

    console.log(`${allData.length} articles from YAML (${lang}) ready for building`);
    const articlesYAML = yaml.safeDump(allData, { 'indent': '4' });
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