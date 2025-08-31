import express from "express";
import {
  getSubtopics,
  getSubtopicPorId,
  getSubtopicPorNombre,
  getSubtopicsPorSubject,
  postSubtopic,
  putSubtopic,
  deleteSubtopic,
  getSubtopicsConProgress
} from "./subtopic.controllers.js";

const router = express.Router();

router.get("/", getSubtopics);
router.get("/con-progress", getSubtopicsConProgress);
router.get("/subject/:subjectId", getSubtopicsPorSubject);
router.get("/nombre/:name", getSubtopicPorNombre);
router.get("/:id", getSubtopicPorId);
router.post("/", postSubtopic);
router.put("/", putSubtopic);
router.delete("/:id", deleteSubtopic);

export default router;
