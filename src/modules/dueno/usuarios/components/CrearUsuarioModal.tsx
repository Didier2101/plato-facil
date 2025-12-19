// src/modules/dueno/usuarios/components/CrearUsuarioModal.tsx
'use client';

import { useState } from 'react';
import { FiUser, FiMail, FiLock, FiX, FiSave } from 'react-icons/fi';
import { TbFidgetSpinner } from 'react-icons/tb';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import FormField from './FormField';
import type { CrearUsuarioData } from '../schemas/usuarioSchema';

interface CrearUsuarioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    register: UseFormRegister<CrearUsuarioData>;
    errors: FieldErrors<CrearUsuarioData>;
    saving: boolean;
}

export default function CrearUsuarioModal({
    isOpen,
    onClose,
    onSubmit,
    register,
    errors,
    saving
}: CrearUsuarioModalProps) {
    const [showPassword, setShowPassword] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-md">
                {/* Header del Modal */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <FiUser className="text-orange-500" />
                        Agregar Nuevo Usuario
                    </h2>
                    <button
                        className="text-gray-400 hover:text-gray-600 transition p-1"
                        onClick={onClose}
                        disabled={saving}
                    >
                        <FiX size={24} />
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={onSubmit} className="p-6 space-y-4">
                    <FormField
                        label="Nombre Completo"
                        name="nombre"
                        type="text"
                        placeholder="Ej: Carlos Pérez"
                        icon={<FiUser className="text-gray-400" />}
                        register={register}
                        error={errors.nombre?.message}
                        required
                    />

                    <FormField
                        label="Correo Electrónico"
                        name="email"
                        type="email"
                        placeholder="ejemplo@correo.com"
                        icon={<FiMail className="text-gray-400" />}
                        register={register}
                        error={errors.email?.message}
                        required
                    />

                    <FormField
                        label="Contraseña"
                        name="contraseña"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        icon={<FiLock className="text-gray-400" />}
                        register={register}
                        error={errors.contraseña?.message}
                        required
                        showPasswordToggle
                        showPassword={showPassword}
                        onTogglePassword={() => setShowPassword(!showPassword)}
                    />

                    <FormField
                        label="Rol"
                        name="rol"
                        type="select"
                        icon={<FiUser className="text-gray-400" />}
                        register={register}
                        error={errors.rol?.message}
                        required
                        options={[
                            { value: 'admin', label: 'Administrador' },
                            { value: 'repartidor', label: 'Repartidor' },
                            { value: 'dueno', label: 'Propietario' }
                        ]}
                    />

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <TbFidgetSpinner className="animate-spin" />
                                    <span>Creando...</span>
                                </>
                            ) : (
                                <>
                                    <FiSave />
                                    <span>Crear Usuario</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}