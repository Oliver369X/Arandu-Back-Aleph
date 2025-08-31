import { z } from "zod";

export const crearSubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required").max(100, "Subject name must be less than 100 characters"),
  description: z.string().optional()
});
