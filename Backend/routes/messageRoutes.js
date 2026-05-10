'use strict';

const express = require('express');
const messageController = require('../controllers/messageController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { submitContactFormRules } = require('../validators/messageValidator');
const ROLES = require('../constants/roles');

const router = express.Router();

// ── Public: anyone can submit a contact form ──────────────────────────────────
router.post('/', submitContactFormRules, validate, messageController.submitContactForm);

// ── Admin only: manage messages ───────────────────────────────────────────────
router.use(protect, restrictTo(ROLES.ADMIN));

// Unread count — used by the admin sidebar badge
router.get('/unread-count', messageController.getUnreadCount);

router.get('/', messageController.getAllMessages);

router.route('/:id')
  .get(messageController.getMessage)
  .delete(messageController.deleteMessage);

router.patch('/:id/read',    messageController.markAsRead);
router.patch('/:id/archive', messageController.archiveMessage);

module.exports = router;
