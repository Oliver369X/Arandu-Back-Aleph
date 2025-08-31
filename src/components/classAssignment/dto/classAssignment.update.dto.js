import { z } from "zod";

export const actualizarClassAssignmentSchema = z.object({
  id: z.string().uuid("Invalid class assignment ID"),
  gradeId: z.string().uuid("Invalid grade ID").optional(),
  subjectId: z.string().uuid("Invalid subject ID").optional(),
  teacherId: z.string().uuid("Invalid teacher ID").optional()
});
