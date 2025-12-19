// src/modules/dueno/reportes/hooks/useReporteFilters.ts
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const filtroSchema = z.object({
    fechaInicio: z.string().min(1, "La fecha de inicio es obligatoria"),
    fechaFin: z.string().min(1, "La fecha de fin es obligatoria"),
    estado: z.string().optional(),
    tipoOrden: z.string().optional(),
});

export type FiltrosData = z.infer<typeof filtroSchema>;

export function useReporteFilters() {
    const [filtros, setFiltros] = useState<FiltrosData>({
        fechaInicio: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
        fechaFin: new Date().toISOString().split('T')[0],
        estado: '',
        tipoOrden: ''
    });

    const { register, handleSubmit, formState, watch, reset } = useForm<FiltrosData>({
        resolver: zodResolver(filtroSchema),
        defaultValues: filtros,
        mode: 'onChange'
    });

    // Sincronizar filtros cuando cambien los valores del formulario
    useEffect(() => {
        const subscription = watch((value) => {
            setFiltros(value as FiltrosData);
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    const updateFiltro = (key: keyof FiltrosData, value: string) => {
        setFiltros(prev => ({ ...prev, [key]: value }));
    };

    return {
        filtros,
        setFiltros,
        register,
        handleSubmit,
        formState,
        reset,
        updateFiltro
    };
}