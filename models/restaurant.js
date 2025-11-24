// models/restaurant.js
const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    district: { type: String, trim: true },
    cuisine: { type: String, trim: true },
    rating: { type: Number, min: 1, max: 5 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  {
    timestamps: true // 自動加 createdAt, updatedAt
  }
);

module.exports = mongoose.model('Restaurant', restaurantSchema);

