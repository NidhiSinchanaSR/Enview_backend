const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { DateTime } = require('luxon');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
});

const db = mongoose.connection;

db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

db.once('open', () => {
    console.log('Connected to MongoDB');
});

const DrivingEvent = require('./models/DrivingEvent');
const Alert = require('./models/Alert');
const LocationTypeThreshold = require('./models/LocationTypeThreshold');

cron.schedule('*/5 * * * *', async () => {
    try {
        const thresholdConfigs = await LocationTypeThreshold.find().exec();

        for (const config of thresholdConfigs) {
            const { locationType, threshold } = config;

            const unsafeEvents = await DrivingEvent.find({
                location_type: locationType,
                is_driving_safe: false,
                timestamp: {
                    $gte: DateTime.utc().minus({ minutes: 5 }).toISO(),
                    $lte: DateTime.utc().toISO(),
                },
            }).exec();

            if (unsafeEvents.length >= threshold) {
                
                const alert = new Alert({
                    timestamp: DateTime.utc().toISO(),
                    message: `Unsafe driving in ${locationType}. Threshold exceeded.`,
                });
                await alert.save();

                console.log('Alert generated and saved to MongoDB:', alert);
            }
        }
    } catch (err) {
        console.error('Error running rule:', err);
    }
});


app.post('/driving-event', async (req, res) => {
    const data = req.body;

    data.timestamp = DateTime.utc().toISO();

    try {
        const drivingEvent = new DrivingEvent(data);
        await drivingEvent.save();

        console.log('Driving event saved to MongoDB:', drivingEvent);
        res.json({ status: 'success' });
    } catch (err) {
        console.error('Error saving driving event to MongoDB:', err);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});

app.get('/alerts', async (req, res) => {
    try {
        const alerts = await Alert.find().exec();
        res.json(alerts);
    } catch (err) {
        console.error('Error fetching alerts from MongoDB:', err);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});

app.get('/alerts/:alert_id', async (req, res) => {
    const alertId = req.params.alert_id;

    try {
        const alert = await Alert.findById(alertId).exec();

        if (!alert) {
            return res.status(404).json({ status: 'error', message: 'Alert not found' });
        }

        res.json(alert);s
    } catch (err) {
        console.error('Error fetching alert from MongoDB:', err);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
