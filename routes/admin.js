/**
 * Admin Panel Routes
 * Handles all admin panel routes
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated, isGuest } = require('../middleware/adminAuth');
const { uploadPassportMiddleware, uploadGalleryMiddleware } = require('../middleware/upload');

// Authentication routes
router.get('/login', isGuest, adminController.showLogin);
router.post('/login', isGuest, adminController.login);
router.post('/users/create', isGuest, adminController.createAdminUser);
router.get('/logout', isAuthenticated, adminController.logout);

// Dashboard
router.get('/', isAuthenticated, (req, res) => res.redirect('/admin/dashboard'));
router.get('/dashboard', isAuthenticated, adminController.showDashboard);

// Admissions Management
router.get('/admissions', isAuthenticated, adminController.listAdmissions);
router.get('/admissions/:id', isAuthenticated, adminController.viewAdmission);
router.get('/admissions/:id/edit', isAuthenticated, adminController.editAdmissionForm);
router.post('/admissions/:id/update', isAuthenticated, uploadPassportMiddleware, adminController.updateAdmission);
router.post('/admissions/:id/delete', isAuthenticated, adminController.deleteAdmission);
router.post('/admissions/:id/status', isAuthenticated, adminController.updateStatus);

// Gallery Management
router.get('/gallery', isAuthenticated, adminController.listGallery);
router.get('/gallery/create', isAuthenticated, adminController.createGalleryForm);
router.post('/gallery/create', isAuthenticated, uploadGalleryMiddleware, adminController.createGallery);
router.get('/gallery/:id/edit', isAuthenticated, adminController.editGalleryForm);
router.post('/gallery/:id/update', isAuthenticated, uploadGalleryMiddleware, adminController.updateGallery);
router.post('/gallery/:id/delete', isAuthenticated, adminController.deleteGallery);
router.post('/gallery/reorder', isAuthenticated, adminController.updateGalleryOrder);

module.exports = router;