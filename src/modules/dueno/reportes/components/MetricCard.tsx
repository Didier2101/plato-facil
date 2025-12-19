// src/modules/dueno/reportes/components/MetricCard.tsx
'use client';

import { ReactNode } from 'react';

interface MetricCardProps {
    titulo: string;
    valor: string;
    subtitulo?: string;
    icon: ReactNode;
    colorClass?: string;
    loading?: boolean;
}

export default function MetricCard({
    titulo,
    valor,
    subtitulo,
    icon,
    colorClass = "bg-orange-500",
    loading = false
}: MetricCardProps) {
    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-gray-500 text-sm font-medium mb-1">{titulo}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{valor}</p>
                    {subtitulo && <p className="text-xs text-gray-500">{subtitulo}</p>}
                </div>
                <div className={`${colorClass} p-3 rounded-lg`}>
                    <div className="text-white text-xl">
                        {icon}
                    </div>
                </div>
            </div>
        </div>
    );
}