import MessageLog from "../models/MessageLog.js";
import Patient from "../models/Patient.js";
import {sendWhatsAppMessage} from "../utils/sendWhatsAppMessage.js"; 

export const sendCampaign = async (req, res) => {
  const { patientIds, message } = req.body;

  try {
    const patients = await Patient.find({ _id: { $in: patientIds } });

    const results = await Promise.allSettled(
      patients.map(async (patient) => {
        try {
          const status = await sendWhatsAppMessage(patient.contact, message);
          await MessageLog.create({
            patientId: patient._id,
            content: message,
            status: status === "SENT" ? "SENT" : "FAILED",
          });
          return { patientId: patient._id, status };
        } catch {
          await MessageLog.create({
            patientId: patient._id,
            content: message,
            status: "FAILED",
          });
          return { patientId: patient._id, status: "FAILED" };
        }
      })
    );

    res.json({ message: "Campaign executed", results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send campaign" });
  }
};

export const getMessageLogs = async (req, res) => {
  try {
    const logs = await MessageLog.find()
      .populate("patientId", "name contact")
      .sort({ createdAt: -1 });
    res.json(logs);
  } catch {
    res.status(500).json({ error: "Could not retrieve logs" });
  }
};
