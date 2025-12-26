"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, LogIn, ArrowLeft, Home, Search, ChefHat } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-orange-100/30 blur-[150px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-slate-200/40 blur-[150px] rounded-full" />

            <div className="relative z-10 w-full max-w-2xl text-center">
                {/* Visual Header */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-12 relative"
                >
                    <div className="mx-auto w-40 h-40 bg-white rounded-[3rem] shadow-2xl flex items-center justify-center ring-[20px] ring-white/50 border-2 border-slate-50">
                        <motion.div
                            animate={{
                                rotate: [0, 10, -10, 0],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <ChefHat className="h-20 w-20 text-orange-500" />
                        </motion.div>
                    </div>
                </motion.div>

                {/* 404 Error Code */}
                <div className="relative mb-6">
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-[12rem] font-black leading-none text-slate-900 tracking-tighter opacity-10"
                    >
                        404
                    </motion.h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
                            Plato No <span className="text-orange-500">Encontrado</span>
                        </h2>
                    </div>
                </div>

                {/* Message */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mb-12 max-w-xs mx-auto leading-loose"
                >
                    Parece que esta página se ha esfumado del menú. ¿Te gustaría volver al inicio?
                </motion.p>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                    <Link
                        href="/domicilios"
                        className="bg-slate-900 text-white px-8 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 hover:bg-orange-500 hover:shadow-orange-100 transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                        <ShoppingBag className="h-5 w-5" />
                        Pedir Algo Rico
                    </Link>

                    <Link
                        href="/login"
                        className="bg-white border-2 border-slate-100 text-slate-600 px-8 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:border-orange-200 hover:text-orange-500 transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                        <LogIn className="h-5 w-5" />
                        Iniciar Sesión
                    </Link>
                </div>

                {/* Secondary Actions */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-12 flex items-center justify-center gap-8"
                >
                    <button
                        onClick={() => window.history.back()}
                        className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest flex items-center gap-2 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" /> Volver Atrás
                    </button>

                    <Link
                        href="/"
                        className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest flex items-center gap-2 transition-colors"
                    >
                        <Home className="h-4 w-4" /> Inicio KAVVO
                    </Link>
                </motion.div>

                {/* Branding footer */}
                <div className="mt-24">
                    <div className="inline-flex items-center gap-4 px-6 py-2 bg-slate-100/50 rounded-full">
                        <Search className="h-3 w-3 text-slate-400" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">KAVVO CLOUD ECOSYSTEM</span>
                    </div>
                </div>
            </div>
        </div>
    );
}