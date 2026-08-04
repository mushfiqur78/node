/**
 * Image Service
 * Uploads optimized images to Vercel Blob
 */

const sharp = require('sharp');
const { put, del } = require('@vercel/blob');

// Process image and upload to Vercel Blob
const processImage = async (buffer, options = {}) => {
  const { width = 800, quality = 75 } = options;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN is missing');
  }

  const filename =
    `properties/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.webp`;

  const outputBuffer = await sharp(buffer)
    .rotate()
    .resize({
      width,
      withoutEnlargement: true,
    })
    .webp({ quality })
    .toBuffer();

  const blob = await put(filename, outputBuffer, {
    access: 'public',
    addRandomSuffix: true,
    contentType: 'image/webp',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return {
    url: blob.url,
    filename: blob.pathname || filename,
    size: outputBuffer.length,
  };
};

// Process image and save information to Media collection
const processAndSave = async (
  file,
  meta = {},
  uploadedBy = null
) => {
  const Media = require('../models/Media');

  const { url, filename, size } =
    await processImage(file.buffer);

  return Media.create({
    url,
    filename,
    size,
    alt: meta.alt || '',
    title: meta.title || '',
    uploadedBy,
  });
};

// Featured image
const processFeaturedImage = async (
  file,
  meta = {},
  uploadedBy = null
) => {
  const media = await processAndSave(
    file,
    meta,
    uploadedBy
  );

  return {
    url: media.url,
    alt: media.alt,
    title: media.title,
  };
};

// Gallery images
const processGalleryImages = async (
  files,
  metas = [],
  uploadedBy = null
) => {
  if (files.length > 10) {
    throw new Error(
      'Maximum 10 gallery images allowed'
    );
  }

  return Promise.all(
    files.map(async (file, index) => {
      const media = await processAndSave(
        file,
        metas[index] || {},
        uploadedBy
      );

      return {
        url: media.url,
        alt: media.alt,
        title: media.title,
      };
    })
  );
};

// Delete image from Vercel Blob
const deleteImage = async (image) => {
  const url =
    typeof image === 'string' ? image : image?.url;

  if (!url || !url.includes('blob.vercel-storage.com')) {
    return;
  }

  try {
    await del(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
  } catch (error) {
    console.error(
      'Blob image delete failed:',
      error.message
    );
  }
};

module.exports = {
  processImage,
  processAndSave,
  processFeaturedImage,
  processGalleryImages,
  deleteImage,
};
