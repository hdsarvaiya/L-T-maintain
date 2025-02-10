const express = require("express");
const router = express.Router();
const Inventory = require("../models/Inventory");
const nodemailer = require("nodemailer");

// Add Inventory


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  


router.post("/add", async (req, res) => {
  try {
    const { name, Item_id , location, lastMaintenance, maintenanceInterval, responsiblePerson, email } = req.body;

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
    res.status(500).json({ error: "Failed to add inventory" });
  }
});

// Get Inventory List
router.get("/", async (req, res) => {
  try {
    const inventoryList = await Inventory.find();
    res.json(inventoryList);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

router.put("/:id", async (req, res) => {
    try {
      const { maintenanceInterval, email } = req.body;
      const updatedItem = await Inventory.findByIdAndUpdate(
        req.params.id,
        { maintenanceInterval, email },
        { new: true }
      );
      res.status(200).json(updatedItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to update inventory" });
    }
  });
  
// Send Immediate Email for Maintenance Reminder
// Send Immediate Email for Maintenance Reminder
router.post("/send-email/:id", async (req, res) => {
    try {
      const item = await Inventory.findById(req.params.id);
  
      if (!item) {
        return res.status(404).json({ error: "Inventory item not found" });
      }
  
      const nextMaintenanceDate = new Date(item.lastMaintenance);
      nextMaintenanceDate.setMonth(nextMaintenanceDate.getMonth() + item.maintenanceInterval);
  
      // Create email content
      const emailContent = {
        from: process.env.EMAIL_USER, // The email from your .env file
        to: item.email,
        subject: `Maintenance Reminder: ${item.name}`,
        text: `Hello ${item.responsiblePerson},\n\nThe ${item.name} (${item.location}) is due for maintenance on ${nextMaintenanceDate.toDateString()}.\n\nPlease ensure the maintenance is completed.\n\nBest Regards,\nMaintenance Team`
      };
  
      // Send the email
      await transporter.sendMail(emailContent);
  
      console.log(`Immediate email sent for ${item.name}`);
      res.status(200).json({ message: "Maintenance reminder email sent successfully!" });
    } catch (error) {
      console.error("Error sending immediate email:", error.message);
      console.error(error.stack);  // Log the error stack for more detailed debugging
      res.status(500).json({ error: "Failed to send email", details: error.message });
    }
  });
  
module.exports = router;
