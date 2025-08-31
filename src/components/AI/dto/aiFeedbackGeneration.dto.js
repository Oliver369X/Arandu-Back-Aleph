import { z } from "zod";

export const aiFeedbackGenerationSchema = z.object({
  subtopicId: z.string().uuid("Subtopic ID must be a valid UUID")
});

export const validateAIFeedbackGeneration = (data) => {
  return aiFeedbackGenerationSchema.safeParse(data);
};
