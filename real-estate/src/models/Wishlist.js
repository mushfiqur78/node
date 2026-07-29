/**
 * Wishlist Model
 * Users can save/favorite properties
 * One record per user — properties stored as array
 */

const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      unique:   true,
      index:    true,
    },
    properties: [
      {
        type:      mongoose.Schema.Types.ObjectId,
        ref:       'Property',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Wishlist', wishlistSchema);
