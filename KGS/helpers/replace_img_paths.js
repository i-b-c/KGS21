const STRAPIDIR = `https://a.saal.ee`;
const REPLACEDIR = `https://saal.ee`;

function replaceImgPaths(pathAliases = '') {
    // Replace Strapi URL with assets URL for images
    let searchRegExp = new RegExp(STRAPIDIR, 'g');
    let replaceWith = REPLACEDIR;
    const replaceImgPath = pathAliases.replace(searchRegExp, replaceWith);

    return replaceImgPath
}
module.exports = replaceImgPaths
