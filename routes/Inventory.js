// const express = require("express");
// const router = express.Router();
// const Inventory = require("../models/Inventory");
// const nodemailer = require("nodemailer");
// const QRCode = require("qrcode");

// // Add Inventory


// const transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com',
//     port: 465,
//     secure: true, // true for 465, false for other ports
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });
  

//   router.get("/generate-qr/:id", async (req, res) => {
//     try {
//         const item = await Inventory.findById(req.params.id);
//         if (!item) {
//             return res.status(404).json({ error: "Inventory item not found" });
//         }

//         const qrData = JSON.stringify({
//             Item_id: item.Item_id,
//             name: item.name,
//             location: item.location,
//             responsiblePerson: item.responsiblePerson,
//         });

//         const qrCodeURL = await QRCode.toDataURL(qrData);
//         res.json({ qrCodeURL });

//     } catch (error) {
//         res.status(500).json({ error: "Failed to generate QR code" });
//     }
// });

// router.post("/add", async (req, res) => {
//   try {
//     const { name, Item_id , location, lastMaintenance, maintenanceInterval, responsiblePerson, email } = req.body;

//     const inventoryItem = new Inventory({
//       Item_id,
//       name,
//       location,
//       lastMaintenance,
//       maintenanceInterval,
//       responsiblePerson,
//       email,
//     });

//     await inventoryItem.save();
//     res.status(201).json({ message: "Inventory added successfully" });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to add inventory" });
//   }
// });

// // Get Inventory List
// router.get("/", async (req, res) => {
//   try {
//     const inventoryList = await Inventory.find();
//     res.json(inventoryList);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch inventory" });
//   }
// });

// router.put("/:id", async (req, res) => {
//     try {
//       const { maintenanceInterval, email } = req.body;
//       const updatedItem = await Inventory.findByIdAndUpdate(
//         req.params.id,
//         { maintenanceInterval, email },
//         { new: true }
//       );
//       res.status(200).json(updatedItem);
//     } catch (error) {
//       res.status(500).json({ error: "Failed to update inventory" });
//     }
//   });
  
// // Send Immediate Email for Maintenance Reminder
// // Send Immediate Email for Maintenance Reminder
// router.post("/send-email/:id", async (req, res) => {
//     try {
//       const item = await Inventory.findById(req.params.id);
  
//       if (!item) {
//         return res.status(404).json({ error: "Inventory item not found" });
//       }
  
//       const nextMaintenanceDate = new Date(item.lastMaintenance);
//       nextMaintenanceDate.setMonth(nextMaintenanceDate.getMonth() + item.maintenanceInterval);
  
//       // Create email content
//       const emailContent = {
//         from: process.env.EMAIL_USER, // The email from your .env file
//         to: item.email,
//         subject: `Maintenance Reminder: ${item.name}`,
//         text: `Hello ${item.responsiblePerson},\n\nThe ${item.name} (${item.location}) is due for maintenance on ${nextMaintenanceDate.toDateString()}.\n\nPlease ensure the maintenance is completed.\n\nBest Regards,\nMaintenance Team`
//       };
  
//       // Send the email
//       await transporter.sendMail(emailContent);
  
//       console.log(`Immediate email sent for ${item.name}`);
//       res.status(200).json({ message: "Maintenance reminder email sent successfully!" });
//     } catch (error) {
//       console.error("Error sending immediate email:", error.message);
//       console.error(error.stack);  // Log the error stack for more detailed debugging
//       res.status(500).json({ error: "Failed to send email", details: error.message });
//     }
//   });
  
// module.exports = router;


const express = require("express");
const router = express.Router();
const Inventory = require("../models/Inventory");
const nodemailer = require("nodemailer");
const QRCode = require("qrcode");
const authMiddleware = require("../middleware/authMiddleware");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate QR Code
router.get("/generate-qr/:id", async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Inventory item not found" });

    const qrData = JSON.stringify({
      Item_id: item.Item_id,
      name: item.name,
      location: item.location,
      responsiblePerson: item.responsiblePerson,
    });

    const qrCodeURL = await QRCode.toDataURL(qrData);
    res.json({ qrCodeURL });

  } catch (error) {
    res.status(500).json({ error: "Failed to generate QR code" });
  }
});

// Add Inventory (Admin Only)
router.post("/add", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const { name, Item_id, location, lastMaintenance, maintenanceInterval, responsiblePerson, email } = req.body;

    const inventoryItem = new Inventory({
      Item_id,
      name,
      location,
      lastMaintenance,
      maintenanceInterval,
      responsiblePerson,
      email,
    });

    await inventoryItem.save();
    res.status(201).json({ message: "Inventory added successfully" });
  } catch (error) {
    console.error("Error adding inventory:", error); // Add a log to see the actual error
    res.status(500).json({ error: "Failed to add inventory" });
  }
});


// Get Inventory List (Users only see their assigned items)
router.get("/", authMiddleware, async (req, res) => {
  try {
    let inventoryList;
    if (req.user.role === "admin") {
      inventoryList = await Inventory.find(); // Admin sees all
    } else {
      inventoryList = await Inventory.find({ email: req.user.email }); // User sees only their assigned items
    }
    res.json(inventoryList);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

// Update Inventory (Admin Only)
// Update Inventory (Admin Only)
router.put("/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const { maintenanceInterval, email } = req.body;

    // Input validation
    if (maintenanceInterval <= 0) {
      return res.status(400).json({ error: "Invalid maintenance interval" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check if the item exists
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    // Update the item
    const updatedItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      { maintenanceInterval, email },
      { new: true }
    );

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error("Error updating inventory:", error);
    res.status(500).json({ error: "Failed to update inventory" });
  }
});


// Send Maintenance Email
// router.post("/send-email/:id", async (req, res) => {
//   try {
//     const item = await Inventory.findById(req.params.id);
//     if (!item) return res.status(404).json({ error: "Inventory item not found" });

//     const nextMaintenanceDate = new Date(item.lastMaintenance);
//     nextMaintenanceDate.setMonth(nextMaintenanceDate.getMonth() + item.maintenanceInterval);

//     const emailContent = {
//       from: process.env.EMAIL_USER,
//       to: item.email,
//       subject: `Maintenance Reminder: ${item.name}`,
//       text: `Hello ${item.responsiblePerson},\n\nThe ${item.name} (${item.location}) is due for maintenance on ${nextMaintenanceDate.toDateString()}.\n\nBest Regards,\nMaintenance Team`,
//     };

//     await transporter.sendMail(emailContent);
//     res.status(200).json({ message: "Maintenance reminder email sent successfully!" });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to send email" });
//   }
// });

router.post('/send-email/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Inventory item not found" });

    const nextMaintenanceDate = new Date(item.lastMaintenance);
    nextMaintenanceDate.setMonth(nextMaintenanceDate.getMonth() + item.maintenanceInterval);

    const emailContent = {
      from: process.env.EMAIL_USER,
      to: item.email,
      subject: `Maintenance Reminder: ${item.name}`,
      text: `Hello ${item.responsiblePerson},\n\nThe ${item.name} (${item.location}) is due for maintenance on ${nextMaintenanceDate.toDateString()}.\n\nBest Regards,\nMaintenance Team`,
    };

    await transporter.sendMail(emailContent);
    res.status(200).json({ message: "Maintenance reminder email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});


module.exports = router;
