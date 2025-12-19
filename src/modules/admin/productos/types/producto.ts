import { z } from 'zod';

// Tipos para la base de datos
export interface ProductoDB {
    id: string; // Cambiado de bigint a string (UUID)
    nombre: string;
    precio: number;
    imagen_url?: string | null;
    descripcion?: string | null;
    activo: boolean;
    categoria_id?: string | null; // UUID
    created_at: string;
    updated_at: string;
}

export interface CategoriaDB {
    id: string; // UUID
    nombre: string;
    activo: boolean;
    created_at: string;
    updated_at: string;
}

export interface IngredienteDB {
    id: string; // UUID
    nombre: string;
    activo: boolean;
    created_at: string;
}

export interface ProductoIngredienteDB {
    id: string; // UUID
    producto_id: string; // UUID
    ingrediente_id: string; // UUID
    obligatorio: boolean;
    orden: number;
}

// Tipos para el frontend
export interface ProductoFrontend {
    id: string; // UUID
    nombre: string;
    precio: number;
    imagen_url?: string;
    descripcion?: string;
    activo: boolean;
    categoria?: string; // Solo nombre para mostrar
    categoria_id?: string; // UUID para referencias
    ingredientes?: {
        ingrediente_id: string;
        obligatorio: boolean;
        ingrediente: {
            nombre: string;
            activo: boolean;
        };
    }[];
    created_at: string;
    updated_at: string;
}

export interface CategoriaFrontend {
    id: string; // UUID
    nombre: string;
    activo: boolean;
    created_at: string;
    updated_at: string;
}

export interface IngredienteFrontend {
    id: string; // UUID
    nombre: string;
    activo: boolean;
    created_at: string;
    precio_extra?: number; // No existe en la DB actual
    es_requerido?: boolean; // No existe en la DB actual
    max_seleccion?: number; // No existe en la DB actual
}

export interface IngredienteSeleccionado {
    id: string; // UUID
    nombre: string;
    obligatorio: boolean;
}

// Tipos para acciones
export interface CrearProductoData {
    nombre: string;
    precio: number;
    categoria_id?: string;
    descripcion?: string;
    imagen?: FileList;
    ingredientes?: IngredienteSeleccionado[];
}

export interface ActualizarProductoData {
    nombre?: string;
    precio?: number;
    categoria_id?: string;
    descripcion?: string;
    imagen?: FileList;
    activo?: boolean;
}

// Tipos para formularios
export interface ProductoFormData {
    nombre: string;
    precio: number;
    categoria_id?: string;
    descripcion?: string;
    imagen?: FileList;
}

// Schemas de validación
export const productoSchema = z.object({
    nombre: z.string()
        .min(1, 'El nombre es requerido')
        .max(100, 'El nombre no puede exceder 100 caracteres'),
    precio: z.number()
        .min(1, 'El precio debe ser mayor a 0')
        .max(9999999, 'El precio no puede exceder 9,999,999'),
    categoria_id: z.string().uuid('Categoría inválida').optional(),
    descripcion: z.string()
        .max(500, 'La descripción no puede exceder 500 caracteres')
        .optional(),
    imagen: z.instanceof(FileList)
        .refine(files => files.length === 0 || files[0]?.type.startsWith('image/'), {
            message: 'Debe ser una imagen válida',
        })
        .optional(),
});

export const categoriaSchema = z.object({
    nombre: z.string()
        .min(1, 'El nombre es requerido')
        .max(100, 'El nombre no puede exceder 100 caracteres'),
    activo: z.boolean().default(true),
});

export const ingredienteSchema = z.object({
    nombre: z.string()
        .min(1, 'El nombre es requerido')
        .max(100, 'El nombre no puede exceder 100 caracteres'),
    activo: z.boolean().default(true),
});

export type ProductoSchema = z.infer<typeof productoSchema>;
export type CategoriaSchema = z.infer<typeof categoriaSchema>;
export type IngredienteSchema = z.infer<typeof ingredienteSchema>;