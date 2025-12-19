// src/shared/hooks/useImageOptimizer.ts
'use client';

import { useState, useCallback, useRef } from 'react';
import { ImageOptimizer } from '../utils/image-optimizer/ImageOptimizer';
import type { OptimizeOptions, OptimizationResult } from '../utils/image-optimizer/types';

export function useImageOptimizer() {
    const [optimizing, setOptimizing] = useState(false);
    const [lastResult, setLastResult] = useState<OptimizationResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const optimizerRef = useRef(new ImageOptimizer());

    const optimize = useCallback(async (
        file: File,
        options?: Partial<OptimizeOptions>
    ): Promise<File | null> => {
        setOptimizing(true);
        setError(null);

        try {
            const result = await optimizerRef.current.optimize(file, options);

            setLastResult(result);

            if (result.success && result.file) {
                console.log(`✅ Optimización exitosa: ${result.reductionPercentage}% de reducción`);
                return result.file;
            } else {
                const errorMsg = result.error || 'Error desconocido en optimización';
                setError(errorMsg);
                console.error('❌ Error en optimización:', errorMsg);
                return null;
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Error inesperado';
            setError(errorMsg);
            console.error('❌ Error en optimización:', err);
            return null;
        } finally {
            setOptimizing(false);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const clearLastResult = useCallback(() => {
        setLastResult(null);
    }, []);

    return {
        optimize,
        optimizing,
        lastResult,
        error,
        clearError,
        clearLastResult,
        statistics: optimizerRef.current.getStatistics(),
    };
}