import { z } from "zod";

export const registrarUsuarioSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Correo no válido"),
  password: z.string().min(6, "La contraseña debe tener mínimo 6 caracteres"),
  image: z.string().optional(),
  bio: z.string().optional(),
  role: z.string().optional(), // ID del rol a asignar
});
 