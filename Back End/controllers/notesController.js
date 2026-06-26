const Notes = require("../models/notes");

const getNotes = async (req, res) => {
  const user_id = req.user._id;

  try {
    let notes = await Notes.findOne({ user_id });

    if (!notes) {
      notes = await Notes.create({
        user_id,
        content: "",
      });
    }

    res.status(200).json(notes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateNotes = async (req, res) => {
  const user_id = req.user._id;
  const { content } = req.body;

  try {
    const notes = await Notes.findOneAndUpdate(
      { user_id },
      { content: content ?? "" },
      { new: true, upsert: true }
    );

    res.status(200).json(notes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getNotes, updateNotes };