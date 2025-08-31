import { z } from "zod";

export const crearProgressSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  subtopicId: z.string().uuid("Invalid subtopic ID"),
  progressType: z.enum(["learning", "teaching", "mastery"], {
    errorMap: () => ({ message: "Progress type must be 'learning', 'teaching', or 'mastery'" })
  }),
  percentage: z.number().min(0, "Percentage must be at least 0").max(100, "Percentage must be at most 100")
});
