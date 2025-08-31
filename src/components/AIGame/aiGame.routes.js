import express from "express";
import {
  getJuegos,
  getJuegoPorId,
  getJuegosPorSubtopic,
  getJuegosPorTipo,
  postJuego,
  putJuego,
  deleteJuego,
  playJuego,
  getJuegosPopulares,
  getEstadisticasJuegos,
  generateJuegoConIA
} from "./aiGame.controllers.js";

// Importar documentación Swagger
import "./aiGame.swagger.js";

const router = express.Router();

// ==================== CRUD BÁSICO ====================
router.get("/", getJuegos);
router.get("/populares", getJuegosPopulares);
router.get("/estadisticas", getEstadisticasJuegos);
router.get("/subtopic/:subtopicId", getJuegosPorSubtopic);
router.get("/tipo/:gameType", getJuegosPorTipo);
router.get("/:id", getJuegoPorId);
router.post("/", postJuego);
router.put("/", putJuego);
router.delete("/:id", deleteJuego);

// ==================== GAMEPLAY ====================
router.get("/:id/play", playJuego);

// ==================== AI GENERATION ====================
router.post("/generate/:subtopicId", generateJuegoConIA);

export default router;

