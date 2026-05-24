const Notification = require('../models/Notification');

// @desc    Get notifications for logged in user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'admin') {
      // Admins see notifications where user is null (global) OR user is them
      query = { $or: [{ user: null }, { user: req.user.id }] };
    } else {
      // Users see only their notifications
      query = { user: req.user.id };
    }

    const notifications = await Notification.find(query).sort('-createdAt').limit(20);

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'admin') {
      query = { $or: [{ user: null }, { user: req.user.id }] };
    } else {
      query = { user: req.user.id };
    }

    await Notification.updateMany(query, { isRead: true });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
