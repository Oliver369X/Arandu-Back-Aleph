import { z } from "zod";

export const actualizarRolSchema = z.object({
  id: z.string().uuid("El ID debe ser un UUID válido"),
  name: z.string().min(1, "El nombre del rol es requerido").optional(),
  description: z.string().min(5, "La descripción debe tener mínimo 5 caracteres").optional(),
  permissions: z.string().min(1, "Los permisos son requeridos").optional()
}); 