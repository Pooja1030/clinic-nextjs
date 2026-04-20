import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: Date,
    time: { type: String, required: true },
    reason: { type: String, required: true },
    status: { type: String, default: "pending" },
});

export default mongoose.model("Appointment", appointmentSchema);