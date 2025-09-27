"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Swal from "sweetalert2";
import {
    FiTrendingUp,
    FiCalendar,
    FiPackage,
    FiClock,
    FiFilter,

} from "react-icons/fi";
import {
    FaStore,
    FaMotorcycle,

    FaDollarSign,

} from "react-icons/fa";
import { obtenerReporteAvanzadoAction } from "@/src/actions/dueno/obtenerReporteAvanzadoAction";
import Loading from "../ui/Loading";
import { TbFidgetSpinner } from "react-icons/tb";

// Esquema de validación para filtros
const schemaFiltros = z.object({
    fechaInicio: z.string().min(1, "La fecha de inicio es obligatoria"),
    fechaFin: z.string().min(1, "La fecha de fin es obligatoria"),
});

type FiltrosData = z.infer<typeof schemaFiltros>;

// Tipos actualizados según la base de datos real
interface ReporteUsuario {
    id: string;
    nombre: string;
    rol: string;
    totalVentas: number;
    pedidos: number;
    promedioVenta: number;
}

interface ReporteProducto {
    nombre: string;
    cantidad: number;
    ingresos: number;
    categoria?: string;
}

interface OrdenDetallada {
    id: string;
    cliente_nombre: string;
    cliente_telefono: string;
    cliente_direccion: string;
    total: number;
    estado: string;
    tipo_orden: string;
    vendedor: string;
    entregador?: string;
    cajero?: string;
    created_at: string;
    fecha_entrega?: string;
    metodo_pago: string;
    propina?: number;
}

interface ReporteDatos {
    // Totales generales
    totalVentas: number;
    totalPropinas: number;
    totalPedidos: number;
    promedioVenta: number;

    // Análisis por usuario
    ventasPorUsuario: ReporteUsuario[];

    // Productos
    masVendidos: ReporteProducto[];
    menosVendidos: ReporteProducto[];
    ventasPorCategoria: ReporteProducto[];

    // Análisis temporal
    ventasPorHora: { hora: number; ventas: number; pedidos: number }[];

    // Órdenes detalladas
    ordenesDetalladas: OrdenDetallada[];

    // Métodos de pago
    ventasPorMetodoPago: { metodo: string; cantidad: number; monto: number }[];

    // Estados de órdenes
    estadisticasEstados: { estado: string; cantidad: number; porcentaje: number }[];

    // Tipos de orden
    ventasPorTipoOrden: { tipo: string; cantidad: number; monto: number }[];
}

