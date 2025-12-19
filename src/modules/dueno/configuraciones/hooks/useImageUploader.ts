// src/modules/dueno/configuraciones/hooks/useImageUploader.ts
'use client';

import { useState, useCallback } from 'react';
import { useImageOptimizer } from '@/src/shared/hooks/useImageOptimizer';
import { subirImagenLogo } from '../actions/configuracionRestauranteActions';
import { toast } from '@/src/shared/services/toast.service';

export interface OptimizationResult {
    original: {
        name: string;
        type: string;
        size: number;
        sizeFormatted: string;
    };
    optimized: {
        name: string;
        type: string;
        size: number;
        sizeFormatted: string;
    };
    reduction: string;
    timestamp: string;
}

export interface UseImageUploaderReturn {
    uploadImage: (file: File) => Promise<{ success: boolean; url?: string }>;
    uploadAndOptimizeImage: (file: File) => Promise<{ success: boolean; url?: string }>;
    uploading: boolean;
    optimizing: boolean;
    error: string | null;
    clearError: () => void;
    lastOptimizationResult: OptimizationResult | null;
}

export function useImageUploader(): UseImageUploaderReturn {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastOptimizationResult, setLastOptimizationResult] = useState<OptimizationResult | null>(null);

    const {
        optimize,
        optimizing,
        clearError: clearOptimizerError
    } = useImageOptimizer();

    // Función original (sin optimización)
    const uploadImage = useCallback(async (file: File): Promise<{ success: boolean; url?: string }> => {
        try {
            setUploading(true);
            setError(null);

            const resultado = await subirImagenLogo(file);

            if (resultado.success && resultado.url) {
                toast.success('¡Imagen subida!', {
                    description: 'La imagen se ha subido correctamente',
                    duration: 3000,
                });
                return { success: true, url: resultado.url };
            } else {
                const errorMsg = resultado.error || 'Error al subir la imagen';
                setError(errorMsg);
                toast.error('Error al subir imagen', {
                    description: errorMsg,
                    duration: 4000,
                });
                return { success: false };
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Error inesperado al subir la imagen';
            setError(errorMsg);
            toast.error('Error inesperado', {
                description: errorMsg,
                duration: 4000,
            });
            console.error('Error subiendo imagen:', err);
            return { success: false };
        } finally {
            setUploading(false);
        }
    }, []);

    // Nueva función con optimización
    const uploadAndOptimizeImage = useCallback(async (file: File): Promise<{ success: boolean; url?: string }> => {
        try {
            setUploading(true);
            setError(null);
            setLastOptimizationResult(null);

            // 🔴 LOG ANTES DE OPTIMIZAR
            console.log('📤 INICIO DE SUBIDA:', {
                nombre: file.name,
                tipo: file.type,
                tamaño: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                'tamaño_bytes': file.size,
                'fecha': new Date().toISOString(),
            });

            // 1. OPTIMIZAR LA IMAGEN
            const optimizedFile = await optimize(file, {
                maxWidth: 1200,  // Para logos, 1200px es suficiente
                maxHeight: 800,
                quality: 0.9,    // Alta calidad para logos
                format: 'webp',  // Siempre convertir a WebP
            });

            if (!optimizedFile) {
                throw new Error('No se pudo optimizar la imagen');
            }

            // 🔴 LOG DESPUÉS DE OPTIMIZAR
            console.log('✅ IMAGEN OPTIMIZADA:', {
                nombre_original: file.name,
                tipo_original: file.type,
                tamaño_original: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                'tamaño_bytes_original': file.size,
                nombre_optimizado: optimizedFile.name,
                tipo_optimizado: optimizedFile.type,
                tamaño_optimizado: `${(optimizedFile.size / 1024 / 1024).toFixed(2)} MB`,
                'tamaño_bytes_optimizado': optimizedFile.size,
                reducción: `${(((file.size - optimizedFile.size) / file.size) * 100).toFixed(2)}%`,
                'diferencia_bytes': file.size - optimizedFile.size,
                'fecha': new Date().toISOString(),
            });

            setLastOptimizationResult({
                original: {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    sizeFormatted: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                },
                optimized: {
                    name: optimizedFile.name,
                    type: optimizedFile.type,
                    size: optimizedFile.size,
                    sizeFormatted: `${(optimizedFile.size / 1024 / 1024).toFixed(2)} MB`,
                },
                reduction: `${(((file.size - optimizedFile.size) / file.size) * 100).toFixed(2)}%`,
                timestamp: new Date().toISOString(),
            });

            // 2. SUBIR IMAGEN OPTIMIZADA
            const resultado = await subirImagenLogo(optimizedFile);

            if (resultado.success && resultado.url) {
                // 🔴 LOG DE SUBIDA EXITOSA
                console.log('🚀 SUBIDA EXITOSA:', {
                    url: resultado.url,
                    nombre_guardado: optimizedFile.name,
                    tipo_guardado: optimizedFile.type,
                    tamaño_final: `${(optimizedFile.size / 1024 / 1024).toFixed(2)} MB`,
                    'fecha': new Date().toISOString(),
                    'se_optimizo': true,
                    'formato_final': 'webp',
                });

                toast.success('¡Imagen optimizada y subida!', {
                    description: `Imagen reducida ${(((file.size - optimizedFile.size) / file.size) * 100).toFixed(1)}% (${(file.size / 1024 / 1024).toFixed(2)}MB → ${(optimizedFile.size / 1024 / 1024).toFixed(2)}MB)`,
                    duration: 4000,
                });

                return { success: true, url: resultado.url };
            } else {
                const errorMsg = resultado.error || 'Error al subir la imagen optimizada';

                // 🔴 LOG DE ERROR EN SUBIDA
                console.error('❌ ERROR EN SUBIDA:', {
                    error: errorMsg,
                    nombre_archivo: optimizedFile.name,
                    tipo: optimizedFile.type,
                    tamaño: `${(optimizedFile.size / 1024 / 1024).toFixed(2)} MB`,
                    'fecha': new Date().toISOString(),
                });

                setError(errorMsg);
                toast.error('Error al subir imagen', {
                    description: errorMsg,
                    duration: 4000,
                });
                return { success: false };
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Error inesperado al subir la imagen';

            // 🔴 LOG DE ERROR INESPERADO
            console.error('💥 ERROR INESPERADO:', {
                error: errorMsg,
                nombre_archivo: file.name,
                tipo: file.type,
                tamaño: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                'fecha': new Date().toISOString(),
                'stack': err instanceof Error ? err.stack : 'No stack',
            });

            setError(errorMsg);
            toast.error('Error inesperado', {
                description: errorMsg,
                duration: 4000,
            });
            console.error('Error subiendo imagen:', err);
            return { success: false };
        } finally {
            setUploading(false);
        }
    }, [optimize]);

    const clearError = useCallback(() => {
        setError(null);
        clearOptimizerError();
    }, [clearOptimizerError]);

    return {
        uploadImage,           // Función original (sin optimización)
        uploadAndOptimizeImage, // Nueva función con optimización
        uploading,
        optimizing,
        error,
        clearError,
        lastOptimizationResult,
    };
}