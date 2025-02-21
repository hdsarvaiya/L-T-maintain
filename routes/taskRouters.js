// const express = require("express");
// const Inventory = require("../models/Inventory");

// const router = express.Router();

// // GET maintenance tasks for a user
// router.get("/user-tasks", async (req, res) => {
//   try {
//     const email = req.query.email;
//     if (!email) return res.status(400).json({ msg: "Email is required" });

//     console.log("Fetching tasks for email:", email); // Debug log

//     // Query the inventory collection based on email
//     const tasks = await Inventory.find({ email });

//     if (!tasks.length) {
//       console.log("No tasks found for:", email); // Log if no results found
//       return res.status(404).json({ msg: "No maintenance tasks found" });
//     }

//     console.log("Fetched tasks:", tasks); // Debugging log
//     res.json(tasks);
//   } catch (err) {
//     console.error("Error fetching tasks:", err); // Log the actual error
//     res.status(500).json({ msg: "Server error", error: err.message });
//   }
// });

// router.patch("/api/update-maintenance", async (req, res) => {
//     try {
//       const { taskId, status, lastMaintenance } = req.body;
  
//       // Find the task and update its last maintenance date and status
//       const updatedTask = await Task.findByIdAndUpdate(
//             taskId,
//         {
//           lastMaintenance,
//           status,
//         },
//         { new: true }
//       );
  
//       if (!updatedTask) {
//         return res.status(404).json({ message: "Task not found" });
//       }
  
//       // Send the data to the admin (Example: Save to DB or Notify via Email)
//       console.log("Admin Notification: Task Update", updatedTask);
  
//       res.json(updatedTask);
//     } catch (error) {
//       console.error("Error updating maintenance:", error);
//       res.status(500).json({ message: "Server error" });
//     }
//   });

// module.exports = router;


const express = require("express");
const Inventory = require("../models/Inventory"); // ✅ Use the correct model

const router = express.Router();

// GET maintenance tasks for a user
router.get("/user-tasks", async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ msg: "Email is required" });

    console.log("Fetching tasks for email:", email); // Debug log

    const tasks = await Inventory.find({ email });

    if (!tasks.length) {
      console.log("No tasks found for:", email);
      return res.status(404).json({ msg: "No maintenance tasks found" });
    }

    
    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ✅ PATCH: Update Maintenance Status
// router.patch("/update-maintenance", async (req, res) => {
//   try {
//     const { taskId, status, lastMaintenance } = req.body;

//     if (!taskId) {
//       return res.status(400).json({ message: "Task ID is required" });
//     }

//     const updatedTask = await Inventory.findByIdAndUpdate(
//       taskId,
//       { lastMaintenance, status },
//       { new: true }
//     );

//     if (!updatedTask) {
//       return res.status(404).json({ message: "Task not found" });
//     }

//     console.log("✅ Admin Notification: Task Update", updatedTask);
//     res.json(updatedTask);
//   } catch (error) {
//     console.error("❌ Error updating maintenance:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// router.patch("/update-maintenance", async (req, res) => {
//     try {
//       const { taskId, status, lastMaintenance } = req.body;
  
//       if (!taskId) {
//         return res.status(400).json({ message: "Task ID is required" });
//       }
  
//       const updatedTask = await Inventory.findByIdAndUpdate(
//         taskId,
//         { lastMaintenance, status },
//         { new: true }
//       );
  
//       if (!updatedTask) {
//         return res.status(404).json({ message: "Task not found" });
//       }
  
//       console.log("✅ Task updated:", updatedTask);
  
//       // Notify admin via WebSocket (optional)
//       // io.emit("taskUpdated", updatedTask);
  
//       res.json(updatedTask);
//     } catch (error) {
//       console.error("❌ Error updating maintenance:", error);
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  

router.patch("/update-maintenance", async (req, res) => {
  try {
    const { taskId, status, lastMaintenance } = req.body;

    if (!taskId) {
      return res.status(400).json({ message: "Task ID is required" });
    }

    // Find the task to update
    const task = await Inventory.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update the current task status and lastMaintenance
    task.status = status;
    task.lastMaintenance = lastMaintenance;
    await task.save();
    console.log("✅ Task updated:", task);

    // If status is 'Completed', create a new task
    if (status === "Completed") {
      const nextMaintenanceDate = new Date(lastMaintenance);
      nextMaintenanceDate.setMonth(
        nextMaintenanceDate.getMonth() + task.maintenanceInterval
      );

      // Create a new task with the same details but a new due date
      const newTask = new Inventory({
        name: task.name,
        Item_id: task.Item_id,
        location: task.location,
        lastMaintenance: nextMaintenanceDate,
        maintenanceInterval: task.maintenanceInterval,
        responsiblePerson: task.responsiblePerson,
        email: task.email,
        status: "Pending", // New task starts as 'Pending'
      });

      await newTask.save();
      console.log("✅ New Task Created:");
    }

    res.json(task);
  } catch (error) {
    console.error("❌ Error updating maintenance:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
