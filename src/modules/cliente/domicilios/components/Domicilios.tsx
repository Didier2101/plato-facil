"use client";

import React from "react";
import { useCarritoStore } from "@/src/modules/admin/tienda/store/carritoStore";
import CarritoResumen from "@/src/modules/admin/tienda/components/CarritoResumen";
import { FaShoppingCart, FaClock, FaBan } from "react-icons/fa";
import ProductoCard from "@/src/modules/admin/tienda/components/ProductoCard";
import { useDomicilios } from "../hooks/useDomicilios";


export default function Domicilios() {
    const {
        productos,
        configuracion,
        categoriaActiva,
        mostrarCarrito,
        setMostrarCarrito,
        transitionDirection,
        prevCategoria,
        categorias,
        productosFiltrados,
        productosAgrupados,
        cambiarCategoria,
        servicioDisponible,
        horarioInfo
    } = useDomicilios();

    const { productos: productosCarrito } = useCarritoStore();


    // Mostrar mensaje si el servicio no está disponible
    if (!servicioDisponible || !horarioInfo.abierto) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full rounded-2xl  p-8 text-center">
                    <div className="mb-6">
                        <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                            {!servicioDisponible ? (
                                <FaBan className="w-10 h-10 text-orange-500" />
                            ) : (
                                <FaClock className="w-10 h-10 text-orange-500" />
                            )}
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        {!servicioDisponible ? "Domicilios pausados hoy" : "Estamos cerrados"}
                    </h2>

                    <p className="text-gray-600 mb-6">
                        {!servicioDisponible
                            ? "En este momento no contamos con servicio de domicilios, pero mañana estaremos de vuelta. ¡Te esperamos!"
                            : `Lo sentimos, estamos cerrados en este momento.\n${horarioInfo.mensaje}`
                        }
                    </p>

                    {!servicioDisponible && (
                        <div className="bg-orange-50 rounded-lg p-4 text-sm text-gray-700">
                            <p className="font-medium text-orange-600">💡 Tip</p>
                            <p className="mt-1">Puedes volver mañana o visitarnos directamente en nuestro establecimiento.</p>
                        </div>
                    )}

                    {!horarioInfo.abierto && configuracion && (
                        <div className="bg-orange-50 rounded-lg p-4 text-sm text-gray-700">
                            <p className="font-medium">Nuestro horario:</p>
                            <p className="mt-1 text-lg font-semibold text-orange-600">
                                {configuracion.hora_apertura} - {configuracion.hora_cierre}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Clases CSS para las transiciones
    const getTransitionClasses = () => {
        if (!transitionDirection) return "opacity-100 transform translate-x-0";

        if (transitionDirection === "left") {
            return "opacity-0 transform translate-x-8";
        } else {
            return "opacity-0 transform -translate-x-8";
        }
    };

    const getEnteringClasses = () => {
        if (!transitionDirection) return "opacity-100 transform translate-x-0";

        if (transitionDirection === "left") {
            return "animate-slideInFromRight";
        } else {
            return "animate-slideInFromLeft";
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white">
                {/* Categorías */}
                <div className="max-w-7xl mx-auto mt-0 px-0">
                    <div className="pt-4">
                        <nav className="flex space-x-6 overflow-x-auto px-4 md:px-6 scrollbar-hide">
                            {categorias.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => cambiarCategoria(cat.id)}
                                    className={`whitespace-nowrap py-2 text-sm font-medium transition-colors flex items-center gap-2 flex-shrink-0
                                        ${categoriaActiva === cat.id
                                            ? "text-orange-600"
                                            : "text-gray-600 hover:text-gray-800"
                                        }`}
                                >
                                    {/* Punto naranja para categoría activa */}
                                    {categoriaActiva === cat.id && (
                                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    )}
                                    <span className="capitalize">
                                        {cat.nombre}
                                    </span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>

            {/* Contenido principal con transición */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 relative overflow-hidden">
                {/* Contenido saliente */}
                {transitionDirection && (
                    <div
                        className={`absolute inset-0 px-4 md:px-6 py-8 transition-all duration-300 ease-in-out ${getTransitionClasses()}`}
                        key={`outgoing-${prevCategoria}`}
                    >
                        {renderContent(prevCategoria)}
                    </div>
                )}

                {/* Contenido entrante */}
                <div
                    className={`transition-all duration-300 ease-in-out ${transitionDirection ? getEnteringClasses() : ''}`}
                    key={`incoming-${categoriaActiva}`}
                >
                    {renderContent(categoriaActiva)}
                </div>
            </div>

            {/* Botón flotante del carrito */}
            {productosCarrito.length > 0 && (
                <div className="fixed bottom-6 right-6 z-50">
                    <button
                        onClick={() => setMostrarCarrito(true)}
                        className="relative bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all"
                    >
                        <FaShoppingCart className="w-6 h-6" />
                        <span className="absolute border-orange-700 border -top-2 -left-2 bg-white text-orange-600 text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow">
                            {productosCarrito.reduce((sum, p) => sum + p.cantidad, 0)}
                        </span>
                    </button>
                </div>
            )}

            {/* Modal del carrito */}
            {mostrarCarrito && (
                <CarritoResumen
                    tipo="domicilio"
                    onClose={() => setMostrarCarrito(false)}
                />
            )}
        </div>
    );

    // Función para renderizar el contenido basado en la categoría
    function renderContent(categoria: string) {
        if (categoria === "todas") {
            return productosAgrupados.length === 0 ? (
                <div className="text-center py-16">
                    <h3 className="text-lg font-medium text-gray-900">No hay productos disponibles</h3>
                </div>
            ) : (
                <div className="space-y-8">
                    {productosAgrupados.map(grupo => (
                        <div key={grupo.categoria} className="space-y-2">
                            {/* Título de la categoría con botón "Ver más" */}
                            <div className="flex items-center justify-between md:px-0">
                                <h2 className="text-lg md:text-xl font-bold text-gray-900">{grupo.categoria}</h2>
                                <button
                                    onClick={() => cambiarCategoria((grupo.categoria || "General").toLowerCase().replace(/\s+/g, "-"))}
                                    className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1"

                                >
                                    Ver más
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            {/* Slider horizontal - Móvil y Tablet (hasta lg) */}
                            <div className="lg:hidden">
                                <div className="overflow-x-auto scrollbar-hide pb-1">
                                    <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
                                        {grupo.productos.map(producto => (
                                            <div key={producto.id} className="flex-shrink-0 w-40">
                                                <ProductoCard
                                                    producto={producto}
                                                    todosLosProductos={productos}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Grid - Solo en desktop (lg en adelante) */}
                            <div className="hidden lg:grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
                                {grupo.productos.map(producto => (
                                    <ProductoCard
                                        key={producto.id}
                                        producto={producto}
                                        todosLosProductos={productos}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            );
        } else {
            return productosFiltrados.length === 0 ? (
                <div className="text-center py-16">
                    <div className="mx-auto w-28 h-28 bg-gradient-to-br from-orange-100 to-white rounded-full flex items-center justify-center mb-4">
                        <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5" />
                        </svg>
                    </div>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No hay productos disponibles</h3>
                    <p className="mt-1 text-sm text-gray-500">No se encontraron productos en esta categoría.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 md:gap-6">
                    {productosFiltrados.map(producto => (
                        <ProductoCard
                            key={producto.id}
                            producto={producto}
                            todosLosProductos={productos}
                        />
                    ))}
                </div>
            );
        }
    }
}

// Agregar los estilos de animación al CSS global
const styles = `
@keyframes slideInFromLeft {
    from {
        opacity: 0;
        transform: translateX(-30px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes slideInFromRight {
    from {
        opacity: 0;
        transform: translateX(30px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.animate-slideInFromLeft {
    animation: slideInFromLeft 0.3s ease-in-out forwards;
}

.animate-slideInFromRight {
    animation: slideInFromRight 0.3s ease-in-out forwards;
}
`;

// Inyectar los estilos
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}