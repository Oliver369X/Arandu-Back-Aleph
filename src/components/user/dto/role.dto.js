import { z } from "zod";

export const asignarRolSchema = z.object({
  userId: z.string().uuid("El ID del usuario debe ser un UUID válido"),
  roleId: z.string().uuid("El ID del rol debe ser un UUID válido")
});

export const removerRolSchema = z.object({
  userId: z.string().uuid("El ID del usuario debe ser un UUID válido"),
  roleId: z.string().uuid("El ID del rol debe ser un UUID válido")
}); 