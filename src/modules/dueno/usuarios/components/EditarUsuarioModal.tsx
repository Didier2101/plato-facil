"use client";

import { User, Mail, X, Save, ShieldCheck, Sparkles } from 'lucide-react';
import { TbFidgetSpinner } from 'react-icons/tb';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import FormField from './FormField';
import type { EditarUsuarioData } from '../schemas/usuarioSchema';

interface EditarUsuarioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    register: UseFormRegister<EditarUsuarioData>;
    errors: FieldErrors<EditarUsuarioData>;
    saving: boolean;
}

export default function EditarUsuarioModal({
    isOpen,
    onClose,
    onSubmit,
    register,
    errors,
    saving
}: EditarUsuarioModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Premium Overay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-[100]"
                    />

                    {/* High-End Modal Content */}
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="
                            fixed inset-x-0 bottom-0 z-[101] lg:inset-auto 
                            lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2
                            bg-white 
                            rounded-t-[3.5rem] lg:rounded-[3.5rem] 
                            shadow-2xl
                            lg:max-w-md lg:w-full
                            flex flex-col overflow-hidden
                            border-t-8 border-orange-500 lg:border-t-0
                        "
                    >
                        {/* Mobile Handle */}
                        <div className="lg:hidden w-16 h-1.5 bg-gray-200 rounded-full mx-auto mt-4 mb-2 opacity-50" />

                        <div className="p-8 space-y-8">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl">
                                        <User className="h-7 w-7 text-orange-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-tight">
                                            Editar Perfil
                                        </h2>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                            <ShieldCheck className="h-3 w-3" />
                                            Gestión de Acceso
                                        </p>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </motion.button>
                            </div>

                            {/* Form */}
                            <form onSubmit={onSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <FormField
                                        label="Nombre Completo"
                                        name="nombre"
                                        type="text"
                                        placeholder="EJ: CARLOS PÉREZ"
                                        icon={<User className="text-slate-300" />}
                                        register={register}
                                        error={errors.nombre?.message}
                                        required
                                    />

                                    <FormField
                                        label="Correo Corporativo"
                                        name="email"
                                        type="email"
                                        placeholder="EJEMPLO@KAVVO.COM"
                                        icon={<Mail className="text-slate-300" />}
                                        register={register}
                                        error={errors.email?.message}
                                        required
                                    />

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 ml-1">
                                            <Sparkles className="h-3 w-3 text-orange-500" />
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                Nivel de Autorización
                                            </label>
                                        </div>
                                        <FormField
                                            label=""
                                            name="rol"
                                            type="select"
                                            register={register}
                                            error={errors.rol?.message}
                                            required
                                            options={[
                                                { value: 'admin', label: 'ADMINISTRADOR DE SISTEMA' },
                                                { value: 'repartidor', label: 'REPARTIDOR LOGÍSTICO' },
                                                { value: 'dueno', label: 'PROPIETARIO ESTABLECIMIENTO' }
                                            ]}
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-3 pt-4">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={saving}
                                        className="w-full bg-slate-900 hover:bg-orange-500 text-white h-16 rounded-[1.5rem] font-black flex items-center justify-center gap-3 transition-all duration-300 shadow-xl hover:shadow-orange-200 disabled:opacity-50 disabled:bg-slate-400"
                                    >
                                        {saving ? (
                                            <div className="flex items-center gap-3">
                                                <TbFidgetSpinner className="h-5 w-5 animate-spin" />
                                                <span className="uppercase tracking-widest text-xs">Guardando...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <Save className="h-5 w-5" />
                                                <span className="uppercase tracking-widest text-xs">Actualizar Miembro</span>
                                            </>
                                        )}
                                    </motion.button>

                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={saving}
                                        className="h-14 w-full bg-transparent text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-slate-900 transition-colors"
                                    >
                                        Descartar Cambios
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
