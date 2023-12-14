const mongoose = require('mongoose');

const locationTypeThresholdSchema = new mongoose.Schema({
    locationType: { type: String, enum: ['highway', 'residential', 'commercial', 'city_center'], required: true },
    threshold: { type: Number, required: true },
});

const LocationTypeThreshold = mongoose.model('LocationTypeThreshold', locationTypeThresholdSchema);

module.exports = LocationTypeThreshold;