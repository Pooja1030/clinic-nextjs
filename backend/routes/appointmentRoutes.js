import express from "express";
import {
  protect,
  doctorOnly,
  patientOnly
} from "../middleware/authMiddleware.js";
import {
  getAppointments,
  createAppointment,
  getMyAppointments,
  deleteAppointment,
  getAppointmentById,
  updateAppointment
} from "../controllers/appointmentController.js";

const router = express.Router();

router.get("/profile", protect, patientOnly, getMyAppointments);

router.route("/")
  .get(protect, doctorOnly, getAppointments)
  .post(protect, createAppointment);

router.route("/:id")
  .get(protect, doctorOnly, getAppointmentById)
  .put(protect, doctorOnly, updateAppointment)
  .delete(protect, doctorOnly, deleteAppointment);

export default router;
