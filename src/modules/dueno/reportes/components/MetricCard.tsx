// src/modules/dueno/reportes/components/MetricCard.tsx
'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

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
    loading = false
}: MetricCardProps) {
    if (loading) {
        return (
            <div className="premium-card p-8 animate-pulse">
                <div className="space-y-4">
                    <div className="h-3 bg-slate-100 rounded-full w-24"></div>
                    <div className="h-8 bg-slate-100 rounded-full w-32"></div>
                    <div className="h-3 bg-slate-100 rounded-full w-40"></div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-2xl shadow-slate-200/50 group relative overflow-hidden transition-all duration-500"
        >
            {/* Background Decor */}
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <div className="h-24 w-24 -mr-8 -mt-8 text-slate-900 group-hover:text-orange-500 transition-colors">
                    {icon}
                </div>
            </div>

            <div className="flex items-start justify-between relative z-10">
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{titulo}</p>
                    <div className="space-y-1">
                        <p className="text-4xl font-black text-slate-900 tracking-tighter">
                            {valor}
                        </p>
                        {subtitulo && (
                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest leading-loose">
                                {subtitulo}
                            </p>
                        )}
                    </div>
                </div>

                <div className="h-14 w-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white group-hover:bg-orange-500 group-hover:shadow-lg group-hover:shadow-orange-200 transition-all duration-500">
                    <div className="h-6 w-6 text-orange-500 group-hover:text-white transition-colors">
                        {icon}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}