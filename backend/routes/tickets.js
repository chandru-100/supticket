const express = require('express');
const {
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  getReplies,
  addReply
} = require('../controllers/ticketController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .get(getTickets)
  .post(createTicket);

router
  .route('/:id')
  .get(getTicket)
  .put(updateTicket)
  .delete(deleteTicket);

router
  .route('/:ticketId/replies')
  .get(getReplies)
  .post(addReply);

module.exports = router;
