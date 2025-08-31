import { z } from "zod";

export const crearClassAssignmentSchema = z.object({
  gradeId: z.string().uuid("Invalid grade ID"),
  subjectId: z.string().uuid("Invalid subject ID"),
  teacherId: z.string().uuid("Invalid teacher ID")
});
