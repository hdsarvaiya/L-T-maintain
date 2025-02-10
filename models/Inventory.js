const mongoose = require("mongoose");

const InventorySchema = new mongoose.Schema({
    Item_id:Number,
  name: String,
  location: String,
  lastMaintenance: Date,
  maintenanceInterval: Number, // In months
  responsiblePerson: String,
  email: String,
});

module.exports = mongoose.model("Inventory", InventorySchema);
