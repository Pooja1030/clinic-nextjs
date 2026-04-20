import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageUrl: String,
    extractedText: String,
    diagnosis: String,
    medications: [
      {
        name: String,
        dosage: String,
        duration: String,
      },
    ],
    dosage: String,
    notes: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Prescription", prescriptionSchema);
