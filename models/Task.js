const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nextMaintenance: { type: Date, required: true },
  userEmail: { type: String, required: true }, // Store user email
});

module.exports = mongoose.model("Task", TaskSchema);
