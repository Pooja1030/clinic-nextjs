import Reminder from "../models/Reminder.js";
import ROLES from "../constants/roles.js";
import Patient from "../models/Patient.js";
import MessageLog from "../models/MessageLog.js";

// GET reminders (doctor sees all created by them, patient sees their own)
const getReminders = async (req, res) => {
  try {
    let reminders;

    if (req.user.role === ROLES.PATIENT) {
      // Find the patient document linked to this user
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient) return res.status(404).json({ message: "Patient not found" });

      // Fetch only reminders for this patient, sorted by upcoming date
      reminders = await Reminder.find({ patientId: patient._id }).sort({ remindOn: 1 });

    } else {
      // Doctor or admin sees reminders they created, populate patient name
      reminders = await Reminder.find({ createdBy: req.user._id })
        .populate("patientId", "name")
        .sort({ remindOn: 1 });
    }

    res.json(reminders);

  } catch (err) {
    console.error("Error fetching reminders:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE reminder (by doctor)
const createReminder = async (req, res) => {
  const { patientId, message, remindOn } = req.body;

  try {
    const reminder = await Reminder.create({
      createdBy: req.user._id,
      patientId,
      message,
      remindOn,
    });

    res.status(201).json(reminder);
  } catch (err) {
    console.error("Error creating reminder:", err);
    res.status(500).json({ message: "Failed to create reminder" });
  }
};

// GET reminder by ID
const getReminderById = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id).populate("patientId", "name");
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    res.json(reminder);
  } catch (err) {
    console.error("Error fetching reminder by ID:", err);
    res.status(500).json({ message: "Failed to fetch reminder" });
  }
};

// GET reminders for logged-in patient
// GET reminders for logged-in patient
const getMyReminders = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    // 1. Fetch regular reminders
    const reminders = await Reminder.find({ patientId: patient._id }).sort({ remindOn: 1 });

    // 2. Fetch campaign messages for this patient
    const campaignLogs = await MessageLog.find({ patientId: patient._id }).sort({ sentAt: 1 });

    // 3. Map both to a common format
    const formattedReminders = reminders.map((r) => ({
      _id: r._id,
      message: r.message,
      remindOn: r.remindOn,
      status: r.status || "PENDING",
      type: r.type || "checkup",
      doctorName: r.createdByName || "System",
    }));

    const formattedCampaigns = campaignLogs.map((c) => ({
      _id: c._id,
      message: c.content,
      remindOn: c.sentAt,  // treat sentAt as the date
      status: c.status || "SENT",
      type: "campaign",
      doctorName: "Doctor",
    }));

    // 4. Combine and sort by date descending
    const combined = [...formattedReminders, ...formattedCampaigns].sort(
      (a, b) => new Date(b.remindOn) - new Date(a.remindOn)
    );

    res.json(combined);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE reminder
const updateReminder = async (req, res) => {
  const { patientId, message, remindOn } = req.body;
  try {
    const reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      { patientId, message, remindOn },
      { new: true }
    );
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    res.json(reminder);
  } catch (err) {
    console.error("Error updating reminder:", err);
    res.status(500).json({ message: "Failed to update reminder" });
  }
};

// DELETE reminder
const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndDelete(req.params.id);
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    res.json({ message: "Reminder deleted successfully" });
  } catch (err) {
    console.error("Error deleting reminder:", err);
    res.status(500).json({ message: "Failed to delete reminder" });
  }
};

export {
  getReminders,
  createReminder,
  getReminderById,
  getMyReminders,
  updateReminder,
  deleteReminder,
};
