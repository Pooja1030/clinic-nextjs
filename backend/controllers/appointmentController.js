import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";

/**
 * @desc    Get appointments for the logged-in doctor
 * @route   GET /api/appointments
 * @access  Private (Doctor)
 */
const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      doctorId: req.user._id,
    }).populate("patientId", "name email");

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Create a new appointment
 * @route   POST /api/appointments
 * @access  Private (Doctor or Patient)
 */
const createAppointment = async (req, res) => {
  try {
    const { date, time, reason, status = "pending" } = req.body;

    if (!date || !time) {
      return res.status(400).json({ message: "Date and time are required" });
    }

    let doctorId;
    let patientId;

    if (req.user.role === "doctor") {
      doctorId = req.user._id; // automatically set logged-in doctor
      if (!req.body.patientId) {
        return res.status(400).json({ message: "Patient ID is required" });
      }
      patientId = req.body.patientId;
    } 
    else if (req.user.role === "patient") {
      // doctorId must come from request body
      if (!req.body.doctorId) {
        return res.status(400).json({ message: "Doctor ID is required" });
      }
      doctorId = req.body.doctorId;

      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient) {
        return res.status(404).json({ message: "Patient profile not found" });
      }
      patientId = patient._id;
    } 
    else {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    const appointment = await Appointment.create({
      doctorId,
      patientId,
      date,
      time,
      reason,
      status,
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ message: "Failed to create appointment" });
  }
};

/**
 * @desc    Get appointments for the logged-in patient
 * @route   GET /api/appointments/my
 * @access  Private (Patient)
 */
const getMyAppointments = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return res.status(404).json({ message: "Patient profile not found" });

    const appointments = await Appointment.find({ patientId: patient._id })
      .populate("doctorId", "name")
      .sort({ date: 1 });

    const formatted = appointments.map(a => ({
      id: a._id,
      doctor: a.doctorId?.name || "Doctor",
      date: a.date,
      status: a.status,
      patientId: a.patientId,
      title: a.title || "Appointment",
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * @desc    Get an appointment by ID
 * @route   GET /api/appointments/:id
 * @access  Private (Doctor)
 */
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patientId", "name email");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view this appointment" });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Delete an appointment
 * @route   DELETE /api/appointments/:id
 * @access  Private (Doctor)
 */
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this appointment" });
    }

    await appointment.deleteOne();
    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Update an appointment
 * @route   PUT /api/appointments/:id
 * @access  Private (Doctor)
 */
const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Ensure only the doctor who owns the appointment can update it
    if (appointment.doctorId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this appointment" });
    }

    // Update appointment fields
    Object.assign(appointment, req.body);
    const updatedAppointment = await appointment.save();

    // If marked completed, safely update patient's lastVisit
    if (req.body.status === "completed") {
      const patient = await Patient.findById(appointment.patientId);
      if (patient) {
        const newVisitDate = new Date(appointment.date);
        const lastVisitDate = new Date(patient.lastVisit || 0);

        if (newVisitDate > lastVisitDate) {
          patient.lastVisit = newVisitDate;
          await patient.save();
        }
      }
    }

    res.status(200).json(updatedAppointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export {
  getAppointments,
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  deleteAppointment,
  updateAppointment,
};
