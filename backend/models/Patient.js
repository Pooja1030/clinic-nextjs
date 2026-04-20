import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
  name: String,
  dosage: String,
  frequency: String,
});

const reportSchema = new mongoose.Schema({
  name: String,
  url: String,
});

const appointmentSchema = new mongoose.Schema({
  date: Date,
  doctor: String,
  purpose: String,
});

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  name: String,
  age: Number,
  disease: String,
  email: String,
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
  },
  lastVisit: { type: Date },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  avatar: { type: String }, // store URL or file path

  // New fields
  vitals: {
    bloodPressure: String,
    heartRate: String,
    temperature: String,
    weight: String,
  },

  medicalHistory: {
    allergies: [String],
    surgeries: [String],
    chronicConditions: [String],
  },

  prescriptions: {
    type: [prescriptionSchema],
    default: [],
  },
  reports: {
    type: [reportSchema],
    default: [],
  },
  appointments: {
    upcoming: {
      type: [appointmentSchema],
      default: [],
    },
    past: {
      type: [appointmentSchema],
      default: [],
    },
  },

  reports: [reportSchema],
});

export default mongoose.models.Patient ||
  mongoose.model("Patient", patientSchema);
