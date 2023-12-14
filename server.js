const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { DateTime } = require('luxon');
const { MongoClient } = require('mongodb');
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

// Rest of your code...

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
