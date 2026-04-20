import Prescription from "../models/Prescription.js";
import ROLES from "../constants/roles.js";
import Patient from "../models/Patient.js";

// GET prescriptions for doctor or patient
const getPrescriptions = async (req, res) => {
  try {
    let prescriptions;

    if (req.user.role === ROLES.PATIENT) {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient) return res.status(404).json({ message: "Patient not found" });

      prescriptions = await Prescription.find({ patientId: patient._id }).populate("doctorId", "name").sort({createdAt: -1});
    } else {
      prescriptions = await Prescription.find({ doctorId: req.user._id }).populate("patientId", "name").sort({createdAt: -1});
    }

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE prescription (by doctor)
const createPrescription = async (req, res) => {
  const { patientId, imageUrl, extractedText, diagnosis, medications, dosage, notes } = req.body;

  if (!patientId || !imageUrl || !extractedText) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  try {
    const prescription = await Prescription.create({
      patientId,
      imageUrl,
      extractedText,
      diagnosis,
      medications,
      dosage,
      createdAt: new Date(),
      lastVisit: new Date(),
      doctorId: req.user._id,
    });

    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ message: "Failed to create prescription" });
  }
};

const getMyPrescriptions = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const prescriptions = await Prescription.find({ patientId: patient._id })
      .populate("doctorId", "name")
      .sort({ createdAt: -1 });

    const formatted = prescriptions.map(p => ({
      id: p._id,
      doctor: p.doctorId?.name || "Dr. Unknown",
      medications: p.medications || [],
      diagnosis: p.diagnosis || "",
      notes: p.notes || "",
      createdAt: p.createdAt,
      taken: p.taken ?? false,
      patientId: p.patientId,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id).populate("patientId", "name");

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch prescription" });
  }
};

const updatePrescription = async (req, res) => {
  const { diagnosis, medications, notes } = req.body;

  try {
    const prescription = await Prescription.findByIdAndUpdate(req.params.id);
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    prescription.diagnosis = diagnosis || prescription.diagnosis;
    prescription.medications = medications || prescription.medications;
    prescription.notes = notes || prescription.notes;

    const updated = await prescription.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update prescription" });
  }
};


// DELETE /api/prescriptions/:id
const deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPrescription = await Prescription.findByIdAndDelete(id);
    if (!deletedPrescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }
    res.status(200).json({ message: "Prescription deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const uploadPrescriptionImage = async (req, res) => {
  try {
    const imageUrl = req.file.path;
    res.status(200).json({ imageUrl });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error });
  }
};

export {
  getPrescriptions,
  createPrescription,
  getMyPrescriptions,
  deletePrescription,
  getPrescriptionById,
  updatePrescription,
  uploadPrescriptionImage,
};
