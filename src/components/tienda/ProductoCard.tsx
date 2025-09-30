"use client";

import { useState } from "react";
import type { ProductoFrontend } from "@/src/types/producto";
import Image from "next/image";
import ProductoDetalleModal from "./ProductoDetalleModal";
import { FaShoppingCart } from "react-icons/fa";
import Swal from "sweetalert2";
import { useCarritoStore } from "@/src/store/carritoStore";

interface ProductoCardProps {
    producto: ProductoFrontend;
}

export default function ProductoCard({ producto }: ProductoCardProps) {
    const [imageError, setImageError] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const { agregarProducto } = useCarritoStore();

    const handleAgregarDirectoAlCarrito = () => {
        const productoId = typeof producto.id === "string" ? parseInt(producto.id, 10) : producto.id;

        const productoCarrito = {
            id: productoId,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen_url: producto.imagen_url || null,
            categoria: producto.categoria,
            cantidad: 1,
            ingredientes_personalizados: producto.ingredientes?.map((pi) => ({
                ingrediente_id: pi.ingrediente_id,
                nombre: pi.ingrediente.nombre,
                incluido: true,
                obligatorio: pi.obligatorio,
            })) || [],
            notas: undefined,
            personalizacion_id: `${productoId}-${Date.now()}`,
        };

        agregarProducto(productoCarrito);

        Swal.fire({
            icon: "success",
            title: "Agregado al carrito",
            text: `${producto.nombre}`,
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: "top-end",
        });
    };

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all flex flex-col">
                {/* Imagen */}
                <div
                    className="relative h-40 md:h-48 w-full bg-gray-100 cursor-pointer"
                    onClick={() => setOpenModal(true)}
                >
                    {producto.imagen_url && !imageError ? (
                        <Image
                            src={producto.imagen_url}
                            alt={producto.nombre}
                            fill
                            priority
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <span className="text-5xl">🍔</span>
                        </div>
                    )}

                    {/* Badge de estado */}
                    <div className="absolute top-3 left-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${producto.activo
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                            }`}>
                            {producto.activo ? "Activo" : "Inactivo"}
                        </span>
                    </div>
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2">
                        {producto.nombre}
                    </h3>

                    {producto.descripcion && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                            {producto.descripcion}
                        </p>
                    )}

                    {/* Categoría */}
                    {producto.categoria && (
                        <div className="mb-3">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                                {producto.categoria}
                            </span>
                        </div>
                    )}

                    <p className="text-2xl font-bold text-green-600 mb-4">
                        ${producto.precio.toLocaleString("es-CO")}
                    </p>

                    {/* Botones de acción */}
                    <div className="flex gap-2 mt-auto">
                        <button
                            onClick={() => setOpenModal(true)}
                            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-colors border border-gray-200"
                        >
                            {/* <FaEye className="text-lg" /> */}
                            <span >Personalizar</span>
                        </button>

                        <button
                            onClick={handleAgregarDirectoAlCarrito}
                            disabled={!producto.activo}
                            className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-semibold transition-colors"
                        >
                            <FaShoppingCart className="text-lg" />
                        </button>
                    </div>
                </div>
            </div>

            {openModal && (
                <ProductoDetalleModal
                    producto={producto}
                    onClose={() => setOpenModal(false)}
                />
            )}
        </>
    );
}