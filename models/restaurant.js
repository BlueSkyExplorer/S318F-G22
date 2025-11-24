const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    district: { type: String, trim: true },
    cuisine: { type: String, trim: true },
    rating: { type: Number, min: 1, max: 5 }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Restaurant', restaurantSchema);

