const nodemailer = require("nodemailer");
const Inventory = require("../models/Inventory");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMaintenanceReminder = async () => {
  const today = new Date();
  today.setDate(today.getDate() + 2); // 2 days prior

  const items = await Inventory.find();
  items.forEach(async (item) => {
    const nextMaintenance = new Date(item.lastMaintenance);
    nextMaintenance.setMonth(nextMaintenance.getMonth() + item.maintenanceInterval);

    if (nextMaintenance.toDateString() === today.toDateString()) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: item.email,
        subject: `Maintenance Reminder: ${item.name}`,
        text: `Reminder: The ${item.name} requires maintenance. Please schedule it soon.`,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) console.log("Error sending email:", err);
        else console.log("Email sent:", info.response);
      });
    }
  });
};

module.exports = sendMaintenanceReminder;
