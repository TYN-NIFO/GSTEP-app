const DriveRequest = require('../models/DriveRequest');

// @desc    Update drive request status
// @route   PATCH /api/po/drive-request/:id
// @access  Private (PO only)
const updateDriveRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Accepted', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const driveRequest = await DriveRequest.findById(req.params.id);

    if (!driveRequest) {
      return res.status(404).json({ message: 'Drive request not found' });
    }

    driveRequest.status = status;
    await driveRequest.save();

    res.json(driveRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updateDriveRequestStatus
};