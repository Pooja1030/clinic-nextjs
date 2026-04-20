import express from "express";
import { sendCampaign, getMessageLogs } from "../controllers/campaign.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send", protect, sendCampaign);
router.get("/logs", protect, getMessageLogs);


export default router;
