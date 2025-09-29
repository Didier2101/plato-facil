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
    FiFilter,
    FiUsers,
    FiBarChart2,
    FiActivity,
    FiDollarSign,
} from "react-icons/fi";
import {
    FaStore,
    FaMotorcycle,
    FaMoneyBillWave,
} from "react-icons/fa";
import { MdOutlineAnalytics, MdOutlineDeliveryDining } from "react-icons/md";
import { IoFastFoodOutline } from "react-icons/io5";
import { TbFidgetSpinner } from "react-icons/tb";
import Loading from "../ui/Loading";
import { obtenerReporteSimplificadoAction } from "@/src/actions/dueno/obtenerReporteAvanzadoAction";

const schemaFiltros = z.object({
    fechaInicio: z.string().min(1, "La fecha de inicio es obligatoria"),
    fechaFin: z.string().min(1, "La fecha de fin es obligatoria"),
    estado: z.string().optional(),
    tipoOrden: z.string().optional(),
});

type FiltrosData = z.infer<typeof schemaFiltros>;

interface ReporteDatos {
    totalVentas: number;
    totalPropinas: number;
    totalPedidos: number;
    promedioTicket: number;
    totalCostosDomicilio: number;
    ventasPorTipoOrden: Array<{
        tipo: string;
        cantidad: number;
        monto: number;
        porcentaje: number;
    }>;
    ventasPorMetodoPago: Array<{
        metodo: string;
        cantidad: number;
        monto: number;
        porcentaje: number;
    }>;
    estadisticasEstados: Array<{
        estado: string;
        cantidad: number;
        porcentaje: number;
    }>;
    topProductos: Array<{
        nombre: string;
        cantidad: number;
        ingresos: number;
        precioPromedio: number;
    }>;
    ventasPorUsuario: Array<{
        id: string;
        nombre: string;
        rol: string;
        totalVentas: number;
        pedidos: number;
        promedioTicket: number;
        propinasRecibidas: number;
    }>;
    ventasPorDia: Array<{
        fecha: string;
        ventas: number;
        pedidos: number;
    }>;
    ventasPorHora: Array<{
        hora: number;
        ventas: number;
        pedidos: number;
    }>;
    domicilios: {
        total: number;
        ingresosTotales: number;
        costoPromedio: number;
        distanciaPromedio: number;
    };
}

const MetricaCard = ({
    titulo,
    valor,
    subtitulo,
    Icon,
    colorClass = "bg-orange-500",
}: {
    titulo: string;
    valor: string;
    subtitulo?: string;
    Icon: React.ComponentType<{ className?: string }>;
    colorClass?: string;
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-gray-500 text-sm font-medium mb-1">{titulo}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{valor}</p>
                    {subtitulo && <p className="text-xs text-gray-500">{subtitulo}</p>}
                </div>
                <div className={`${colorClass} p-3 rounded-lg`}>
                    <Icon className="text-white text-xl" />
                </div>
            </div>
        </div>
    );
};

