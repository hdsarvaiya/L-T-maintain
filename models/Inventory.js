// const mongoose = require("mongoose");

// const InventorySchema = new mongoose.Schema({
//     Item_id:Number,
//   name: String,
//   location: String,
//   lastMaintenance: Date,
//   maintenanceInterval: Number, // In months
//   responsiblePerson: String,
//   email: String,
// });

// module.exports = mongoose.model("Inventory", InventorySchema);


// const mongoose = require("mongoose");

// const InventorySchema = new mongoose.Schema({
//   Item_id: { type: Number, required: true, unique: true },
//   name: { type: String, required: true },
//   location: { type: String, required: true },
//   lastMaintenance: { type: Date },
//   maintenanceInterval: { type: Number }, // In months
//   responsiblePerson: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to User model
//   email: { type: String },
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Tracks who added it
// }, { timestamps: true });

// module.exports = mongoose.model("Inventory", InventorySchema);

// const mongoose = require("mongoose");

// const InventorySchema = new mongoose.Schema(
//   {
//     Item_id: { type: Number, required: true, unique: true },
//     name: { type: String, required: true },
//     location: { type: String, required: true },
//     lastMaintenance: { type: Date },
//     maintenanceInterval: { type: Number }, // In months
//     responsiblePerson: { type: String, required: true }, // Update this line to String
//     email: { type: String },
//     createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Tracks who added it
//     status: { type: String, enum: ["Completed", "Not Completed"], default: "Not Completed" }, // ✅ Added status field
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Inventory", InventorySchema);


const mongoose = require("mongoose");

const InventorySchema = new mongoose.Schema(
  {
    Item_id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    lastMaintenance: { type: Date },
    nextMaintenance: { type: Date }, // ✅ Added next maintenance date
    maintenanceInterval: { type: Number }, // In months
    responsiblePerson: { type: String, required: true },
    email: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
status: {
  type: String,
  enum: ["Pending", "Completed", "In Progress", "Overdue" , "Not Completed"] , default: "Not Completed" , // Added "Pending"
  required: true,
},
    maintenanceHistory: [
      {
        date: { type: Date, default: Date.now },
        status: { type: String, required: true }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", InventorySchema);
