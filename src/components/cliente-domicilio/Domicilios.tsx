
"use client";

import { useState, useEffect } from "react";
import { obtenerProductosAction } from "@/src/actions/obtenerProductosAction";
import { useCarritoStore } from "@/src/store/carritoStore";

import Swal from "sweetalert2";



// Usar el tipo canonical del proyecto
import type { ProductoFrontend } from "@/src/types/producto";
import ProductoCard from "@/src/components/tienda/ProductoCard";
import MisOrdenes from "@/src/components/cliente-domicilio/MisOrdenes";
import CarritoResumen from "@/src/components/tienda/CarritoResumen";

export default function Domicilios() {
    const [productos, setProductos] = useState<ProductoFrontend[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoriaActiva, setCategoriaActiva] = useState<string>("todas");
    const [mostrarCarrito, setMostrarCarrito] = useState(false);
    const [tabActivo, setTabActivo] = useState<'productos' | 'misordenes'>('productos');

    const { productos: productosCarrito, total } = useCarritoStore();

    // Obtener categorías únicas
    const categorias = [
        { id: "todas", nombre: "Todas" },
        ...Array.from(
            new Set(productos.map(p => p.categoria))
        ).map(categoria => ({
            id: categoria.toLowerCase().replace(/\s+/g, '-'),
            nombre: categoria
        }))
    ];

    // Filtrar productos por categoría
    const productosFiltrados = categoriaActiva === "todas"
        ? productos
        : productos.filter(p => p.categoria.toLowerCase().replace(/\s+/g, '-') === categoriaActiva);

    // Cargar productos al iniciar
    useEffect(() => {
        const cargarProductos = async () => {
            try {
                setLoading(true);
                const result = await obtenerProductosAction();

                if (result.success && result.productos) {
                    // Solo productos activos
                    const productosActivos = result.productos.filter(p => p.activo);
                    setProductos(productosActivos);
                } else {
                    Swal.fire("❌ Error", result.error || "No se pudieron cargar los productos", "error");
                }
            } catch (error) {
                console.error('Error cargando productos:', error);
                Swal.fire("❌ Error", "Error inesperado al cargar productos", "error");
            } finally {
                setLoading(false);
            }
        };

        cargarProductos();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                <span className="ml-3 text-gray-600">Cargando...</span>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-xl">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Pedidos a Domicilio</h1>
                                <p className="text-sm text-gray-600">Entregamos en tu ubicación</p>
                            </div>
                        </div>

                        {/* Información de entrega */}
                        <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Tiempo estimado: 30-45 min</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>Productos personalizables</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs principales */}
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex space-x-8 border-b border-gray-200">
                        <button
                            onClick={() => setTabActivo('productos')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${tabActivo === 'productos'
                                ? 'border-green-500 text-green-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <span>Hacer Pedido</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setTabActivo('misordenes')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${tabActivo === 'misordenes'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <span>Mis Órdenes</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Contenido según tab activo */}
            {tabActivo === 'productos' ? (
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Información adicional para domicilio */}


                    {/* Tabs de categorías con estilo domicilio */}
                    <div className="mb-8">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8 overflow-x-auto">
                                {categorias.map((categoria) => (
                                    <button
                                        key={categoria.id}
                                        onClick={() => setCategoriaActiva(categoria.id)}
                                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${categoriaActiva === categoria.id
                                            ? "border-green-500 text-green-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                            }`}
                                    >
                                        {categoria.nombre}
                                        <span className={`ml-2 rounded-full px-2 py-1 text-xs ${categoriaActiva === categoria.id
                                            ? "bg-green-100 text-green-800"
                                            : "bg-gray-100 text-gray-900"
                                            }`}>
                                            {categoria.id === "todas"
                                                ? productos.length
                                                : productos.filter(p => p.categoria.toLowerCase().replace(/\s+/g, '-') === categoria.id).length
                                            }
                                        </span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Grid de productos */}
                    {productosFiltrados.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2-2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-1 1m1-1l-1-1m-6 2h2m-2 2h2" />
                                </svg>
                            </div>
                            <h3 className="mt-2 text-lg font-medium text-gray-900">No hay productos disponibles</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                No se encontraron productos en esta categoría para entrega a domicilio.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {productosFiltrados.map((producto) => (
                                <ProductoCard key={producto.id} producto={producto} />
                            ))}
                        </div>
                    )}

                    {/* Resumen flotante del carrito - estilo domicilio */}
                    {productosCarrito.length > 0 && (
                        <div className="fixed bottom-4 right-4 bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-3 rounded-lg shadow-xl z-50">
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-8v8a2 2 0 11-4 0v-8m4 0V9a2 2 0 10-4 0v4.01" />
                                    </svg>
                                    <div>
                                        <p className="text-sm font-medium">
                                            {productosCarrito.reduce((sum, p) => sum + p.cantidad, 0)} productos
                                        </p>
                                        <p className="text-lg font-bold">
                                            ${total.toLocaleString('es-CO')}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setMostrarCarrito(true)}
                                    className="bg-white text-green-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-md"
                                >
                                    Ver carrito
                                </button>
                            </div>

                            {/* Información de entrega mínima */}
                            {total < 50000 && (
                                <div className="mt-2 text-xs bg-white/20 backdrop-blur-sm rounded px-2 py-1">
                                    Faltan ${(50000 - total).toLocaleString('es-CO')} para entrega gratuita
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                // Tab de Mis Órdenes
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <MisOrdenes />
                </div>
            )}

            {/* Modal del carrito - tipo domicilio */}
            {mostrarCarrito && (
                <CarritoResumen
                    tipo="domicilio"
                    onClose={() => setMostrarCarrito(false)}
                />
            )}
        </div>
    )
}
