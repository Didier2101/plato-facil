"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    Package,
    DollarSign,
    Calendar,
    TrendingUp,
    CreditCard,
    ArrowUp,
    RefreshCw,
    FileText,
    Home,
    Truck
} from 'lucide-react';

import { useUserStore } from '@/src/store/useUserStore';
import { obtenerEntregasRepartidorAction } from '@/src/actions/repartidor/obtenerEntregasRepartidorAction';
import Loading from '../ui/Loading';

interface Entrega {
    id: string;
    cliente_nombre: string;
    cliente_telefono?: string;
    cliente_direccion: string;
    total: number;
    estado: string;
    tipo_orden: string;
    metodo_pago?: string;
    created_at: string;
    updated_at: string;
}

interface Estadisticas {
    totalEntregas: number;
    totalFacturado: number;
    promedioPorEntrega: number;
    entregasPorMetodo: Record<string, number>;
    entregasUltimaSemana: number;
    entregasPorTipo: Record<string, number>;
}

export default function MisEntregas() {
    const [entregas, setEntregas] = useState<Entrega[]>([]);
    const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { id: usuarioId } = useUserStore();

    // ✅ Usar useCallback para que la función sea estable entre renders
    const cargarEntregas = useCallback(async () => {
        if (!usuarioId) {
            setError('No se ha identificado al repartidor');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError('');

            const result = await obtenerEntregasRepartidorAction(usuarioId);

            if (result.success && result.entregas) {
                setEntregas(result.entregas);
                setEstadisticas(result.estadisticas);
            } else {
                setError(result.error || 'Error al cargar las entregas');
            }
        } catch (err) {
            console.error('Error cargando entregas:', err);
            setError('Error inesperado al cargar las entregas');
        } finally {
            setLoading(false);
        }
    }, [usuarioId]);

    // ✅ Cargar entregas al montar el componente y cuando cambie usuarioId
    useEffect(() => {
        cargarEntregas();
    }, [cargarEntregas]);

    const getMetodoPagoLabel = (metodo?: string) => {
        switch (metodo) {
            case 'efectivo': return 'Efectivo';
            case 'tarjeta': return 'Tarjeta';
            case 'transferencia': return 'Transferencia';
            default: return 'No especificado';
        }
    };

    const getMetodoPagoColor = (metodo?: string) => {
        switch (metodo) {
            case 'efectivo': return 'bg-green-100 text-green-800';
            case 'tarjeta': return 'bg-blue-100 text-blue-800';
            case 'transferencia': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTipoOrdenLabel = (tipo: string) => {
        switch (tipo) {
            case 'domicilio': return 'Domicilio';
            case 'establecimiento': return 'Establecimiento';
            default: return 'No especificado';
        }
    };

    const getTipoOrdenIcon = (tipo: string) => {
        switch (tipo) {
            case 'domicilio': return <Truck size={14} className="text-blue-600" />;
            case 'establecimiento': return <Home size={14} className="text-green-600" />;
            default: return <Package size={14} className="text-gray-600" />;
        }
    };

    const getTipoOrdenColor = (tipo: string) => {
        switch (tipo) {
            case 'domicilio': return 'bg-blue-100 text-blue-800';
            case 'establecimiento': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <Loading
                texto="Cargando tus entregas..."
                tamaño="mediano"
                color="orange-500"
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-30">
                <div className="px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-orange-100 rounded-xl">
                                <Package className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">Mis Entregas</h1>
                                <p className="text-xs text-gray-600">Historial y estadísticas de entregas</p>
                            </div>
                        </div>

                        <button
                            onClick={cargarEntregas}
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

            <div className="px-3 py-4">
                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-red-800 text-sm">
                            <span>{error}</span>
                        </div>
                        <button
                            onClick={cargarEntregas}
                            className="mt-2 text-red-700 hover:text-red-900 text-sm underline"
                        >
                            Intentar de nuevo
                        </button>
                    </div>
                )}

                {/* Estadísticas */}
                {estadisticas && (
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3">Resumen de Entregas</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
                            {/* Total Entregas */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Entregas</p>
                                        <p className="text-2xl font-bold text-gray-800">{estadisticas.totalEntregas}</p>
                                    </div>
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Package className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 mt-2">
                                    <TrendingUp size={14} className="text-green-500" />
                                    <span className="text-xs text-green-600">
                                        {estadisticas.entregasUltimaSemana} esta semana
                                    </span>
                                </div>
                            </div>

                            {/* Total Facturado */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Facturado</p>
                                        <p className="text-2xl font-bold text-gray-800">
                                            ${estadisticas.totalFacturado.toLocaleString('es-CO')}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <DollarSign className="w-6 h-6 text-green-600" />
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <p className="text-xs text-gray-600">
                                        Promedio: ${Math.round(estadisticas.promedioPorEntrega).toLocaleString('es-CO')}
                                    </p>
                                </div>
                            </div>

                            {/* Métodos de Pago */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-gray-600">Métodos de Pago</p>
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <CreditCard className="w-6 h-6 text-purple-600" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    {Object.entries(estadisticas.entregasPorMetodo).map(([metodo, cantidad]) => (
                                        <div key={metodo} className="flex justify-between items-center text-xs">
                                            <span>{getMetodoPagoLabel(metodo)}</span>
                                            <span className="font-semibold">{cantidad}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Estadísticas por Tipo de Orden */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-gray-600">Tipo de Órdenes</p>
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <Package className="w-6 h-6 text-indigo-600" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    {Object.entries(estadisticas.entregasPorTipo).map(([tipo, cantidad]) => (
                                        <div key={tipo} className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-1">
                                                {getTipoOrdenIcon(tipo)}
                                                <span>{getTipoOrdenLabel(tipo)}</span>
                                            </div>
                                            <span className="font-semibold">{cantidad}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Última Semana */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Esta Semana</p>
                                        <p className="text-2xl font-bold text-gray-800">{estadisticas.entregasUltimaSemana}</p>
                                    </div>
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                        <Calendar className="w-6 h-6 text-orange-600" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 mt-2">
                                    <ArrowUp size={14} className="text-green-500" />
                                    <span className="text-xs text-green-600">Activo</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lista de Entregas */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Historial de Entregas</h2>

                    {entregas.length === 0 ? (
                        <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                                <FileText size={24} className="text-gray-400" />
                            </div>
                            <h3 className="text-base font-semibold text-gray-800 mb-2">No hay entregas registradas</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                {usuarioId
                                    ? "Todavía no has realizado ninguna entrega."
                                    : "No se ha identificado al repartidor."
                                }
                            </p>
                            {usuarioId && (
                                <button
                                    onClick={cargarEntregas}
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                                >
                                    Actualizar
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {entregas.map((entrega) => (
                                <div key={entrega.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                    <h3 className="text-base font-semibold text-gray-800">
                                                        Orden #{entrega.id.slice(-6)}
                                                    </h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMetodoPagoColor(entrega.metodo_pago)}`}>
                                                        {getMetodoPagoLabel(entrega.metodo_pago)}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoOrdenColor(entrega.tipo_orden)}`}>
                                                        {getTipoOrdenLabel(entrega.tipo_orden)}
                                                    </span>
                                                </div>

                                                <div className="space-y-1 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-medium">{entrega.cliente_nombre}</span>
                                                        {entrega.cliente_telefono && (
                                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                                {entrega.cliente_telefono}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs">
                                                        {entrega.cliente_direccion}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        <div>Creada: {new Date(entrega.created_at).toLocaleString('es-CO')}</div>
                                                        <div>Entregada: {new Date(entrega.updated_at).toLocaleString('es-CO')}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-lg font-bold text-green-600">
                                                    ${entrega.total.toLocaleString('es-CO')}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {new Date(entrega.created_at).toLocaleDateString('es-CO')}
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