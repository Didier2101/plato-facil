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
            <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all flex flex-col">
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
                            className="object-cover"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <span className="text-5xl">🍔</span>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-gray-800 line-clamp-2 mb-2">
                        {producto.nombre}
                    </h3>

                    {producto.descripcion && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                            {producto.descripcion}
                        </p>
                    )}

                    <p className="text-2xl font-bold text-orange-600 mb-4">
                        ${producto.precio.toLocaleString("es-CO")}
                    </p>

                    <button
                        onClick={() => setOpenModal(true)}
                        className="w-full mt-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
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
