// src/shared/utils/image-optimizer/ImageResizer.ts
export class ImageResizer {
    /**
     * Redimensiona una imagen manteniendo aspecto
     */
    async resizeImage(
        image: HTMLImageElement,
        maxWidth: number,
        maxHeight: number,
        maintainAspectRatio: boolean = true
    ): Promise<{ width: number; height: number }> {
        let newWidth = image.width;
        let newHeight = image.height;

        // Si la imagen es más grande que los máximos, redimensionar
        if (image.width > maxWidth || image.height > maxHeight) {
            if (maintainAspectRatio) {
                const ratio = Math.min(maxWidth / image.width, maxHeight / image.height);
                newWidth = Math.round(image.width * ratio);
                newHeight = Math.round(image.height * ratio);
            } else {
                newWidth = maxWidth;
                newHeight = maxHeight;
            }
        }

        return { width: newWidth, height: newHeight };
    }

    /**
     * Verifica si necesita redimensionamiento
     */
    needsResizing(
        image: HTMLImageElement,
        maxWidth: number,
        maxHeight: number
    ): boolean {
        return image.width > maxWidth || image.height > maxHeight;
    }

    /**
     * Obtiene las dimensiones de una imagen
     */
    async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
        return new Promise((resolve, reject) => {
            const image = new Image();
            const url = URL.createObjectURL(file);

            image.onload = () => {
                URL.revokeObjectURL(url);
                resolve({ width: image.width, height: image.height });
            };

            image.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('No se pudo obtener dimensiones de la imagen'));
            };

            image.src = url;
        });
    }
}