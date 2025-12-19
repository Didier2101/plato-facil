// src/shared/utils/image-optimizer/types.ts
export type ImageFormat = 'webp' | 'jpeg' | 'png';

export interface OptimizeOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number; // 0.0 - 1.0
    format?: ImageFormat;
    maintainAspectRatio?: boolean;
    preserveTransparency?: boolean; // Para PNG con transparencia
}

export interface OptimizationResult {
    success: boolean;
    file?: File;
    originalSize: number; // bytes
    optimizedSize: number; // bytes
    reductionPercentage: number; // %
    originalFormat: string;
    optimizedFormat: ImageFormat;
    dimensions?: {
        original: { width: number; height: number };
        optimized: { width: number; height: number };
    };
    error?: string;
}

export interface LogEntry {
    timestamp: string;
    operation: string;
    originalFile: {
        name: string;
        type: string;
        size: number;
    };
    optimizedFile?: {
        name: string;
        type: string;
        size: number;
    };
    processingTime: number; // ms
    reductionPercentage?: number;
    error?: string;
}