export default function ReportesSimplificadosComponent() {
    const [reporte, setReporte] = useState<ReporteDatos | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [vistaActiva, setVistaActiva] = useState<'resumen' | 'ventas' | 'equipo'>('resumen');

    const { register, handleSubmit, formState } = useForm<FiltrosData>({
        resolver: zodResolver(schemaFiltros),
        defaultValues: {
            fechaInicio: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
            fechaFin: new Date().toISOString().split('T')[0]
        }
    });

    const cargarReporte = useCallback(async (filtros?: FiltrosData) => {
        setLoading(true);
        try {
            const result = await obtenerReporteSimplificadoAction({
                fechaInicio: filtros?.fechaInicio || new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
                fechaFin: filtros?.fechaFin || new Date().toISOString().split('T')[0],
                estado: filtros?.estado,
                tipoOrden: filtros?.tipoOrden
            });

            if (result.success && result.datos) {
                setReporte(result.datos as ReporteDatos);
            } else if (result.success && !result.datos) {
                setReporte(null);
            } else {
                Swal.fire({
                    title: 'Error',
                    text: result.error || 'No se pudieron cargar los datos',
                    icon: 'error'
                });
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
    }, []);

    useEffect(() => {
        cargarReporte();
    }, [cargarReporte]);

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatNumber = (num: number): string => {
        return new Intl.NumberFormat('es-CO').format(num);
    };

    const handleAplicarFiltros = (data: FiltrosData): void => {
        setSaving(true);
        cargarReporte(data).finally(() => setSaving(false));
    };

    const getEstadoColor = (estado: string): string => {
        const colores: Record<string, string> = {
            entregada: "bg-green-100 text-green-800 border-green-200",
            cancelada: "bg-red-100 text-red-800 border-red-200",
            lista: "bg-blue-100 text-blue-800 border-blue-200",
            orden_tomada: "bg-yellow-100 text-yellow-800 border-yellow-200",
            en_camino: "bg-orange-100 text-orange-800 border-orange-200",
            llegue_a_destino: "bg-purple-100 text-purple-800 border-purple-200",
        };
        return colores[estado] || "bg-gray-100 text-gray-800 border-gray-200";
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
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-500 p-4 rounded-xl">
                            <MdOutlineAnalytics className="text-2xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Reportes de Ventas</h1>
                            <p className="text-gray-600 mt-1">Análisis del rendimiento de tu restaurante</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <FiFilter className="text-orange-500" />
                        Filtros del Reporte
                    </h2>

                    <div onSubmit={handleSubmit(handleAplicarFiltros)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <FiCalendar className="text-orange-500" />
                                    Fecha Inicio
                                </label>
                                <input
                                    type="date"
                                    {...register("fechaInicio")}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                                />
                                {formState.errors.fechaInicio && (
                                    <p className="text-sm text-red-600">{formState.errors.fechaInicio.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <FiCalendar className="text-orange-500" />
                                    Fecha Fin
                                </label>
                                <input
                                    type="date"
                                    {...register("fechaFin")}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                                />
                                {formState.errors.fechaFin && (
                                    <p className="text-sm text-red-600">{formState.errors.fechaFin.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Estado</label>
                                <select
                                    {...register("estado")}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                                >
                                    <option value="">Todos</option>
                                    <option value="orden_tomada">Orden Tomada</option>
                                    <option value="lista">Lista</option>
                                    <option value="en_camino">En Camino</option>
                                    <option value="llegue_a_destino">Llegué a Destino</option>
                                    <option value="entregada">Entregada</option>
                                    <option value="cancelada">Cancelada</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Tipo de Orden</label>
                                <select
                                    {...register("tipoOrden")}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                                >
                                    <option value="">Todos</option>
                                    <option value="establecimiento">Establecimiento</option>
                                    <option value="domicilio">Domicilio</option>
                                </select>
                            </div>

                            <div className="flex items-end">
                                <button
                                    type="button"
                                    onClick={handleSubmit(handleAplicarFiltros)}
                                    disabled={saving}
                                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2.5 px-6 rounded-lg transition-all duration-200 flex items-center gap-2 w-full justify-center"
                                >
                                    {saving ? (
                                        <>
                                            <TbFidgetSpinner className="animate-spin" />
                                            <span>Aplicando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiFilter />
                                            <span>Aplicar</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setVistaActiva('resumen')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${vistaActiva === 'resumen'
                                ? 'bg-orange-500 text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <FiTrendingUp />
                            Resumen Ejecutivo
                        </button>
                        <button
                            onClick={() => setVistaActiva('ventas')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${vistaActiva === 'ventas'
                                ? 'bg-orange-500 text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <FiBarChart2 />
                            Análisis de Ventas
                        </button>
                        <button
                            onClick={() => setVistaActiva('equipo')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${vistaActiva === 'equipo'
                                ? 'bg-orange-500 text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <FiUsers />
                            Rendimiento del Equipo
                        </button>
                    </div>
                </div>

                {!reporte ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay datos disponibles</h3>
                        <p className="text-gray-500">No se encontraron ventas para el período seleccionado</p>
                    </div>
                ) : (
                    <>
                        {vistaActiva === 'resumen' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <MetricaCard
                                        titulo="Total Ventas"
                                        valor={formatCurrency(reporte.totalVentas)}
                                        Icon={FiTrendingUp}
                                        colorClass="bg-orange-500"
                                    />
                                    <MetricaCard
                                        titulo="Total Pedidos"
                                        valor={formatNumber(reporte.totalPedidos)}
                                        Icon={FiPackage}
                                        colorClass="bg-blue-500"
                                    />
                                    <MetricaCard
                                        titulo="Ticket Promedio"
                                        valor={formatCurrency(reporte.promedioTicket)}
                                        Icon={FiBarChart2}
                                        colorClass="bg-purple-500"
                                    />
                                    <MetricaCard
                                        titulo="Total Propinas"
                                        valor={formatCurrency(reporte.totalPropinas)}
                                        Icon={FiDollarSign}
                                        colorClass="bg-green-500"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <MetricaCard
                                        titulo="Domicilios"
                                        valor={formatNumber(reporte.domicilios.total)}
                                        subtitulo={`${formatCurrency(reporte.domicilios.ingresosTotales)} en ingresos`}
                                        Icon={MdOutlineDeliveryDining}
                                        colorClass="bg-orange-500"
                                    />
                                    <MetricaCard
                                        titulo="Establecimiento"
                                        valor={formatNumber(reporte.ventasPorTipoOrden.find(t => t.tipo === 'establecimiento')?.cantidad || 0)}
                                        subtitulo={`${formatCurrency(reporte.ventasPorTipoOrden.find(t => t.tipo === 'establecimiento')?.monto || 0)} en ingresos`}
                                        Icon={FaStore}
                                        colorClass="bg-indigo-500"
                                    />
                                    <MetricaCard
                                        titulo="Costos Domicilio"
                                        valor={formatCurrency(reporte.totalCostosDomicilio)}
                                        subtitulo={`Promedio: ${formatCurrency(reporte.domicilios.costoPromedio)}`}
                                        Icon={FaMotorcycle}
                                        colorClass="bg-red-500"
                                    />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <FiActivity className="text-orange-500" />
                                            Estados de Órdenes
                                        </h3>
                                        <div className="space-y-3">
                                            {reporte.estadisticasEstados.map((est) => (
                                                <div key={est.estado} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition">
                                                    <span
                                                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize border ${getEstadoColor(est.estado)}`}
                                                    >
                                                        {est.estado.replace('_', ' ')}
                                                    </span>
                                                    <div className="text-right">
                                                        <div className="font-semibold text-gray-800">{est.cantidad}</div>
                                                        <div className="text-sm text-gray-500">{est.porcentaje.toFixed(1)}%</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <FaMoneyBillWave className="text-orange-500" />
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
                            </div>
                        )}

                        {vistaActiva === 'ventas' && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <IoFastFoodOutline className="text-orange-500" />
                                        Top Productos Más Vendidos
                                    </h3>
                                    <div className="space-y-3">
                                        {reporte.topProductos.map((producto, idx) => (
                                            <div key={producto.nombre} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition border border-gray-100">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-orange-100 text-orange-600 font-bold w-8 h-8 rounded-full flex items-center justify-center">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-800">{producto.nombre}</div>
                                                        <div className="text-sm text-gray-500">Precio promedio: {formatCurrency(producto.precioPromedio)}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-gray-900">{formatCurrency(producto.ingresos)}</div>
                                                    <div className="text-sm text-gray-500">{producto.cantidad} vendidos</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <FiCalendar className="text-orange-500" />
                                            Ventas por Día
                                        </h3>
                                        <div className="space-y-2">
                                            {reporte.ventasPorDia.map((dia) => (
                                                <div key={dia.fecha} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition">
                                                    <span className="text-sm text-gray-600">{new Date(dia.fecha + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                                                    <div className="text-right">
                                                        <div className="font-semibold text-gray-800">{formatCurrency(dia.ventas)}</div>
                                                        <div className="text-xs text-gray-500">{dia.pedidos} pedidos</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <FiActivity className="text-orange-500" />
                                            Ventas por Hora
                                        </h3>
                                        <div className="space-y-2">
                                            {reporte.ventasPorHora.map((hora) => (
                                                <div key={hora.hora} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition">
                                                    <span className="text-sm text-gray-600 font-medium">{hora.hora}:00 - {hora.hora + 1}:00</span>
                                                    <div className="text-right">
                                                        <div className="font-semibold text-gray-800">{formatCurrency(hora.ventas)}</div>
                                                        <div className="text-xs text-gray-500">{hora.pedidos} pedidos</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {vistaActiva === 'equipo' && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <FiUsers className="text-orange-500" />
                                        Rendimiento por Empleado
                                    </h3>
                                    <div className="space-y-4">
                                        {reporte.ventasPorUsuario.map((usuario) => (
                                            <div key={usuario.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 text-lg">{usuario.nombre}</h4>
                                                        <span className="text-sm text-gray-500 capitalize">{usuario.rol}</span>
                                                    </div>
                                                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                                                        {usuario.pedidos} pedidos
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div>
                                                        <div className="text-xs text-gray-500 mb-1">Total Ventas</div>
                                                        <div className="font-bold text-gray-900">{formatCurrency(usuario.totalVentas)}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-gray-500 mb-1">Ticket Promedio</div>
                                                        <div className="font-bold text-gray-900">{formatCurrency(usuario.promedioTicket)}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-gray-500 mb-1">Propinas</div>
                                                        <div className="font-bold text-green-600">{formatCurrency(usuario.propinasRecibidas)}</div>
                                                    </div>
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