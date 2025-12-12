"use client";

import { useEffect, useState, useCallback } from "react";
import { Eye } from "lucide-react";
import Image from "next/image";
import Paginacion from "../../Paginacion";
import DetalleProducto from "./DetalleProducto";
import { formatearPrecioCOP } from "@/src/utils/precio";
import type { ProductoFrontend } from "@/src/types/producto";
import { capitalizarSoloPrimera } from "@/src/utils/texto";
import { obtenerProductosAction } from "@/src/actions/obtenerProductosAction";
import Loading from "../../ui/Loading";
import { FaList, FaPlus, FaBoxOpen, FaSearch } from "react-icons/fa";
import FormAgregarProducto from "./FormAgregarProducto";
import { AiOutlineClose } from "react-icons/ai";

export default function ProductosLista() {
    const [productos, setProductos] = useState<ProductoFrontend[]>([]);
    const [productosFiltrados, setProductosFiltrados] = useState<ProductoFrontend[]>([]);
    const [activeTab, setActiveTab] = useState<"lista" | "crear">("lista");
    const [loading, setLoading] = useState(true);

    // Búsqueda
    const [terminoBusqueda, setTerminoBusqueda] = useState("");

    // Paginación
    const [pagina, setPagina] = useState(1);
    const [itemsPorPagina, setItemsPorPagina] = useState(5);

    // Modal detalle
    const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoFrontend | null>(null);
    const [mostrarDetalle, setMostrarDetalle] = useState(false);

    // Mover la función aplicarFiltros dentro de useCallback
    const aplicarFiltros = useCallback(() => {
        let filtrados = [...productos];

        // Filtrar por término de búsqueda (nombre)
        if (terminoBusqueda.trim()) {
            const termino = terminoBusqueda.toLowerCase().trim();
            filtrados = filtrados.filter(producto =>
                producto.nombre.toLowerCase().includes(termino) ||
                producto.descripcion?.toLowerCase().includes(termino)
            );
        }

        setProductosFiltrados(filtrados);
        setPagina(1); // Resetear a primera página cuando cambia la búsqueda
    }, [productos, terminoBusqueda]);

    useEffect(() => {
        cargarProductos();
    }, []);

    useEffect(() => {
        aplicarFiltros();
    }, [aplicarFiltros]); // Ahora aplicarFiltros es una dependencia estable

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

    const limpiarBusqueda = () => {
        setTerminoBusqueda("");
    };

    const totalPaginas = Math.ceil(productosFiltrados.length / itemsPorPagina);
    const inicio = (pagina - 1) * itemsPorPagina;
    const productosPaginados = productosFiltrados.slice(inicio, inicio + itemsPorPagina);

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
            <Loading
                texto="Cargando productos..."
                tamaño="mediano"
                color="orange-500"
            />
        );
    }

    if (productos.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
                <div className="text-gray-400 mb-4">
                    <FaBoxOpen className="mx-auto text-4xl mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay productos</h3>
                    <p className="text-gray-600">
                        Aún no has agregado ningún producto. ¡Crea tu primer producto!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="bg-white border-b border-gray-200 px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-500 p-4 rounded-xl">
                            <FaBoxOpen className="text-2xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Gestión de Productos</h1>
                            <p className="text-gray-600">Administra y organiza tu menú</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6 p-2">
                {/* Header - Estilo Configuraciones */}


                <div className="flex bg-gray-50 rounded-xl p-2">
                    <button
                        onClick={() => setActiveTab("lista")}
                        className={`flex items-center justify-center gap-3 flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${activeTab === "lista"
                            ? "bg-white text-orange-600 shadow-md"
                            : "text-gray-600 hover:text-gray-800"
                            }`}
                    >
                        <FaList className="text-lg" />
                        <span>Lista</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("crear")}
                        className={`flex items-center justify-center gap-3 flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${activeTab === "crear"
                            ? "bg-white text-orange-600 shadow-md"
                            : "text-gray-600 hover:text-gray-800"
                            }`}
                    >
                        <FaPlus className="text-lg" />
                        <span>Crear</span>
                    </button>
                </div>

                {/* Contenido */}
                <div>
                    {activeTab === "crear" && (
                        <FormAgregarProducto />
                    )}
                </div>

                {/* Búsqueda - Solo en lista */}
                {activeTab === "lista" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 max-w-7xl mx-auto">
                        <div className="flex flex-col lg:flex-row gap-4 items-end">
                            {/* Búsqueda por nombre */}
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Buscar productos
                                </label>
                                <div className="relative">
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre o descripción..."
                                        value={terminoBusqueda}
                                        onChange={(e) => setTerminoBusqueda(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                    />
                                    {terminoBusqueda && (
                                        <button
                                            onClick={limpiarBusqueda}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {/* Replace the 'x' with the icon component */}
                                            <AiOutlineClose className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>


                    </div>
                )}

                {/* Desktop: Tabla - Estilo Configuraciones */}
                {activeTab === "lista" && (
                    <>
                        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            {productosFiltrados.length === 0 ? (
                                <div className="text-center py-12">
                                    <FaBoxOpen className="mx-auto text-4xl text-gray-300 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron productos</h3>
                                    <p className="text-gray-600 mb-4">
                                        {terminoBusqueda
                                            ? "No hay productos que coincidan con tu búsqueda."
                                            : "No hay productos disponibles."}
                                    </p>
                                    {terminoBusqueda && (
                                        <button
                                            onClick={limpiarBusqueda}
                                            className="px-6 py-2 text-sm font-semibold text-orange-600 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all duration-200 border border-orange-200"
                                        >
                                            Limpiar búsqueda
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-orange-50 border-b border-orange-100">
                                                <th className="p-6 text-left font-semibold text-gray-900">Producto</th>
                                                <th className="p-6 text-left font-semibold text-gray-900">Precio</th>
                                                <th className="p-6 text-left font-semibold text-gray-900">Categoría</th>
                                                <th className="p-6 text-left font-semibold text-gray-900">Estado</th>
                                                <th className="p-6 text-center font-semibold text-gray-900">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {productosPaginados.map((producto) => (
                                                <tr key={producto.id} className="hover:bg-orange-50/30 transition">
                                                    <td className="p-6">
                                                        <div className="flex items-center space-x-4">
                                                            {producto.imagen_url ? (
                                                                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                                                    <Image
                                                                        src={producto.imagen_url}
                                                                        alt={producto.nombre}
                                                                        fill
                                                                        priority
                                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center border border-orange-200">
                                                                    <Eye size={20} className="text-orange-500" />
                                                                </div>
                                                            )}
                                                            <div className="min-w-0 flex-1">
                                                                <div className="font-semibold text-gray-900 truncate">
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
                                                        <span className="font-bold text-green-600 text-lg">
                                                            {formatearPrecioCOP(producto.precio)}
                                                        </span>
                                                    </td>
                                                    <td className="p-6">
                                                        <span className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-orange-100 text-orange-700 border border-orange-200">
                                                            {capitalizarSoloPrimera(producto.categoria ?? "Sin categoría")}
                                                        </span>
                                                    </td>
                                                    <td className="p-6">
                                                        <span
                                                            className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border ${producto.activo
                                                                ? "bg-green-100 text-green-800 border-green-200"
                                                                : "bg-red-100 text-red-800 border-red-200"
                                                                }`}
                                                        >
                                                            {producto.activo ? "Activo" : "Inactivo"}
                                                        </span>
                                                    </td>
                                                    <td className="p-6 text-center">
                                                        <button
                                                            onClick={() => handleVerDetalles(producto)}
                                                            className="px-5 py-2.5 text-sm font-semibold text-orange-600 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all duration-200 border border-orange-200 hover:border-orange-300"
                                                        >
                                                            Ver Detalles
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Mobile: Cards - Estilo Configuraciones */}
                        <div className="grid gap-4 lg:hidden">
                            {productosFiltrados.length === 0 ? (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
                                    <FaBoxOpen className="mx-auto text-3xl text-gray-300 mb-3" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron productos</h3>
                                    <p className="text-gray-600 mb-4">
                                        {terminoBusqueda
                                            ? "No hay productos que coincidan con tu búsqueda."
                                            : "No hay productos disponibles."}
                                    </p>
                                    {terminoBusqueda && (
                                        <button
                                            onClick={limpiarBusqueda}
                                            className="px-6 py-2 text-sm font-semibold text-orange-600 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all duration-200 border border-orange-200"
                                        >
                                            Limpiar búsqueda
                                        </button>
                                    )}
                                </div>
                            ) : (
                                productosPaginados.map((producto) => (
                                    <div
                                        key={producto.id}
                                        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4"
                                    >
                                        <div className="flex gap-4">
                                            {producto.imagen_url ? (
                                                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                                    <Image
                                                        src={producto.imagen_url}
                                                        alt={producto.nombre}
                                                        fill
                                                        priority
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-20 h-20 bg-orange-100 rounded-xl flex items-center justify-center border border-orange-200">
                                                    <Eye size={24} className="text-orange-500" />
                                                </div>
                                            )}
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="font-semibold text-gray-900 mb-1">
                                                        {capitalizarSoloPrimera(producto.nombre)}
                                                    </div>
                                                    {producto.descripcion && (
                                                        <div className="text-sm text-gray-500 line-clamp-2">
                                                            {capitalizarSoloPrimera(producto.descripcion)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between mt-3">
                                                    <span className="text-green-600 font-bold text-lg">
                                                        {formatearPrecioCOP(producto.precio)}
                                                    </span>
                                                    <button
                                                        onClick={() => handleVerDetalles(producto)}
                                                        className="px-4 py-2 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-all duration-200"
                                                    >
                                                        Ver
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                                {capitalizarSoloPrimera(producto.categoria ?? "Sin categoría")}
                                            </span>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${producto.activo
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {producto.activo ? "Activo" : "Inactivo"}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Paginación - Estilo Configuraciones */}
                        {totalPaginas > 1 && productosFiltrados.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                <Paginacion
                                    pagina={pagina}
                                    setPagina={setPagina}
                                    totalPaginas={totalPaginas}
                                    itemsPorPagina={itemsPorPagina}
                                    setItemsPorPagina={setItemsPorPagina}
                                />
                            </div>
                        )}
                    </>
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
        </div>
    );
}