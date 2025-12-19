// src/modules/admin/productos/hooks/useCrearProducto.ts
'use client';

import { useState, useCallback } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { crearProductoSchema, type CrearProductoData } from '../schemas/productoSchema';
import { crearProductoAction } from '../actions/crearProductoAction';
import { useImageOptimizer } from '@/src/shared/hooks/useImageOptimizer';
import { toast } from '@/src/shared/services/toast.service';

export interface UseCrearProductoReturn {
    form: ReturnType<typeof useForm<CrearProductoData>>;
    crearProducto: (data: CrearProductoData) => Promise<{ success: boolean; productId?: number }>;
    submitting: boolean;
    error: string | null;
    clearError: () => void;
    previewImage: string | null;
    setPreviewImage: (url: string | null) => void;
    optimizationStats: {
        originalSize?: number;
        optimizedSize?: number;
        reductionPercentage?: number;
        format?: string;
    };
}

export function useCrearProducto(): UseCrearProductoReturn {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [optimizationStats, setOptimizationStats] = useState<UseCrearProductoReturn['optimizationStats']>({});

    const { optimize, optimizing } = useImageOptimizer();

    const form = useForm<CrearProductoData>({
        resolver: zodResolver(crearProductoSchema) as Resolver<CrearProductoData>,
        defaultValues: {
            nombre: '',
            descripcion: '',
            precio: 0,
            categoria_id: '',
            ingredientes: [],
        },
    });

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const crearProducto = useCallback(async (data: CrearProductoData): Promise<{ success: boolean; productId?: number }> => {
        setSubmitting(true);
        clearError();
        setOptimizationStats({});

        try {
            // 🔴 LOG de inicio
            console.log('🚀 INICIO - Crear producto:', {
                nombre: data.nombre,
                categoria: data.categoria_id,
                precio: data.precio,
                ingredientes: data.ingredientes?.length || 0,
                tiene_imagen: !!(data.imagen && data.imagen.length > 0),
            });

            const formData = new FormData();

            // Agregar campos básicos
            formData.append('nombre', data.nombre);
            formData.append('categoria_id', data.categoria_id);
            formData.append('descripcion', data.descripcion || '');
            formData.append('precio', data.precio.toString());

            // Agregar ingredientes si existen
            if (data.ingredientes && data.ingredientes.length > 0) {
                formData.append('ingredientes', JSON.stringify(data.ingredientes));
            }

            // 🔥 OPTIMIZAR IMAGEN ANTES DE SUBIR (si existe)
            if (data.imagen && data.imagen.length > 0) {
                const originalFile = data.imagen[0];

                console.log('🖼️  Procesando imagen original:', {
                    nombre: originalFile.name,
                    tipo: originalFile.type,
                    tamaño: `${(originalFile.size / 1024 / 1024).toFixed(2)} MB`,
                    'tamaño_bytes': originalFile.size,
                });

                // Optimizar imagen para productos (máximo 1200px, calidad 85%)
                const optimizedFile = await optimize(originalFile, {
                    maxWidth: 1200,
                    maxHeight: 800,
                    quality: 0.85,
                    format: 'webp',
                });

                if (optimizedFile) {
                    // Calcular estadísticas de optimización
                    const reduction = ((originalFile.size - optimizedFile.size) / originalFile.size) * 100;

                    setOptimizationStats({
                        originalSize: originalFile.size,
                        optimizedSize: optimizedFile.size,
                        reductionPercentage: Math.round(reduction),
                        format: 'webp',
                    });

                    console.log('✅ Imagen optimizada para producto:', {
                        nombre_original: originalFile.name,
                        tamaño_original: `${(originalFile.size / 1024 / 1024).toFixed(2)} MB`,
                        nombre_optimizado: optimizedFile.name,
                        tamaño_optimizado: `${(optimizedFile.size / 1024 / 1024).toFixed(2)} MB`,
                        reducción: `${reduction.toFixed(2)}%`,
                        formato_final: 'webp',
                    });

                    // Agregar imagen optimizada al FormData
                    formData.append('imagen', optimizedFile);

                    // Mostrar toast informativo
                    toast.info('Imagen optimizada', {
                        description: `Reducción del ${reduction.toFixed(1)}% (${(originalFile.size / 1024 / 1024).toFixed(2)}MB → ${(optimizedFile.size / 1024 / 1024).toFixed(2)}MB)`,
                        duration: 4000,
                    });
                } else {
                    // Si falla la optimización, usar la original
                    console.warn('⚠️  Usando imagen original (falló optimización)');
                    formData.append('imagen', originalFile);
                }
            }

            // Ejecutar acción del servidor
            console.log('📤 Enviando datos al servidor...');
            const result = await crearProductoAction(formData);

            if (result.success && result.producto) {
                console.log('🎉 Producto creado exitosamente:', {
                    id: result.producto.id,
                    nombre: result.producto.nombre,
                    precio: result.producto.precio,
                    'fecha_creacion': new Date().toISOString(),
                });

                toast.success('¡Producto creado!', {
                    description: `${data.nombre} ha sido agregado al menú`,
                    duration: 4000,
                });

                // Resetear formulario
                form.reset();
                setPreviewImage(null);
                setOptimizationStats({});

                return { success: true, productId: result.producto.id };
            } else {
                const errorMessage = result.error || 'Error al crear el producto';
                console.error('❌ Error creando producto:', errorMessage);
                setError(errorMessage);

                toast.error('Error al crear producto', {
                    description: errorMessage,
                    duration: 5000,
                });

                return { success: false };
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
            console.error('💥 Error inesperado:', err);
            setError(errorMessage);

            toast.error('Error inesperado', {
                description: errorMessage,
                duration: 5000,
            });

            return { success: false };
        } finally {
            setSubmitting(false);
        }
    }, [clearError, form, optimize]);

    return {
        form,
        crearProducto,
        submitting: submitting || optimizing,
        error,
        clearError,
        previewImage,
        setPreviewImage,
        optimizationStats,
    };
}