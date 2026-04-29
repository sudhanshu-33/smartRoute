const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  sourceNode: { type: String, required: true },
  destinationNode: { type: String, required: true },
  distance: { type: Number, required: true },
  path: { type: [String], required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Route', routeSchema);
