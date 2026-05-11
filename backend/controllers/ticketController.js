const Ticket = require('../models/Ticket');
const Reply = require('../models/Reply');

// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Private
exports.getTickets = async (req, res) => {
  try {
    let query;

    // If admin, get all tickets, else get user tickets
    if (req.user.role === 'admin') {
      query = Ticket.find().populate('user', 'name email');
    } else {
      query = Ticket.find({ user: req.user.id });
    }

    const tickets = await query;

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
exports.getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('user', 'name email');

    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    // Make sure user is ticket owner or admin
    if (ticket.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private
exports.createTicket = async (req, res) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    const ticket = await Ticket.create(req.body);

    res.status(201).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update ticket
// @route   PUT /api/tickets/:id
// @access  Private
exports.updateTicket = async (req, res) => {
  try {
    let ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    // Make sure user is ticket owner or admin
    if (ticket.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Private
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    // Make sure user is ticket owner or admin
    if (ticket.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    await ticket.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get replies for a ticket
// @route   GET /api/tickets/:ticketId/replies
// @access  Private
exports.getReplies = async (req, res) => {
  try {
    const replies = await Reply.find({ ticket: req.params.ticketId }).populate('user', 'name role');

    res.status(200).json({
      success: true,
      count: replies.length,
      data: replies
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Add reply to a ticket
// @route   POST /api/tickets/:ticketId/replies
// @access  Private
exports.addReply = async (req, res) => {
  try {
    req.body.ticket = req.params.ticketId;
    req.body.user = req.user.id;

    const ticket = await Ticket.findById(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    const reply = await Reply.create(req.body);

    res.status(201).json({
      success: true,
      data: reply
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
