"use client";

import type { ProductoFrontend } from "@/src/modules/admin/productos/types/producto";
import Image from "next/image";
import ProductoDetalleModal from "./ProductoDetalleModal";
import { useProductoCard } from "../hooks/useProductoCard";
import { IoMdAddCircle } from "react-icons/io";

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
            <div
                className="overflow-hidden cursor-pointer transition-all duration-300 flex flex-col h-full relative max-w-[250px]"
                onClick={abrirModal}
            >
                {/* Imagen del producto */}
                <div className="relative h-32 w-full ">
                    {producto.imagen_url && !imageError ? (
                        <Image
                            src={producto.imagen_url}
                            alt={producto.nombre}
                            fill
                            priority
                            className="object-cover rounded-xl"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <Image
                            src="/assets/logo-kavvo-solo.png"
                            alt="Logo Kavvo"
                            fill
                            priority
                            className="object-cover rounded-xl"
                        />
                    )}
                </div>

                {/* Botón flotante */}
                <div className="absolute top-2 right-2 z-20">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAgregarDirectoAlCarrito();
                        }}
                        disabled={!producto.activo}
                        className="flex items-center justify-center bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                    >
                        <IoMdAddCircle className="text-xl" />
                    </button>
                </div>

                {/* Contenido de la card */}
                <div className="pt-2 flex flex-col flex-1">
                    <div className="mb-1">
                        <span className="text-md font-bold text-gray-700">
                            ${producto.precio.toLocaleString("es-CO")}
                        </span>
                    </div>

                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight mb-1">
                        {producto.nombre}
                    </h3>

                    {producto.descripcion && (
                        <p className="text-xs text-gray-600 line-clamp-2 leading-tight">
                            {producto.descripcion}
                        </p>
                    )}
                </div>
            </div>

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