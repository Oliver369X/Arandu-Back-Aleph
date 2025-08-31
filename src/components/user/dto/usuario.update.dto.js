import { z } from "zod";

export const actualizarUsuarioSchema = z.object({
  id: z.string().uuid("El ID debe ser un UUID válido"),
  name: z.string().min(1, "El nombre es requerido").optional(),
  email: z.string().email("Correo no válido").optional(),
  password: z.string().min(6, "La contraseña debe tener mínimo 6 caracteres").optional(),
  image: z.string().optional(),
  bio: z.string().optional(),
  isPremium: z.boolean().optional()
});
