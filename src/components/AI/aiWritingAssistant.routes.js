import express from "express";
import { generateAIFeedbackForSubtopic } from "./aiWritingAssistant.controllers.js";

const router = express.Router();

// Route to generate AI feedback for a specific subtopic
router.post("/generate-feedback/:subtopicId", generateAIFeedbackForSubtopic);

export default router; 