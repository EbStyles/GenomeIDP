const express = require('express');
const router = express.Router();
const { matchUser,matchUser2 } = require('../controllers/matchController');
const requireAuth = require('../middleware/requireauth');

// Require authentication for match route
router.use(requireAuth);

// GET /api/match/
router.get('/', matchUser);

module.exports = router;