export default function ReportesAvanzadosComponent() {
    const [fechaInicio, setFechaInicio] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 7)));
    const [fechaFin, setFechaFin] = useState<Date>(new Date());
    const [reporte, setReporte] = useState<ReporteDatos | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving,] = useState(false);
    const [vistaActiva, setVistaActiva] = useState<'resumen' | 'detallada' | 'productos'>('resumen');
    const [, setFiltrosAbiertos] = useState(false);

    const { register, handleSubmit, formState } = useForm<FiltrosData>({
        resolver: zodResolver(schemaFiltros),
        defaultValues: {
            fechaInicio: fechaInicio.toISOString().split('T')[0],
            fechaFin: fechaFin.toISOString().split('T')[0]
        }
    });

    const cargarReporte = useCallback(async () => {
        setLoading(true);
        try {
            const result = await obtenerReporteAvanzadoAction({
                fechaInicio: fechaInicio.toISOString().split('T')[0],
                fechaFin: fechaFin.toISOString().split('T')[0]
            });

            if (result.success && result.datos) {
                setReporte(result.datos);
                return;
            }
        } catch (error) {
            console.error('Error cargando reporte:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo cargar el reporte',
                icon: 'error'
            });
        } finally {
            setLoading(false);
        }
    }, [fechaInicio, fechaFin]);

    useEffect(() => {
        cargarReporte();
    }, [cargarReporte]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const handleAplicarFiltros = (data: FiltrosData) => {
        setFechaInicio(new Date(data.fechaInicio));
        setFechaFin(new Date(data.fechaFin));
        setFiltrosAbiertos(false);
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case "entregada": return "bg-green-100 text-green-800 border-green-200";
            case "cancelada": return "bg-red-100 text-red-800 border-red-200";
            case "lista": return "bg-blue-100 text-blue-800 border-blue-200";
            case "orden_tomada": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getTipoOrdenIcon = (tipo: string) => {
        return tipo === 'domicilio' ? <FaMotorcycle className="inline text-orange-500" /> : <FaStore className="inline text-orange-500" />;
    };

    if (loading) {
        return (

            <Loading
                texto="Cargando reportes..."
                tamaño="grande"
                color="orange-500"
            />

        );
    }

    return (
        <div >
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-500 p-4 rounded-xl">
                            <FiTrendingUp className="text-2xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Reportes Avanzados</h1>
                            <p className="text-gray-600 mt-1">Analiza el rendimiento y métricas de tu restaurante</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* Filtros */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Filtros del Reporte
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className=" text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FiCalendar className="text-orange-500" />
                                Fecha Inicio *
                            </label>
                            <input
                                type="date"
                                {...register("fechaInicio")}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                            />
                            {formState.errors.fechaInicio && (
                                <p className="text-sm text-red-600 mt-1">{formState.errors.fechaInicio.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className=" text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FiCalendar className="text-orange-500" />
                                Fecha Fin *
                            </label>
                            <input
                                type="date"
                                {...register("fechaFin")}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                            />
                            {formState.errors.fechaFin && (
                                <p className="text-sm text-red-600 mt-1">{formState.errors.fechaFin.message}</p>
                            )}
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={handleSubmit(handleAplicarFiltros)}
                                disabled={saving}
                                className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center gap-3 w-full justify-center"
                            >
                                {saving ? (
                                    <>
                                        <TbFidgetSpinner className="animate-spin text-lg" />
                                        <span>Aplicando...</span>
                                    </>
                                ) : (
                                    <>
                                        <FiFilter className="text-lg" />
                                        <span>Aplicar Filtros</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navegación de Vistas */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
                    <div className="flex flex-wrap gap-1">
                        {[
                            { id: 'resumen', label: 'Resumen General', icon: FiTrendingUp },
                            { id: 'detallada', label: 'Órdenes Detalladas', icon: FiPackage },
                            { id: 'productos', label: 'Análisis de Productos', icon: FaStore },
                        ].map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setVistaActiva(id as 'resumen' | 'detallada' | 'productos')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${vistaActiva === id
                                    ? 'bg-orange-500 text-white font-semibold shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <Icon size={18} />
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {!reporte ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                        <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay datos disponibles</h3>
                        <p className="text-gray-500">No se encontraron reportes para el período seleccionado</p>
                    </div>
                ) : (
                    <>
                        {/* Vista Resumen */}
                        {vistaActiva === 'resumen' && (
                            <div className="space-y-6">
                                {/* Métricas principales */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-transform hover:scale-105">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-500 text-sm">Total Ventas</p>
                                                <p className="text-2xl font-bold text-gray-800">{formatCurrency(reporte.totalVentas)}</p>
                                            </div>
                                            <div className="bg-orange-100 p-3 rounded-lg">
                                                <FiTrendingUp className="text-orange-500 text-xl" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-transform hover:scale-105">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-500 text-sm">Total Propinas</p>
                                                <p className="text-2xl font-bold text-gray-800">{formatCurrency(reporte.totalPropinas)}</p>
                                            </div>
                                            <div className="bg-green-100 p-3 rounded-lg">
                                                <FaDollarSign className="text-green-500 text-xl" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-transform hover:scale-105">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-500 text-sm">Total Pedidos</p>
                                                <p className="text-2xl font-bold text-gray-800">{reporte.totalPedidos}</p>
                                            </div>
                                            <div className="bg-blue-100 p-3 rounded-lg">
                                                <FiPackage className="text-blue-500 text-xl" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-transform hover:scale-105">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-500 text-sm">Promedio por Venta</p>
                                                <p className="text-2xl font-bold text-gray-800">{formatCurrency(reporte.promedioVenta)}</p>
                                            </div>
                                            <div className="bg-purple-100 p-3 rounded-lg">
                                                <FiClock className="text-purple-500 text-xl" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Gráficos y análisis */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Ventas por hora */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                            Ventas por Hora del Día
                                        </h3>
                                        <div className="space-y-3">
                                            {reporte.ventasPorHora.map((hora) => (
                                                <div key={hora.hora} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition">
                                                    <span className="text-gray-700 font-medium">{hora.hora}:00 hrs</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-gray-800">{formatCurrency(hora.ventas)}</span>
                                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{hora.pedidos} pedidos</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Métodos de pago */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                            Métodos de Pago
                                        </h3>
                                        <div className="space-y-3">
                                            {reporte.ventasPorMetodoPago.map((metodo) => (
                                                <div key={metodo.metodo} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition">
                                                    <span className="capitalize text-gray-700 font-medium">{metodo.metodo}</span>
                                                    <div className="text-right">
                                                        <div className="font-semibold text-gray-800">{formatCurrency(metodo.monto)}</div>
                                                        <div className="text-sm text-gray-500">{metodo.cantidad} transacciones</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Tipos de orden y estados */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                            Distribución por Tipo de Orden
                                        </h3>
                                        <div className="space-y-3">
                                            {reporte.ventasPorTipoOrden.map((tipo) => (
                                                <div key={tipo.tipo} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition">
                                                    <div className="flex items-center gap-2">
                                                        {getTipoOrdenIcon(tipo.tipo)}
                                                        <span className="capitalize text-gray-700 font-medium">{tipo.tipo}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-semibold text-gray-800">{formatCurrency(tipo.monto)}</div>
                                                        <div className="text-sm text-gray-500">{tipo.cantidad} órdenes</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                            Estados de Órdenes
                                        </h3>
                                        <div className="space-y-3">
                                            {reporte.estadisticasEstados.map((estadistica) => (
                                                <div key={estadistica.estado} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize border ${getEstadoColor(estadistica.estado)}`}
                                                        >
                                                            {estadistica.estado.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-semibold text-gray-800">{estadistica.cantidad}</div>
                                                        <div className="text-sm text-gray-500">{estadistica.porcentaje.toFixed(1)}%</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Vista Detallada de Órdenes */}
                        {vistaActiva === 'detallada' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                        Órdenes Detalladas
                                    </h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200 bg-orange-50">
                                                <th className="p-4 text-gray-700 font-semibold text-left">Cliente</th>
                                                <th className="p-4 text-gray-700 font-semibold text-left">Teléfono</th>
                                                <th className="p-4 text-gray-700 font-semibold text-left">Total</th>
                                                <th className="p-4 text-gray-700 font-semibold text-left">Estado</th>
                                                <th className="p-4 text-gray-700 font-semibold text-left">Tipo</th>
                                                <th className="p-4 text-gray-700 font-semibold text-left">Vendedor</th>
                                                <th className="p-4 text-gray-700 font-semibold text-left">Entregador</th>
                                                <th className="p-4 text-gray-700 font-semibold text-left">Propina</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {reporte.ordenesDetalladas.map((orden) => (
                                                <tr key={orden.id} className="hover:bg-orange-50 transition-colors">
                                                    <td className="p-4">
                                                        <div>
                                                            <span className="text-gray-800 font-medium">{orden.cliente_nombre}</span>
                                                            {orden.cliente_direccion && (
                                                                <div className="text-xs text-gray-500">{orden.cliente_direccion}</div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-gray-600">{orden.cliente_telefono || '-'}</span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-gray-800 font-semibold">{formatCurrency(orden.total)}</span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span
                                                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize border ${getEstadoColor(orden.estado)}`}
                                                        >
                                                            {orden.estado.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            {getTipoOrdenIcon(orden.tipo_orden)}
                                                            <span className="capitalize text-gray-600 font-medium">{orden.tipo_orden}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-gray-600">{orden.cajero || '-'}</span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-gray-600">{orden.entregador || '-'}</span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-gray-600 font-medium">
                                                            {orden.propina ? formatCurrency(orden.propina) : '-'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Vista Productos */}
                        {vistaActiva === 'productos' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                        Productos Más Vendidos
                                    </h3>
                                    <div className="space-y-4">
                                        {reporte.masVendidos.map((producto, index) => (
                                            <div key={producto.nombre} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition">
                                                <div>
                                                    <div className="font-semibold text-gray-800">{index + 1}. {producto.nombre}</div>
                                                    <div className="text-sm text-gray-500">{producto.categoria || 'Sin categoría'}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold text-gray-800">{producto.cantidad} unidades</div>
                                                    <div className="text-sm text-gray-500">{formatCurrency(producto.ingresos)}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                        Ventas por Categoría
                                    </h3>
                                    <div className="space-y-4">
                                        {reporte.ventasPorCategoria.map((categoria) => (
                                            <div key={categoria.nombre} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition">
                                                <span className="font-semibold text-gray-800">{categoria.nombre}</span>
                                                <div className="text-right">
                                                    <div className="font-semibold text-gray-800">{formatCurrency(categoria.ingresos)}</div>
                                                    <div className="text-sm text-gray-500">{categoria.cantidad} productos</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                        Productos Menos Vendidos
                                    </h3>
                                    <div className="space-y-4">
                                        {reporte.menosVendidos.map((producto, index) => (
                                            <div key={producto.nombre} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition">
                                                <div>
                                                    <div className="font-semibold text-gray-800">{index + 1}. {producto.nombre}</div>
                                                    <div className="text-sm text-gray-500">{producto.categoria || 'Sin categoría'}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold text-gray-800">{producto.cantidad} unidades</div>
                                                    <div className="text-sm text-gray-500">{formatCurrency(producto.ingresos)}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}