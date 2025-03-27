const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const MedicineRequest = require('../models/MedicineRequest');
const auth = require('../middleware/auth');
const axios = require('axios');

// Get all medicines
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let query = { status: 'available' };

        // Add search functionality
        if (search) {
            query.$text = { $search: search };
        }

        const medicines = await Medicine.find(query)
            .populate('donor', 'name')
            .sort({ createdAt: -1 });

        res.json(medicines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Search medicines using OpenFDA API
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        const response = await axios.get(`https://api.fda.gov/drug/drugsfda.json?search=openfda.brand_name:"${query}"&limit=10`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single medicine
router.get('/:id', async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id)
            .populate('donor', 'name');
        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }
        res.json(medicine);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new medicine donation
router.post('/', auth, async (req, res) => {
    try {
        const medicine = new Medicine({
            ...req.body,
            donor: req.user._id
        });
        const newMedicine = await medicine.save();
        res.status(201).json(newMedicine);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update medicine
router.patch('/:id', auth, async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);
        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        if (medicine.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this medicine' });
        }

        Object.assign(medicine, req.body);
        const updatedMedicine = await medicine.save();
        res.json(updatedMedicine);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete medicine
router.delete('/:id', auth, async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);
        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        if (medicine.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this medicine' });
        }

        await medicine.remove();
        res.json({ message: 'Medicine deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Donate medicine
router.post('/:id/donate', auth, async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);
        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        if (medicine.isDonated) {
            return res.status(400).json({ message: 'Medicine already donated' });
        }

        medicine.isDonated = true;
        medicine.donatedTo = req.body.donatedTo;
        medicine.donationDate = new Date();

        const updatedMedicine = await medicine.save();
        res.json(updatedMedicine);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Create medicine request
router.post('/request', auth, async (req, res) => {
    try {
        const request = new MedicineRequest({
            ...req.body,
            requestedBy: req.user._id
        });
        const newRequest = await request.save();
        res.status(201).json(newRequest);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all medicine requests
router.get('/requests/all', auth, async (req, res) => {
    try {
        const requests = await MedicineRequest.find()
            .populate('requestedBy', 'name')
            .populate('fulfilledBy', 'name');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user's medicine requests
router.get('/requests/my', auth, async (req, res) => {
    try {
        const requests = await MedicineRequest.find({ requestedBy: req.user._id })
            .populate('requestedBy', 'name')
            .populate('fulfilledBy', 'name');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Fulfill medicine request
router.post('/requests/:id/fulfill', auth, async (req, res) => {
    try {
        const request = await MedicineRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.status !== 'Pending') {
            return res.status(400).json({ message: 'Request is not pending' });
        }

        request.status = 'Fulfilled';
        request.fulfilledBy = req.user._id;
        request.fulfilledAt = new Date();

        const updatedRequest = await request.save();
        res.json(updatedRequest);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Cancel medicine request
router.post('/requests/:id/cancel', auth, async (req, res) => {
    try {
        const request = await MedicineRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.requestedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to cancel this request' });
        }

        request.status = 'Cancelled';
        const updatedRequest = await request.save();
        res.json(updatedRequest);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update medicine status
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);
        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        if (medicine.donor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        medicine.status = req.body.status;
        await medicine.save();
        res.json(medicine);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router; 