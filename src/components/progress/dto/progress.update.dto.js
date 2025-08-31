import { z } from "zod";

export const actualizarProgressSchema = z.object({
  id: z.string().uuid("Invalid progress ID"),
  userId: z.string().uuid("Invalid user ID").optional(),
  subtopicId: z.string().uuid("Invalid subtopic ID").optional(),
  progressType: z.enum(["learning", "teaching", "mastery"], {
    errorMap: () => ({ message: "Progress type must be 'learning', 'teaching', or 'mastery'" })
  }).optional(),
  percentage: z.number().min(0, "Percentage must be at least 0").max(100, "Percentage must be at most 100").optional()
});
