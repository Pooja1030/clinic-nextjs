import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getAllPatients,
  createPatient,
  getPatientProfile,
  getPatientById,
  updatePatient,
  deletePatient
} from "../controllers/patientController.js";

const router = express.Router();

router.route("/")
  .get(protect, getAllPatients)
  .post(protect, createPatient);

router.get("/profile", protect, getPatientProfile);
router.get("/:id", protect, getPatientById);
router.put("/:id", protect, updatePatient);
router.delete("/:id", protect, deletePatient);

export default router;
