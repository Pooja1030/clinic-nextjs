import express from "express";
import {
  protect,
  patientOnly,
  doctorOnly
} from "../middleware/authMiddleware.js";
import {
  getPrescriptions,
  createPrescription,
  getMyPrescriptions,
  deletePrescription,
  getPrescriptionById,
  updatePrescription,
  uploadPrescriptionImage
} from "../controllers/prescriptionController.js";
import parser from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/upload", protect, doctorOnly, parser.single("image"), uploadPrescriptionImage);

router.get("/profile", protect, patientOnly, getMyPrescriptions);

router.route("/")
  .get(protect, doctorOnly, getPrescriptions)
  .post(protect, doctorOnly, createPrescription);

router.route("/:id")
  .get(protect, doctorOnly, getPrescriptionById)
  .put(protect, doctorOnly, updatePrescription)
  .delete(protect, doctorOnly, deletePrescription);

export default router;
