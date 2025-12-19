"use client";

import { useState } from "react";
import { UseFormRegister, FieldErrors, SubmitHandler, UseFormHandleSubmit } from "react-hook-form";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiChevronDown } from "react-icons/fi";

interface FormData {
    nombre: string;
    email: string;
    rol: "admin" | "repartidor" | "dueno";
    contraseña: string;
}

interface FormAgregarUsuarioProps {
    onClose: () => void;
    handleSubmit: UseFormHandleSubmit<FormData>;
    handleAgregar: SubmitHandler<FormData>;
    register: UseFormRegister<FormData>;
    errors: FieldErrors<FormData>;
}

export default function FormAgregarUsuario({
    onClose,
    handleSubmit,
    handleAgregar,
    register,
    errors,
}: FormAgregarUsuarioProps) {
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative">
                {/* Botón cerrar */}
                <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                    onClick={onClose}
                >
                    ✕
                </button>

                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <FiUser className="text-yellow-500 text-2xl" />
                    Agregar Usuario
                </h2>

                <form onSubmit={handleSubmit(handleAgregar)} className="space-y-5">
                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <div className="flex items-center bg-yellow-50 rounded-xl px-3 py-3 focus-within:ring-2 focus-within:ring-yellow-400">
                            <FiUser className="text-yellow-600 mr-2 text-lg" />
                            <input
                                type="text"
                                {...register("nombre")}
                                placeholder="Ej. Carlos Pérez"
                                className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400"
                            />
                        </div>
                        {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                        <div className="flex items-center bg-yellow-50 rounded-xl px-3 py-3 focus-within:ring-2 focus-within:ring-yellow-400">
                            <FiMail className="text-yellow-600 mr-2 text-lg" />
                            <input
                                type="email"
                                {...register("email")}
                                placeholder="ejemplo@correo.com"
                                className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400"
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                    </div>

                    {/* Contraseña */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <div className="flex items-center bg-yellow-50 rounded-xl px-3 py-3 focus-within:ring-2 focus-within:ring-yellow-400">
                            <FiLock className="text-yellow-600 mr-2 text-lg" />
                            <input
                                type={showPassword ? "text" : "password"}
                                {...register("contraseña")}
                                placeholder="Mínimo 6 caracteres"
                                className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400"
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="ml-2 text-gray-500 hover:text-gray-700 transition p-1"
                                tabIndex={-1}
                            >
                                {showPassword ? <FiEyeOff className="text-gray-600" /> : <FiEye className="text-gray-600" />}
                            </button>
                        </div>
                        {errors.contraseña && (
                            <p className="text-red-500 text-sm mt-1">{errors.contraseña.message}</p>
                        )}
                    </div>

                    {/* Rol */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                        <div className="flex items-center bg-yellow-50 rounded-xl px-3 py-3 focus-within:ring-2 focus-within:ring-yellow-400">
                            <FiUser className="text-yellow-600 mr-2 text-lg" />
                            <select
                                {...register("rol")}
                                className="w-full bg-transparent outline-none text-gray-800 appearance-none pr-6"
                            >
                                <option value="">Selecciona...</option>
                                <option value="admin">Administrador</option>
                                <option value="repartidor">Repartidor</option>
                                <option value="dueno">Propietario</option>
                            </select>
                            <FiChevronDown className="text-gray-400 ml-2" />
                        </div>
                        {errors.rol && <p className="text-red-500 text-sm mt-1">{errors.rol.message}</p>}
                    </div>

                    {/* Botón submit */}
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-2xl py-3 font-semibold transition"
                    >
                        <FiUser className="text-white text-lg" />
                        Agregar
                    </button>
                </form>
            </div>
        </div>
    );
}
