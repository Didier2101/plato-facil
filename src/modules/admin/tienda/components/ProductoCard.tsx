"use client";

import type { ProductoFrontend } from "@/src/modules/admin/productos/types/producto";
import Image from "next/image";
import ProductoDetalleModal from "./ProductoDetalleModal";
import { useProductoCard } from "../hooks/useProductoCard";
import { IoMdAddCircle } from "react-icons/io";
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
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="overflow-hidden cursor-pointer transition-all duration-300 flex flex-col h-full relative max-w-[250px] bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-100"
                role="button"
                tabIndex={0}
                onClick={abrirModal}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        abrirModal();
                    }
                }}
                aria-label={`Ver detalles de ${producto.nombre}, precio: $${producto.precio.toLocaleString("es-CO")}`}
            >
                {/* Imagen del producto */}
                <div className="relative h-32 w-full">
                    {producto.imagen_url && !imageError ? (
                        <Image
                            src={producto.imagen_url}
                            alt={producto.nombre}
                            fill
                            priority
                            className="object-cover"
                            onError={() => setImageError(true)}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <div
                            className="w-full h-full bg-gradient-to-br from-orange-50 to-gray-100 flex items-center justify-center"
                            role="img"
                            aria-label={`${producto.nombre} - Imagen no disponible`}
                        >
                            <div className="text-3xl text-orange-500" aria-hidden="true">🍔</div>
                        </div>
                    )}
                </div>

                {/* Estado del producto */}
                {!producto.activo && (
                    <div
                        className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full"
                        aria-label="Producto agotado"
                    >
                        AGOTADO
                    </div>
                )}

                {/* Botón flotante para agregar al carrito */}
                <div className="absolute top-2 right-2 z-20">
                    <motion.button
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAgregarDirectoAlCarrito();
                        }}
                        disabled={!producto.activo}
                        className="flex items-center justify-center bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                        aria-label={`Agregar ${producto.nombre} al carrito por $${producto.precio.toLocaleString("es-CO")}`}
                        aria-disabled={!producto.activo}
                        title={producto.activo ? `Agregar ${producto.nombre} al carrito` : 'Producto agotado'}
                    >
                        <IoMdAddCircle className="text-xl" aria-hidden="true" />
                        <span className="sr-only">
                            {producto.activo ? `Agregar ${producto.nombre} al carrito` : 'Producto agotado'}
                        </span>
                    </motion.button>
                </div>

                {/* Contenido de la card */}
                <div className="p-3 flex flex-col flex-1">
                    {/* Precio */}
                    <div className="mb-1">
                        <span
                            className="text-lg font-bold text-orange-600"
                            aria-label={`Precio: $${producto.precio.toLocaleString("es-CO")}`}
                        >
                            ${producto.precio.toLocaleString("es-CO")}
                        </span>
                    </div>

                    {/* Nombre del producto */}
                    <h3
                        className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight mb-1"
                        aria-label={producto.nombre}
                    >
                        {producto.nombre}
                    </h3>

                    {/* Descripción del producto */}
                    {producto.descripcion && (
                        <p
                            className="text-xs text-gray-600 line-clamp-2 leading-tight"
                            aria-label={`Descripción: ${producto.descripcion}`}
                        >
                            {producto.descripcion}
                        </p>
                    )}
                </div>

                {/* Indicador de hover para accesibilidad */}
                <div className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-200 border-2 border-orange-300 rounded-xl" aria-hidden="true"></div>
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