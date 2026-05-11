const express = require('express');
const { getAnalytics } = require('../controllers/analyticsController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getAnalytics);

module.exports = router;
