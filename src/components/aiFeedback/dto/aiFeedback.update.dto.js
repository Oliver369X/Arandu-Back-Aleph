import { z } from "zod";

export const actualizarAIFeedbackSchema = z.object({
  id: z.string().uuid("Invalid AI feedback ID"),
  subtopicId: z.string().uuid("Invalid subtopic ID").optional(),
  timeMinutes: z.number().int().positive("Total lesson time must be a positive integer").optional(),
  stepNumber: z.number().int().positive("Step number must be a positive integer").optional(),
  stepName: z.string().min(1, "Step name is required").max(50, "Step name must be less than 50 characters").optional(),
  content: z.string().min(1, "Content is required").optional(),
  studentActivity: z.string().max(255, "Student activity must be less than 255 characters").optional(),
  timeAllocation: z.number().int().positive("Time allocation must be a positive integer").optional(),
  materialsNeeded: z.string().max(200, "Materials needed must be less than 200 characters").optional(),
  successIndicator: z.string().max(200, "Success indicator must be less than 200 characters").optional()
});
