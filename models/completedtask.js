// models/CompletedTask.js
const mongoose = require("mongoose");

const completedTaskSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  dueDate: { type: Date, required: true },
  completedDate: { type: Date, required: true },
  userEmail: { type: String, required: true },
});

module.exports = mongoose.model("CompletedTask", completedTaskSchema);
