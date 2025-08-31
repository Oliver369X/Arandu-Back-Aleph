import express from "express";
import {
  getSchedules,
  getSchedulePorId,
  getSchedulesPorAssignment,
  getSchedulesPorDay,
  getSchedulesPorQuarter,
  postSchedule,
  putSchedule,
  deleteSchedule
} from "./schedule.controllers.js";

const router = express.Router();

router.get("/", getSchedules);
router.get("/assignment/:assignmentId", getSchedulesPorAssignment);
router.get("/day/:dayOfWeek", getSchedulesPorDay);
router.get("/quarter/:quarter", getSchedulesPorQuarter);
router.get("/:id", getSchedulePorId);
router.post("/", postSchedule);
router.put("/", putSchedule);
router.delete("/:id", deleteSchedule);

export default router;
