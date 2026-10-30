const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Public categories endpoint
router.get('/', categoryController.getCategories);

module.exports = router;

