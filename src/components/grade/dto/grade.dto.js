import { z } from "zod";

export const crearGradeSchema = z.object({
  name: z.string().min(1, "Grade name is required").max(50, "Grade name must be less than 50 characters"),
  year: z.number().int().min(2020, "Year must be at least 2020").max(2030, "Year must be at most 2030")
});
