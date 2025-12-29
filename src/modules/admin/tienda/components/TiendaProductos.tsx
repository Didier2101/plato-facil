"use client";

import { useEffect } from "react";
import { ShoppingBag, Utensils, LayoutGrid, ChefHat, ArrowRight } from "lucide-react";
import Loading from "@/src/shared/components/ui/Loading";
import { useTienda } from "../hooks/useTienda";
import { useCarritoStore } from "@/src/modules/admin/tienda/store/carritoStore";
import CarritoResumen from "./Carrito";
import ProductoCard from "./ProductoCard";
import { motion, AnimatePresence } from "framer-motion";

export default function TiendaProductos({ isDomicilio = false }: { isDomicilio?: boolean }) {
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

    // Force "para_llevar" type if isDomicilio is active
    // Force "para_llevar" type if isDomicilio is active
    useEffect(() => {
        if (isDomicilio) {
            setTipoOrden("para_llevar");
        }
    }, [isDomicilio, setTipoOrden]);

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
            <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 pt-6 md:pt-10 pb-4 md:pb-6 sticky top-0 z-40 px-4 md:px-8">
                <div className="max-w-7xl mx-auto flex flex-col gap-6 md:gap-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                        <div className="flex items-center gap-4 md:gap-6">
                            <div className="h-12 w-12 md:h-16 md:w-16 bg-slate-900 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-slate-200 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <ChefHat className="h-6 w-6 md:h-8 md:w-8 relative z-10 transition-transform duration-500 group-hover:scale-110" />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-2 md:gap-4">
                                    Menú <span className="text-orange-500/30">/</span> <span className="text-orange-500 text-sm md:text-xl">
                                        {isDomicilio ? "DOMICILIO" : (tipoOrden === "mesa" ? "LOCAL" : "LLEVAR")}
                                    </span>
                                </h1>
                                <div className="flex items-center gap-2 md:gap-3 mt-1">
                                    <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] md:tracking-[0.4em]">
                                        {productos.length} Productos
                                    </p>
                                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                                    <span className="text-[8px] md:text-[10px] font-black text-orange-500 uppercase tracking-widest">{categorias.length} Categorías</span>
                                </div>
                            </div>
                        </div>

                        {/* Order Type Toggle - Hidden for Domicilio */}
                        {!isDomicilio && (
                            <div className="bg-slate-100/80 backdrop-blur-md p-1 md:p-1.5 rounded-[1.5rem] md:rounded-[2rem] flex w-full md:w-fit border border-white">
                                <button
                                    onClick={() => setTipoOrden("mesa")}
                                    className={`flex-1 md:flex-none px-6 md:px-8 py-2.5 md:py-3.5 rounded-[1.3rem] md:rounded-[1.8rem] text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-2 ${tipoOrden === "mesa"
                                        ? "bg-white text-slate-900 shadow-xl shadow-slate-200/50 scale-105"
                                        : "text-slate-400 hover:text-slate-600"
                                        }`}
                                >
                                    <Utensils className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                    Comer Aquí
                                </button>
                                <button
                                    onClick={() => setTipoOrden("para_llevar")}
                                    className={`flex-1 md:flex-none px-6 md:px-8 py-2.5 md:py-3.5 rounded-[1.3rem] md:rounded-[1.8rem] text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-2 ${tipoOrden === "para_llevar"
                                        ? "bg-white text-slate-900 shadow-xl shadow-slate-200/50 scale-105"
                                        : "text-slate-400 hover:text-slate-600"
                                        }`}
                                >
                                    <ShoppingBag className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                    Recoger
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Category Tabs */}
                    <nav className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-4 scrollbar-hide -mx-4 px-4">
                        {categorias.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setCategoriaActiva(cat.id)}
                                className={`whitespace-nowrap px-5 md:px-8 py-3 md:py-4 rounded-[1.3rem] md:rounded-[1.8rem] text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all duration-500 flex items-center gap-2 md:gap-3 group relative overflow-hidden
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
                                <div className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full transition-all duration-500 ${categoriaActiva === cat.id ? "bg-orange-500 scale-150 animate-pulse" : "bg-slate-200 group-hover:bg-orange-300"}`} />
                                <span className="relative z-10">{cat.nombre}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="w-full overflow-x-hidden"> {/* Wrap main content to absolutely prevent overflow */}
                <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={categoriaActiva}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-12 md:space-y-24"
                        >
                            {categoriaActiva === "todas" ? (
                                productosAgrupados.length === 0 ? (
                                    <EmptyState onReset={() => setCategoriaActiva("todas")} />
                                ) : (
                                    productosAgrupados.map(grupo => (
                                        <div key={grupo.categoria} className="space-y-4 md:space-y-10">
                                            <div className="flex items-center justify-between border-b border-slate-100 pb-3 md:pb-5 px-4 md:px-2">
                                                <div className="flex items-center gap-2 md:gap-4">
                                                    <div className="w-1 md:w-1.5 h-5 md:h-8 bg-orange-500 rounded-full" />
                                                    <h2 className="text-lg md:text-3xl font-black text-slate-900 tracking-tighter uppercase">{grupo.categoria}</h2>
                                                </div>
                                                <button
                                                    onClick={() => setCategoriaActiva(grupo.categoria.toLowerCase().replace(/\s+/g, "-"))}
                                                    className="px-4 md:px-6 py-2 md:py-3 rounded-xl bg-slate-100 text-[8px] md:text-[10px] font-black text-slate-500 hover:bg-slate-900 hover:text-white transition-all uppercase tracking-[0.2em] whitespace-nowrap flex-shrink-0"
                                                >
                                                    Ver Todo
                                                </button>
                                            </div>

                                            {/* Scroll Horizontal - Muestra 2.5 cards en móvil */}
                                            <div className="flex flex-row flex-nowrap gap-3 overflow-x-auto pb-8 scrollbar-hide -mx-4 px-4 snap-x snap-mandatory md:mx-0 md:px-0">
                                                {grupo.productos.map((producto) => (
                                                    <div
                                                        key={producto.id}
                                                        className="snap-start mobile-card-snap desktop-280"
                                                    >
                                                        <ProductoCard producto={producto} todosLosProductos={productos} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )
                            ) : (
                                productosFiltrados.length === 0 ? (
                                    <EmptyState onReset={() => setCategoriaActiva("todas")} />
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 px-4 md:px-8">
                                        {productosFiltrados.map(producto => (
                                            <div key={producto.id} className="w-full">
                                                <ProductoCard producto={producto} todosLosProductos={productos} />
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}

                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Floating Horizontal Cart Button */}
            <AnimatePresence>
                {productosCarrito.length > 0 && (
                    <motion.div
                        initial={{ y: 100, scale: 0.8, opacity: 0 }}
                        animate={{ y: 0, scale: 1, opacity: 1 }}
                        exit={{ y: 100, scale: 0.8, opacity: 0 }}
                        className="fixed bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-50 px-4 md:px-6 w-full max-w-lg"
                    >
                        <button
                            onClick={() => setMostrarCarrito(true)}
                            className="w-full bg-slate-900 hover:bg-orange-500 text-white p-4 md:p-5 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl flex items-center justify-between transition-all group overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                            <div className="flex items-center gap-3 md:gap-5 relative z-10">
                                <div className="h-11 w-11 md:h-14 md:w-14 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center ring-2 md:ring-4 ring-white/5">
                                    <ShoppingBag className="h-5 w-5 md:h-7 md:w-7" />
                                    <span className="absolute -top-1 -right-1 h-5 w-5 md:h-6 md:w-6 bg-orange-500 border-2 border-slate-900 rounded-full text-[9px] md:text-[10px] font-black flex items-center justify-center">
                                        {productosCarrito.reduce((sum, p) => sum + p.cantidad, 0)}
                                    </span>
                                </div>
                                <div className="text-left font-black">
                                    <p className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] opacity-60">Revisar Orden</p>
                                    <p className="text-base md:text-xl tracking-tighter uppercase">Mi Pedido</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 md:gap-5 relative z-10">
                                <div className="text-right font-black">
                                    <p className="text-[9px] md:text-[11px] uppercase tracking-[0.15em] md:tracking-[0.2em] text-orange-500 opacity-80">Total</p>
                                    <p className="text-lg md:text-2xl tracking-tighter">
                                        ${productosCarrito.reduce((sum, p) => sum + (p.precio * p.cantidad), 0).toLocaleString("es-CO")}
                                    </p>
                                </div>
                                <div className="h-10 w-10 md:h-12 md:w-12 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-all">
                                    <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />
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
        </div >
    );
}

function EmptyState({ onReset }: { onReset: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center space-y-4 md:space-y-6 px-4">
            <div className="h-24 w-24 md:h-32 md:w-32 bg-slate-100 rounded-full flex items-center justify-center ring-8 md:ring-[16px] ring-slate-100/50">
                <LayoutGrid className="h-10 w-10 md:h-12 md:w-12 text-slate-300" />
            </div>
            <div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter">Categoría vacía</h3>
                <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 max-w-xs mx-auto">No hay platos disponibles en esta sección por ahora</p>
            </div>
            <button
                onClick={onReset}
                className="bg-slate-900 text-white px-8 md:px-10 py-3 md:py-4 rounded-[1.2rem] md:rounded-[1.5rem] font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-slate-200 active:scale-95 transition-all"
            >
                Regresar al Menú
            </button>
        </div>
    );
}