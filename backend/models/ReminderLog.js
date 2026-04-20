import mongoose from "mongoose";
// import { type } from "os";

const reminderLogSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
  },
  phone: String,
  message: String,
  status: {
    type: String,
    enum: ["PENDING", "SENT", "FAILED"],
    default: "PENDING",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ["checkup", "medication", "follow-up"],
    default: "checkup",
  },
});

export default mongoose.model("ReminderLog", reminderLogSchema);
