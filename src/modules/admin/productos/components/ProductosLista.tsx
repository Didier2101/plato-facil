"use client";

import { useEffect, useState, useCallback } from "react";
import { Eye, Package } from "lucide-react"; // Añadí Package
import Image from "next/image";
import Link from "next/link";
import DetalleProducto from "./DetalleProducto";
import { formatearPrecioCOP } from "@/src/shared/utils/precio";
import type { ProductoFrontend } from "@/src/modules/admin/productos/types/producto";
import { capitalizarSoloPrimera } from "@/src/shared/utils/texto";
import { FaList, FaBoxOpen, FaSearch } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import Loading from "@/src/shared/components/ui/Loading";
import Paginacion from "@/src/shared/components/Paginacion";
import { useProductos } from "@/src/modules/admin/productos/hooks/useProductos";
import { PRIVATE_ROUTES } from '@/src/shared/constants/app-routes';
import { PageHeader } from '@/src/shared/components'; // Importar PageHeader

export default function ProductosLista() {
    const {
        productos,
        loading,
        actualizarProducto,
        desactivarProducto,
    } = useProductos();
    const [productosFiltrados, setProductosFiltrados] = useState<ProductoFrontend[]>([]);

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
            filtrados = filtrados.filter(
                (producto) =>
                    producto.nombre.toLowerCase().includes(termino) ||
                    producto.descripcion?.toLowerCase().includes(termino)
            );
        }

        setProductosFiltrados(filtrados);
        setPagina(1); // Resetear a primera página cuando cambia la búsqueda
    }, [productos, terminoBusqueda]);

    useEffect(() => {
        aplicarFiltros();
    }, [aplicarFiltros]); // Ahora aplicarFiltros es una dependencia estable

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

    const handleProductoActualizado = async (productoActualizado: ProductoFrontend) => {
        // Usar la función del hook para actualizar
        await actualizarProducto(productoActualizado.id, productoActualizado);
        handleCerrarDetalle();
    };

    const handleProductoEliminado = async (productoId: string, activo: boolean) => {
        // Usar la función del hook para desactivar/activar
        await desactivarProducto(productoId, activo);
        handleCerrarDetalle();
    };

    if (loading) {
        return (
            <Loading texto="Cargando productos..." tamaño="mediano" color="orange-500" />
        );
    }

    if (productos.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                {/* Usando PageHeader aquí también */}
                <PageHeader
                    title="Gestión de Productos"
                    description="Administra y organiza tu menú"
                    icon={<Package />}
                    variant="productos"
                    showBorder={true}
                />

                <div className="px-6 py-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                        <div className="text-gray-400 mb-6">
                            <FaBoxOpen className="mx-auto text-5xl mb-4" />
                            <h3 className="text-2xl font-semibold text-gray-900 mb-3">No hay productos</h3>
                            <p className="text-gray-600 mb-8 text-lg">
                                Aún no has agregado ningún producto. ¡Crea tu primer producto!
                            </p>
                            <Link
                                className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-lg font-semibold px-8 py-4 rounded-2xl hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg hover:shadow-xl"
                                href={PRIVATE_ROUTES.ADMIN.PRODUCTOS_NUEVO}
                            >
                                <FaList className="text-xl" />
                                Crear primer producto
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Usando PageHeader */}
            <PageHeader
                title="Gestión de Productos"
                description="Administra y organiza tu menú"
                icon={<Package />}
                variant="productos"
                showBorder={true}
            />

            <div className="px-6 py-8">
                <div className="space-y-6">
                    {/* Búsqueda - ahora en una card separada */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-end">
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
                                            <AiOutlineClose className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="w-full lg:w-auto">
                                <Link
                                    href={PRIVATE_ROUTES.ADMIN.PRODUCTOS_NUEVO}
                                    className="w-full lg:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-semibold px-6 py-3 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all shadow-md hover:shadow-lg"
                                >
                                    <FaList className="text-lg" />
                                    Crear nuevo producto
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Desktop: Tabla */}
                    <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        {productosFiltrados.length === 0 ? (
                            <div className="text-center py-16">
                                <FaBoxOpen className="mx-auto text-5xl text-gray-300 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    No se encontraron productos
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {terminoBusqueda
                                        ? "No hay productos que coincidan con tu búsqueda."
                                        : "No hay productos disponibles."}
                                </p>
                                {terminoBusqueda ? (
                                    <button
                                        onClick={limpiarBusqueda}
                                        className="px-6 py-3 text-sm font-semibold text-orange-600 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all duration-200 border border-orange-200"
                                    >
                                        Limpiar búsqueda
                                    </button>
                                ) : (
                                    <Link
                                        href={PRIVATE_ROUTES.ADMIN.PRODUCTOS_NUEVO}
                                        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-orange-600 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all duration-200 border border-orange-200"
                                    >
                                        <FaList />
                                        Crear nuevo producto
                                    </Link>
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

                    {/* Mobile: Cards */}
                    <div className="grid gap-4 lg:hidden">
                        {productosFiltrados.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
                                <FaBoxOpen className="mx-auto text-3xl text-gray-300 mb-3" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    No se encontraron productos
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {terminoBusqueda
                                        ? "No hay productos que coincidan con tu búsqueda."
                                        : "No hay productos disponibles."}
                                </p>
                                {terminoBusqueda ? (
                                    <button
                                        onClick={limpiarBusqueda}
                                        className="px-6 py-2 text-sm font-semibold text-orange-600 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all duration-200 border border-orange-200"
                                    >
                                        Limpiar búsqueda
                                    </button>
                                ) : (
                                    <Link
                                        href={PRIVATE_ROUTES.ADMIN.PRODUCTOS_NUEVO}
                                        className="inline-flex items-center gap-2 px-6 py-2 text-sm font-semibold text-orange-600 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all duration-200 border border-orange-200"
                                    >
                                        <FaList />
                                        Crear nuevo producto
                                    </Link>
                                )}
                            </div>
                        ) : (
                            productosPaginados.map((producto) => (
                                <div
                                    key={producto.id}
                                    className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
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

                    {/* Paginación */}
                    {totalPaginas > 1 && productosFiltrados.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                            <Paginacion
                                pagina={pagina}
                                setPagina={setPagina}
                                totalPaginas={totalPaginas}
                                itemsPorPagina={itemsPorPagina}
                                setItemsPorPagina={setItemsPorPagina}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de detalles */}
            {mostrarDetalle && productoSeleccionado && (
                <DetalleProducto
                    producto={productoSeleccionado}
                    onCerrar={handleCerrarDetalle}
                    onProductoActualizado={handleProductoActualizado}
                    onProductoEliminado={(productoId) =>
                        handleProductoEliminado(
                            productoId,
                            !productoSeleccionado.activo
                        )
                    }
                />
            )}
        </div>
    );
}