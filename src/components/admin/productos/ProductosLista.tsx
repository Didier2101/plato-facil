"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import Image from "next/image";
import Paginacion from "../../Paginacion";
import DetalleProducto from "./DetalleProducto";
import { formatearPrecioCOP } from "@/src/utils/precio";
import type { ProductoFrontend } from "@/src/types/producto";
import { capitalizarSoloPrimera } from "@/src/utils/texto";
import { obtenerProductosAction } from "@/src/actions/obtenerProductosAction";

export default function ProductosLista() {
    const [productos, setProductos] = useState<ProductoFrontend[]>([]);
    const [loading, setLoading] = useState(true);

    // Paginación
    const [pagina, setPagina] = useState(1);
    const [itemsPorPagina, setItemsPorPagina] = useState(5);

    // Modal detalle
    const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoFrontend | null>(null);
    const [mostrarDetalle, setMostrarDetalle] = useState(false);

    useEffect(() => {
        cargarProductos();
    }, []);

    const cargarProductos = async () => {
        setLoading(true);
        try {
            const result = await obtenerProductosAction();
            if (result.success) {
                setProductos(result.productos || []);
            } else {
                setProductos([]);
                console.error("Error del servidor:", result.error);
            }
        } catch (error) {
            setProductos([]);
            console.error("Error cargando productos:", error);
        } finally {
            setLoading(false);
        }
    };

    const totalPaginas = Math.ceil(productos.length / itemsPorPagina);
    const inicio = (pagina - 1) * itemsPorPagina;
    const productosPaginados = productos.slice(inicio, inicio + itemsPorPagina);

    const handleVerDetalles = (producto: ProductoFrontend) => {
        setProductoSeleccionado(producto);
        setMostrarDetalle(true);
    };

    const handleCerrarDetalle = () => {
        setMostrarDetalle(false);
        setProductoSeleccionado(null);
    };

    const handleProductoActualizado = (productoActualizado: ProductoFrontend) => {
        setProductos((prev) =>
            prev.map((p) => (p.id === productoActualizado.id ? productoActualizado : p))
        );
        handleCerrarDetalle();
    };

    const handleProductoEliminado = (productoId: string) => {
        setProductos((prev) => prev.filter((p) => String(p.id) !== String(productoId)));
        handleCerrarDetalle();
    };

    if (loading) {
        return (
            <div className="bg-white rounded-3xl shadow-md p-12 text-center border border-gray-100">
                <p className="text-gray-500">Cargando productos...</p>
            </div>
        );
    }

    if (productos.length === 0) {
        return (
            <div className="bg-white rounded-3xl shadow-md p-12 text-center border border-gray-100">
                <div className="text-gray-400 mb-4">
                    <Eye size={48} className="mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-600">No hay productos</h3>
                    <p className="text-gray-500 mt-2">
                        Aún no has agregado ningún producto. ¡Crea tu primer producto!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {/* Desktop: Tabla */}
                <div className="hidden md:block bg-white rounded-3xl shadow-md overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-orange-50 border-b border-orange-100">
                                    <th className="p-6">Producto</th>
                                    <th className="p-6">Precio</th>
                                    <th className="p-6">Categoría</th>
                                    <th className="p-6">Estado</th>
                                    <th className="p-6 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {productosPaginados.map((producto) => (
                                    <tr key={producto.id} className="hover:bg-orange-50 transition">
                                        <td className="p-6 flex items-center space-x-4">
                                            {producto.imagen_url ? (
                                                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100">
                                                    <Image
                                                        src={producto.imagen_url}
                                                        alt={producto.nombre}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                                    <Eye size={20} className="text-orange-400" />
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-semibold text-gray-900">
                                                    {capitalizarSoloPrimera(producto.nombre)}
                                                </div>
                                                {producto.descripcion && (
                                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                                        {capitalizarSoloPrimera(producto.descripcion)}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6 font-bold text-green-600">
                                            {formatearPrecioCOP(producto.precio)}
                                        </td>
                                        <td className="p-6">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                                {capitalizarSoloPrimera(producto.categoria ?? "")}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${producto.activo
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {producto.activo ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <button
                                                onClick={() => handleVerDetalles(producto)}
                                                className="px-4 py-2 text-sm font-semibold text-orange-600 bg-orange-50 rounded-xl hover:bg-orange-100 transition"
                                            >
                                                Ver Detalles
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile: Cards */}
                <div className="grid gap-4 md:hidden">
                    {productosPaginados.map((producto) => (
                        <div
                            key={producto.id}
                            className="flex gap-4 p-4 bg-white rounded-2xl shadow border border-gray-100"
                        >
                            {producto.imagen_url ? (
                                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                                    <Image
                                        src={producto.imagen_url}
                                        alt={producto.nombre}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-20 h-20 bg-orange-100 rounded-xl flex items-center justify-center">
                                    <Eye size={24} className="text-orange-400" />
                                </div>
                            )}
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="font-semibold text-gray-900">
                                        {capitalizarSoloPrimera(producto.nombre)}
                                    </div>
                                    {producto.descripcion && (
                                        <div className="text-sm text-gray-500 truncate">
                                            {capitalizarSoloPrimera(producto.descripcion)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-green-600 font-bold">
                                        {formatearPrecioCOP(producto.precio)}
                                    </span>
                                    <button
                                        onClick={() => handleVerDetalles(producto)}
                                        className="px-3 py-1.5 text-xs font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition"
                                    >
                                        Ver
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Paginación */}
                {totalPaginas > 1 && (
                    <Paginacion
                        pagina={pagina}
                        setPagina={setPagina}
                        totalPaginas={totalPaginas}
                        itemsPorPagina={itemsPorPagina}
                        setItemsPorPagina={setItemsPorPagina}
                    />
                )}
            </div>

            {/* Modal de detalles */}
            {mostrarDetalle && productoSeleccionado && (
                <DetalleProducto
                    producto={productoSeleccionado}
                    onCerrar={handleCerrarDetalle}
                    onProductoActualizado={handleProductoActualizado}
                    onProductoEliminado={handleProductoEliminado}
                />
            )}
        </>
    );
}
