// dto/interactionType.dto.js
import { z } from "zod";

export const interactionTypeCreateSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  description: z.string().min(1, "La descripción es requerida"),
  category: z.string().min(1, "La categoría es requerida").max(50),
  systemPrompt: z.string().min(1, "El prompt del sistema es requerido"),
  userPrompt: z.string().min(1, "El prompt del usuario es requerido"),
  costPerUse: z.number().min(0).default(0),
  isActive: z.boolean().default(true)
});
