import express from "express";
import {
  getClassAssignments,
  getClassAssignmentPorId,
  getClassAssignmentsPorTeacher,
  getClassAssignmentsPorGrade,
  getClassAssignmentsPorSubject,
  postClassAssignment,
  putClassAssignment,
  deleteClassAssignment
} from "./classAssignment.controllers.js";

const router = express.Router();

router.get("/", getClassAssignments);
router.get("/teacher/:teacherId", getClassAssignmentsPorTeacher);
router.get("/grade/:gradeId", getClassAssignmentsPorGrade);
router.get("/subject/:subjectId", getClassAssignmentsPorSubject);
router.get("/:id", getClassAssignmentPorId);
router.post("/", postClassAssignment);
router.put("/", putClassAssignment);
router.delete("/:id", deleteClassAssignment);

export default router;
