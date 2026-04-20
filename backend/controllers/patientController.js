import Patient from "../models/Patient.js";
import ROLES from "../constants/roles.js";
import mongoose from "mongoose";

// GET all patients for a doctor
const getAllPatients = async (req, res) => {
  try {
    if (req.user.role !== ROLES.DOCTOR) {
      return res.status(403).json({ message: "Access denied" });
    }

    const patients = await Patient.find({ doctorId: req.user._id });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE a patient (by doctor)
const createPatient = async (req, res) => {
  const {
    name,
    email,
    age,
    disease,
    userId,
    vitals,
    medicalHistory,
    prescriptions,
    reports,
    appointments,
    avatar,
  } = req.body;

  try {
    const patient = await Patient.create({
      name,
      email,
      age,
      disease,
      userId, // required for login match
      doctorId: req.user._id,
      vitals,
      medicalHistory,
      prescriptions,
      reports,
      appointments,
      avatar,
    });
    res.status(201).json(patient);
  } catch (err) {
    console.error("Create Patient Error:", err);
    res.status(500).json({ message: "Failed to create patient" });
  }
};

// GET profile for logged-in patient
const getPatientProfile = async (req, res) => {
  try {
    if (req.user.role !== ROLES.PATIENT) {
      return res.status(403).json({ message: "Access denied" });
    }

    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch patient info" });
  }
};

// GET patient by ID (for doctor/admin)
const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const {
      name,
      email,
      age,
      gender,
      disease,
      lastVisit,
      vitals = {},
      medicalHistory = {},
      prescriptions,
      reports,
      appointments,
      avatar,
    } = req.body;

    // Update flat fields
    if (name) patient.name = name;
    if (email) patient.email = email;
    if (age !== undefined) patient.age = age;
    if (gender) patient.gender = gender;
    if (disease) patient.disease = disease;
    if (lastVisit) patient.lastVisit = lastVisit;
    if (prescriptions) patient.prescriptions = prescriptions;
    if (reports) patient.reports = reports;
    if (appointments) patient.appointments = appointments;
    if (avatar) patient.avatar = avatar;

    // Update nested objects safely
    patient.vitals = { ...patient.vitals, ...vitals };
    patient.medicalHistory = { ...patient.medicalHistory, ...medicalHistory };

    const updatedPatient = await patient.save();
    res.status(200).json(updatedPatient);
  } catch (error) {
    console.error("Update Patient Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


// DELETE patient by ID
const deletePatient = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid patient ID" });
    }

    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: "Patient removed" });
  } catch (err) {
    console.error("Delete Patient Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export {
  getAllPatients,
  createPatient,
  getPatientProfile,
  getPatientById,
  updatePatient,
  deletePatient,
};
