const cron = require("node-cron");
const sendMaintenanceReminder = require("./utils/emailService");

// Schedule job to run every day at 8 AM
cron.schedule("0 8 * * *", () => {
  console.log("Running maintenance reminder job...");
  sendMaintenanceReminder();
});
