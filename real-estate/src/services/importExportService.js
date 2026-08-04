/**
 * Image Service
 * Processes images with Sharp (webp, resize, optimize)
 * Uploads to Vercel Blob instead of local disk
 */

const sharp = require('sharp');
const { put, del } = require('@vercel/blob');

// ─── Core processor ───────────────────────────────────────────────
const processImage = async (buffer, options = {}) => {
  const { width = 800, quality = 75, folder = 'properties' } = options;

  const filename = `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.webp`;

  const outputBuffer = await sharp(buffer)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();

  const blob = await put(filename, outputBuffer, {
    access: 'public',
    contentType: 'image/webp',
    addRandomSuffix: true,
  });

  return {
    url: blob.url,
    filename: blob.pathname || filename,
    size: outputBuffer.length,
  };
};

// ─── Process + save to Media library ──────────────────────────────
const processAndSave = async (file, meta = {}, uploadedBy = null) => {
  const Media = require('../models/Media');
  const { url, filename, size } = await processImage(file.buffer);

  return await Media.create({
    url,
    filename,
    size,
    alt: meta.alt || '',
    title: meta.title || '',
    uploadedBy,
  });
};

// ─── Featured image: process + save → return { url, alt, title } ──
const processFeaturedImage = async (file, meta = {}, uploadedBy = null) => {
  const media = await processAndSave(file, meta, uploadedBy);
  return {
    url: media.url,
    alt: media.alt,
    title: media.title,
  };
};

// ─── Gallery images: process + save each → return array ───────────
const processGalleryImages = async (files, metas = [], uploadedBy = null) => {
  if (files.length > 10) {
    throw new Error('Maximum 10 gallery images allowed');
  }

  return Promise.all(
    files.map(async (file, i) => {
      const media = await processAndSave(file, metas[i] || {}, uploadedBy);
      return {
        url: media.url,
        alt: media.alt,
        title: media.title,
      };
    })
  );
};

// ─── Delete image from Vercel Blob ────────────────────────────────
const deleteImage = (image) => {
  if (!image) return;

  const url = typeof image === 'string' ? image : image.url;
  if (!url) return;

  del(url).catch((error) => {
    console.error('Blob delete failed:', error.message);
  });
};

module.exports = {
  processImage,
  processAndSave,
  processFeaturedImage,
  processGalleryImages,
  deleteImage,
};
