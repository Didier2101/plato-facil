"use client";

import React, { useState, useEffect } from "react";
import { obtenerProductosAction } from "@/src/actions/obtenerProductosAction";
import { obtenerConfiguracionRestaurante } from "@/src/actions/dueno/configuracionRestauranteActions";
import { useCarritoStore } from "@/src/store/carritoStore";
import Swal from "sweetalert2";

import type { ProductoFrontend } from "@/src/types/producto";
import type { ConfiguracionRestaurante } from "@/src/actions/dueno/configuracionRestauranteActions";

import CarritoResumen from "@/src/components/tienda/CarritoResumen";

import { FaShoppingCart, FaClock, FaBan } from "react-icons/fa";
import Loading from "../ui/Loading";
import ProductoCard from "../tienda/ProductoCard";

export default function Domicilios() {
    const [productos, setProductos] = useState<ProductoFrontend[]>([]);
    const [configuracion, setConfiguracion] = useState<ConfiguracionRestaurante | null>(null);
    const [loading, setLoading] = useState(true);
    const [categoriaActiva, setCategoriaActiva] = useState<string>("todas");
    const [mostrarCarrito, setMostrarCarrito] = useState(false);

    const { productos: productosCarrito } = useCarritoStore();

    // Obtener categorías únicas (incluye 'todas')
    const categorias = [
        { id: "todas", nombre: "Todas" },
        ...Array.from(new Set(productos.map(p => p.categoria))).map(categoria => ({
            id: categoria.toLowerCase().replace(/\s+/g, "-"),
            nombre: categoria
        }))
    ];

    const productosFiltrados = categoriaActiva === "todas"
        ? productos
        : productos.filter(p => p.categoria.toLowerCase().replace(/\s+/g, '-') === categoriaActiva);

    // Agrupar productos por categoría (para vista "Todas")
    const productosAgrupados = categoriaActiva === "todas"
        ? Array.from(new Set(productos.map(p => p.categoria))).map(cat => ({
            categoria: cat,
            productos: productos.filter(p => p.categoria === cat)
        }))
        : [];

    // Verificar si el restaurante está abierto
    const verificarHorario = (config: ConfiguracionRestaurante): { abierto: boolean; mensaje: string } => {
        if (!config.hora_apertura || !config.hora_cierre) {
            return { abierto: true, mensaje: "" };
        }

        const ahora = new Date();
        const horaActual = ahora.getHours() * 60 + ahora.getMinutes();

        const [aperturaHoras, aperturaMinutos] = config.hora_apertura.split(':').map(Number);
        const [cierreHoras, cierreMinutos] = config.hora_cierre.split(':').map(Number);

        const apertura = aperturaHoras * 60 + aperturaMinutos;
        const cierre = cierreHoras * 60 + cierreMinutos;

        const abierto = horaActual >= apertura && horaActual <= cierre;

        if (!abierto) {
            return {
                abierto: false,
                mensaje: `Horario de atención: ${config.hora_apertura} - ${config.hora_cierre}`
            };
        }

        return { abierto: true, mensaje: "" };
    };

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);

                // Cargar configuración del restaurante
                const configResult = await obtenerConfiguracionRestaurante();
                if (configResult.success && configResult.configuracion) {
                    setConfiguracion(configResult.configuracion);
                }

                // Cargar productos
                const result = await obtenerProductosAction();

                if (result.success && result.productos) {
                    const productosActivos = result.productos.filter(p => p.activo);
                    setProductos(productosActivos);
                } else {
                    Swal.fire("❌ Error", result.error || "No se pudieron cargar los productos", "error");
                }
            } catch (error) {
                console.error("Error cargando datos:", error);
                Swal.fire("❌ Error", "Error inesperado al cargar datos", "error");
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, []);

    if (loading) {
        return (
            <Loading
                texto="Cargando productos..."
                tamaño="mediano"
                color="orange-500"
            />
        );
    }

    // Verificar estado del servicio
    const servicioDisponible = configuracion?.domicilio_activo ?? true;
    const horarioInfo = configuracion ? verificarHorario(configuracion) : { abierto: true, mensaje: "" };

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
                                    onClick={() => setCategoriaActiva(cat.id)}
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

            {/* Contenido principal */}
            <div className="max-w-7xl mx-auto px-2 md:px-6 py-8">
                {categoriaActiva === "todas" ? (
                    // Vista "Todas": Mostrar categorías con sliders horizontales
                    <div className="space-y-8">
                        {productosAgrupados.length === 0 ? (
                            <div className="text-center py-16">
                                <h3 className="text-lg font-medium text-gray-900">No hay productos disponibles</h3>
                            </div>
                        ) : (
                            productosAgrupados.map(grupo => (
                                <div key={grupo.categoria} className="space-y-2">
                                    {/* Título de la categoría */}
                                    <h2 className="text-lg md:text-xl font-bold text-gray-900 px-4 md:px-0">{grupo.categoria}</h2>

                                    {/* Slider horizontal - Móvil y Tablet (hasta lg) */}
                                    <div className="lg:hidden">
                                        <div className="overflow-x-auto scrollbar-hide pb-1">
                                            <div className="flex gap-4 px-4" style={{ minWidth: 'max-content' }}>
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
                            ))
                        )}
                    </div>
                ) : (
                    // Vista categoría específica: Grid en todas las pantallas
                    productosFiltrados.length === 0 ? (
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
                        // Grid responsive: 2 móvil, 3 tablet, auto-fit en desktop
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 md:gap-6">
                            {productosFiltrados.map(producto => (
                                <ProductoCard
                                    key={producto.id}
                                    producto={producto}
                                    todosLosProductos={productos}
                                />
                            ))}
                        </div>
                    )
                )}
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
}