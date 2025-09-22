"use client";

import { useState, useEffect } from "react";
import { obtenerProductosAction } from "@/src/actions/obtenerProductosAction";
import { useCarritoStore } from "@/src/store/carritoStore";
import CarritoResumen from "./CarritoResumen";
import Swal from "sweetalert2";
import ProductoCard from "./ProductoCard";
import { ProductoFrontend } from "@/src/types/producto";

// Usar el tipo que devuelve el action


export default function TiendaProductos() {
    const [productos, setProductos] = useState<ProductoFrontend[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoriaActiva, setCategoriaActiva] = useState<string>("todas");
    const [mostrarCarrito, setMostrarCarrito] = useState(false);

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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                <span className="ml-3 text-gray-600">Cargando productos...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-800">Nuestra Tienda</h1>

                        {/* Indicador de productos con ingredientes */}
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span>Personaliza cada producto</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Tabs de categorías */}
                <div className="mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8 overflow-x-auto">
                            {categorias.map((categoria) => (
                                <button
                                    key={categoria.id}
                                    onClick={() => setCategoriaActiva(categoria.id)}
                                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${categoriaActiva === categoria.id
                                        ? "border-orange-500 text-orange-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                        }`}
                                >
                                    {categoria.nombre}
                                    <span className="ml-2 bg-gray-100 text-gray-900 rounded-full px-2 py-1 text-xs">
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
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2-2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-1 1m1-1l-1-1m-6 2h2m-2 2h2" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            No se encontraron productos en esta categoría.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {productosFiltrados.map((producto) => (
                            <ProductoCard key={producto.id} producto={producto} />
                        ))}
                    </div>
                )}

                {/* Resumen flotante del carrito */}
                {productosCarrito.length > 0 && (
                    <div className="fixed bottom-4 right-4 bg-orange-600 text-white px-4 py-3 rounded-lg shadow-lg z-50">
                        <div className="flex items-center space-x-3">
                            <div>
                                <p className="text-sm font-medium">
                                    {productosCarrito.reduce((sum, p) => sum + p.cantidad, 0)} productos
                                </p>
                                <p className="text-lg font-bold">
                                    ${total.toLocaleString('es-CO')}
                                </p>
                            </div>
                            <button
                                onClick={() => setMostrarCarrito(true)}
                                className="bg-white text-orange-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
                            >
                                Ver carrito
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal del carrito */}
            {mostrarCarrito && (
                <CarritoResumen
                    tipo="establecimiento"
                    onClose={() => setMostrarCarrito(false)}
                />
            )}
        </div>
    );
}