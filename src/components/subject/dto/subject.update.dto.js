import { z } from "zod";

export const actualizarSubjectSchema = z.object({
  id: z.string().uuid("Invalid subject ID"),
  name: z.string().min(1, "Subject name is required").max(100, "Subject name must be less than 100 characters").optional(),
  description: z.string().optional()
});
