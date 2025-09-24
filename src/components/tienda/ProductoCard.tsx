"use client";

import { useState } from "react";
import type { ProductoFrontend } from "@/src/types/producto";
import Image from "next/image";
import ProductoDetalleModal from "./ProductoDetalleModal";

interface ProductoCardProps {
    producto: ProductoFrontend;
}

export default function ProductoCard({ producto }: ProductoCardProps) {
    const [imageError, setImageError] = useState(false);
    const [openModal, setOpenModal] = useState(false);

    return (
        <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                {/* Imagen */}
                <div
                    className="relative h-40 w-full bg-gray-200 cursor-pointer"
                    onClick={() => setOpenModal(true)}
                >
                    {producto.imagen_url && !imageError ? (
                        <Image
                            src={producto.imagen_url}
                            alt={producto.nombre}
                            fill
                            className="object-cover"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <span className="text-4xl">🍔</span>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 mb-2">
                        {producto.nombre}
                    </h3>

                    {producto.descripcion && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                            {producto.descripcion}
                        </p>
                    )}

                    <p className="text-xl font-bold text-orange-600 mb-4">
                        ${producto.precio.toLocaleString("es-CO")}
                    </p>

                    <button
                        onClick={() => setOpenModal(true)}
                        className="w-full mt-auto bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                        Ver producto
                    </button>
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
