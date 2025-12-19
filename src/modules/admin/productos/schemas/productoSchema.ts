// src/modules/admin/productos/schemas/productoSchema.ts
import { z } from 'zod';

// Schema para crear producto
export const crearProductoSchema = z.object({
    nombre: z.string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres')
        .regex(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-.,;:]+$/, 'El nombre contiene caracteres inválidos'),

    descripcion: z.string()
        .max(500, 'La descripción no puede exceder 500 caracteres')
        .optional()
        .or(z.literal('')),

    precio: z.coerce.number()
        .positive('El precio debe ser mayor a 0')
        .max(999999.99, 'El precio no puede exceder $999,999.99'),

    categoria_id: z.string()
        .uuid('Selecciona una categoría válida'),

    imagen: z.custom<FileList | File[]>((val) => {
        if (typeof FileList !== 'undefined' && val instanceof FileList) return true;
        if (Array.isArray(val) && val.every(item => item instanceof File)) return true;
        return false;
    }, 'Debe ser un archivo válido')
        .optional()
        .refine(files => {
            if (!files || files.length === 0) return true;
            const file = files[0];
            return file.size <= 5 * 1024 * 1024; // 5MB
        }, 'La imagen no debe superar los 5MB')
        .refine(files => {
            if (!files || files.length === 0) return true;
            const file = files[0];
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            return allowedTypes.includes(file.type);
        }, 'Solo se permiten imágenes JPG, PNG o WebP'),

    ingredientes: z.array(z.object({
        id: z.string().uuid(),
        nombre: z.string(),
        obligatorio: z.boolean()
    }))
        .optional()
        .default([]),
});

export type CrearProductoData = z.infer<typeof crearProductoSchema>;

// Schema para actualizar producto
export const actualizarProductoSchema = z.object({
    nombre: z.string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres')
        .regex(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-.,;:]+$/, 'El nombre contiene caracteres inválidos'),

    descripcion: z.string()
        .max(500, 'La descripción no puede exceder 500 caracteres')
        .optional()
        .or(z.literal('')),

    precio: z.coerce.number()
        .positive('El precio debe ser mayor a 0')
        .max(999999.99, 'El precio no puede exceder $999,999.99'),

    categoria_id: z.string()
        .uuid('Selecciona una categoría válida'),

    activo: z.boolean().default(true),

    imagen: z.custom<FileList | File[]>((val) => {
        if (typeof FileList !== 'undefined' && val instanceof FileList) return true;
        if (Array.isArray(val) && val.every(item => item instanceof File)) return true;
        return false;
    }, 'Debe ser un archivo válido')
        .optional()
        .refine(files => {
            if (!files || files.length === 0) return true;
            const file = files[0];
            return file.size <= 5 * 1024 * 1024; // 5MB
        }, 'La imagen no debe superar los 5MB')
        .refine(files => {
            if (!files || files.length === 0) return true;
            const file = files[0];
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            return allowedTypes.includes(file.type);
        }, 'Solo se permiten imágenes JPG, PNG o WebP'),

    ingredientes: z.array(z.object({
        id: z.string().uuid(),
        nombre: z.string(),
        obligatorio: z.boolean()
    }))
        .optional()
        .default([]),
});

export type ActualizarProductoData = z.infer<typeof actualizarProductoSchema>;