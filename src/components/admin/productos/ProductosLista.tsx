"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import Image from "next/image";
import Paginacion from "../../Paginacion";
import DetalleProducto from "./DetalleProducto";
import { formatearPrecioCOP } from "@/src/utils/precio";
import type { ProductoFrontend } from "@/src/types/producto";
import { capitalizarSoloPrimera } from "@/src/utils/texto";
import { obtenerProductosAction } from "@/src/actions/obtenerProductosAction"; // 🔹 Importar action

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
            if (result.success && result.productos) {
                setProductos(result.productos);
            }
        } catch (error) {
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
                {/* Tabla */}
                <div className="bg-white rounded-3xl shadow-md overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white border-b border-gray-200">
                                    <th className="p-6">Producto</th>
                                    <th className="p-6">Precio</th>
                                    <th className="p-6">Categoría</th>
                                    <th className="p-6">Estado</th>
                                    <th className="p-6 text-center">Ver Detalles</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {productosPaginados.map((producto) => (
                                    <tr key={producto.id} className="hover:bg-blue-50 transition">
                                        <td className="p-6">
                                            <div className="flex items-center space-x-4">
                                                {producto.imagen_url ? (
                                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                                                        <Image
                                                            src={producto.imagen_url}
                                                            alt={producto.nombre}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                                        <Eye size={20} className="text-gray-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {capitalizarSoloPrimera(producto.nombre)}
                                                    </div>
                                                    {producto.descripcion && (
                                                        <div className="text-sm text-gray-500 truncate max-w-xs">
                                                            {capitalizarSoloPrimera(producto.descripcion)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="font-semibold text-green-600 text-lg">
                                                {formatearPrecioCOP(producto.precio)}
                                            </div>
                                            <div className="text-xs text-green-500 mt-1">COP</div>
                                        </td>
                                        <td className="p-6">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
                                                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition"
                                            >
                                                <Eye size={16} className="mr-2" />
                                                Ver Detalles
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
