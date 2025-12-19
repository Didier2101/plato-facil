// src/modules/admin/productos/components/ProductImageUploader.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { FiUpload, FiImage, FiCheck } from 'react-icons/fi';
import Image from 'next/image';
import { useImageOptimizer } from '@/src/shared/hooks/useImageOptimizer';
import { toast } from '@/src/shared/services/toast.service';

interface ProductImageUploaderProps {
    onImageUpload: (file: File | null) => void;
    currentImageUrl?: string;
    label?: string;
    accept?: string;
    maxSizeMB?: number;
}

interface OptimizationResult {
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
    reductionPercentage: number;
}

export default function ProductImageUploader({
    onImageUpload,
    currentImageUrl,
    label = 'Imagen del producto',
    accept = 'image/*',
    maxSizeMB = 5,
}: ProductImageUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
    const [dragOver, setDragOver] = useState(false);
    const [uploading,] = useState(false);
    const [optimizing, setOptimizing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);

    const { optimize } = useImageOptimizer();

    useEffect(() => {
        if (currentImageUrl) {
            setPreviewUrl(currentImageUrl);
        }
    }, [currentImageUrl]);

    useEffect(() => {
        return () => {
            if (previewUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Limpiar errores previos
        setError(null);
        setOptimizationResult(null);

        // Validaciones básicas
        if (!file.type.startsWith('image/')) {
            setError('Selecciona un archivo de imagen válido');
            toast.error('Error', {
                description: 'El archivo debe ser una imagen',
                duration: 4000,
            });
            return;
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`La imagen no debe superar los ${maxSizeMB}MB`);
            toast.error('Error', {
                description: `La imagen es demasiado grande. Máximo: ${maxSizeMB}MB`,
                duration: 4000,
            });
            return;
        }

        // Mostrar preview inmediato
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        console.log('📁 Imagen seleccionada para producto:', {
            nombre: file.name,
            tipo: file.type,
            tamaño: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            'tamaño_bytes': file.size,
            'fecha_seleccion': new Date().toISOString(),
        });

        try {
            setOptimizing(true);

            // Optimizar imagen específicamente para productos
            const optimizedFile = await optimize(file, {
                maxWidth: 1200,  // Para productos en menú
                maxHeight: 800,
                quality: 0.85,   // Calidad balanceada para productos
                format: 'webp',  // Siempre convertir a WebP
            });

            if (optimizedFile) {
                // Guardar estadísticas de optimización
                const reduction = ((file.size - optimizedFile.size) / file.size) * 100;
                setOptimizationResult({
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
                    reduction: `${reduction.toFixed(2)}%`,
                    reductionPercentage: reduction,
                });

                console.log('✅ Imagen optimizada para producto:', {
                    nombre_original: file.name,
                    tamaño_original: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                    nombre_optimizado: optimizedFile.name,
                    tamaño_optimizado: `${(optimizedFile.size / 1024 / 1024).toFixed(2)} MB`,
                    reducción: `${reduction.toFixed(2)}%`,
                    formato_final: 'webp',
                });

                // Mostrar toast informativo
                toast.info('Imagen optimizada', {
                    description: `Reducción del ${reduction.toFixed(1)}%`,
                    duration: 3000,
                });

                // Pasar el archivo optimizado al componente padre
                onImageUpload(optimizedFile);
            } else {
                // Si falla la optimización, usar la original
                console.warn('⚠️  Usando imagen original (falló optimización)');
                onImageUpload(file);
            }

        } catch (error) {
            console.error('Error optimizando imagen:', error);
            setError('Error al procesar la imagen');
            // En caso de error, usar la imagen original
            onImageUpload(file);
        } finally {
            setOptimizing(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);

        const file = e.dataTransfer.files?.[0];
        if (file && fileInputRef.current) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInputRef.current.files = dataTransfer.files;

            const event = new Event('change', { bubbles: true });
            fileInputRef.current.dispatchEvent(event);
        }
    };

    const handleClearImage = () => {
        if (previewUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setOptimizationResult(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        // Notificar al padre que se eliminó la imagen
        onImageUpload(null);
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block mb-3 font-medium text-gray-700">
                    {label}
                </label>

                <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
                        ${dragOver ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-gray-400'}
                        ${uploading || optimizing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => !uploading && !optimizing && fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={accept}
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={uploading || optimizing}
                    />

                    {optimizing ? (
                        <div className="space-y-3">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                            <p className="text-sm text-gray-600">
                                Optimizando imagen...
                            </p>
                        </div>
                    ) : previewUrl ? (
                        <div className="space-y-3">
                            <div className="relative w-32 h-32 mx-auto">
                                <Image
                                    src={previewUrl}
                                    alt="Vista previa"
                                    fill
                                    className="object-cover rounded-lg border-2 border-gray-200"
                                    sizes="128px"
                                    unoptimized={previewUrl.startsWith('blob:')}
                                />
                                <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                                    <FiCheck className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-green-600 font-medium">
                                    Imagen lista
                                </p>
                                <button
                                    type="button"
                                    onClick={handleClearImage}
                                    className="text-xs text-red-500 hover:text-red-700 transition-colors"
                                >
                                    Eliminar imagen
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                                <FiUpload className="w-8 h-8 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-700 font-medium">
                                    Arrastra y suelta una imagen o haz clic para seleccionar
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    PNG, JPG, GIF hasta {maxSizeMB}MB
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Información de optimización */}
            {optimizationResult && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                        <FiImage className="w-4 h-4" />
                        Información de optimización
                    </h4>
                    <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                            <span className="text-blue-700">Original:</span>
                            <span className="text-blue-900 font-medium">
                                {optimizationResult.original.sizeFormatted}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-green-700">Optimizado:</span>
                            <span className="text-green-900 font-medium">
                                {optimizationResult.optimized.sizeFormatted}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-orange-700">Reducción:</span>
                            <span className="text-orange-900 font-medium">
                                {optimizationResult.reduction}
                            </span>
                        </div>
                        <div className="text-xs text-blue-600 mt-2">
                            Formato final: {optimizationResult.optimized.type.replace('image/', '').toUpperCase()}
                        </div>
                    </div>
                </div>
            )}

            {/* Mensaje de error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {/* Información de consola */}
            <div className="text-xs text-gray-500">
                <p>💡 Todos los logs de optimización se muestran en la consola del navegador</p>
                <p>🔍 Presiona F12 → Console para ver detalles técnicos</p>
            </div>
        </div>
    );
}