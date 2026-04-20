import cron from "node-cron";
import mongoose from "mongoose";
import Patient from "../models/Patient.js";
import ReminderLog from "../models/ReminderLog.js";
import { sendWhatsAppMessage } from "../utils/sendWhatsAppMessage.js";

function getTomorrowDateRange() {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setDate(end.getDate() + 1);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

const reminderJob = cron.schedule("0 9 * * *", async () => {
  console.log("[ReminderJob] Running daily WhatsApp reminder task...");

  const { start, end } = getTomorrowDateRange();

  try {
    const patients = await Patient.find({
      nextCheckupDate: { $gte: start, $lte: end },
      whatsappOptIn: true,
    });

    if (!patients.length) {
      console.log("[ReminderJob] No patients scheduled for tomorrow.");
      return;
    }

    for (const patient of patients) {
      const message = `Hello ${patient.name}, this is a reminder for your checkup scheduled on ${patient.nextCheckupDate.toDateString()}.`;

      try {
        const result = await sendWhatsAppMessage(patient.whatsapp, message);

        await ReminderLog.create({
          patientId: patient._id,
          phone: patient.whatsapp,
          message,
          status: result.status?.toUpperCase() || "FAILED",
          type: "checkup",
        });

        console.log(`Reminder sent to ${patient.name} (${patient.whatsapp})`);
      } catch (sendErr) {
        console.error(`Failed to send reminder to ${patient.name}:`, sendErr);

        await ReminderLog.create({
          patientId: patient._id,
          phone: patient.whatsapp,
          message,
          status: "FAILED",
          type: "checkup",
        });
      }
    }

    console.log(`[ReminderJob] Completed processing ${patients.length} patient(s)`);
  } catch (err) {
    console.error("[ReminderJob] Failed to process reminders:", err);
  }
});

export default reminderJob;
