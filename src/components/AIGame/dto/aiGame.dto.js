import { z } from "zod";

export const crearJuegoSchema = z.object({
  subtopicId: z.string().uuid("ID de subtopic debe ser un UUID válido"),
  gameType: z.enum([
    "wordsearch", "quiz", "memory", "puzzle", "crossword", "matching", 
    "threejs", "pixijs", "adaptive"
  ], {
    errorMap: () => ({ message: "Tipo de juego no válido" })
  }),
  agentType: z.enum(["specialized", "free"], {
    errorMap: () => ({ message: "Tipo de agente debe ser 'specialized' o 'free'" })
  }),
  title: z.string()
    .min(1, "El título es requerido")
    .max(200, "El título no puede exceder 200 caracteres"),
  description: z.string()
    .min(10, "La descripción debe tener al menos 10 caracteres"),
  instructions: z.string()
    .min(5, "Las instrucciones deben tener al menos 5 caracteres"),
  htmlContent: z.string()
    .min(100, "El contenido HTML debe tener al menos 100 caracteres"),
  difficulty: z.enum(["easy", "medium", "hard"], {
    errorMap: () => ({ message: "La dificultad debe ser 'easy', 'medium' o 'hard'" })
  }).default("medium"),
  estimatedTime: z.number()
    .int("El tiempo estimado debe ser un número entero")
    .min(1, "El tiempo estimado debe ser al menos 1 minuto")
    .max(120, "El tiempo estimado no puede exceder 120 minutos")
    .default(10)
});

export const actualizarJuegoSchema = z.object({
  id: z.string().uuid("ID debe ser un UUID válido"),
  title: z.string()
    .min(1, "El título es requerido")
    .max(200, "El título no puede exceder 200 caracteres")
    .optional(),
  description: z.string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .optional(),
  instructions: z.string()
    .min(5, "Las instrucciones deben tener al menos 5 caracteres")
    .optional(),
  htmlContent: z.string()
    .min(100, "El contenido HTML debe tener al menos 100 caracteres")
    .optional(),
  difficulty: z.enum(["easy", "medium", "hard"], {
    errorMap: () => ({ message: "La dificultad debe ser 'easy', 'medium' o 'hard'" })
  }).optional(),
  estimatedTime: z.number()
    .int("El tiempo estimado debe ser un número entero")
    .min(1, "El tiempo estimado debe ser al menos 1 minuto")
    .max(120, "El tiempo estimado no puede exceder 120 minutos")
    .optional(),
  isActive: z.boolean().optional()
});

export const generarJuegoSchema = z.object({
  gameType: z.enum([
    "wordsearch", "quiz", "memory", "puzzle", "crossword", "matching", 
    "threejs", "pixijs", "adaptive"
  ], {
    errorMap: () => ({ message: "Tipo de juego no válido" })
  }).optional(),
  difficulty: z.enum(["easy", "medium", "hard"], {
    errorMap: () => ({ message: "La dificultad debe ser 'easy', 'medium' o 'hard'" })
  }).default("medium"),
  customPrompt: z.string()
    .max(1000, "El prompt personalizado no puede exceder 1000 caracteres")
    .optional(),
  focus: z.string()
    .max(200, "El enfoque no puede exceder 200 caracteres")
    .optional(),
  targetAge: z.string()
    .max(50, "La edad objetivo no puede exceder 50 caracteres")
    .optional(),
  language: z.enum(["es", "en"], {
    errorMap: () => ({ message: "El idioma debe ser 'es' o 'en'" })
  }).default("es")
});

