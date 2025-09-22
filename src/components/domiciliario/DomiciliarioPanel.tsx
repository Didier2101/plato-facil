"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    MapPin,
    Phone,
    Clock,
    Package,
    Truck,
    CheckCircle,
    Navigation,
    User,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import { obtenerOrdenesDomicilioAction } from '@/src/actions/obtenerOrdenesDomicilioAction';
import { actualizarEstadoOrdenAction } from '@/src/actions/actualizarEstadoOrdenAction';
import { useUserStore } from '@/src/store/useUserStore';


interface OrdenDomicilio {
    id: string;
    cliente_nombre: string;
    cliente_telefono?: string;
    cliente_direccion: string;
    total: number;
    estado: 'lista' | 'en_camino' | 'entregada';
    created_at: string;
    updated_at: string;
    productos: {
        nombre: string;
        cantidad: number;
        precio_unitario: number;
        subtotal: number;
    }[];
    notas_domiciliario?: string;
}

export default function DomiciliarioPanel() {
    const [ordenes, setOrdenes] = useState<OrdenDomicilio[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actualizando, setActualizando] = useState<string | null>(null);
    const [mostrarDetalles, setMostrarDetalles] = useState<string | null>(null);
    const [notas, setNotas] = useState<{ [key: string]: string }>({});

    // Obtener usuario del store
    const { id: usuarioId, nombre: usuarioNombre } = useUserStore();

    // Cargar órdenes usando la función de servidor real
    const cargarOrdenes = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            console.log('Cargando órdenes...');

            const result = await obtenerOrdenesDomicilioAction();
            console.log('Resultado de cargar órdenes:', result);

            if (result.success && result.ordenes) {
                setOrdenes(result.ordenes);
                console.log(`Se cargaron ${result.ordenes.length} órdenes`);
            } else {
                setError(result.error || 'Error al cargar las órdenes');
                console.error('Error en cargar órdenes:', result.error);
            }
        } catch (err) {
            console.error('Error inesperado cargando órdenes:', err);
            setError('Error inesperado al cargar las órdenes');
        } finally {
            setLoading(false);
        }
    }, []);

    // Actualizar estado de orden usando la función de servidor real
    const actualizarEstado = async (ordenId: string, nuevoEstado: 'en_camino' | 'entregada') => {
        if (!usuarioId) {
            setError('No se ha identificado al repartidor');
            return;
        }

        setActualizando(ordenId);
        setError('');

        try {
            console.log(`Actualizando orden ${ordenId} a estado ${nuevoEstado}`);

            const result = await actualizarEstadoOrdenAction({
                ordenId,
                nuevoEstado,
                usuarioId,
                notas: notas[ordenId] || undefined
            });

            console.log('Resultado de actualizar estado:', result);

            if (result.success) {
                // Actualizar localmente
                setOrdenes(prev => prev.map(orden =>
                    orden.id === ordenId
                        ? {
                            ...orden,
                            estado: nuevoEstado,
                            notas_domiciliario: notas[ordenId] || orden.notas_domiciliario
                        }
                        : orden
                ));

                // Limpiar notas
                setNotas(prev => {
                    const nuevas = { ...prev };
                    delete nuevas[ordenId];
                    return nuevas;
                });

                // Mostrar confirmación
                mostrarNotificacion(`Orden ${nuevoEstado === 'en_camino' ? 'tomada' : 'entregada'} exitosamente`);

                // Si se entregó, quitar de la lista después de un momento
                if (nuevoEstado === 'entregada') {
                    setTimeout(() => {
                        setOrdenes(prev => prev.filter(orden => orden.id !== ordenId));
                    }, 2000);
                }
            } else {
                setError(result.error || 'Error al actualizar la orden');
                console.error('Error al actualizar orden:', result.error);
            }
        } catch (err) {
            console.error('Error inesperado actualizando orden:', err);
            setError('Error inesperado al actualizar la orden');
        } finally {
            setActualizando(null);
        }
    };

    // Mostrar notificación
    const mostrarNotificacion = (mensaje: string) => {
        if (typeof window !== 'undefined') {
            const notificacion = document.createElement('div');
            notificacion.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300';
            notificacion.innerHTML = `
                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 bg-white rounded-full"></div>
                    <span class="font-medium">${mensaje}</span>
                </div>
            `;

            document.body.appendChild(notificacion);

            setTimeout(() => {
                if (notificacion.parentNode) {
                    notificacion.style.transform = 'translateX(100%)';
                    setTimeout(() => notificacion.remove(), 300);
                }
            }, 3000);
        }
    };

    // Abrir mapa con dirección
    const abrirMapa = (direccion: string) => {
        const url = `https://maps.google.com/maps?q=${encodeURIComponent(direccion)}`;
        window.open(url, '_blank');
    };

    // Hacer llamada telefónica
    const llamarCliente = (telefono: string) => {
        window.location.href = `tel:${telefono}`;
    };

    // Cargar órdenes al montar el componente
    useEffect(() => {
        cargarOrdenes();
    }, [cargarOrdenes]);

    const formatearFecha = (fecha: string) => {
        return new Date(fecha).toLocaleString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit'
        });
    };

    const ordenesListas = ordenes.filter(orden => orden.estado === 'lista');
    const ordenesEnCamino = ordenes.filter(orden => orden.estado === 'en_camino');

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
                    <span className="text-gray-600 text-lg">Cargando órdenes...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header móvil */}
            <div className="bg-white shadow-sm sticky top-0 z-30">
                <div className="px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-xl">
                                <Truck className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">Panel Delivery</h1>
                                <p className="text-xs text-gray-600">
                                    {usuarioNombre ? `Hola, ${usuarioNombre}` : 'Repartidor'}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => cargarOrdenes()}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors text-sm"
                        >
                            <RefreshCw size={16} />
                        </button>
                    </div>

                    {/* Resumen móvil */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                                <span className="text-yellow-800 font-medium text-sm">Listas</span>
                                <span className="bg-yellow-200 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                                    {ordenesListas.length}
                                </span>
                            </div>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                                <span className="text-blue-800 font-medium text-sm">En Camino</span>
                                <span className="bg-blue-200 text-blue-900 px-2 py-1 rounded-full text-xs font-bold">
                                    {ordenesEnCamino.length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-3 py-4">
                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-red-800 text-sm">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {/* Órdenes Listas */}
                {ordenesListas.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <Package size={18} className="text-yellow-600" />
                            Listas para Entregar
                        </h2>
                        <div className="space-y-3">
                            {ordenesListas.map((orden) => (
                                <div key={orden.id} className="bg-white rounded-xl shadow-sm border border-yellow-200">
                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="text-base font-semibold text-gray-800">
                                                        Orden #{orden.id.slice(-6)}
                                                    </h3>
                                                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                                                        Lista
                                                    </span>
                                                </div>

                                                <div className="space-y-1 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <User size={14} />
                                                        <span className="font-medium">{orden.cliente_nombre}</span>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                                                        <span className="text-xs">{orden.cliente_direccion}</span>
                                                    </div>
                                                    {orden.cliente_telefono && (
                                                        <div className="flex items-center gap-2">
                                                            <Phone size={14} />
                                                            <span className="text-xs">{orden.cliente_telefono}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <Clock size={14} />
                                                        <span>{formatearFecha(orden.created_at)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-lg font-bold text-green-600 mb-1">
                                                    ${orden.total.toLocaleString('es-CO')}
                                                </div>
                                                <button
                                                    onClick={() => setMostrarDetalles(
                                                        mostrarDetalles === orden.id ? null : orden.id
                                                    )}
                                                    className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                                                >
                                                    {mostrarDetalles === orden.id ? 'Ocultar' : 'Ver productos'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Detalles de productos */}
                                        {mostrarDetalles === orden.id && (
                                            <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                                                <h4 className="font-medium text-gray-700 mb-1 text-sm">Productos:</h4>
                                                <div className="space-y-1">
                                                    {orden.productos.map((producto, index) => (
                                                        <div key={index} className="flex justify-between text-xs">
                                                            <span>{producto.cantidad}x {producto.nombre}</span>
                                                            <span className="font-medium">
                                                                ${producto.subtotal.toLocaleString('es-CO')}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Notas opcionales */}
                                        <div className="mb-3">
                                            <textarea
                                                value={notas[orden.id] || ''}
                                                onChange={(e) => setNotas(prev => ({
                                                    ...prev,
                                                    [orden.id]: e.target.value
                                                }))}
                                                placeholder="Notas (piso, apartamento, referencias...)"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs"
                                                rows={2}
                                            />
                                        </div>

                                        {/* Acciones móviles */}
                                        <div className="flex flex-col gap-2">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => abrirMapa(orden.cliente_direccion)}
                                                    className="flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg transition-colors text-xs font-medium flex-1"
                                                >
                                                    <Navigation size={14} />
                                                    Mapa
                                                </button>

                                                {orden.cliente_telefono && (
                                                    <button
                                                        onClick={() => llamarCliente(orden.cliente_telefono!)}
                                                        className="flex items-center justify-center gap-1 bg-green-100 hover:bg-green-200 text-green-800 px-3 py-2 rounded-lg transition-colors text-xs font-medium flex-1"
                                                    >
                                                        <Phone size={14} />
                                                        Llamar
                                                    </button>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => actualizarEstado(orden.id, 'en_camino')}
                                                disabled={actualizando === orden.id}
                                                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium w-full"
                                            >
                                                {actualizando === orden.id ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                                        Tomando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Truck size={16} />
                                                        Tomar Orden
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Órdenes En Camino */}
                {ordenesEnCamino.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <Truck size={18} className="text-blue-600" />
                            En Camino
                        </h2>
                        <div className="space-y-3">
                            {ordenesEnCamino.map((orden) => (
                                <div key={orden.id} className="bg-white rounded-xl shadow-sm border border-blue-200">
                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="text-base font-semibold text-gray-800">
                                                        Orden #{orden.id.slice(-6)}
                                                    </h3>
                                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                                        En Camino
                                                    </span>
                                                </div>

                                                <div className="space-y-1 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <User size={14} />
                                                        <span className="font-medium">{orden.cliente_nombre}</span>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                                                        <span className="text-xs">{orden.cliente_direccion}</span>
                                                    </div>
                                                    {orden.cliente_telefono && (
                                                        <div className="flex items-center gap-2">
                                                            <Phone size={14} />
                                                            <span className="text-xs">{orden.cliente_telefono}</span>
                                                        </div>
                                                    )}
                                                    {orden.notas_domiciliario && (
                                                        <div className="bg-blue-50 p-2 rounded text-blue-800 text-xs">
                                                            <strong>Notas:</strong> {orden.notas_domiciliario}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-lg font-bold text-green-600 mb-1">
                                                    ${orden.total.toLocaleString('es-CO')}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Cobrar al cliente
                                                </div>
                                            </div>
                                        </div>

                                        {/* Acciones móviles */}
                                        <div className="flex flex-col gap-2">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => abrirMapa(orden.cliente_direccion)}
                                                    className="flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg transition-colors text-xs font-medium flex-1"
                                                >
                                                    <Navigation size={14} />
                                                    Mapa
                                                </button>

                                                {orden.cliente_telefono && (
                                                    <button
                                                        onClick={() => llamarCliente(orden.cliente_telefono!)}
                                                        className="flex items-center justify-center gap-1 bg-green-100 hover:bg-green-200 text-green-800 px-3 py-2 rounded-lg transition-colors text-xs font-medium flex-1"
                                                    >
                                                        <Phone size={14} />
                                                        Llamar
                                                    </button>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => actualizarEstado(orden.id, 'entregada')}
                                                disabled={actualizando === orden.id}
                                                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium w-full"
                                            >
                                                {actualizando === orden.id ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                                        Entregando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle size={16} />
                                                        Marcar Entregada
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Estado vacío */}
                {ordenes.length === 0 && !loading && (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                            <Truck size={24} className="text-gray-400" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-800 mb-2">No hay órdenes disponibles</h3>
                        <p className="text-gray-600 text-xs mb-4">
                            No hay órdenes de domicilio listas para entregar en este momento.
                        </p>
                        <button
                            onClick={cargarOrdenes}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                        >
                            Actualizar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}