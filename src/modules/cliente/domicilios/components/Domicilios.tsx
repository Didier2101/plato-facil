"use client";

import React from "react";
import { useCarritoStore } from "@/src/modules/admin/tienda/store/carritoStore";
import Carrito from "@/src/modules/admin/tienda/components/Carrito";
import ProductoCard from "@/src/modules/admin/tienda/components/ProductoCard";
import { useDomicilios } from "../hooks/useDomicilios";
import {
    ShoppingBag,
    Clock,
    Moon,
    ChefHat,
    ArrowRight,
    Search,
    UtensilsCrossed,
    Sparkles,
    Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Domicilios() {
    const {
        configuracion,
        categoriaActiva,
        mostrarCarrito,
        setMostrarCarrito,
        categorias,
        productosFiltrados,
        productosAgrupados,
        cambiarCategoria,
        servicioDisponible,
        horarioInfo
    } = useDomicilios();

    const { productos: productosCarrito } = useCarritoStore();

    // Mensaje de servicio no disponible
    if (!servicioDisponible || !horarioInfo.abierto) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white rounded-[3rem] p-10 text-center shadow-2xl shadow-gray-200 border border-gray-100"
                >
                    <div className="mb-8 relative flex justify-center">
                        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center ring-8 ring-orange-50/50">
                            {!servicioDisponible ? (
                                <Moon className="w-10 h-10 text-orange-500" />
                            ) : (
                                <Clock className="w-10 h-10 text-orange-500" />
                            )}
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter uppercase">
                        {!servicioDisponible ? "Pausamos Momentáneamente" : "Estamos Descansando"}
                    </h2>

                    <p className="text-gray-400 font-bold mb-8 leading-relaxed text-sm">
                        {!servicioDisponible
                            ? "Nuestro equipo está recargando energías. Pronto estaremos de vuelta para deleitarte."
                            : `Volveremos pronto para servirte nuestro delicioso menú.\n${horarioInfo.mensaje}`
                        }
                    </p>

                    <div className="bg-gray-900 rounded-3xl p-6 text-left shadow-xl shadow-gray-200">
                        <p className="text-orange-500 font-black text-[10px] uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                            <Sparkles className="h-3 w-3" /> Recomendación
                        </p>
                        <p className="text-white text-xs font-bold leading-relaxed opacity-80">
                            Preparamos los mejores platos de la ciudad. ¡No te pierdas nuestra apertura mañana!
                        </p>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Header / Search Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <div className="inline-flex items-center space-x-2 bg-orange-100/50 px-4 py-2 rounded-2xl mb-4">
                        <ChefHat className="h-4 w-4 text-orange-600" />
                        <span className="text-xs font-black text-orange-600 uppercase tracking-widest leading-none">Menú Premium</span>
                    </div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter">
                        ¿Qué te <span className="text-orange-500 underline decoration-orange-200 underline-offset-8">antojas</span> hoy?
                    </h2>
                </div>

                <div className="relative group min-w-[300px]">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Busca tu sabor favorito..."
                        className="w-full bg-white border-2 border-transparent focus:border-orange-500/10 py-5 pl-14 pr-6 rounded-[2rem] shadow-xl shadow-gray-200/50 outline-none transition-all font-bold text-gray-900"
                    />
                </div>
            </div>

            {/* Categories Navigation */}
            <div className="flex items-center gap-3 overflow-x-auto pb-6 -mx-4 px-4 no-scrollbar">
                {categorias.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => cambiarCategoria(cat.id)}
                        className={`whitespace-nowrap px-8 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-lg
                            ${categoriaActiva === cat.id
                                ? "bg-orange-500 text-white shadow-orange-200 ring-4 ring-orange-50 scale-105"
                                : "bg-white text-gray-500 hover:bg-orange-50 hover:text-orange-600 shadow-gray-100"
                            }`}
                    >
                        {cat.nombre}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <main>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={categoriaActiva}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                    >
                        {renderContent(categoriaActiva)}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Floating Order Summary Tab (Floating Button Style) */}
            <AnimatePresence>
                {productosCarrito.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-24 lg:bottom-10 right-6 z-50"
                    >
                        <button
                            onClick={() => setMostrarCarrito(true)}
                            className="bg-gray-900 hover:bg-orange-500 text-white p-6 rounded-[2.5rem] shadow-2xl flex items-center gap-4 transition-all hover:scale-105 group"
                        >
                            <div className="relative">
                                <ShoppingBag className="h-7 w-7" />
                                <span className="absolute -top-3 -right-3 h-6 w-6 bg-orange-500 border-4 border-gray-900 rounded-full text-[10px] font-black flex items-center justify-center">
                                    {productosCarrito.reduce((sum, p) => sum + p.cantidad, 0)}
                                </span>
                            </div>
                            <div className="text-left hidden sm:block">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">Tu Pedido</p>
                                <p className="text-xl font-black tracking-tighter leading-none">
                                    ${productosCarrito.reduce((sum, p) => sum + (p.precio * p.cantidad), 0).toLocaleString("es-CO")}
                                </p>
                            </div>
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Shopping Cart Modal */}
            <AnimatePresence>
                {mostrarCarrito && (
                    <Carrito
                        tipo="domicilio"
                        onClose={() => setMostrarCarrito(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );

    function renderContent(categoria: string) {
        if (categoria === "todas") {
            return productosAgrupados.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="space-y-16">
                    {productosAgrupados.map(grupo => (
                        <div key={grupo.categoria} className="space-y-8">
                            <div className="flex items-center justify-between border-b-2 border-gray-100 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">{grupo.categoria}</h2>
                                </div>
                                <button
                                    onClick={() => cambiarCategoria((grupo.categoria || "General").toLowerCase().replace(/\s+/g, "-"))}
                                    className="text-[10px] font-black text-gray-400 hover:text-orange-500 transition-colors uppercase tracking-[0.2em]"
                                >
                                    Explorar Todo
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {grupo.productos.map(producto => (
                                    <ProductoCard
                                        key={producto.id}
                                        producto={producto}
                                        todosLosProductos={productosFiltrados}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            );
        } else {
            return productosFiltrados.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {productosFiltrados.map(producto => (
                        <ProductoCard
                            key={producto.id}
                            producto={producto}
                            todosLosProductos={productosFiltrados}
                        />
                    ))}
                </div>
            );
        }
    }

    function EmptyState() {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="h-24 w-24 bg-gray-100 rounded-[2rem] flex items-center justify-center mb-6">
                    <UtensilsCrossed className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Próximamente</h3>
                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-2 max-w-xs mx-auto">
                    Estamos actualizando nuestro menú con nuevas delicias para ti.
                </p>
                <button
                    onClick={() => cambiarCategoria("todas")}
                    className="mt-8 px-8 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-orange-500 transition-colors uppercase tracking-widest text-xs"
                >
                    Volver al Menú
                </button>
            </div>
        );
    }
}