// src/modules/dueno/usuarios/schemas/usuarioSchema.ts
import { z } from 'zod';

export const crearUsuarioSchema = z.object({
    nombre: z.string().min(3, "El nombre es obligatorio (mínimo 3 caracteres)"),
    email: z.string().email("El email no es válido"),
    rol: z.enum(["admin", "repartidor", "dueno"], {
        message: "Selecciona un rol válido"  // ✅ Cambia errorMap por message
    }),
    contraseña: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const editarUsuarioSchema = z.object({
    nombre: z.string().min(3, "El nombre es obligatorio (mínimo 3 caracteres)"),
    email: z.string().email("El email no es válido"),
    rol: z.enum(["admin", "repartidor", "dueno"], {
        message: "Selecciona un rol válido"  // ✅ Cambia errorMap por message
    }),
});

export type CrearUsuarioData = z.infer<typeof crearUsuarioSchema>;
export type EditarUsuarioData = z.infer<typeof editarUsuarioSchema>;