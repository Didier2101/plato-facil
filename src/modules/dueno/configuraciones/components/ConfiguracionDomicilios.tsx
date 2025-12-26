// src/modules/dueno/configuraciones/components/ConfiguracionDomicilios.tsx
'use client';

import { useState } from 'react';
import {
    DollarSign,
    Clock,
    Globe,
    Calendar,
    Ruler,
    Calculator,
    Truck,
    ShieldAlert
} from 'lucide-react';
import type { ConfiguracionRestaurante } from '../actions/configuracionRestauranteActions';

interface ConfiguracionDomiciliosProps {
    configuracion: ConfiguracionRestaurante;
    onConfigChange: (configuracion: ConfiguracionRestaurante) => void;
}

export default function ConfiguracionDomicilios({
    configuracion,
    onConfigChange
}: ConfiguracionDomiciliosProps) {
    const [formData, setFormData] = useState(configuracion);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        const newValue = type === 'number' ? parseFloat(value) || 0 : value;

        const updated = { ...formData, [name]: newValue };
        setFormData(updated);
        onConfigChange(updated);
    };

    const calcularCostoEjemplo = (distancia: number) => {
        if (distancia <= formData.distancia_base_km) {
            return formData.costo_base_domicilio;
        }
        const distanciaExtra = distancia - formData.distancia_base_km;
        return formData.costo_base_domicilio + (distanciaExtra * formData.costo_por_km);
    };

    return (
        <div className="premium-card p-10 space-y-12 h-full">
            <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 shadow-inner">
                        <Truck className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Reglas de Logística</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Parámetros de Entrega y Tiempos</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                        <DollarSign className="h-3 w-3 text-orange-500" /> Costo Base
                    </label>
                    <div className="relative group">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 group-focus-within:text-orange-500 transition-colors">$</span>
                        <input
                            type="number"
                            name="costo_base_domicilio"
                            value={formData.costo_base_domicilio}
                            onChange={handleInputChange}
                            className="premium-input w-full pl-12"
                            step="500"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                        <Ruler className="h-3 w-3 text-orange-500" /> Distancia Base
                    </label>
                    <div className="relative group">
                        <input
                            type="number"
                            name="distancia_base_km"
                            value={formData.distancia_base_km}
                            onChange={handleInputChange}
                            className="premium-input w-full pr-16"
                            step="0.1"
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest">KM</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                        <DollarSign className="h-3 w-3 text-orange-500" /> Costo por KM Extra
                    </label>
                    <div className="relative group">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 group-focus-within:text-orange-500 transition-colors">$</span>
                        <input
                            type="number"
                            name="costo_por_km"
                            value={formData.costo_por_km}
                            onChange={handleInputChange}
                            className="premium-input w-full pl-12"
                            step="100"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                        <Globe className="h-3 w-3 text-orange-500" /> Cobertura Máxima
                    </label>
                    <div className="relative group">
                        <input
                            type="number"
                            name="distancia_maxima_km"
                            value={formData.distancia_maxima_km}
                            onChange={handleInputChange}
                            className="premium-input w-full pr-16"
                            step="0.5"
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest">KM</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                        <Clock className="h-3 w-3 text-orange-500" /> Prep. Estimado
                    </label>
                    <div className="relative group">
                        <input
                            type="number"
                            name="tiempo_preparacion_min"
                            value={formData.tiempo_preparacion_min}
                            onChange={handleInputChange}
                            className="premium-input w-full pr-16"
                            step="5"
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest">MIN</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-orange-500" /> Horario Operativo
                    </label>
                    <div className="flex gap-4">
                        <input
                            type="time"
                            name="hora_apertura"
                            value={formData.hora_apertura || '08:00'}
                            onChange={handleInputChange}
                            className="premium-input w-full !px-4 text-center"
                        />
                        <input
                            type="time"
                            name="hora_cierre"
                            value={formData.hora_cierre || '22:00'}
                            onChange={handleInputChange}
                            className="premium-input w-full !px-4 text-center"
                        />
                    </div>
                </div>
            </div>

            {/* Simulación de Costos */}
            <div className="bg-slate-50 rounded-[2rem] p-8 space-y-6 border border-slate-100">
                <div className="flex items-center gap-3">
                    <Calculator className="h-4 w-4 text-orange-500" />
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Configurador de Tarifas KAVVO</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 3, 5].map(km => (
                        <div key={km} className="bg-white p-5 rounded-2xl border-2 border-slate-50 shadow-sm flex flex-col items-center gap-2">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{km} KM Recorrido</p>
                            <p className="text-xl font-black text-slate-900">${calcularCostoEjemplo(km).toLocaleString()}</p>
                        </div>
                    ))}
                </div>

                <div className="flex items-start gap-3 p-4 bg-orange-50/50 rounded-xl border border-orange-100">
                    <ShieldAlert className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                    <p className="text-[9px] font-bold text-orange-700 uppercase leading-relaxed tracking-wider">
                        El sistema calculará automáticamente el costo excedente basándose en la distancia GPS entre el establecimiento y el destino del cliente.
                    </p>
                </div>
            </div>
        </div>
    );
}