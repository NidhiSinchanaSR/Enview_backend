const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    message: { type: String, required: true },
    vehicle_id: { type: Number, required: true },
    location_type: { type: String, enum: ['highway', 'residential', 'commercial', 'city_center'], required: true }
});

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;
