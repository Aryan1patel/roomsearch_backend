const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   POST /api/users
// @desc    Create a new room swap listing
// @access  Public
router.post('/', async (req, res) => {
    try {
        const {
            email,
            name,
            phoneNo,
            currentHostelBlock,
            currentFloor,
            desiredHostelBlock,
            desiredFloor
        } = req.body;

        // Validation
        if (!email || !name || !phoneNo || !currentHostelBlock || !currentFloor || !desiredHostelBlock || !desiredFloor) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if user already has an active listing
        const existingUser = await User.findOne({ email, isActive: true });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'You already have an active listing. Please delete it first.'
            });
        }

        // Create new user listing
        const user = new User({
            email: email.toLowerCase(),
            name,
            phoneNo,
            currentHostelBlock: currentHostelBlock.toLowerCase(),
            currentFloor,
            desiredHostelBlock: desiredHostelBlock.toLowerCase(),
            desiredFloor
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: 'Room swap listing created successfully',
            data: user
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/users
// @desc    Get all active room swap listings
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { block, floor } = req.query;

        let query = { isActive: true };

        // Filter by desired block if provided
        if (block) {
            query.desiredHostelBlock = block.toLowerCase();
        }

        // Filter by desired floor if provided
        if (floor) {
            query.desiredFloor = floor;
        }

        const users = await User.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/users/matches/:userId
// @desc    Find potential matches for a user
// @access  Public
router.get('/matches/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Find users whose current location matches this user's desired location
        // AND whose desired location matches this user's current location
        const matches = await User.find({
            _id: { $ne: user._id }, // Exclude the current user
            isActive: true,
            currentHostelBlock: user.desiredHostelBlock,
            currentFloor: user.desiredFloor,
            desiredHostelBlock: user.currentHostelBlock,
            desiredFloor: user.currentFloor
        });

        res.status(200).json({
            success: true,
            count: matches.length,
            data: matches
        });
    } catch (error) {
        console.error('Error finding matches:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/users/:id
// @desc    Get a single user listing by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   PUT /api/users/:id
// @desc    Update a user listing
// @access  Public
router.put('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const {
            name,
            phoneNo,
            currentHostelBlock,
            currentFloor,
            desiredHostelBlock,
            desiredFloor,
            isActive
        } = req.body;

        // Update fields if provided
        if (name) user.name = name;
        if (phoneNo) user.phoneNo = phoneNo;
        if (currentHostelBlock) user.currentHostelBlock = currentHostelBlock.toLowerCase();
        if (currentFloor) user.currentFloor = currentFloor;
        if (desiredHostelBlock) user.desiredHostelBlock = desiredHostelBlock.toLowerCase();
        if (desiredFloor) user.desiredFloor = desiredFloor;
        if (typeof isActive !== 'undefined') user.isActive = isActive;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'User listing updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user listing (soft delete)
// @access  Public
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Soft delete - just mark as inactive
        user.isActive = false;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'User listing deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/users/search/potential-matches
// @desc    Search for potential room swap partners based on criteria
// @access  Public
router.get('/search/potential-matches', async (req, res) => {
    try {
        const { currentBlock, currentFloor, desiredBlock, desiredFloor } = req.query;

        if (!currentBlock || !currentFloor || !desiredBlock || !desiredFloor) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all search criteria'
            });
        }

        // Find users who want what you have and have what you want
        const matches = await User.find({
            isActive: true,
            currentHostelBlock: desiredBlock.toLowerCase(),
            currentFloor: desiredFloor,
            desiredHostelBlock: currentBlock.toLowerCase(),
            desiredFloor: currentFloor
        });

        res.status(200).json({
            success: true,
            count: matches.length,
            data: matches
        });
    } catch (error) {
        console.error('Error searching matches:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;
