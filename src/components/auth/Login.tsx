"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/src/schemas/auth";
import { useState, useTransition } from "react";
import Swal from "sweetalert2";

import {
    FiMail,
    FiLock,
    FiEye,
    FiEyeOff,
    FiLogIn,
    FiUser,
    FiGlobe,
    FiShield
} from "react-icons/fi";
import {
    FaSpinner,
    FaExclamationTriangle
} from "react-icons/fa";
import Link from "next/link";
import { loginWithRedirect } from "@/src/actions/login/actions";

export default function LoginComponent() {
    const [isPending, startTransition] = useTransition();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);



    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = (data: LoginFormData) => {
        const formData = new FormData();
        formData.append('email', data.email);
        formData.append('password', data.password);

        setLoading(true);

        startTransition(async () => {
            const result = await loginWithRedirect(formData);

            setLoading(false);

            // Si hubo error, loginWithRedirect retorna {success:false, error:...}
            if (result && !result.success) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de Acceso',
                    text: result.error ?? 'Credenciales incorrectas',
                    confirmButtonColor: '#f97316',
                });
            }

            // Si fue success, el servidor ya hizo redirect() y el navegador navegó.
        });
    };


    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Elementos decorativos de fondo */}

            {/* Header */}
            <header className="w-full max-w-md mb-8 text-center relative z-10">
                <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="bg-white p-4 rounded-2xl shadow-lg border border-orange-100">
                        <FiUser className="text-orange-500 text-3xl" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                            PlatoFácil
                        </h1>
                        <p className="text-sm text-gray-500 font-medium mt-1">Sistema de Gestión</p>
                    </div>
                </div>
                <p className="text-gray-600 text-lg font-medium">
                    Accede a tu panel de administración
                </p>
            </header>

            {/* Formulario */}
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-8 space-y-6 relative z-10"
            >
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                        <FiShield className="text-orange-500" />
                        Iniciar Sesión
                    </h2>
                    <p className="text-gray-500 text-sm">
                        Ingresa tus credenciales para acceder al sistema
                    </p>
                </div>

                {/* Email */}
                <div>
                    <label className=" text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FiMail className="text-orange-500 text-base" />
                        Correo electrónico
                    </label>
                    <div className={`flex items-center border rounded-xl px-4 py-3 bg-gray-50/50 transition-all duration-200 ${errors.email
                        ? 'border-red-400 focus-within:ring-2 focus-within:ring-red-200 focus-within:border-red-500'
                        : 'border-gray-200 focus-within:ring-2 focus-within:ring-orange-200 focus-within:border-orange-400'
                        }`}>
                        <input
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

                {/* Contraseña */}
                <div>
                    <label className=" text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FiLock className="text-orange-500 text-base" />
                        Contraseña
                    </label>
                    <div className={`flex items-center border rounded-xl px-4 py-3 bg-gray-50/50 transition-all duration-200 ${errors.password
                        ? 'border-red-400 focus-within:ring-2 focus-within:ring-red-200 focus-within:border-red-500'
                        : 'border-gray-200 focus-within:ring-2 focus-within:ring-orange-200 focus-within:border-orange-400'
                        }`}>
                        <input
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

                {/* Botón */}
                <button
                    type="submit"
                    disabled={loading || isPending}
                    className="w-full flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-4 transition-all duration-200 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:transform-none"
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

                {/* Enlace a iBug Solutions */}
                <div className="text-center pt-4 border-t border-gray-200">
                    <Link
                        href="https://www.ibug.space/"
                        target="_blank"
                        className="text-orange-600 hover:text-orange-800 font-semibold flex items-center justify-center gap-2 transition-colors hover:underline text-sm"
                    >
                        <FiGlobe className="text-sm" />
                        ¿Problemas para acceder? Contacta a !Bug Solutions SAS
                    </Link>
                </div>
            </form>


            {/* Footer */}
            <footer className="mt-8 text-center text-gray-500 text-sm relative z-10">
                <div className="bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 border border-gray-200">
                    <p>© 2025 !Bug Solutions SAS - Todos los derechos reservados</p>
                </div>
            </footer>
        </div>
    );
}