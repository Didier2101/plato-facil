"use client";

import React, { useState, useEffect, useCallback } from 'react';

import {
    Truck,
    DollarSign,
    Package,
    MapPin,
    Clock,
    User,
    Phone,
    Calendar,
    RefreshCw,
    FileText,
    Filter,
    Search,
    X
} from 'lucide-react';
import { obtenerMisDomiciliosAction } from '@/src/modules/repartidor/entregas/actions/obtenerMisDomiciliosAction';
import Loading from '@/src/shared/components/ui/Loading';

interface MiDomicilio {
    id: string;
    cliente_nombre: string;
    cliente_direccion: string;
    cliente_telefono: string | null;
    total: number;
    costo_domicilio: number;
    distancia_km: number;
    duracion_estimada: number;
    estado: string;
    metodo_pago: string | null;
    created_at: string;
    fecha_entrega: string | null;
    notas_cliente: string | null;
}

interface MisEstadisticas {
    total_domicilios: number;
    total_ganancias_domicilio: number;
    promedio_ganancia_por_domicilio: number;
    distancia_total_km: number;
    domicilios_este_mes: number;
    domicilios_esta_semana: number;
    domicilios_por_estado: Record<string, number>;
    domicilios_por_metodo_pago: Record<string, number>;
}

interface FiltrosFecha {
    fechaInicio: string;
    fechaFin: string;
}
interface CajaListaProps {
    usuarioId: string;
}
export default function MisDomiciliosComponent({ usuarioId }: CajaListaProps) {
    const [domicilios, setDomicilios] = useState<MiDomicilio[]>([]);
    const [domiciliosFiltrados, setDomiciliosFiltrados] = useState<MiDomicilio[]>([]);
    const [estadisticas, setEstadisticas] = useState<MisEstadisticas | null>(null);
    const [estadisticasFiltradas, setEstadisticasFiltradas] = useState<{
        total_domicilios: number;
        total_ganancias: number;
        total_ingresos: number;
        distancia_total: number;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mostrarFiltros, setMostrarFiltros] = useState(true);


    // Estado para filtros - Inicialmente vacío para mostrar todos
    const [filtros, setFiltros] = useState<FiltrosFecha>({
        fechaInicio: '',
        fechaFin: ''
    });

    // ✅ Calcular estadísticas de los domicilios filtrados (memoizado)
    const calcularEstadisticasFiltradas = useCallback((domiciliosLista: MiDomicilio[]) => {
        const total_domicilios = domiciliosLista.length;
        const total_ganancias = domiciliosLista.reduce((sum, dom) => sum + dom.costo_domicilio, 0);
        const total_ingresos = domiciliosLista.reduce((sum, dom) => sum + dom.total, 0);
        const distancia_total = domiciliosLista.reduce((sum, dom) => sum + dom.distancia_km, 0);

        setEstadisticasFiltradas({
            total_domicilios,
            total_ganancias,
            total_ingresos,
            distancia_total
        });
    }, []);

    // ✅ Usar useCallback para memoizar la función principal
    const cargarDomicilios = useCallback(async () => {
        if (!usuarioId) {
            setError('No se ha identificado al repartidor');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError('');

            const result = await obtenerMisDomiciliosAction(usuarioId);

            if (result.success && result.datos) {
                setDomicilios(result.datos.domicilios);
                setDomiciliosFiltrados(result.datos.domicilios);
                setEstadisticas(result.datos.estadisticas);
                calcularEstadisticasFiltradas(result.datos.domicilios);
            } else {
                setError(result.error || 'Error al cargar tus domicilios');
            }
        } catch (err) {
            console.error('Error cargando domicilios:', err);
            setError('Error inesperado al cargar los domicilios');
        } finally {
            setLoading(false);
        }
    }, [usuarioId, calcularEstadisticasFiltradas]);

    // ✅ Función corregida para filtrar por fecha
    const filtrarPorFecha = useCallback((domiciliosLista: MiDomicilio[], fechaInicio: string, fechaFin: string): MiDomicilio[] => {
        if (!fechaInicio && !fechaFin) {
            return domiciliosLista;
        }

        return domiciliosLista.filter(domicilio => {
            const fechaDomicilio = new Date(domicilio.created_at);
            const fechaDomicilioLocal = new Date(fechaDomicilio.getTime() - fechaDomicilio.getTimezoneOffset() * 60000);
            const fechaDomicilioStr = fechaDomicilioLocal.toISOString().split('T')[0];

            if (fechaInicio && !fechaFin) {
                return fechaDomicilioStr >= fechaInicio;
            }

            if (!fechaInicio && fechaFin) {
                return fechaDomicilioStr <= fechaFin;
            }

            if (fechaInicio && fechaFin) {
                return fechaDomicilioStr >= fechaInicio && fechaDomicilioStr <= fechaFin;
            }

            return true;
        });
    }, []);

    // ✅ Aplicar filtros por fecha (memoizado)
    const aplicarFiltros = useCallback(() => {
        const domiciliosFiltrados = filtrarPorFecha(domicilios, filtros.fechaInicio, filtros.fechaFin);
        setDomiciliosFiltrados(domiciliosFiltrados);
        calcularEstadisticasFiltradas(domiciliosFiltrados);
    }, [domicilios, filtros, calcularEstadisticasFiltradas, filtrarPorFecha]);

    // ✅ Limpiar filtros (memoizado)
    const limpiarFiltros = useCallback(() => {
        setFiltros({
            fechaInicio: '',
            fechaFin: ''
        });
        setDomiciliosFiltrados(domicilios);
        calcularEstadisticasFiltradas(domicilios);
    }, [domicilios, calcularEstadisticasFiltradas]);

    // ✅ useEffect para cargar domicilios inicialmente
    useEffect(() => {
        cargarDomicilios();
    }, [cargarDomicilios]);

    // ✅ Aplicar filtros cuando cambien los filtros o domicilios
    useEffect(() => {
        if (domicilios.length > 0) {
            aplicarFiltros();
        }
    }, [filtros, domicilios, aplicarFiltros]);

    // ✅ Función corregida para establecer filtros rápidos
    const establecerFiltroRapido = (dias: number) => {
        const fechaFin = new Date();
        const fechaInicio = new Date();
        fechaInicio.setDate(fechaInicio.getDate() - dias);

        const formatoFecha = (fecha: Date) => {
            return fecha.toISOString().split('T')[0];
        };

        setFiltros({
            fechaInicio: formatoFecha(fechaInicio),
            fechaFin: formatoFecha(fechaFin)
        });
    };

    // ✅ Función corregida para aplicar filtro de hoy
    const filtrarHoy = () => {
        const hoy = new Date();
        const fechaStr = hoy.toISOString().split('T')[0];

        setFiltros({
            fechaInicio: fechaStr,
            fechaFin: fechaStr
        });
    };

    // ✅ Función corregida para aplicar filtro de ayer
    const filtrarAyer = () => {
        const ayer = new Date();
        ayer.setDate(ayer.getDate() - 1);
        const fechaStr = ayer.toISOString().split('T')[0];

        setFiltros({
            fechaInicio: fechaStr,
            fechaFin: fechaStr
        });
    };

    // ✅ Función corregida para aplicar filtro de este mes
    const filtrarEsteMes = () => {
        const ahora = new Date();
        const primerDiaMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const ultimoDiaMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);

        const formatoFecha = (fecha: Date) => {
            return fecha.toISOString().split('T')[0];
        };

        setFiltros({
            fechaInicio: formatoFecha(primerDiaMes),
            fechaFin: formatoFecha(ultimoDiaMes)
        });
    };

    // ✅ Función para formatear fecha en texto legible
    const formatearFechaTexto = (fechaStr: string) => {
        const fecha = new Date(fechaStr + 'T00:00:00');
        return fecha.toLocaleDateString('es-CO', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

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

    const getEstadoColor = (estado: string): string => {
        switch (estado) {
            case 'entregada': return 'bg-green-100 text-green-800 border-green-200';
            case 'en_camino': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'orden_tomada': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'lista': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'cancelada': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getEstadoLabel = (estado: string): string => {
        switch (estado) {
            case 'entregada': return 'Entregada';
            case 'en_camino': return 'En Camino';
            case 'orden_tomada': return 'Orden Tomada';
            case 'lista': return 'Lista para Entrega';
            case 'cancelada': return 'Cancelada';
            default: return estado;
        }
    };

    const getMetodoPagoLabel = (metodo: string | null): string => {
        switch (metodo) {
            case 'efectivo': return 'Efectivo';
            case 'tarjeta': return 'Tarjeta';
            case 'transferencia': return 'Transferencia';
            default: return 'No especificado';
        }
    };

    if (loading) {
        return <Loading texto="Cargando tus domicilios..." tamaño="grande" color="orange-500" />;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-30">
                <div className="px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-orange-100 rounded-xl">
                                <Truck className="w-6 h-6 text-orange-600" />
                            </div>

                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm ${mostrarFiltros
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                            >
                                <Filter size={16} />
                                {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                            </button>

                            <button
                                onClick={cargarDomicilios}
                                disabled={loading}
                                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Cargando...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw size={16} />
                                        Actualizar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-3 py-4">
                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-red-800 text-sm">
                            <span>{error}</span>
                        </div>
                        <button
                            onClick={cargarDomicilios}
                            className="mt-2 text-red-700 hover:text-red-900 text-sm underline"
                        >
                            Intentar de nuevo
                        </button>
                    </div>
                )}

                {/* Filtros Rápidos - SIEMPRE VISIBLES */}
                <div className="mb-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Search size={18} />
                        Filtros Rápidos
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={filtrarHoy}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                        >
                            <Calendar size={14} />
                            Hoy
                        </button>
                        <button
                            onClick={filtrarAyer}
                            className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                        >
                            <Calendar size={14} />
                            Ayer
                        </button>
                        <button
                            onClick={() => establecerFiltroRapido(7)}
                            className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                        >
                            <Calendar size={14} />
                            Últimos 7 días
                        </button>
                        <button
                            onClick={() => establecerFiltroRapido(30)}
                            className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                        >
                            <Calendar size={14} />
                            Últimos 30 días
                        </button>
                        <button
                            onClick={filtrarEsteMes}
                            className="bg-pink-100 hover:bg-pink-200 text-pink-700 px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                        >
                            <Calendar size={14} />
                            Este Mes
                        </button>
                        <button
                            onClick={limpiarFiltros}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                        >
                            <X size={14} />
                            Limpiar Filtros
                        </button>
                    </div>

                    {/* Indicador del período activo */}
                    {filtros.fechaInicio && filtros.fechaFin && (
                        <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-700 text-center">
                                <strong>Período activo:</strong>{' '}
                                {filtros.fechaInicio === filtros.fechaFin
                                    ? formatearFechaTexto(filtros.fechaInicio)
                                    : `${formatearFechaTexto(filtros.fechaInicio)} - ${formatearFechaTexto(filtros.fechaFin)}`
                                }
                            </p>
                        </div>
                    )}
                </div>

                {/* Filtros Avanzados - Expandible */}
                {mostrarFiltros && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Filter size={18} />
                                Filtros por Fecha Específica
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha Inicial
                                </label>
                                <input
                                    type="date"
                                    value={filtros.fechaInicio}
                                    onChange={(e) => setFiltros(prev => ({ ...prev, fechaInicio: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha Final
                                </label>
                                <input
                                    type="date"
                                    value={filtros.fechaFin}
                                    onChange={(e) => setFiltros(prev => ({ ...prev, fechaFin: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={limpiarFiltros}
                                    className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                                >
                                    <X size={16} />
                                    Limpiar Fechas
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Resumen del Período Filtrado */}
                {estadisticasFiltradas && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Resumen del Período Seleccionado
                            </h2>
                            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {domiciliosFiltrados.length} de {domicilios.length} domicilios
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Domicilios</p>
                                        <p className="text-2xl font-bold text-gray-800">
                                            {formatNumber(estadisticasFiltradas.total_domicilios)}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Package className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <p className="text-xs text-gray-600">
                                        {estadisticas && estadisticas.total_domicilios > 0
                                            ? `${((estadisticasFiltradas.total_domicilios / estadisticas.total_domicilios) * 100).toFixed(1)}% del total`
                                            : '0% del total'
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Ganancias Domicilios</p>
                                        <p className="text-2xl font-bold text-gray-800">
                                            {formatCurrency(estadisticasFiltradas.total_ganancias)}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <DollarSign className="w-6 h-6 text-green-600" />
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <p className="text-xs text-gray-600">
                                        Promedio: {formatCurrency(estadisticasFiltradas.total_domicilios > 0 ? estadisticasFiltradas.total_ganancias / estadisticasFiltradas.total_domicilios : 0)}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Entregado</p>
                                        <p className="text-2xl font-bold text-gray-800">
                                            {formatCurrency(estadisticasFiltradas.total_ingresos)}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <Truck className="w-6 h-6 text-purple-600" />
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <p className="text-xs text-gray-600">
                                        Valor total de las órdenes
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Distancia Recorrida</p>
                                        <p className="text-2xl font-bold text-gray-800">
                                            {estadisticasFiltradas.distancia_total.toFixed(1)} km
                                        </p>
                                    </div>
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                        <MapPin className="w-6 h-6 text-orange-600" />
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <p className="text-xs text-gray-600">
                                        Promedio: {(estadisticasFiltradas.total_domicilios > 0 ? estadisticasFiltradas.distancia_total / estadisticasFiltradas.total_domicilios : 0).toFixed(1)} km/domicilio
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lista de Domicilios Filtrados */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-gray-800">Mis Domicilios</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                                {domiciliosFiltrados.length} de {domicilios.length} domicilios
                            </span>
                            {(filtros.fechaInicio || filtros.fechaFin) && (
                                <button
                                    onClick={limpiarFiltros}
                                    className="text-sm text-orange-600 hover:text-orange-700 underline"
                                >
                                    Mostrar todos
                                </button>
                            )}
                        </div>
                    </div>

                    {domiciliosFiltrados.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <FileText size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                {domicilios.length === 0 ? 'No hay domicilios registrados' : 'No hay domicilios en el período seleccionado'}
                            </h3>
                            <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">
                                {domicilios.length === 0
                                    ? (usuarioId ? "Todavía no tienes domicilios asignados." : "No se ha identificado al repartidor.")
                                    : "Prueba con otro rango de fechas o limpia los filtros para ver todos tus domicilios."
                                }
                            </p>
                            {domicilios.length > 0 && (
                                <button
                                    onClick={limpiarFiltros}
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors text-sm"
                                >
                                    Mostrar Todos los Domicilios
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {domiciliosFiltrados.map((domicilio) => (
                                <div key={domicilio.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                    <h3 className="text-base font-semibold text-gray-800">
                                                        Orden #{domicilio.id.slice(-6)}
                                                    </h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(domicilio.estado)}`}>
                                                        {getEstadoLabel(domicilio.estado)}
                                                    </span>
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        {getMetodoPagoLabel(domicilio.metodo_pago)}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(domicilio.created_at).toLocaleDateString('es-CO')}
                                                    </span>
                                                </div>

                                                <div className="space-y-2 text-sm text-gray-600">
                                                    {/* Información del cliente */}
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <User size={14} className="text-gray-400" />
                                                        <span className="font-medium">{domicilio.cliente_nombre}</span>
                                                        {domicilio.cliente_telefono && (
                                                            <div className="flex items-center gap-1">
                                                                <Phone size={12} className="text-gray-400" />
                                                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                                    {domicilio.cliente_telefono}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Dirección */}
                                                    <div className="flex items-start gap-2">
                                                        <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                                        <span className="text-xs">{domicilio.cliente_direccion}</span>
                                                    </div>

                                                    {/* Detalles del domicilio */}
                                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                                        <div className="flex items-center gap-1">
                                                            <MapPin size={12} className="text-blue-500" />
                                                            <span>Distancia: {domicilio.distancia_km.toFixed(1)} km</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock size={12} className="text-orange-500" />
                                                            <span>Duración: {domicilio.duracion_estimada} min</span>
                                                        </div>
                                                    </div>

                                                    {/* Notas del cliente */}
                                                    {domicilio.notas_cliente && (
                                                        <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                                                            <strong>Notas del cliente:</strong> {domicilio.notas_cliente}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="space-y-1">
                                                    <div className="text-lg font-bold text-green-600">
                                                        {formatCurrency(domicilio.costo_domicilio)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Valor domicilio
                                                    </div>
                                                    <div className="text-sm font-semibold text-gray-800">
                                                        {formatCurrency(domicilio.total)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Total orden
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}