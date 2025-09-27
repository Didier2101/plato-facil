"use client";

import React, { useState, useEffect } from "react";
import { obtenerProductosAction } from "@/src/actions/obtenerProductosAction";
import { useCarritoStore } from "@/src/store/carritoStore";
import Swal from "sweetalert2";

import type { ProductoFrontend } from "@/src/types/producto";
import ProductoCard from "@/src/components/tienda/ProductoCard";
import CarritoResumen from "@/src/components/tienda/CarritoResumen";

import { FiSettings } from "react-icons/fi";
import { FaShoppingCart } from "react-icons/fa";
import Loading from "../ui/Loading";


export default function Domicilios() {
    const [productos, setProductos] = useState<ProductoFrontend[]>([]);
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

    useEffect(() => {
        const cargarProductos = async () => {
            try {
                setLoading(true);
                const result = await obtenerProductosAction();

                if (result.success && result.productos) {
                    const productosActivos = result.productos.filter(p => p.activo);
                    setProductos(productosActivos);
                } else {
                    Swal.fire("❌ Error", result.error || "No se pudieron cargar los productos", "error");
                }
            } catch (error) {
                console.error("Error cargando productos:", error);
                Swal.fire("❌ Error", "Error inesperado al cargar productos", "error");
            } finally {
                setLoading(false);
            }
        };

        cargarProductos();
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
            {/* Header (diseño tomado del componente inicial) */}
            <div className="bg-white border-b border-gray-200 px-6 py-6 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-500 p-3 rounded-xl">
                            <FiSettings className="text-2xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Pedidos a Domicilio</h1>
                            <p className="text-sm text-gray-600 mt-1">Haz tu pedido y te lo llevamos a tu ubicación</p>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full" />
                            <span>Entrega estimada: 30–45 min</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full" />
                            <span>Personaliza tus productos</span>
                        </div>
                    </div>
                </div>

                {/* categorías (barra inferior del header) */}
                <div className="max-w-7xl mx-auto mt-4 px-0">
                    <div className="border-t border-gray-100 pt-4">
                        <nav className="flex space-x-4 overflow-x-auto">
                            {categorias.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategoriaActiva(cat.id)}
                                    className={`whitespace-nowrap py-2 px-3 rounded-md transition-colors text-sm font-medium
                    ${categoriaActiva === cat.id
                                            ? "bg-orange-50 border border-orange-200 text-orange-600"
                                            : "text-gray-600 hover:bg-gray-50"}
                  `}
                                >
                                    <span>{cat.nombre}</span>
                                    <span className={`ml-2 inline-block px-2 py-0.5 text-xs rounded-full ${categoriaActiva === cat.id ? "bg-orange-100 text-orange-800" : "bg-gray-100 text-gray-800"}`}>
                                        {cat.id === "todas" ? productos.length : productos.filter(p => p.categoria.toLowerCase().replace(/\s+/g, '-') === cat.id).length}
                                    </span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {productosFiltrados.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="mx-auto w-28 h-28 bg-gradient-to-br from-orange-100 to-white rounded-full flex items-center justify-center mb-4">
                            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5" />
                            </svg>
                        </div>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No hay productos disponibles</h3>
                        <p className="mt-1 text-sm text-gray-500">No se encontraron productos en esta categoría para entrega a domicilio.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {productosFiltrados.map(producto => (
                            <ProductoCard key={producto.id} producto={producto} />
                        ))}
                    </div>
                )}
            </div>

            {/* Resumen flotante del carrito — diseño acorde al primer componente (orange) */}
            {productosCarrito.length > 0 && (
                <div className="fixed bottom-15 right-5 z-50">
                    <button
                        onClick={() => setMostrarCarrito(true)}
                        className="relative bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg transition"
                    >
                        <FaShoppingCart className="w-6 h-6" />
                        <span className="absolute border-orange-700 border -top-2 -left-2 bg-white text-orange-600 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow">
                            {productosCarrito.reduce((sum, p) => sum + p.cantidad, 0)}
                        </span>
                    </button>
                </div>
            )}


            {/* Modal/Drawer del carrito */}
            {mostrarCarrito && (
                <CarritoResumen
                    tipo="domicilio"
                    onClose={() => setMostrarCarrito(false)}
                />
            )}
        </div>
    );
}
