const express = require("express");
const { getNotes, updateNotes } = require("../controllers/notesController");
const requireAuth = require("../middleware/requireauth");

const router = express.Router();

router.use(requireAuth);

router.get("/", getNotes);
router.patch("/", updateNotes);

module.exports = router;