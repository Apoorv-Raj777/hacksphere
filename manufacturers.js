const express = require('express');
const router = express.Router();
const Manufacturer = require('../models/Manufacturer');
const auth = require('../middleware/auth');

// Get all manufacturers
router.get('/', async (req, res) => {
    try {
        const manufacturers = await Manufacturer.find();
        res.json(manufacturers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single manufacturer
router.get('/:id', async (req, res) => {
    try {
        const manufacturer = await Manufacturer.findById(req.params.id);
        if (!manufacturer) {
            return res.status(404).json({ message: 'Manufacturer not found' });
        }
        res.json(manufacturer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create manufacturer profile
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'manufacturer') {
        return res.status(403).json({ message: 'Only manufacturers can create profiles' });
    }

    try {
        const manufacturer = new Manufacturer({
            ...req.body,
            contactPerson: {
                name: req.user.name,
                email: req.user.email,
                phone: req.user.phone
            }
        });

        const newManufacturer = await manufacturer.save();
        res.status(201).json(newManufacturer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update manufacturer profile
router.patch('/:id', auth, async (req, res) => {
    try {
        const manufacturer = await Manufacturer.findById(req.params.id);
        if (!manufacturer) {
            return res.status(404).json({ message: 'Manufacturer not found' });
        }

        if (manufacturer.contactPerson.email !== req.user.email && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this profile' });
        }

        Object.assign(manufacturer, req.body);
        const updatedManufacturer = await manufacturer.save();
        res.json(updatedManufacturer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Verify manufacturer (admin only)
router.patch('/:id/verify', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
    }

    try {
        const manufacturer = await Manufacturer.findById(req.params.id);
        if (!manufacturer) {
            return res.status(404).json({ message: 'Manufacturer not found' });
        }

        manufacturer.isVerified = true;
        const updatedManufacturer = await manufacturer.save();
        res.json(updatedManufacturer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete manufacturer (admin only)
router.delete('/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
    }

    try {
        const manufacturer = await Manufacturer.findById(req.params.id);
        if (!manufacturer) {
            return res.status(404).json({ message: 'Manufacturer not found' });
        }

        await manufacturer.remove();
        res.json({ message: 'Manufacturer deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 