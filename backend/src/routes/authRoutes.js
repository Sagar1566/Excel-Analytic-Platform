const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/authController');

// Authentication routes
router.post('/register', register);
router.post('/login', login);

module.exports = router; 