"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Package,
    Search,
    Plus,
    Sparkles,
    Eye,
    X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import DetalleProducto from "./DetalleProducto";
import { formatearPrecioCOP } from "@/src/shared/utils/precio";
import type { ProductoFrontend } from "@/src/modules/admin/productos/types/producto";
import Loading from "@/src/shared/components/ui/Loading";
import Paginacion from "@/src/shared/components/Paginacion";
import { useProductos } from "@/src/modules/admin/productos/hooks/useProductos";
import { PRIVATE_ROUTES } from '@/src/shared/constants/app-routes';
import { PageHeader } from '@/src/shared/components';
import { motion, AnimatePresence } from "framer-motion";

export default function ProductosLista() {
    const {
        productos,
        loading,
        actualizarProducto,
        desactivarProducto,
    } = useProductos();
    const [productosFiltrados, setProductosFiltrados] = useState<ProductoFrontend[]>([]);

    // Búsqueda
    const [terminoBusqueda, setTerminoBusqueda] = useState("");

    // Paginación
    const [pagina, setPagina] = useState(1);
    const [itemsPorPagina, setItemsPorPagina] = useState(8);

    // Modal detalle
    const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoFrontend | null>(null);
    const [mostrarDetalle, setMostrarDetalle] = useState(false);

    const aplicarFiltros = useCallback(() => {
        let filtrados = [...productos];

        if (terminoBusqueda.trim()) {
            const termino = terminoBusqueda.toLowerCase().trim();
            filtrados = filtrados.filter(
                (producto) =>
                    producto.nombre.toLowerCase().includes(termino) ||
                    producto.descripcion?.toLowerCase().includes(termino)
            );
        }

        setProductosFiltrados(filtrados);
        setPagina(1);
    }, [productos, terminoBusqueda]);

    useEffect(() => {
        aplicarFiltros();
    }, [aplicarFiltros]);

    const limpiarBusqueda = () => {
        setTerminoBusqueda("");
    };

    const totalPaginas = Math.ceil(productosFiltrados.length / itemsPorPagina);
    const inicio = (pagina - 1) * itemsPorPagina;
    const productosPaginados = productosFiltrados.slice(inicio, inicio + itemsPorPagina);

    const handleVerDetalles = (producto: ProductoFrontend) => {
        setProductoSeleccionado(producto);
        setMostrarDetalle(true);
    };

    const handleCerrarDetalle = () => {
        setMostrarDetalle(false);
        setProductoSeleccionado(null);
    };

    const handleProductoActualizado = async (productoActualizado: ProductoFrontend) => {
        await actualizarProducto(productoActualizado.id, productoActualizado);
        handleCerrarDetalle();
    };

    const handleProductoEliminado = async (productoId: string, activo: boolean) => {
        await desactivarProducto(productoId, activo);
        handleCerrarDetalle();
    };

    if (loading) {
        return (
            <Loading texto="Desplegando Menú Elite..." tamaño="grande" color="orange-500" />
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            <PageHeader
                title="Menú Elite"
                description="Gestión de productos y experiencias gastronómicas"
                icon={<Package className="h-8 w-8 text-orange-500" />}
                variant="productos"
                showBorder={true}
            />

            <div className="px-6 lg:px-10 py-10 space-y-12 max-w-[1600px] mx-auto">
                {/* Panel de Control - Filtros y Búsqueda */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/50 shadow-2xl shadow-slate-200/50 p-8"
                >
                    <div className="flex flex-col lg:flex-row gap-6 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="BUSCAR EN EL CATÁLOGO..."
                                value={terminoBusqueda}
                                onChange={(e) => setTerminoBusqueda(e.target.value)}
                                className="w-full h-16 pl-14 pr-14 bg-slate-50/50 border border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold text-slate-900 uppercase tracking-widest text-[11px]"
                            />
                            {terminoBusqueda && (
                                <button
                                    onClick={limpiarBusqueda}
                                    className="absolute right-6 top-1/2 transform -translate-y-1/2 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-4 w-full lg:w-auto">
                            <Link
                                href={PRIVATE_ROUTES.ADMIN.PRODUCTOS_NUEVO}
                                className="flex-1 lg:flex-none h-16 px-8 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-orange-500 transition-all duration-500 shadow-xl shadow-slate-200/50 hover:shadow-orange-200"
                            >
                                <Plus className="h-4 w-4" />
                                Nuevo Producto
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* Grid de Productos */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                    <AnimatePresence mode="popLayout">
                        {productosPaginados.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="col-span-full py-24 flex flex-col items-center text-center"
                            >
                                <div className="h-24 w-24 bg-slate-100 rounded-[2.5rem] flex items-center justify-center mb-6 border border-slate-200 shadow-inner">
                                    <Package className="h-10 w-10 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">No se encontraron productos</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ajusta los filtros para refinar la búsqueda</p>
                            </motion.div>
                        ) : (
                            productosPaginados.map((producto, index) => (
                                <motion.div
                                    key={producto.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                    transition={{ duration: 0.4, delay: index * 0.05, ease: "circOut" }}
                                    className="group relative bg-white/70 backdrop-blur-xl rounded-[3rem] border border-white/50 shadow-xl shadow-slate-200/40 overflow-hidden hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-500"
                                >
                                    <div className="p-4 h-full flex flex-col">
                                        {/* Imagen y Estado */}
                                        <div className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-slate-100 mb-6">
                                            {producto.imagen_url ? (
                                                <Image
                                                    src={producto.imagen_url}
                                                    alt={producto.nombre}
                                                    fill
                                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-slate-300">
                                                    <Package className="h-16 w-16 opacity-30" />
                                                </div>
                                            )}

                                            <div className="absolute top-4 left-4">
                                                <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 shadow-sm ${producto.activo
                                                    ? "bg-white/90 border-green-500 text-green-600 backdrop-blur-md"
                                                    : "bg-white/90 border-red-500 text-red-600 backdrop-blur-md"
                                                    }`}>
                                                    {producto.activo ? "Activo" : "Inactivo"}
                                                </span>
                                            </div>

                                            <div className="absolute bottom-4 right-4 translate-y-12 group-hover:translate-y-0 transition-all duration-500">
                                                <button
                                                    onClick={() => handleVerDetalles(producto)}
                                                    className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl hover:bg-orange-500 transition-colors"
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Información */}
                                        <div className="flex-1 flex flex-col px-4 pb-4">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div className="min-w-0">
                                                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest block mb-1">
                                                        {producto.categoria || "Menú General"}
                                                    </span>
                                                    <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-tight line-clamp-1 group-hover:text-orange-500 transition-colors">
                                                        {producto.nombre}
                                                    </h3>
                                                </div>
                                            </div>

                                            {producto.descripcion && (
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest line-clamp-2 mb-6 leading-relaxed">
                                                    {producto.descripcion}
                                                </p>
                                            )}

                                            <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                                                <div>
                                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block">Inversión</span>
                                                    <span className="text-xl font-black text-slate-900 tracking-tighter">
                                                        {formatearPrecioCOP(producto.precio)}
                                                    </span>
                                                </div>

                                                <Sparkles className={`h-5 w-5 ${producto.activo ? "text-orange-400 animate-pulse" : "text-slate-200"}`} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                {/* Paginación Modernizada */}
                {totalPaginas > 1 && productosFiltrados.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/50 shadow-xl shadow-slate-200/30 p-4"
                    >
                        <Paginacion
                            pagina={pagina}
                            setPagina={setPagina}
                            totalPaginas={totalPaginas}
                            itemsPorPagina={itemsPorPagina}
                            setItemsPorPagina={setItemsPorPagina}
                        />
                    </motion.div>
                )}
            </div>

            {/* Modal de detalles */}
            <AnimatePresence>
                {mostrarDetalle && productoSeleccionado && (
                    <DetalleProducto
                        producto={productoSeleccionado}
                        onCerrar={handleCerrarDetalle}
                        onProductoActualizado={handleProductoActualizado}
                        onProductoEliminado={(productoId) =>
                            handleProductoEliminado(
                                productoId,
                                !productoSeleccionado.activo
                            )
                        }
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
