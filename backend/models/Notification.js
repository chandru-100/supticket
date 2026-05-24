const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false // If null, it's a global admin notification
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  ticket: {
    type: mongoose.Schema.ObjectId,
    ref: 'Ticket',
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);
