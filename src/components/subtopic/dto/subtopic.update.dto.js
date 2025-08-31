import { z } from "zod";

export const actualizarSubtopicSchema = z.object({
  id: z.string().uuid("Invalid subtopic ID"),
  subjectId: z.string().uuid("Invalid subject ID").optional(),
  name: z.string().min(1, "Subtopic name is required").max(100, "Subtopic name must be less than 100 characters").optional(),
  description: z.string().optional()
});
