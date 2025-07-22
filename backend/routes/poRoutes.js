const express = require('express');
const router = express.Router();
const { updateDriveRequestStatus } = require('../controllers/poController');
// Note: In a real app, you'd have PO authentication middleware here

router.patch('/drive-request/:id', updateDriveRequestStatus);

module.exports = router;