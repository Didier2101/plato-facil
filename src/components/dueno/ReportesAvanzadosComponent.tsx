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
    FiHome,
    FiTruck,
} from "react-icons/fi";
import { obtenerReporteAvanzadoAction } from "@/src/actions/obtenerReporteAvanzadoAction";
import Loading from "../ui/Loading";

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
    const [vistaActiva, setVistaActiva] = useState<'resumen' | 'detallada' | 'productos'>('resumen');
    const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

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
            Swal.fire("❌ Error", "No se pudo cargar el reporte", "error");
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
        return tipo === 'domicilio' ? <FiTruck className="inline" /> : <FiHome className="inline" />;
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

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-white rounded-3xl p-6 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="p-4 bg-blue-100 rounded-xl shadow-md">
                            <FiTrendingUp className="text-blue-600 text-3xl" />
                        </div>
                        <div>
                            <h1 className="font-bold text-2xl text-gray-800">Dashboard de Reportes</h1>
                            <p className="text-gray-600">Analiza el rendimiento de tu negocio</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
                            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-3 rounded-2xl font-semibold transition"
                        >
                            <FiFilter size={18} />
                            <span>Filtros</span>
                        </button>
                    </div>
                </div>

                {/* Filtros desplegables */}
                {filtrosAbiertos && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
                        <form onSubmit={handleSubmit(handleAplicarFiltros)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                                <input
                                    type="date"
                                    {...register("fechaInicio")}
                                    className="w-full p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                />
                                {formState.errors.fechaInicio && (
                                    <p className="mt-1 text-sm text-red-600">{formState.errors.fechaInicio.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                                <input
                                    type="date"
                                    {...register("fechaFin")}
                                    className="w-full p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                />
                                {formState.errors.fechaFin && (
                                    <p className="mt-1 text-sm text-red-600">{formState.errors.fechaFin.message}</p>
                                )}
                            </div>
                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-3 rounded-2xl font-semibold transition"
                                >
                                    Aplicar Filtros
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-3xl p-2 shadow-md">
                <div className="flex flex-wrap gap-1">
                    {[
                        { id: 'resumen', label: 'Resumen', icon: FiTrendingUp },
                        { id: 'detallada', label: 'Órdenes', icon: FiPackage },
                        { id: 'productos', label: 'Productos', icon: FiPackage },
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setVistaActiva(id as 'resumen' | 'detallada' | 'productos')}
                            className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition ${vistaActiva === id
                                ? 'bg-yellow-100 text-yellow-800 font-semibold'
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
                <div className="text-center text-gray-500 p-10 bg-white rounded-3xl shadow">
                    No hay datos disponibles para el período seleccionado
                </div>
            ) : (
                <>
                    {/* Vista Resumen */}
                    {vistaActiva === 'resumen' && (
                        <div className="space-y-6">
                            {/* Métricas principales */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white rounded-3xl p-5 shadow-md border border-green-200 transition hover:shadow-xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-500 text-sm">Total Ventas</p>
                                            <p className="text-2xl font-bold text-gray-800">{formatCurrency(reporte.totalVentas)}</p>
                                        </div>
                                        <div className="p-4 bg-green-100 rounded-full flex items-center justify-center">
                                            <FiTrendingUp className="text-green-600 text-xl" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-3xl p-5 shadow-md border border-blue-200 transition hover:shadow-xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-500 text-sm">Total Propinas</p>
                                            <p className="text-2xl font-bold text-gray-800">{formatCurrency(reporte.totalPropinas)}</p>
                                        </div>
                                        <div className="p-4 bg-blue-100 rounded-full flex items-center justify-center">
                                            <FiCalendar className="text-blue-600 text-xl" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-3xl p-5 shadow-md border border-purple-200 transition hover:shadow-xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-500 text-sm">Total Pedidos</p>
                                            <p className="text-2xl font-bold text-gray-800">{reporte.totalPedidos}</p>
                                        </div>
                                        <div className="p-4 bg-purple-100 rounded-full flex items-center justify-center">
                                            <FiPackage className="text-purple-600 text-xl" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-3xl p-5 shadow-md border border-orange-200 transition hover:shadow-xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-500 text-sm">Promedio por Venta</p>
                                            <p className="text-2xl font-bold text-gray-800">{formatCurrency(reporte.promedioVenta)}</p>
                                        </div>
                                        <div className="p-4 bg-orange-100 rounded-full flex items-center justify-center">
                                            <FiClock className="text-orange-600 text-xl" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Gráficos y análisis */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Ventas por hora */}
                                <div className="bg-white rounded-3xl p-6 shadow-md">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Ventas por Hora</h3>
                                    <div className="space-y-3">
                                        {reporte.ventasPorHora.map((hora) => (
                                            <div key={hora.hora} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-2xl transition">
                                                <span className="text-gray-700">{hora.hora}:00</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-800">{formatCurrency(hora.ventas)}</span>
                                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{hora.pedidos} pedidos</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Métodos de pago */}
                                <div className="bg-white rounded-3xl p-6 shadow-md">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Métodos de Pago</h3>
                                    <div className="space-y-3">
                                        {reporte.ventasPorMetodoPago.map((metodo) => (
                                            <div key={metodo.metodo} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-2xl transition">
                                                <span className="capitalize text-gray-700">{metodo.metodo}</span>
                                                <div className="text-right">
                                                    <div className="font-medium text-gray-800">{formatCurrency(metodo.monto)}</div>
                                                    <div className="text-sm text-gray-500">{metodo.cantidad} transacciones</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Tipos de orden */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white rounded-3xl p-6 shadow-md">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Tipo de Órdenes</h3>
                                    <div className="space-y-3">
                                        {reporte.ventasPorTipoOrden.map((tipo) => (
                                            <div key={tipo.tipo} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-2xl transition">
                                                <div className="flex items-center gap-2">
                                                    {getTipoOrdenIcon(tipo.tipo)}
                                                    <span className="capitalize text-gray-700">{tipo.tipo}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium text-gray-800">{formatCurrency(tipo.monto)}</div>
                                                    <div className="text-sm text-gray-500">{tipo.cantidad} órdenes</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Estados de órdenes */}
                                <div className="bg-white rounded-3xl p-6 shadow-md">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Estados de Órdenes</h3>
                                    <div className="space-y-3">
                                        {reporte.estadisticasEstados.map((estadistica) => (
                                            <div key={estadistica.estado} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-2xl transition">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize border ${getEstadoColor(estadistica.estado)}`}
                                                    >
                                                        {estadistica.estado}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium text-gray-800">{estadistica.cantidad}</div>
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
                        <div className="bg-white rounded-3xl shadow-md overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="font-bold text-xl text-gray-800">Órdenes Detalladas</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-yellow-50">
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
                                            <tr key={orden.id} className="hover:bg-yellow-50 transition-colors">
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
                                                    <span className="text-gray-800 font-medium">{formatCurrency(orden.total)}</span>
                                                </td>
                                                <td className="p-4">
                                                    <span
                                                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize border ${getEstadoColor(orden.estado)}`}
                                                    >
                                                        {orden.estado.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1">
                                                        {getTipoOrdenIcon(orden.tipo_orden)}
                                                        <span className="capitalize text-gray-600">{orden.tipo_orden}</span>
                                                    </div>
                                                </td>

                                                <td className="p-4">
                                                    <span className="text-gray-600">{orden.cajero || '-'}</span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-gray-600">{orden.entregador || '-'}</span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-gray-600">
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
                            <div className="bg-white rounded-3xl p-6 shadow-md">
                                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                                    <FiTrendingUp size={20} />
                                    Más Vendidos
                                </h3>
                                <div className="space-y-4">
                                    {reporte.masVendidos.map((producto, index) => (
                                        <div key={producto.nombre} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-2xl transition">
                                            <div>
                                                <div className="font-medium text-gray-800">{index + 1}. {producto.nombre}</div>
                                                <div className="text-sm text-gray-500">{producto.categoria}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium text-gray-800">{producto.cantidad} uds</div>
                                                <div className="text-sm text-gray-500">{formatCurrency(producto.ingresos)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-6 shadow-md">
                                <h3 className="text-lg font-semibold mb-4 text-gray-800">Ventas por Categoría</h3>
                                <div className="space-y-4">
                                    {reporte.ventasPorCategoria.map((categoria) => (
                                        <div key={categoria.nombre} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-2xl transition">
                                            <span className="font-medium text-gray-800">{categoria.nombre}</span>
                                            <div className="text-right">
                                                <div className="font-medium text-gray-800">{formatCurrency(categoria.ingresos)}</div>
                                                <div className="text-sm text-gray-500">{categoria.cantidad} productos</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-6 shadow-md">
                                <h3 className="text-lg font-semibold mb-4 text-gray-800">Menos Vendidos</h3>
                                <div className="space-y-4">
                                    {reporte.menosVendidos.map((producto, index) => (
                                        <div key={producto.nombre} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-2xl transition">
                                            <div>
                                                <div className="font-medium text-gray-800">{index + 1}. {producto.nombre}</div>
                                                <div className="text-sm text-gray-500">{producto.categoria}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium text-gray-800">{producto.cantidad} uds</div>
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
    );
}