import { z } from "zod";

export const crearSubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required").max(100, "Subject name must be less than 100 characters"),
  description: z.string().optional(),
  category: z.string().max(50, "Category must be less than 50 characters").optional(),
  price: z.number().min(0, "Price must be positive").optional(),
  duration: z.string().max(50, "Duration must be less than 50 characters").optional(),
  difficulty: z.enum(["principiante", "intermedio", "avanzado"]).optional(),
  createdBy: z.string().uuid("Invalid teacher ID").optional()
});
