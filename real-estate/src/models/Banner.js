/**
 * Banner Model
 * Homepage hero banners and sliders
 * type: 'banner' = single static banner, 'slider' = carousel slide
 * Admin can switch between banner and slider mode via GeneralSetting
 */

const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title:       { type: String, trim: true },
    subtitle:    { type: String, trim: true },
    description: { type: String, trim: true },

    // Typography
    titleFontSize: { 
      type: String, 
      default: '3xl',
      trim: true 
    },

    // Overlay opacity (0–100), controls how dark the background overlay is
    overlayOpacity: {
      type:    Number,
      default: 55,   // 55 = bg-black/55
      min:     0,
      max:     100,
    },

    // Media
    image: {
      url:   { type: String, required: true },
      alt:   { type: String, trim: true },
      title: { type: String, trim: true },
    },

    // CTA Button
    buttonText: { type: String, trim: true },
    buttonUrl:  { type: String, trim: true },
    buttonTarget: { type: String, enum: ['_self', '_blank'], default: '_self' },

    // Type: banner (static) or slider (carousel)
    type: {
      type:    String,
      enum:    ['banner', 'slider'],
      default: 'slider',
      index:   true,
    },

    order:    { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Banner', bannerSchema);
