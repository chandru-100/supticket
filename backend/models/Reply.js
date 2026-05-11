const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
  ticket: {
    type: mongoose.Schema.ObjectId,
    ref: 'Ticket',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Please add a message']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Reply', ReplySchema);
