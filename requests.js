const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Medicine = require('../models/Medicine');
const auth = require('../middleware/auth');

// Get all requests
router.get('/', auth, async (req, res) => {
    try {
        const requests = await Request.find()
            .populate('medicine')
            .populate('requester', 'name')
            .populate('fulfilledBy', 'name')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new request
router.post('/', auth, async (req, res) => {
    try {
        const { medicineName, description, quantity, urgency } = req.body;

        // Create a new medicine if it doesn't exist
        let medicine = await Medicine.findOne({ name: medicineName });
        if (!medicine) {
            medicine = await Medicine.create({
                name: medicineName,
                description: description,
                quantity: 1,
                status: 'requested',
                donor: req.user._id,
                manufacturer: 'Unknown', // Required field
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Set expiry date to 1 year from now
            });
        }

        // Create the request
        const request = await Request.create({
            medicine: medicine._id,
            requester: req.user._id,
            description,
            quantity,
            urgency,
            status: 'pending'
        });

        // Populate the request with medicine and requester details
        await request.populate('medicine requester', 'name email phone');

        res.status(201).json(request);
    } catch (error) {
        console.error('Request creation error:', error);
        res.status(500).json({ message: error.message || 'Failed to create request' });
    }
});

// Get request by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const request = await Request.findById(req.params.id)
            .populate('medicine')
            .populate('requester', 'name')
            .populate('fulfilledBy', 'name');
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update request status
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        const medicine = await Medicine.findById(request.medicine);
        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        if (medicine.donor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        request.status = req.body.status;
        if (request.status === 'accepted') {
            medicine.status = 'requested';
            request.fulfilledBy = req.user._id;
            request.fulfilledAt = new Date();
            await medicine.save();
        }
        await request.save();
        res.json(request);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router; 