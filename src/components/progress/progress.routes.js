import express from "express";
import {
  getProgress,
  getProgressPorId,
  getProgressPorUsuario,
  getProgressPorSubtopic,
  getProgressPorTipo,
  getProgressCompletado,
  postProgress,
  putProgress,
  deleteProgress
} from "./progress.controllers.js";

const router = express.Router();

router.get("/", getProgress);
router.get("/completado", getProgressCompletado);
router.get("/usuario/:userId", getProgressPorUsuario);
router.get("/subtopic/:subtopicId", getProgressPorSubtopic);
router.get("/tipo/:progressType", getProgressPorTipo);
router.get("/:id", getProgressPorId);
router.post("/", postProgress);
router.put("/", putProgress);
router.delete("/:id", deleteProgress);

export default router;
