import express from "express";
import { protect, patientOnly } from "../middleware/authMiddleware.js";
import {
  getReminders,
  createReminder,
  getReminderById,
  updateReminder,
  deleteReminder,
} from "../controllers/reminderController.js";

const router = express.Router();

// Patient profile route to get only their own reminders
router.get("/profile", protect, patientOnly, getReminders);

// Doctor/admin routes
router.route("/")
  .get(protect, getReminders)
  .post(protect, createReminder);

router.route("/:id")
  .get(protect, getReminderById)
  .put(protect, updateReminder)
  .delete(protect, deleteReminder);

export default router;
