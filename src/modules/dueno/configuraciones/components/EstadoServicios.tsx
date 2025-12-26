// src/modules/dueno/configuraciones/components/EstadoServicios.tsx
'use client';

import { Store, Bike, ToggleLeft, ToggleRight, Activity } from 'lucide-react';
import { useConfiguracionMutaciones } from '../hooks/useConfiguracionMutaciones';
import { motion } from 'framer-motion';

interface EstadoServiciosProps {
    domicilioActivo: boolean;
    establecimientoActivo: boolean;
    onToggle?: (tipo: 'domicilio' | 'establecimiento', activo: boolean) => void;
}

export default function EstadoServicios({
    domicilioActivo,
    establecimientoActivo,
    onToggle
}: EstadoServiciosProps) {
    const { toggleServicio, saving } = useConfiguracionMutaciones();

    const handleToggle = async (tipo: 'domicilio' | 'establecimiento', activo: boolean) => {
        const resultado = await toggleServicio(tipo, activo);
        if (resultado.success && onToggle) {
            onToggle(tipo, activo);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4 mb-2">
                <div className="h-10 w-10 bg-slate-900 rounded-2xl flex items-center justify-center text-orange-500 shadow-xl">
                    <Activity className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Estado Global de Servicios</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Control maestro de disponibilidad</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Venta en Establecimiento */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="premium-card p-8 group border-2 border-slate-50 hover:border-orange-100 transition-all"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-5">
                            <div className="h-16 w-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-inner">
                                <Store className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 tracking-tighter uppercase">Establecimiento</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">Pedidos para recoger o en mesa</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleToggle('establecimiento', !establecimientoActivo)}
                            disabled={saving}
                            className="relative focus:outline-none transition-all active:scale-90 group/toggle"
                            aria-label={establecimientoActivo ? 'Desactivar establecimiento' : 'Activar establecimiento'}
                        >
                            {establecimientoActivo ? (
                                <ToggleRight className="h-12 w-12 text-orange-500 group-hover/toggle:text-orange-600 drop-shadow-sm" />
                            ) : (
                                <ToggleLeft className="h-12 w-12 text-slate-200 group-hover/toggle:text-slate-300" />
                            )}
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${establecimientoActivo ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${establecimientoActivo ? 'text-green-600' : 'text-slate-400'}`}>
                            {establecimientoActivo ? 'Servicio Operativo' : 'Servicio Cerrado'}
                        </span>
                    </div>
                </motion.div>

                {/* Servicio a Domicilio */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="premium-card p-8 group border-2 border-slate-50 hover:border-orange-100 transition-all"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-5">
                            <div className="h-16 w-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-inner">
                                <Bike className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 tracking-tighter uppercase">Domicilios</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">Entregas a puerta de cliente</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleToggle('domicilio', !domicilioActivo)}
                            disabled={saving}
                            className="relative focus:outline-none transition-all active:scale-90 group/toggle"
                            aria-label={domicilioActivo ? 'Desactivar domicilio' : 'Activar domicilio'}
                        >
                            {domicilioActivo ? (
                                <ToggleRight className="h-12 w-12 text-orange-500 group-hover/toggle:text-orange-600 drop-shadow-sm" />
                            ) : (
                                <ToggleLeft className="h-12 w-12 text-slate-200 group-hover/toggle:text-slate-300" />
                            )}
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${domicilioActivo ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${domicilioActivo ? 'text-green-600' : 'text-slate-400'}`}>
                            {domicilioActivo ? 'Servicio Operativo' : 'Servicio Cerrado'}
                        </span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}