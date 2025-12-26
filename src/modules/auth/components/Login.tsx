// src/modules/auth/components/Login.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import Link from 'next/link';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    LogIn,
    Globe,
    RotateCw,
    AlertCircle,
    CheckCircle2,
    ChefHat,
    Shield
} from 'lucide-react';
import { loginSchema, type LoginFormData } from '../schemas/auth';
import { useLogin } from '../hooks/useLogin';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginComponent() {
    const { login, loading, error, resetError } = useLogin();
    const [showPassword, setShowPassword] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        watch,
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: 'onChange',
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const emailValue = watch('email');
    const passwordValue = watch('password');

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (error && (emailValue || passwordValue)) {
            resetError();
        }
    }, [emailValue, passwordValue, error, resetError]);

    const onSubmit = (data: LoginFormData) => {
        login(data);
    };

    if (!isMounted) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 relative overflow-hidden">
            {/* Background elements for depth */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-200/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-200/40 blur-[120px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-lg bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200 border-2 border-white relative z-10 overflow-hidden"
            >
                {/* Header Decoration */}
                <div className="bg-slate-900 p-12 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent" />

                    <motion.div
                        initial={{ rotate: -10, scale: 0.8 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="relative z-10 mx-auto w-32 h-32 bg-white/10 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center border border-white/10 shadow-2xl mb-8"
                    >
                        <ChefHat className="h-16 w-16 text-orange-500" />
                    </motion.div>

                    <h1 className="relative z-10 text-3xl font-black text-white tracking-tighter uppercase mb-2">
                        Kavvo <span className="text-orange-500">Dashboard</span>
                    </h1>
                    <p className="relative z-10 text-white/40 font-black text-[10px] uppercase tracking-[0.4em]">
                        Gestión Inteligente de Restaurantes
                    </p>
                </div>

                {/* Form Section */}
                <div className="p-12 pt-10">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-red-50 border-2 border-red-100 rounded-3xl p-6 flex items-start gap-4 text-red-600 shadow-sm"
                                >
                                    <AlertCircle className="h-6 w-6 shrink-0" />
                                    <p className="text-xs font-black uppercase tracking-wider leading-relaxed">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Email Field */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 px-2">
                                <Mail className="h-4 w-4 text-orange-500" />
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Correo Electrónico</label>
                            </div>
                            <div className="relative group">
                                <input
                                    type="email"
                                    {...register('email')}
                                    className="premium-input pl-6 pr-12 font-black text-slate-900 uppercase text-xs"
                                    placeholder="USUARIO@RESTAURANTE.COM"
                                    disabled={loading}
                                />
                                {!errors.email && emailValue && (
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-green-500">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                )}
                            </div>
                            {errors.email && (
                                <p className="px-2 text-[9px] font-black text-red-500 uppercase tracking-widest">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 px-2">
                                <Lock className="h-4 w-4 text-orange-500" />
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Contraseña Secreta</label>
                            </div>
                            <div className="relative group">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    {...register('password')}
                                    className="premium-input pl-6 pr-16 font-black text-slate-900 text-xs"
                                    placeholder="••••••••••••"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors"
                                    disabled={loading}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="px-2 text-[9px] font-black text-red-500 uppercase tracking-widest">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !isValid}
                            className="w-full bg-slate-900 hover:bg-orange-500 disabled:opacity-30 text-white p-6 rounded-3xl font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-slate-200 hover:shadow-orange-200 transition-all active:scale-95 flex items-center justify-center gap-4 group"
                        >
                            {loading ? (
                                <>
                                    <RotateCw className="h-6 w-6 animate-spin" />
                                    Verificando...
                                </>
                            ) : (
                                <>
                                    <LogIn className="h-6 w-6 group-hover:scale-110 transition-transform" />
                                    Entrar al Sistema
                                </>
                            )}
                        </button>

                        <div className="pt-8 border-t border-slate-50 flex flex-col items-center gap-6">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Shield className="h-3 w-3" /> Acceso Protegido por Kavvo Cloud
                            </p>

                            <Link
                                href="https://www.ibug.space/"
                                target="_blank"
                                className="flex items-center gap-3 px-6 py-3 bg-slate-50 hover:bg-orange-50 rounded-2xl transition-all group"
                            >
                                <Globe className="h-4 w-4 text-slate-300 group-hover:text-orange-500" />
                                <span className="text-[9px] font-black text-slate-400 group-hover:text-slate-900 uppercase tracking-widest">Soporte Aurora Luminis S.A.S</span>
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Footer Credits */}
                <div className="bg-slate-50 p-8 text-center border-t border-slate-100">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">
                        © {new Date().getFullYear()} KAVVO ECOSYSTEM
                    </p>
                </div>
            </motion.div>
        </div>
    );
}