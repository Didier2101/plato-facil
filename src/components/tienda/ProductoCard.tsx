"use client";

import { useState } from "react";
import type { ProductoFrontend } from "@/src/types/producto";
import Image from "next/image";
import ProductoDetalleModal from "./ProductoDetalleModal";
import Swal from "sweetalert2";
import { useCarritoStore } from "@/src/store/carritoStore";
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
    const [imageError, setImageError] = useState(false);
    const [pilaModales, setPilaModales] = useState<ProductoFrontend[]>([]);
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
            // ❌ ELIMINADO: personalizacion_id - el store lo generará automáticamente
        };

        agregarProducto(productoCarrito);

        Swal.fire({
            icon: "success",
            title: "",
            text: "",
            timer: 1000,
            showConfirmButton: false,
            toast: true,
            position: "top-end",
            background: "#f97316",
            iconColor: "#ffffff",
            width: "80px",
            customClass: {
                popup: "!rounded-full !shadow-lg !flex !items-center !justify-center",
                icon: "!border-0 !m-0 !scale-75"
            }
        });
    };

    // Generar productos sugeridos
    const obtenerProductosSugeridos = (productoBase: ProductoFrontend): ProductoFrontend[] => {
        if (!todosLosProductos.length) return [];

        const mismaCategoria = todosLosProductos.filter(
            p => p.categoria === productoBase.categoria && p.id !== productoBase.id && p.activo
        );

        const otrasCategoria = todosLosProductos.filter(
            p => p.categoria !== productoBase.categoria && p.id !== productoBase.id && p.activo
        );

        const sugeridos = [...mismaCategoria, ...otrasCategoria];

        return sugeridos
            .sort(() => Math.random() - 0.5)
            .slice(0, 6);
    };

    // Abrir modal del producto inicial
    const abrirModal = () => {
        setPilaModales([producto]);
    };

    // Agregar un nuevo producto a la pila (abrir modal encima)
    const agregarProductoAPila = (productoNuevo: ProductoFrontend) => {
        setPilaModales(prev => [...prev, productoNuevo]);
    };

    // Cerrar el último modal de la pila
    const cerrarUltimoModal = () => {
        setPilaModales(prev => prev.slice(0, -1));
    };

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
                        <p className="text-xs text-gray-600 line-clamp-2 leading-tight truncate">
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