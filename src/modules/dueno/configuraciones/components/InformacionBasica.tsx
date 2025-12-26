// src/modules/dueno/configuraciones/components/InformacionBasica.tsx
'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin, Store, Info } from 'lucide-react';
import type { ConfiguracionRestaurante } from '../actions/configuracionRestauranteActions';
import ImageUploader from './ImageUploader';

interface InformacionBasicaProps {
    configuracion: ConfiguracionRestaurante;
    onConfigChange: (configuracion: ConfiguracionRestaurante) => void;
}

export default function InformacionBasica({ configuracion, onConfigChange }: InformacionBasicaProps) {
    const [formData, setFormData] = useState(configuracion);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        const newValue = type === 'number' ? parseFloat(value) || 0 : value;

        const updated = { ...formData, [name]: newValue };
        setFormData(updated);
        onConfigChange(updated);
    };

    const handleImageChange = (url: string) => {
        const updated = { ...formData, logo_url: url };
        setFormData(updated);
        onConfigChange(updated);
    };

    return (
        <div className="premium-card p-10 space-y-12">
            <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 shadow-inner">
                        <Store className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Identidad Visual</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Branding y Datos de Contacto</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                        Nombre del Restaurante
                    </label>
                    <div className="relative group">
                        <Info className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="text"
                            name="nombre_restaurante"
                            value={formData.nombre_restaurante}
                            onChange={handleInputChange}
                            className="premium-input w-full pl-14"
                            placeholder="Ej: KAVVO GOURMET"
                            required
                        />
                    </div>
                </div>

                <div className="md:col-span-2">
                    <ImageUploader
                        currentImageUrl={formData.logo_url || ''}
                        onImageUpload={handleImageChange}
                    />
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                        Línea Telefónica
                    </label>
                    <div className="relative group">
                        <Phone className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="tel"
                            name="telefono"
                            value={formData.telefono || ''}
                            onChange={handleInputChange}
                            className="premium-input w-full pl-14"
                            placeholder="+57 300 000 0000"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                        Correo Electrónico
                    </label>
                    <div className="relative group">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="email"
                            name="email"
                            value={formData.email || ''}
                            onChange={handleInputChange}
                            className="premium-input w-full pl-14"
                            placeholder="hola@kavvo.com"
                        />
                    </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                        Dirección Física Principal
                    </label>
                    <div className="relative group">
                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="text"
                            name="direccion_completa"
                            value={formData.direccion_completa}
                            onChange={handleInputChange}
                            className="premium-input w-full pl-14"
                            placeholder="Calle 123 #45-67, Ciudad"
                            required
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}