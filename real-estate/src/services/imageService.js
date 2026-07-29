/**
 * Image Service
 * Processes images with Sharp (webp, resize, optimize)
 * Saves to Media library collection
 * Supports reuse across properties
 */

const sharp = require('sharp');
const path  = require('path');
const fs    = require('fs');

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'properties');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ─── Core processor ───────────────────────────────────────────────
const processImage = async (buffer, options = {}) => {
  const { width = 800, quality = 75 } = options;
  const filename   = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
  const outputPath = path.join(UPLOAD_DIR, filename);
  await sharp(buffer).resize({ width, withoutEnlargement: true }).webp({ quality }).toFile(outputPath);
  return { url: `/uploads/properties/${filename}`, filename, size: fs.statSync(outputPath).size };
};

// ─── Process + save to Media library ──────────────────────────────
const processAndSave = async (file, meta = {}, uploadedBy = null) => {
  const Media = require('../models/Media');
  const { url, filename, size } = await processImage(file.buffer);
  return await Media.create({
    url, filename, size,
    alt:        meta.alt   || '',
    title:      meta.title || '',
    uploadedBy,
  });
};

// ─── Featured image: process + save → return { url, alt, title } ──
const processFeaturedImage = async (file, meta = {}, uploadedBy = null) => {
  const media = await processAndSave(file, meta, uploadedBy);
  return { url: media.url, alt: media.alt, title: media.title };
};

// ─── Gallery images: process + save each → return array ───────────
const processGalleryImages = async (files, metas = [], uploadedBy = null) => {
  if (files.length > 10) throw new Error('Maximum 10 gallery images allowed');
  return Promise.all(
    files.map(async (file, i) => {
      const media = await processAndSave(file, metas[i] || {}, uploadedBy);
      return { url: media.url, alt: media.alt, title: media.title };
    })
  );
};

// ─── Delete from disk (not from Media collection) ─────────────────
const deleteImage = (image) => {
  if (!image) return;
  const urlPath = typeof image === 'string' ? image : image.url;
  if (!urlPath) return;
  const filePath = path.join(process.cwd(), urlPath);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

module.exports = { processImage, processAndSave, processFeaturedImage, processGalleryImages, deleteImage };
