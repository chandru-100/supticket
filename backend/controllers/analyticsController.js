const Ticket = require('../models/Ticket');

// @desc    Get dashboard analytics
// @route   GET /api/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res) => {
  try {
    const totalTickets = await Ticket.countDocuments();
    const openTickets = await Ticket.countDocuments({ status: 'Open' });
    const inProgressTickets = await Ticket.countDocuments({ status: 'In Progress' });
    const resolvedTickets = await Ticket.countDocuments({ status: 'Resolved' });
    const highPriorityTickets = await Ticket.countDocuments({ priority: 'High' });

    res.status(200).json({
      success: true,
      data: {
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        highPriorityTickets
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
