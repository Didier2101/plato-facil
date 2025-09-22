"use client";

import { useCarritoStore } from "@/src/store/carritoStore";
import type { ProductoFrontend } from "@/src/types/producto";
import Image from "next/image";
import { useState } from "react";
import ProductoDetalleModal from "./ProductoDetalleModal";
import { ShoppingCart, Settings } from "lucide-react";
import Swal from "sweetalert2";

interface ProductoCardProps {
    producto: ProductoFrontend;
}

export default function ProductoCard({ producto }: ProductoCardProps) {
    const [imageError, setImageError] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [agregandoRapido, setAgregandoRapido] = useState(false);

    const { productos: productosCarrito, agregarProducto, generarPersonalizacionId } = useCarritoStore();

    const productoId = typeof producto.id === "string" ? parseInt(producto.id, 10) : producto.id;

    // Contar cuántas unidades hay en el carrito (sumando todas las personalizaciones)
    const cantidadEnCarrito = productosCarrito
        .filter((p) => p.id === productoId)
        .reduce((total, p) => total + p.cantidad, 0);

    // Verificar si el producto tiene ingredientes personalizables
    const esPersonalizable = producto.ingredientes && producto.ingredientes.length > 0;

    // Función para agregar rápidamente sin personalización
    const handleAgregarRapido = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!esPersonalizable) {
            // Si no es personalizable, agregar directamente
            const productoCarrito = {
                id: productoId,
                nombre: producto.nombre,
                precio: producto.precio,
                imagen_url: producto.imagen_url || null,
                categoria: producto.categoria,
                cantidad: 1,
                personalizacion_id: generarPersonalizacionId(productoId, [], "")
            };

            agregarProducto(productoCarrito);

            Swal.fire({
                icon: "success",
                title: "Agregado al carrito",
                text: `${producto.nombre} x1`,
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: "top-end"
            });
            return;
        }

        // Si es personalizable, agregar con ingredientes por defecto (todos los obligatorios)
        setAgregandoRapido(true);

        try {
            // CORREGIDO: Acceder correctamente a la estructura de datos
            const ingredientesDefecto = producto.ingredientes
                ?.filter(pi => pi.obligatorio) // Solo obligatorios por defecto
                .map(pi => ({
                    ingrediente_id: pi.ingrediente_id,
                    nombre: pi.ingrediente.nombre,
                    incluido: true,
                    obligatorio: pi.obligatorio
                })) || [];

            const productoCarrito = {
                id: productoId,
                nombre: producto.nombre,
                precio: producto.precio,
                imagen_url: producto.imagen_url || null,
                categoria: producto.categoria,
                cantidad: 1,
                ingredientes_personalizados: ingredientesDefecto,
                personalizacion_id: generarPersonalizacionId(productoId, ingredientesDefecto, "")
            };

            agregarProducto(productoCarrito);

            Swal.fire({
                icon: "success",
                title: "Agregado al carrito",
                text: `${producto.nombre} x1 (ingredientes básicos)`,
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: "top-end"
            });
        } catch (error) {
            console.error("Error agregando producto:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo agregar el producto",
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: "top-end"
            });
        } finally {
            setAgregandoRapido(false);
        }
    };

    const handlePersonalizar = (e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenModal(true);
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
                {/* Imagen */}
                <div
                    className="relative h-48 w-full bg-gray-200 cursor-pointer"
                    onClick={() => setOpenModal(true)}
                >
                    {producto.imagen_url && !imageError ? (
                        <Image
                            src={producto.imagen_url}
                            alt={producto.nombre}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <svg
                                className="h-16 w-16 text-gray-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                    )}

                    {/* Badge categoría */}
                    <div className="absolute top-2 left-2">
                        <span className="bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                            {producto.categoria}
                        </span>
                    </div>

                    {/* Badge carrito */}
                    {cantidadEnCarrito > 0 && (
                        <div className="absolute top-2 right-2 bg-orange-600 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
                            {cantidadEnCarrito}
                        </div>
                    )}

                    {/* Indicador de personalización disponible */}
                    {esPersonalizable && (
                        <div className="absolute bottom-2 right-2">
                            <div className="bg-green-600 text-white p-1 rounded-full shadow-lg" title="Personalizable">
                                <Settings className="w-4 h-4" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Información del producto */}
                <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 mb-2">
                        {producto.nombre}
                    </h3>

                    {producto.descripcion && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                            {producto.descripcion}
                        </p>
                    )}

                    <div className="flex items-center justify-between mb-3">
                        <p className="text-2xl font-bold text-orange-600">
                            ${producto.precio.toLocaleString("es-CO")}
                        </p>

                        {/* Indicador visual de personalización */}
                        {esPersonalizable && (
                            <div className="flex items-center text-xs text-green-600">
                                <span className="w-2 h-2 bg-green-600 rounded-full mr-1"></span>
                                <span>Personalizable</span>
                            </div>
                        )}
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-2">
                        {/* Botón agregar rápido */}
                        <button
                            onClick={handleAgregarRapido}
                            disabled={agregandoRapido}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                            {agregandoRapido ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                                <ShoppingCart size={16} />
                            )}
                            {esPersonalizable ? "Agregar básico" : "Agregar"}
                        </button>

                        {/* Botón personalizar (solo si es personalizable) */}
                        {esPersonalizable && (
                            <button
                                onClick={handlePersonalizar}
                                className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                                title="Personalizar ingredientes"
                            >
                                <Settings size={16} />
                            </button>
                        )}
                    </div>

                    {/* Descripción de acción */}
                    <div className="mt-2 text-center">
                        <span className="text-xs text-gray-500">
                            {esPersonalizable
                                ? "Agregar básico o personalizar ingredientes"
                                : "Toca para ver detalles"
                            }
                        </span>
                    </div>
                </div>
            </div>

            {/* Modal de detalle con ingredientes */}
            {openModal && (
                <ProductoDetalleModal
                    producto={producto}
                    onClose={() => setOpenModal(false)}
                />
            )}
        </>
    );
}