import { z } from "zod";

export const crearRolSchema = z.object({
  name: z.string().min(1, "El nombre del rol es requerido"),
  description: z.string().min(5, "La descripción debe tener mínimo 5 caracteres"),
  permissions: z.string().min(1, "Los permisos son requeridos")
}); 