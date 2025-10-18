"use client";

import { useState, useEffect } from "react";
import { obtenerProductosAction } from "@/src/actions/obtenerProductosAction";
import { useCarritoStore } from "@/src/store/carritoStore";
import CarritoResumen from "./CarritoResumen";
import Swal from "sweetalert2";
import ProductoCard from "./ProductoCard";
import { ProductoFrontend } from "@/src/types/producto";
import Loading from "../ui/Loading";
import { FaStore } from "react-icons/fa";
import { MdOutlineShoppingCart } from "react-icons/md";

export default function TiendaProductos() {
    const [productos, setProductos] = useState<ProductoFrontend[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoriaActiva, setCategoriaActiva] = useState<string>("todas");
    const [mostrarCarrito, setMostrarCarrito] = useState(false);

    const { productos: productosCarrito } = useCarritoStore();

    // Categorías únicas
    const categorias = [
        { id: "todas", nombre: "Todas" },
        ...Array.from(new Set(productos.map((p) => p.categoria))).map(
            (categoria) => ({
                id: categoria.toLowerCase().replace(/\s+/g, "-"),
                nombre: categoria,
            })
        ),
    ];

    // Filtrar productos
    const productosFiltrados =
        categoriaActiva === "todas"
            ? productos
            : productos.filter(
                (p) =>
                    p.categoria.toLowerCase().replace(/\s+/g, "-") ===
                    categoriaActiva
            );

    // Agrupar productos por categoría (para vista "Todas")
    const productosAgrupados = categoriaActiva === "todas"
        ? Array.from(new Set(productos.map(p => p.categoria))).map(cat => ({
            categoria: cat,
            productos: productos.filter(p => p.categoria === cat)
        }))
        : [];

    // Cargar productos
    useEffect(() => {
        const cargarProductos = async () => {
            try {
                setLoading(true);
                const result = await obtenerProductosAction();

                if (result.success && result.productos) {
                    setProductos(result.productos.filter((p) => p.activo));
                } else {
                    Swal.fire(
                        "❌ Error",
                        result.error || "No se pudieron cargar los productos",
                        "error"
                    );
                }
            } catch (error) {
                console.error("Error cargando productos:", error);
                Swal.fire(
                    "❌ Error",
                    "Error inesperado al cargar productos",
                    "error"
                );
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
        <div className="min-h-screen">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white">
                <div className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-500 p-3 rounded-xl">
                            <FaStore className="text-white text-xl" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Menu disponible
                            </h1>
                            <p className="text-gray-600">
                                {productos.length}{" "}
                                {productos.length === 1
                                    ? "producto disponible"
                                    : "productos disponibles"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs de categorías con scroll-x */}
                <div className="max-w-7xl mx-auto px-0">
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
                                    <span>{cat.nombre}</span>
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
                                                        <ProductoCard producto={producto} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Grid - Solo en desktop (lg en adelante) */}
                                    <div className="hidden lg:grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
                                        {grupo.productos.map(producto => (
                                            <ProductoCard key={producto.id} producto={producto} />
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
                                <ProductoCard key={producto.id} producto={producto} />
                            ))}
                        </div>
                    )
                )}
            </div>

            {/* Carrito flotante */}
            {productosCarrito.length > 0 && (
                <div className="fixed bottom-6 right-6 z-50">
                    <button
                        onClick={() => setMostrarCarrito(true)}
                        className="relative bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all"
                    >
                        <MdOutlineShoppingCart className="w-6 h-6" />
                        <span className="absolute border-orange-700 border -top-2 -left-2 bg-white text-orange-600 text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow">
                            {productosCarrito.reduce((sum, p) => sum + p.cantidad, 0)}
                        </span>
                    </button>
                </div>
            )}

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