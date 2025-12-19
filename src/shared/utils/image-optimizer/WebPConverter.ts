// src/shared/utils/image-optimizer/WebPConverter.ts
import { LogEntry } from './types';
export class WebPConverter {
    private logs: LogEntry[] = [];
    private maxLogs = 50; // Mantener solo los últimos 50 logs

    /**
     * Convierte una imagen a WebP
     */
    async convertToWebP(
        file: File,
        quality: number = 0.8
    ): Promise<{ success: boolean; blob?: Blob; error?: string }> {
        const startTime = performance.now();
        const logEntry: LogEntry = {
            timestamp: new Date().toISOString(),
            operation: 'convertToWebP',
            originalFile: {
                name: file.name,
                type: file.type,
                size: file.size,
            },
            processingTime: 0,
        };

        try {
            if (!file.type.startsWith('image/')) {
                throw new Error('El archivo no es una imagen válida');
            }

            // Crear imagen HTML
            const image = await this.loadImage(file);

            // Crear canvas
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;

            // Dibujar imagen en canvas
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('No se pudo obtener contexto 2D');
            }

            // Para PNG con transparencia
            if (file.type === 'image/png' || file.type === 'image/gif') {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }

            ctx.drawImage(image, 0, 0);

            // Convertir a WebP
            const webpBlob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob(
                    (blob) => resolve(blob),
                    'image/webp',
                    quality
                );
            });

            if (!webpBlob) {
                throw new Error('No se pudo convertir a WebP');
            }

            const endTime = performance.now();
            logEntry.processingTime = endTime - startTime;
            logEntry.optimizedFile = {
                name: this.replaceExtension(file.name, 'webp'),
                type: 'image/webp',
                size: webpBlob.size,
            };
            logEntry.reductionPercentage = this.calculateReduction(file.size, webpBlob.size);

            this.addLog(logEntry);

            return {
                success: true,
                blob: webpBlob,
            };

        } catch (error) {
            const endTime = performance.now();
            logEntry.processingTime = endTime - startTime;
            logEntry.error = error instanceof Error ? error.message : 'Error desconocido';

            this.addLog(logEntry);

            return {
                success: false,
                error: logEntry.error,
            };
        }
    }

    /**
     * Verifica si el navegador soporta WebP
     */
    isWebPSupported(): boolean {
        return document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    /**
     * Carga una imagen desde File
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
     * Reemplaza la extensión del archivo
     */
    private replaceExtension(filename: string, newExt: string): string {
        const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
        return `${nameWithoutExt}.${newExt}`;
    }

    /**
     * Calcula porcentaje de reducción
     */
    private calculateReduction(originalSize: number, optimizedSize: number): number {
        return Math.round(((originalSize - optimizedSize) / originalSize) * 100);
    }

    /**
     * Agrega log al historial
     */
    private addLog(log: LogEntry): void {
        this.logs.unshift(log);
        if (this.logs.length > this.maxLogs) {
            this.logs.pop();
        }
    }

    /**
     * Obtiene logs recientes
     */
    getLogs(): LogEntry[] {
        return [...this.logs];
    }

    /**
     * Limpia logs
     */
    clearLogs(): void {
        this.logs = [];
    }
}