const express = require('express');
const router = express.Router();
const readingController = require('../controllers/readingController');
const { authenticate } = require('../middleware/auth');

router.get('/progress/:bookId', authenticate, readingController.getProgress);
router.post('/progress/:bookId', authenticate, readingController.saveProgress);

router.get('/bookmarks', authenticate, readingController.getBookmarks);
router.post('/bookmarks', authenticate, readingController.addBookmark);
router.delete('/bookmarks/:bookId/:page?', authenticate, readingController.removeBookmark);

module.exports = router;

