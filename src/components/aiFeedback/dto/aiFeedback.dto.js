import { z } from "zod";

export const crearAIFeedbackSchema = z.object({
  subtopicId: z.string().uuid("Invalid subtopic ID"),
  timeMinutes: z.number().int().positive("Total lesson time must be a positive integer"),
  stepNumber: z.number().int().positive("Step number must be a positive integer"),
  stepName: z.string().min(1, "Step name is required").max(50, "Step name must be less than 50 characters"),
  content: z.string().min(1, "Content is required"),
  studentActivity: z.string().max(255, "Student activity must be less than 255 characters").optional(),
  timeAllocation: z.number().int().positive("Time allocation must be a positive integer"),
  materialsNeeded: z.string().max(200, "Materials needed must be less than 200 characters").optional(),
  successIndicator: z.string().max(200, "Success indicator must be less than 200 characters").optional()
});
