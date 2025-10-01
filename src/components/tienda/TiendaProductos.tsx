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
        <div className="p-6">
            {/* Header */}


            <div className="flex items-center gap-4">
                <div className="bg-orange-500 p-3 rounded-xl">
                    <FaStore className="text-white text-xl" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Tienda - haz tu orden
                    </h1>
                    <p className="text-gray-600">
                        {productos.length}{" "}
                        {productos.length === 1
                            ? "producto disponible"
                            : "productos disponibles"}
                    </p>
                </div>
            </div>



            {/* Tabs de categorías con scroll-x */}

            <div className="overflow-x-auto scrollbar-hide">
                <nav className="flex gap-2 sm:gap-3 py-3 min-w-max">
                    {categorias.map((categoria) => (
                        <button
                            key={categoria.id}
                            onClick={() => setCategoriaActiva(categoria.id)}
                            className={`flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${categoriaActiva === categoria.id
                                ? "bg-orange-500 text-white shadow-sm"
                                : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            {categoria.nombre}
                            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                {categoria.id === "todas"
                                    ? productos.length
                                    : productos.filter(
                                        (p) =>
                                            p.categoria
                                                .toLowerCase()
                                                .replace(/\s+/g, "-") ===
                                            categoria.id
                                    ).length}
                            </span>
                        </button>
                    ))}
                </nav>
            </div>


            {/* Contenido */}
            <div className="mt-2">
                {productosFiltrados.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                        <FaStore className="text-gray-300 text-5xl mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Sin productos
                        </h2>
                        <p className="text-gray-500">
                            No hay productos disponibles en esta categoría
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                        {productosFiltrados.map((producto) => (
                            <ProductoCard key={producto.id} producto={producto} />
                        ))}
                    </div>
                )}
            </div>

            {/* Carrito flotante */}
            {productosCarrito.length > 0 && (
                <div className="fixed bottom-20 right-8 z-50">
                    <button
                        onClick={() => setMostrarCarrito(true)}
                        className="relative bg-orange-600 text-white p-3 rounded-full shadow-lg hover:bg-orange-500 transition-colors"
                    >
                        {/* Ícono del carrito */}
                        <MdOutlineShoppingCart size={24} />

                        {/* Badge con cantidad */}
                        <span className="absolute -top-1 -right-1 bg-white text-orange-600 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow">
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
