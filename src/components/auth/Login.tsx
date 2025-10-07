"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/src/schemas/auth";
import Image from "next/image";

import {
    FiMail,
    FiLock,
    FiEye,
    FiEyeOff,
    FiLogIn,
    FiGlobe,
} from "react-icons/fi";
import {
    FaSpinner,
    FaExclamationTriangle
} from "react-icons/fa";
import Link from "next/link";
import { useLogin } from "@/src/hooks/useLogin";
import { useState } from "react";


export default function LoginComponent() {
    const { login, loading, isPending } = useLogin();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = (data: LoginFormData) => login(data);

    return (
        <div className="h-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-white">

            {/* Header */}
            {/* Header */}
            <header className="w-full max-w-md mb-8 text-center relative z-10">
                <Image
                    src="/assets/logo-kavvo.png"
                    alt="Logo !Bug Solutions SAS"
                    width={600}
                    height={100}
                    className="inline mx-auto mb-4"
                    style={{ width: 'auto', height: '200px', objectFit: 'contain' }}
                    priority // Para que cargue más rápido
                />
                <p className="text-gray-600 text-lg font-medium -mt-12">
                    Accede a tu panel de administración
                </p>
            </header>

            {/* Formulario */}
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-8 space-y-6 relative z-10"
            >
                {/* Email */}
                <div>
                    <label
                        htmlFor="email-input"
                        className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                    >
                        <FiMail className="text-orange-500 text-base" />
                        Correo electrónico
                    </label>
                    <div className={`flex items-center border rounded-xl px-4 py-3 bg-gray-50/50 transition-all duration-200 ${errors.email
                        ? 'border-red-400 focus-within:ring-2 focus-within:ring-red-200 focus-within:border-red-500'
                        : 'border-gray-200 focus-within:ring-2 focus-within:ring-orange-200 focus-within:border-orange-400'
                        }`}>
                        <input
                            id="email-input"
                            type="email"
                            {...register("email")}
                            className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400 font-medium"
                            placeholder="ejemplo@correo.com"
                        />
                    </div>
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-2 font-medium flex items-center gap-2">
                            <FaExclamationTriangle className="text-sm" />
                            {errors.email.message}
                        </p>
                    )}
                </div>

                {/* Password */}
                <div>
                    <label
                        htmlFor="password-input"
                        className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                    >
                        <FiLock className="text-orange-500 text-base" />
                        Contraseña
                    </label>
                    <div className={`flex items-center border rounded-xl px-4 py-3 bg-gray-50/50 transition-all duration-200 ${errors.password
                        ? 'border-red-400 focus-within:ring-2 focus-within:ring-red-200 focus-within:border-red-500'
                        : 'border-gray-200 focus-within:ring-2 focus-within:ring-orange-200 focus-within:border-orange-400'
                        }`}>
                        <input
                            id="password-input"
                            type={showPassword ? "text" : "password"}
                            {...register("password")}
                            className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400 font-medium"
                            placeholder="Ingresa tu contraseña"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="ml-3 text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100"
                            tabIndex={-1}
                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                            {showPassword ? (
                                <FiEyeOff className="text-lg" />
                            ) : (
                                <FiEye className="text-lg" />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-red-500 text-sm mt-2 font-medium flex items-center gap-2">
                            <FaExclamationTriangle className="text-sm" />
                            {errors.password.message}
                        </p>
                    )}
                </div>

                {/* Botón de envío */}
                <button
                    type="submit"
                    disabled={loading || isPending}
                    className="w-full flex items-center justify-center gap-3 bg-orange-400 hover:bg-orange-600 text-white rounded-xl py-4 transition-all duration-200 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:transform-none"
                >
                    {loading || isPending ? (
                        <>
                            <FaSpinner className="animate-spin text-xl" />
                            Iniciando sesión...
                        </>
                    ) : (
                        <>
                            <FiLogIn className="text-xl" />
                            Iniciar sesión
                        </>
                    )}
                </button>

                {/* Link de ayuda */}
                <div className="text-center pt-4 border-t border-gray-200">
                    <Link
                        href="https://www.ibug.space/"
                        target="_blank"
                        className="text-orange-600 hover:text-orange-800 font-semibold flex justify-center gap-2 transition-colors hover:underline text-sm"
                    >
                        <FiGlobe className="text-sm mt-1" />
                        ¿Problemas para acceder? Contacta a Vadya S.A.S
                    </Link>
                </div>
            </form>

            {/* Footer */}
            <footer className="mt-8 text-center text-gray-500 text-sm relative z-10">
                <div className=" flex items-center justify-center gap-2">
                    <p className="flex items-center gap-1 flex-wrap justify-center">
                        <span className="font-semibold">KAVVO</span>
                        <span >es un producto de</span>


                        <span className="font-semibold ">Vadya S.A.S</span>

                        <span>© 2025 - Todos los derechos reservados</span>
                    </p>
                </div>
            </footer>
        </div>
    );
}