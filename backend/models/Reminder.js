import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
    message: String,
    remindOn: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    status: {
        type: String,
        enum: ["PENDING", "SENT", "FAILED"],
        default: "PENDING",
    },
}, {
    timestamps: true
});


export default mongoose.model("Reminder", reminderSchema);