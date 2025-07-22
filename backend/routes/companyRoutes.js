const express = require('express');
const router = express.Router();
const {
  registerCompany,
  loginCompany,
  createDriveRequest,
  getDriveRequests,
  getAppliedStudents,
  getPlacementStatistics,
  updateProfile,
  getProfile
} = require('../controllers/companyController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerCompany);
router.post('/login', loginCompany);
router.post('/request-drive', protect, createDriveRequest);
router.get('/requests', protect, getDriveRequests);
router.get('/drive/:id/applications', protect, getAppliedStudents);
router.get('/statistics', protect, getPlacementStatistics);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;