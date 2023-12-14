const mongoose = require('mongoose');

const drivingEventSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    is_driving_safe: { type: Boolean, required: true },
    vehicle_id: { type: Number, required: true },
    location_type: { type: String, enum: ['highway', 'residential', 'commercial', 'city_center'], required: true }
});

const DrivingEvent = mongoose.model('DrivingEvent', drivingEventSchema);

module.exports = DrivingEvent;
