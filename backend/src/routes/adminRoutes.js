const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { uploadAdminBookFiles } = require('../middleware/upload');

// Protect all admin endpoints with both authentication and strict admin check
router.use(authenticate, requireAdmin);

// Dashboard overview
router.get('/dashboard', adminController.getDashboardStats);

// Book management CRUD
router.get('/books', adminController.getAdminBooks);
router.post(
  '/books',
  uploadAdminBookFiles.fields([{ name: 'pdf', maxCount: 1 }, { name: 'cover', maxCount: 1 }]),
  adminController.createAdminBook
);
router.put(
  '/books/:id',
  uploadAdminBookFiles.fields([{ name: 'pdf', maxCount: 1 }, { name: 'cover', maxCount: 1 }]),
  adminController.updateAdminBook
);
router.delete('/books/:id', adminController.deleteAdminBook);

// Category management CRUD
router.post('/categories', adminController.createAdminCategory);
router.put('/categories/:id', adminController.updateAdminCategory);
router.delete('/categories/:id', adminController.deleteAdminCategory);

// Contribution review queue
router.get('/contributions', adminController.getAdminContributions);
router.post('/contributions/:id/review', adminController.reviewContribution);

// User management
router.get('/users', adminController.getAdminUsers);
router.patch('/users/:id/role', adminController.updateUserRole);
router.patch('/users/:id/status', adminController.toggleUserStatus);

// Activity logs
router.get('/logs', adminController.getAdminLogs);

module.exports = router;

