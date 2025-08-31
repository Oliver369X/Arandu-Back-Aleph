import express from "express";
import {
  getGrades,
  getGradePorId,
  getGradesPorYear,
  postGrade,
  putGrade,
  deleteGrade
} from "./grade.controllers.js";

const router = express.Router();

router.get("/", getGrades);
router.get("/year/:year", getGradesPorYear);
router.get("/:id", getGradePorId);
router.post("/", postGrade);
router.put("/", putGrade);
router.delete("/:id", deleteGrade);

export default router;
