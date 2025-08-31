import express from "express";
import {
  getSubjects,
  getSubjectPorId,
  getSubjectPorNombre,
  postSubject,
  putSubject,
  deleteSubject,
  getSubjectsConSubtopics,
  getSubjectsByCreator
} from "./subject.controllers.js";

const router = express.Router();

router.get("/", getSubjects);
router.get("/con-subtopics", getSubjectsConSubtopics);
router.get("/creator/:teacherId", getSubjectsByCreator);
router.get("/nombre/:name", getSubjectPorNombre);
router.get("/:id", getSubjectPorId);
router.post("/", postSubject);
router.put("/", putSubject);
router.delete("/:id", deleteSubject);

export default router;
