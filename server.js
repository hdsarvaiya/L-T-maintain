// require("dotenv").config();
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const nodemailer = require("nodemailer");
// const cron = require("node-cron");
// require("./cronJob");  // Ensure cron job logic is here or imported

// const app = express();

// // Middleware
// app.use(express.json());
// app.use(cors());


// // Routes
// const authRoutes = require("./routes/auth");
// app.use("/api/auth", authRoutes);

// const inventoryRoutes = require("./routes/Inventory");
// app.use("/api/inventory", inventoryRoutes);

// // Connect to MongoDB
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB Connected"))
//   .catch((err) => {
//     console.error("MongoDB connection failed", err);
//     process.exit(1); // Exit on failure
//   });

// // Default Route
// app.get("/", (req, res) => {
//   res.send("L&T Maintenance Portal API is Running...");
// });

// app.get("/api/items/:id", async (req, res) => {
//   try {
//       const item = await ItemModel.findById(req.params.id);
//       if (!item) return res.status(404).json({ message: "Item not found" });
//       res.json(item);
//   } catch (error) {
//       res.status(500).json({ error: "Server error" });
//   }
// });


// // Nodemailer Transporter
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // Cron Job for Maintenance Reminders
// cron.schedule("0 0 * * *", async () => {
//   try {
//     const inventoryList = await Inventory.find();
//     const today = new Date();

//     inventoryList.forEach(async (item) => {
//       const nextMaintenanceDate = new Date(item.lastMaintenance);
//       nextMaintenanceDate.setMonth(nextMaintenanceDate.getMonth() + item.maintenanceInterval);

//       const daysLeft = Math.ceil((nextMaintenanceDate - today) / (1000 * 60 * 60 * 24));

//       if (daysLeft === 2) { // Send reminder 2 days before
//         await transporter.sendMail({
//           from: process.env.EMAIL_USER,
//           to: item.email,
//           subject: `Maintenance Reminder: ${item.name}`,
//           text: `Hello ${item.responsiblePerson},\n\nThe ${item.name} (${item.type}) is due for maintenance on ${nextMaintenanceDate.toDateString()}.\n\nPlease ensure the maintenance is completed.\n\nBest Regards,\nMaintenance Team`,
//         });

//         console.log(`Reminder email sent for ${item.name}`);
//       }
//     });
//   } catch (error) {
//     console.error("Error sending maintenance reminders:", error);
//   }
// });

// // Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const authMiddleware = require("./middleware/authMiddleware")
const cron = require("node-cron");
const Inventory = require("./models/Inventory"); // ✅ FIXED: Import Inventory Model

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth",  authRoutes);

const inventoryRoutes = require("./routes/Inventory");
app.use("/api/inventory", authMiddleware, inventoryRoutes);

const taskRoutes = require("./routes/taskRouters"); // Import the new task routes
app.use("/api", authMiddleware, taskRoutes); // Register routes under `/api`

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection failed", err);
    process.exit(1); // Exit on failure
  });

// Default Route
app.get("/", (req, res) => {
  res.send("✅ L&T Maintenance Portal API is Running...");
});

// Get Inventory Item by ID (Fixed Model Reference)
app.get("/api/items/:id", async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id); // ✅ FIXED: Replaced `ItemModel` with `Inventory`
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Cron Job for Maintenance Reminders
cron.schedule("0 0 * * *", async () => {
  try {
    const inventoryList = await Inventory.find();
    const today = new Date();

    for (const item of inventoryList) {
      const nextMaintenanceDate = new Date(item.lastMaintenance);
      nextMaintenanceDate.setMonth(nextMaintenanceDate.getMonth() + item.maintenanceInterval);

      const daysLeft = Math.ceil((nextMaintenanceDate - today) / (1000 * 60 * 60 * 24));

      if (daysLeft === 2) { // Send reminder 2 days before
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: item.email,
          subject: `Maintenance Reminder: ${item.name}`,
          text: `Hello ${item.responsiblePerson},\n\nThe ${item.name} (${item.type}) is due for maintenance on ${nextMaintenanceDate.toDateString()}.\n\nPlease ensure the maintenance is completed.\n\nBest Regards,\nMaintenance Team`,
        });

        console.log(`📩 Reminder email sent for ${item.name}`);
      }
    }
  } catch (error) {
    console.error("❌ Error sending maintenance reminders:", error);
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
