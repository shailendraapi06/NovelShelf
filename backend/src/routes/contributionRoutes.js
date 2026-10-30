const express = require('express');
const router = express.Router();
const contributionController = require('../controllers/contributionController');
const { authenticate } = require('../middleware/auth');
const { uploadContributionPdf } = require('../middleware/upload');

// Protected: User must be authenticated to submit and track contributions
router.post('/', authenticate, uploadContributionPdf.single('pdf'), contributionController.submitContribution);
router.get('/my', authenticate, contributionController.getMyContributions);
router.get('/:id/pdf', authenticate, contributionController.getContributionPdf);

module.exports = router;

