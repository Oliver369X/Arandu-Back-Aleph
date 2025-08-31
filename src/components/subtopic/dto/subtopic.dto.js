import { z } from "zod";

export const crearSubtopicSchema = z.object({
  subjectId: z.string().uuid("Invalid subject ID"),
  name: z.string().min(1, "Subtopic name is required").max(100, "Subtopic name must be less than 100 characters"),
  description: z.string().optional()
});
