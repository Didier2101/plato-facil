// src/modules/dueno/configuraciones/components/ImageUploader.tsx (ejemplo de uso)
'use client';

import { useRef, useState, useEffect } from 'react';
import { FiUpload, FiImage, FiCheck } from 'react-icons/fi';
import Image from 'next/image';
import { useImageUploader } from '../hooks/useImageUploader';

interface ImageUploaderProps {
    onImageUpload: (url: string) => void;
    currentImageUrl?: string;
    label?: string;
    accept?: string;
    maxSizeMB?: number;
}

export default function ImageUploader({
    onImageUpload,
    currentImageUrl,
    label = 'Subir imagen',
    accept = 'image/*',
    maxSizeMB = 5,
}: ImageUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
    const [dragOver, setDragOver] = useState(false);

    const {
        uploadAndOptimizeImage,
        uploading,
        optimizing,
        error,
        clearError,
        lastOptimizationResult
    } = useImageUploader();

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

        // Mostrar preview inmediato
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        // Limpiar error previo
        clearError();

        // 🔴 LOG DE ARCHIVO SELECCIONADO
        console.log('📁 ARCHIVO SELECCIONADO:', {
            nombre: file.name,
            tipo: file.type,
            tamaño: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            'tamaño_bytes': file.size,
            'es_imagen': file.type.startsWith('image/'),
            'fecha_seleccion': new Date().toISOString(),
        });

        try {
            // Subir y optimizar imagen
            const result = await uploadAndOptimizeImage(file);

            if (result.success && result.url) {
                onImageUpload(result.url);

                // 🔴 LOG DE ÉXITO FINAL
                console.log('🎉 PROCESO COMPLETADO:', {
                    url_final: result.url,
                    nombre_final: file.name,
                    se_optimizo: true,
                    formato_final: 'webp',
                    'fecha_completado': new Date().toISOString(),
                });
            }
        } catch (error) {
            console.error('Error uploading image:', error);
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
            // Crear un DataTransfer para simular input file
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInputRef.current.files = dataTransfer.files;

            // Disparar evento change
            const event = new Event('change', { bubbles: true });
            fileInputRef.current.dispatchEvent(event);
        }
    };



    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                </label>

                <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
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

                    {uploading || optimizing ? (
                        <div className="space-y-3">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                            <p className="text-sm text-gray-600">
                                {optimizing ? 'Optimizando imagen...' : 'Subiendo imagen...'}
                            </p>
                        </div>
                    ) : previewUrl ? (
                        <div className="space-y-3">
                            <div className="relative w-32 h-32 mx-auto">
                                <Image
                                    src={previewUrl}
                                    alt="Preview"
                                    fill
                                    className="object-cover rounded-lg"
                                    sizes="128px"
                                    unoptimized={previewUrl.startsWith('blob:')}
                                />
                                <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                                    <FiCheck className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-sm text-green-600 font-medium">
                                Haz clic para cambiar la imagen
                            </p>
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
            {lastOptimizationResult && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                        <FiImage className="w-4 h-4" />
                        Información de optimización
                    </h4>
                    <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                            <span className="text-blue-700">Original:</span>
                            <span className="text-blue-900 font-medium">
                                {lastOptimizationResult.original.sizeFormatted}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-green-700">Optimizado:</span>
                            <span className="text-green-900 font-medium">
                                {lastOptimizationResult.optimized.sizeFormatted}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-orange-700">Reducción:</span>
                            <span className="text-orange-900 font-medium">
                                {lastOptimizationResult.reduction}
                            </span>
                        </div>
                        <div className="text-xs text-blue-600 mt-2">
                            Formato final: {lastOptimizationResult.optimized.type.replace('image/', '').toUpperCase()}
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