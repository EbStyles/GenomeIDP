const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const notesSchema = new Schema(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
    },
    content: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notes", notesSchema);