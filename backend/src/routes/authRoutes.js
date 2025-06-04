const express = require('express');
const router = express.Router();
const { login, register, updateProfile } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Authentication routes
router.post('/register', register);
router.post('/login', login);
router.put('/users/profile', auth, updateProfile);

module.exports = router; 