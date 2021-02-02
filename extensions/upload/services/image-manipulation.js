'use strict';
/**
 * Image manipulation functions
 */
const sharp = require('sharp');

const { bytesToKbytes } = require('../utils/file');

const getMetadatas = buffer =>
  sharp(buffer)
    .metadata()
    .catch(() => ({})); // ignore errors

const getDimensions = buffer =>
  getMetadatas(buffer)
    .then(({ width = null, height = null }) => ({ width, height }))
    .catch(() => ({})); // ignore errors

const resizeTo = (buffer, options) =>
  sharp(buffer)
    .resize(options)
    .toBuffer()
    .catch(() => null);

const MINI_RESIZE_OPTIONS = {
  width: 200,
  height: 200,
  fit: 'cover',
  position: sharp.strategy.attention,
};

const MEDIUM_RESIZE_OPTIONS = {
  width: 350,
  height: 350,
  fit: 'cover',
  position: sharp.strategy.attention,
};

const PORTRAIT_RESIZE_OPTIONS = {
  width: 1400,
  height: 700,
  fit: 'cover',
  position: sharp.strategy.attention,
};

const LANDSCAPE_RESIZE_OPTIONS = {
  width: 700,
  height: 1400,
  fit: 'cover',
  position: sharp.strategy.attention,
};

const ALL_OPTIONS =[MINI_RESIZE_OPTIONS, MEDIUM_RESIZE_OPTIONS, PORTRAIT_RESIZE_OPTIONS, LANDSCAPE_RESIZE_OPTIONS,]


const generateALL = async file => {
  if (!(await canBeProccessed(file.buffer))) {
    return null;
  }

  const { width, height } = await getDimensions(file.buffer);

  let files = []

  for (let OPTION of ALL_OPTIONS){
    if (width > OPTION.width && height > OPTION.height) {
      const newBuff = await resizeTo(file.buffer, OPTION);

      if (newBuff) {
        const { width, height, size } = await getMetadatas(newBuff);

        const fileName = file.name.split(file.ext)[0]
        const extension = `${OPTION.width}x${OPTION.height}`
        // console.log(`Generated name: ${fileName}_${extension}${file.ext}`)

        files.push( {
          name: `${fileName}_${extension}${file.ext}`,
          hash: `${file.hash}_${extension}`,
          ext: file.ext,
          mime: file.mime,
          width,
          height,
          size: bytesToKbytes(size),
          buffer: newBuff,
          path: file.path ? file.path : null,
          alternativeText: file.alternativeText,
          caption: file.caption,
        })
      }
    }

  }
  if(files.length>0){
    return files
  }


  return null;
};



const optimize = async buffer => {
  const {
    sizeOptimization = false,
    autoOrientation = false,
  } = await strapi.plugins.upload.services.upload.getSettings();

  if (!sizeOptimization || !(await canBeProccessed(buffer))) {
    return { buffer };
  }

  const sharpInstance = autoOrientation ? sharp(buffer).rotate() : sharp(buffer);
  return sharpInstance
    .toBuffer({ resolveWithObject: true })
    .then(({ data, info }) => ({
      buffer: data,
      info: {
        width: info.width,
        height: info.height,
        size: bytesToKbytes(info.size),
      },
    }))
    .catch(() => ({ buffer }));
};


// const generateBreakpoint = async (key, { file, breakpoint }) => {
//   const newBuff = await resizeTo(file.buffer, {
//     width: breakpoint,
//     height: breakpoint,
//     fit: 'inside',
//   });

//   if (newBuff) {
//     const { width, height, size } = await getMetadatas(newBuff);

//     return {
//       key,
//       file: {
//         name: `${key}_${file.name}`,
//         hash: `${key}_${file.hash}`,
//         ext: file.ext,
//         mime: file.mime,
//         width,
//         height,
//         size: bytesToKbytes(size),
//         buffer: newBuff,
//         path: file.path ? file.path : null,
//       },
//     };
//   }
// };

// const breakpointSmallerThan = (breakpoint, { width, height }) => {
//   return breakpoint < width || breakpoint < height;
// };

const formatsToProccess = ['jpeg', 'png', 'webp', 'tiff'];
const canBeProccessed = async buffer => {
  const { format } = await getMetadatas(buffer);
  return format && formatsToProccess.includes(format);
};

module.exports = {
  getDimensions,
  generateALL,
  bytesToKbytes,
  optimize,
};
