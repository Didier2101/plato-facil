// src/modules/dueno/configuraciones/components/InformacionBasica.tsx
'use client';

import { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Información Básica
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Nombre del Restaurante *
                    </label>
                    <input
                        type="text"
                        name="nombre_restaurante"
                        value={formData.nombre_restaurante}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                        placeholder="Ej: Mi Restaurante"
                        required
                    />
                </div>

                <div className="md:col-span-2">
                    <ImageUploader
                        currentImageUrl={formData.logo_url || ''}
                        onImageUpload={handleImageChange}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FaPhone className="text-orange-500" />
                        Teléfono
                    </label>
                    <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                        placeholder="+57 123 456 7890"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FaEnvelope className="text-orange-500" />
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                        placeholder="contacto@mirestaurante.com"
                    />
                </div>

                <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-orange-500" />
                        Dirección Completa *
                    </label>
                    <input
                        type="text"
                        name="direccion_completa"
                        value={formData.direccion_completa}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                        placeholder="Calle 123 #45-67, Ciudad"
                        required
                    />
                </div>
            </div>
        </div>
    );
}