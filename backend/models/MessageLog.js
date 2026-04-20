import mongoose from "mongoose";

const messageLogSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  content: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["SENT", "FAILED"],
    default: "SENT",
  },
}, {
  timestamps: true,
});

export default mongoose.model("MessageLog", messageLogSchema);
