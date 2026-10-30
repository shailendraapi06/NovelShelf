const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authenticate } = require('../middleware/auth');

// Public endpoints: Anyone can browse and view book details
router.get('/', bookController.getBooks);
router.get('/:id', bookController.getBookById);

// Protected endpoint: Reading requires authentication!
router.get('/:id/content', authenticate, bookController.getBookContent);

module.exports = router;

