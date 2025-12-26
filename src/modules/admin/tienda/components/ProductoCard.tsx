"use client";

import type { ProductoFrontend } from "@/src/modules/admin/productos/types/producto";
import Image from "next/image";
import ProductoDetalleModal from "./ProductoDetalleModal";
import { useProductoCard } from "../hooks/useProductoCard";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

interface ProductoCardSliderProps {
    producto: ProductoFrontend;
    showDiscount?: boolean;
    discountPercentage?: number;
    originalPrice?: number;
    todosLosProductos?: ProductoFrontend[];
}

export default function ProductoCard({
    producto,
    todosLosProductos = [],
}: ProductoCardSliderProps) {
    const {
        imageError,
        setImageError,
        pilaModales,
        handleAgregarDirectoAlCarrito,
        obtenerProductosSugeridos,
        abrirModal,
        agregarProductoAPila,
        cerrarUltimoModal
    } = useProductoCard(producto, todosLosProductos);

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={abrirModal}
                className="group relative flex flex-col h-full bg-white rounded-[2.5rem] p-4 border-2 border-slate-50 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:shadow-orange-100/50 hover:border-orange-100 transition-all duration-500 cursor-pointer overflow-hidden"
            >
                {/* Image Section */}
                <div className="relative h-44 w-full rounded-[2rem] overflow-hidden mb-5 bg-slate-50 ring-4 ring-slate-50">
                    {producto.imagen_url && !imageError ? (
                        <Image
                            src={producto.imagen_url}
                            alt={producto.nombre}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={() => setImageError(true)}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
                            <span className="text-5xl grayscale opacity-20 filter group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500">🍔</span>
                        </div>
                    )}

                    {/* Badge status */}
                    {!producto.activo && (
                        <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-lg">
                            Agotado
                        </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Content Section */}
                <div className="flex flex-col flex-1 px-1">
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-sm font-black text-slate-900 tracking-tight leading-snug line-clamp-2 uppercase group-hover:text-orange-600 transition-colors">
                            {producto.nombre}
                        </h3>
                    </div>

                    {producto.descripcion && (
                        <p className="text-[11px] font-bold text-slate-400 line-clamp-2 leading-relaxed mb-4">
                            {producto.descripcion}
                        </p>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-0.5 opacity-50">Precio</span>
                            <span className="text-lg font-black text-slate-900 tracking-tighter">
                                <span className="text-orange-500 text-sm mr-0.5">$</span>
                                {producto.precio.toLocaleString("es-CO")}
                            </span>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAgregarDirectoAlCarrito();
                            }}
                            disabled={!producto.activo}
                            className="h-12 w-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200 group-hover:bg-orange-500 group-hover:shadow-orange-200 transition-all duration-500 disabled:opacity-30"
                        >
                            <Plus className="h-6 w-6" />
                        </motion.button>
                    </div>
                </div>

                {/* Accessibility */}
                <span className="sr-only">Ver detalles de {producto.nombre}</span>
            </motion.div>

            {/* Renderizar todos los modales en la pila */}
            {pilaModales.map((prod, index) => (
                <ProductoDetalleModal
                    key={`${prod.id}-${index}`}
                    producto={prod}
                    onClose={cerrarUltimoModal}
                    productosSugeridos={obtenerProductosSugeridos(prod)}
                    onProductoSugeridoClick={agregarProductoAPila}
                    zIndexBase={50 + index}
                />
            ))}
        </>
    );
}