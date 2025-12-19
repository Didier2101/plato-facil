// src/shared/utils/image-optimizer/ImageOptimizer.ts
import { WebPConverter } from './WebPConverter';
import { ImageResizer } from './ImageResizer';
import type { OptimizeOptions, OptimizationResult, LogEntry } from './types';

export class ImageOptimizer {
    private webpConverter: WebPConverter;
    private imageResizer: ImageResizer;
    private defaultOptions: OptimizeOptions = {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85,
        format: 'webp',
        maintainAspectRatio: true,
        preserveTransparency: true,
    };

    constructor() {
        this.webpConverter = new WebPConverter();
        this.imageResizer = new ImageResizer();
    }

    /**
     * Optimiza una imagen
     */
    async optimize(file: File, options?: Partial<OptimizeOptions>): Promise<OptimizationResult> {
        const startTime = performance.now();
        const mergedOptions = { ...this.defaultOptions, ...options };

        const result: OptimizationResult = {
            success: false,
            originalSize: file.size,
            optimizedSize: 0,
            reductionPercentage: 0,
            originalFormat: file.type,
            optimizedFormat: mergedOptions.format!,
        };

        try {
            // 1. Verificar que es una imagen
            if (!file.type.startsWith('image/')) {
                throw new Error('El archivo debe ser una imagen');
            }

            // 2. Verificar tamaño máximo (10MB)
            const MAX_SIZE = 10 * 1024 * 1024; // 10MB
            if (file.size > MAX_SIZE) {
                throw new Error(`La imagen es demasiado grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Máximo: 10MB`);
            }

            // 3. Cargar imagen para obtener dimensiones
            const image = await this.loadImage(file);
            const originalDimensions = { width: image.width, height: image.height };

            // 4. Redimensionar si es necesario
            const newDimensions = await this.imageResizer.resizeImage(
                image,
                mergedOptions.maxWidth!,
                mergedOptions.maxHeight!,
                mergedOptions.maintainAspectRatio
            );

            // 5. Crear canvas con nuevas dimensiones
            const canvas = document.createElement('canvas');
            canvas.width = newDimensions.width;
            canvas.height = newDimensions.height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('No se pudo obtener contexto 2D');
            }

            // 6. Configurar canvas para transparencia si es PNG
            if ((file.type === 'image/png' || file.type === 'image/gif') && mergedOptions.preserveTransparency) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }

            // 7. Dibujar imagen redimensionada
            ctx.drawImage(image, 0, 0, newDimensions.width, newDimensions.height);

            // 8. Convertir al formato deseado
            const mimeType = this.getMimeType(mergedOptions.format!);
            const blob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob(
                    (b) => resolve(b),
                    mimeType,
                    mergedOptions.quality
                );
            });

            if (!blob) {
                throw new Error('No se pudo convertir la imagen');
            }

            // 9. Crear File desde Blob
            const optimizedFileName = this.getOptimizedFileName(file.name, mergedOptions.format!);
            const optimizedFile = new File([blob], optimizedFileName, {
                type: mimeType,
                lastModified: Date.now(),
            });

            const endTime = performance.now();
            const processingTime = endTime - startTime;

            // 10. Calcular métricas
            const reductionPercentage = this.calculateReduction(file.size, blob.size);

            // 11. Registrar log
            this.logOptimization({

                originalFile: {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                },
                optimizedFile: {
                    name: optimizedFileName,
                    type: mimeType,
                    size: blob.size,
                },
                processingTime,
                reductionPercentage,
            });

            // 12. Retornar resultado
            return {
                success: true,
                file: optimizedFile,
                originalSize: file.size,
                optimizedSize: blob.size,
                reductionPercentage,
                originalFormat: file.type,
                optimizedFormat: mergedOptions.format!,
                dimensions: {
                    original: originalDimensions,
                    optimized: newDimensions,
                },
            };

        } catch (error) {
            const endTime = performance.now();
            const processingTime = endTime - startTime;

            this.logOptimization({

                originalFile: {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                },
                processingTime,
                error: error instanceof Error ? error.message : 'Error desconocido',
            });

            return {
                ...result,
                error: error instanceof Error ? error.message : 'Error desconocido',
            };
        }
    }

    /**
     * Carga una imagen
     */
    private loadImage(file: File): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const image = new Image();
            const url = URL.createObjectURL(file);

            image.onload = () => {
                URL.revokeObjectURL(url);
                resolve(image);
            };

            image.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('No se pudo cargar la imagen'));
            };

            image.src = url;
        });
    }

    /**
     * Obtiene MIME type según formato
     */
    private getMimeType(format: 'webp' | 'jpeg' | 'png'): string {
        const mimeTypes = {
            webp: 'image/webp',
            jpeg: 'image/jpeg',
            png: 'image/png',
        };
        return mimeTypes[format];
    }

    /**
     * Genera nombre de archivo optimizado
     */
    private getOptimizedFileName(originalName: string, format: string): string {
        const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
        const timestamp = Date.now();
        return `${nameWithoutExt}-optimized-${timestamp}.${format}`;
    }

    /**
     * Calcula porcentaje de reducción
     */
    private calculateReduction(originalSize: number, optimizedSize: number): number {
        return Math.round(((originalSize - optimizedSize) / originalSize) * 100);
    }

    /**
     * Registra operación de optimización
     */
    private logOptimization(log: Omit<LogEntry, 'operation' | 'timestamp' | 'processingTime'> & {
        processingTime: number;
    }): void {


        console.log('🎨 Image Optimization Log:', {
            original: `${log.originalFile.name} (${this.formatBytes(log.originalFile.size)})`,
            optimized: log.optimizedFile
                ? `${log.optimizedFile.name} (${this.formatBytes(log.optimizedFile.size)})`
                : 'N/A',
            reduction: log.reductionPercentage ? `${log.reductionPercentage}%` : 'N/A',
            time: `${log.processingTime.toFixed(2)}ms`,
            error: log.error || 'None',
        });
    }

    /**
     * Formatea bytes a tamaño legible
     */
    private formatBytes(bytes: number): string {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Obtiene estadísticas de optimización
     */
    getStatistics(): {
        totalOptimizations: number;
        averageReduction: number;
        totalBytesSaved: number;
        webpConversions: number;
    } {
        // Esto podría conectarse a un sistema de logs persistente
        return {
            totalOptimizations: 0,
            averageReduction: 0,
            totalBytesSaved: 0,
            webpConversions: 0,
        };
    }
}