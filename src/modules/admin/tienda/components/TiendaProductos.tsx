"use client";

import { ShoppingBag, Utensils, LayoutGrid, ChefHat, ArrowRight } from "lucide-react";
import Loading from "@/src/shared/components/ui/Loading";
import { useTienda } from "../hooks/useTienda";
import { useCarritoStore } from "@/src/modules/admin/tienda/store/carritoStore";
import CarritoResumen from "./Carrito";
import ProductoCard from "./ProductoCard";
import { motion, AnimatePresence } from "framer-motion";

export default function TiendaProductos() {
    const {
        loading,
        categoriaActiva,
        setCategoriaActiva,
        mostrarCarrito,
        setMostrarCarrito,
        tipoOrden,
        setTipoOrden,
        categorias,
        productosFiltrados,
        productosAgrupados,
        productos
    } = useTienda();

    const { productos: productosCarrito } = useCarritoStore();

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-50">
                <Loading
                    texto="Preparando el menú..."
                    tamaño="mediano"
                    color="orange-500"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            {/* Header Section */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 pt-10 pb-6 sticky top-0 z-40 px-4 md:px-8">
                <div className="max-w-7xl mx-auto flex flex-col gap-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="h-16 w-16 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-slate-200 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <ChefHat className="h-8 w-8 relative z-10 transition-transform duration-500 group-hover:scale-110" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-4">
                                    Menú <span className="text-orange-500/30">/</span> <span className="text-orange-500">{tipoOrden === "mesa" ? "SERVICIO LOCAL" : "PARA LLEVAR"}</span>
                                </h1>
                                <div className="flex items-center gap-3 mt-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                                        {productos.length} Creaciones Gastronómicas
                                    </p>
                                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{categorias.length} Categorías</span>
                                </div>
                            </div>
                        </div>

                        {/* Order Type Toggle */}
                        <div className="bg-slate-100/80 backdrop-blur-md p-1.5 rounded-[2rem] flex w-full md:w-fit border border-white">
                            <button
                                onClick={() => setTipoOrden("mesa")}
                                className={`flex-1 md:flex-none px-8 py-3.5 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-2 ${tipoOrden === "mesa"
                                    ? "bg-white text-slate-900 shadow-xl shadow-slate-200/50 scale-105"
                                    : "text-slate-400 hover:text-slate-600"
                                    }`}
                            >
                                <Utensils className="h-3.5 w-3.5" />
                                Comer Aquí
                            </button>
                            <button
                                onClick={() => setTipoOrden("para_llevar")}
                                className={`flex-1 md:flex-none px-8 py-3.5 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-2 ${tipoOrden === "para_llevar"
                                    ? "bg-white text-slate-900 shadow-xl shadow-slate-200/50 scale-105"
                                    : "text-slate-400 hover:text-slate-600"
                                    }`}
                            >
                                <ShoppingBag className="h-3.5 w-3.5" />
                                Recoger
                            </button>
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <nav className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 mask-fade-edges">
                        {categorias.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setCategoriaActiva(cat.id)}
                                className={`whitespace-nowrap px-8 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 flex items-center gap-3 group relative overflow-hidden
                                    ${categoriaActiva === cat.id
                                        ? "bg-slate-900 text-white shadow-2xl shadow-slate-300 scale-105"
                                        : "bg-white border-2 border-slate-50 text-slate-400 hover:border-orange-200 hover:text-orange-500 hover:shadow-lg hover:shadow-orange-100/50"
                                    }`}
                            >
                                {categoriaActiva === cat.id && (
                                    <motion.div
                                        layoutId="activeTabGlow"
                                        className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-transparent opacity-50"
                                    />
                                )}
                                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${categoriaActiva === cat.id ? "bg-orange-500 scale-150 animate-pulse" : "bg-slate-200 group-hover:bg-orange-300"}`} />
                                <span className="relative z-10">{cat.nombre}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-12">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={categoriaActiva}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-24"
                    >
                        {categoriaActiva === "todas" ? (
                            productosAgrupados.length === 0 ? (
                                <EmptyState onReset={() => setCategoriaActiva("todas")} />
                            ) : (
                                productosAgrupados.map(grupo => (
                                    <div key={grupo.categoria} className="space-y-10">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-5 px-2">
                                            <div className="flex items-center gap-4">
                                                <div className="w-1.5 h-8 bg-orange-500 rounded-full" />
                                                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{grupo.categoria}</h2>
                                            </div>
                                            <button
                                                onClick={() => setCategoriaActiva(grupo.categoria.toLowerCase().replace(/\s+/g, "-"))}
                                                className="px-6 py-3 rounded-xl bg-slate-100 text-[10px] font-black text-slate-500 hover:bg-slate-900 hover:text-white transition-all uppercase tracking-[0.2em]"
                                            >
                                                Ver Todo
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8">
                                            {grupo.productos.map(producto => (
                                                <ProductoCard key={producto.id} producto={producto} todosLosProductos={productos} />
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )
                        ) : (
                            productosFiltrados.length === 0 ? (
                                <EmptyState onReset={() => setCategoriaActiva("todas")} />
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
                                    {productosFiltrados.map(producto => (
                                        <ProductoCard key={producto.id} producto={producto} todosLosProductos={productos} />
                                    ))}
                                </div>
                            )
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Floating Horizontal Cart Button */}
            <AnimatePresence>
                {productosCarrito.length > 0 && (
                    <motion.div
                        initial={{ y: 100, scale: 0.8, opacity: 0 }}
                        animate={{ y: 0, scale: 1, opacity: 1 }}
                        exit={{ y: 100, scale: 0.8, opacity: 0 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-6 w-full max-w-lg"
                    >
                        <button
                            onClick={() => setMostrarCarrito(true)}
                            className="w-full bg-slate-900 hover:bg-orange-500 text-white p-5 rounded-[2.5rem] shadow-2xl flex items-center justify-between transition-all group overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                            <div className="flex items-center gap-5 relative z-10">
                                <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center ring-4 ring-white/5">
                                    <ShoppingBag className="h-7 w-7" />
                                    <span className="absolute -top-1 -right-1 h-6 w-6 bg-orange-500 border-2 border-slate-900 rounded-full text-[10px] font-black flex items-center justify-center">
                                        {productosCarrito.reduce((sum, p) => sum + p.cantidad, 0)}
                                    </span>
                                </div>
                                <div className="text-left font-black">
                                    <p className="text-[10px] uppercase tracking-[0.3em] opacity-60">Revisar Orden</p>
                                    <p className="text-xl tracking-tighter uppercase">Mi Pedido</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-5 relative z-10">
                                <div className="text-right font-black">
                                    <p className="text-[11px] uppercase tracking-[0.2em] text-orange-500 opacity-80">Total</p>
                                    <p className="text-2xl tracking-tighter">
                                        ${productosCarrito.reduce((sum, p) => sum + (p.precio * p.cantidad), 0).toLocaleString("es-CO")}
                                    </p>
                                </div>
                                <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-all">
                                    <ArrowRight className="h-6 w-6" />
                                </div>
                            </div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal de Carrito */}
            <AnimatePresence>
                {mostrarCarrito && (
                    <CarritoResumen
                        tipo={tipoOrden}
                        onClose={() => setMostrarCarrito(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function EmptyState({ onReset }: { onReset: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
            <div className="h-32 w-32 bg-slate-100 rounded-full flex items-center justify-center ring-[16px] ring-slate-100/50">
                <LayoutGrid className="h-12 w-12 text-slate-300" />
            </div>
            <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Categoría vacía</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 max-w-xs mx-auto">No hay platos disponibles en esta sección por ahora</p>
            </div>
            <button
                onClick={onReset}
                className="bg-slate-900 text-white px-10 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-slate-200 active:scale-95 transition-all"
            >
                Regresar al Menú
            </button>
        </div>
    );
}