import express from "express";
import {
  getAIFeedbacks,
  getAIFeedbackPorId,
  getAIFeedbacksPorSubtopic,
  getAIFeedbacksPorStepNumber,
  getAIFeedbacksCompletos,
  postAIFeedback,
  putAIFeedback,
  deleteAIFeedback
} from "./aiFeedback.controllers.js";

const router = express.Router();

router.get("/", getAIFeedbacks);
router.get("/completos", getAIFeedbacksCompletos);
router.get("/subtopic/:subtopicId", getAIFeedbacksPorSubtopic);
router.get("/step/:stepNumber", getAIFeedbacksPorStepNumber);
router.get("/:id", getAIFeedbackPorId);
router.post("/", postAIFeedback);
router.put("/", putAIFeedback);
router.delete("/:id", deleteAIFeedback);

export default router;
