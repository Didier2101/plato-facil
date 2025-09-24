"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Clock, CheckCircle, XCircle, Package, MapPin, Phone, AlertTriangle, ChevronRight, User } from 'lucide-react';
import { buscarOrdenPorTelefonoAction, cancelarOrdenAction } from '@/src/actions/buscarOrdenPorTelefonoAction';
import { FaMotorcycle } from 'react-icons/fa';

// Tipos para el seguimiento
interface OrdenEstado {
    id: string;
    cliente_nombre: string;
    cliente_telefono?: string;
    cliente_direccion: string;
    total: number;
    estado: 'orden_tomada' | 'lista' | 'en_camino' | 'entregada' | 'cancelada';
    tipo_orden: 'establecimiento' | 'domicilio';
    created_at: string;
    updated_at: string;
    productos: {
        nombre: string;
        cantidad: number;
        personalizaciones?: string[];
    }[];
    puede_cancelar: boolean;
}

// Configuración de estados con colores naranja
const estadosConfig = {
    orden_tomada: {
        label: 'Preparando',
        icon: Clock,
        color: 'text-orange-600 bg-orange-50 border-orange-200',
        iconColor: 'text-orange-500',
        progressColor: 'bg-orange-500'
    },
    lista: {
        label: 'Lista',
        icon: CheckCircle,
        color: 'text-orange-700 bg-orange-50 border-orange-200',
        iconColor: 'text-orange-600',
        progressColor: 'bg-orange-600'
    },
    en_camino: {
        label: 'En Camino',
        icon: Package,
        color: 'text-orange-800 bg-orange-50 border-orange-200',
        iconColor: 'text-orange-700',
        progressColor: 'bg-orange-700'
    },
    entregada: {
        label: 'Entregada',
        icon: CheckCircle,
        color: 'text-green-600 bg-green-50 border-green-200',
        iconColor: 'text-green-500',
        progressColor: 'bg-green-500'
    },
    cancelada: {
        label: 'Cancelada',
        icon: XCircle,
        color: 'text-red-600 bg-red-50 border-red-200',
        iconColor: 'text-red-500',
        progressColor: 'bg-red-500'
    }
};

export default function MisOrdenes() {
    const [telefono, setTelefono] = useState('');
    const [orden, setOrden] = useState<OrdenEstado | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [, setUltimaActualizacion] = useState<Date | null>(null);
    const [actualizandoEnTiempoReal, setActualizandoEnTiempoReal] = useState(false);
    const [mostrandoCancelacion, setMostrandoCancelacion] = useState(false);
    const [motivoCancelacion, setMotivoCancelacion] = useState('');
    const [cancelando, setCancelando] = useState(false);

    const pollingInterval = useRef<NodeJS.Timeout | null>(null);
    const isComponentMounted = useRef(true);

    const handleCancelarOrden = async () => {
        if (!orden) return;

        setCancelando(true);

        try {
            const result = await cancelarOrdenAction({
                ordenId: orden.id,
                motivo: motivoCancelacion.trim() || undefined
            });

            if (result.success) {
                setOrden(prev => prev ? { ...prev, estado: 'cancelada', puede_cancelar: false } : null);
                setMostrandoCancelacion(false);
                setMotivoCancelacion('');
                detenerActualizacionesEnTiempoReal();
                mostrarNotificacion('Orden cancelada exitosamente', 'red');
            } else {
                setError(result.error || 'Error al cancelar la orden');
            }
        } catch (err) {
            console.error('Error cancelando orden:', err);
            setError('Error inesperado al cancelar la orden');
        } finally {
            setCancelando(false);
        }
    };

    const buscarOrden = async (silencioso = false) => {
        if (!telefono.trim()) {
            setError('Ingresa tu número de teléfono');
            return;
        }

        if (!silencioso) {
            setLoading(true);
            setError('');
        }

        try {
            const result = await buscarOrdenPorTelefonoAction({
                telefono: telefono.trim()
            });

            if (result.success && result.orden) {
                if (isComponentMounted.current) {
                    const estadoCambio = orden && orden.estado !== result.orden.estado;
                    setOrden(result.orden);
                    setUltimaActualizacion(new Date());

                    if (estadoCambio && !silencioso) {
                        mostrarNotificacion(`¡Estado actualizado: ${estadosConfig[result.orden.estado as keyof typeof estadosConfig].label}!`, 'orange');
                    }

                    if (!actualizandoEnTiempoReal && result.orden.estado !== 'entregada' && result.orden.estado !== 'cancelada') {
                        iniciarActualizacionesEnTiempoReal();
                    }
                }
            } else {
                if (isComponentMounted.current) {
                    setError(result.error || 'No se encontró ninguna orden con ese teléfono');
                    setOrden(null);
                }
            }

        } catch (err) {
            console.error('Error buscando orden:', err);
            if (isComponentMounted.current) {
                setError('Error al buscar la orden. Intenta de nuevo.');
                setOrden(null);
            }
        } finally {
            if (!silencioso && isComponentMounted.current) {
                setLoading(false);
            }
        }
    };

    const iniciarActualizacionesEnTiempoReal = () => {
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
        }

        setActualizandoEnTiempoReal(true);

        pollingInterval.current = setInterval(() => {
            if (orden && orden.estado !== 'entregada' && orden.estado !== 'cancelada') {
                buscarOrden(true);
            } else {
                detenerActualizacionesEnTiempoReal();
            }
        }, 10000);
    };

    const detenerActualizacionesEnTiempoReal = () => {
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
            pollingInterval.current = null;
        }
        setActualizandoEnTiempoReal(false);
    };

    const mostrarNotificacion = (mensaje: string, color: 'orange' | 'green' | 'red') => {
        if (typeof window !== 'undefined') {
            const notificacion = document.createElement('div');
            const bgColor = color === 'orange' ? 'bg-orange-500' : color === 'green' ? 'bg-green-500' : 'bg-red-500';

            notificacion.className = `fixed top-4 left-4 right-4 ${bgColor} text-white px-4 py-3 rounded-xl shadow-2xl z-50 transform transition-all duration-300`;
            notificacion.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span class="font-medium text-sm">${mensaje}</span>
                </div>
            `;

            document.body.appendChild(notificacion);

            setTimeout(() => {
                if (notificacion.parentNode) {
                    notificacion.style.transform = 'translateY(-100px)';
                    notificacion.style.opacity = '0';
                    setTimeout(() => notificacion.remove(), 300);
                }
            }, 4000);
        }
    };

    useEffect(() => {
        isComponentMounted.current = true;
        return () => {
            isComponentMounted.current = false;
            detenerActualizacionesEnTiempoReal();
        };
    }, []);

    const formatearFecha = (fecha: string) => {
        return new Date(fecha).toLocaleString('es-CO', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const obtenerTiempoEstimado = (estado: string, tipo: string) => {
        if (estado === 'entregada' || estado === 'cancelada') return null;

        const tiempos = {
            orden_tomada: tipo === 'domicilio' ? '25-35 min' : '15-20 min',
            lista: tipo === 'domicilio' ? 'Esperando repartidor' : 'Lista para recoger',
            en_camino: 'El repartidor está en camino'
        };

        return tiempos[estado as keyof typeof tiempos] || null;
    };

    const formatearTelefono = (telefono: string) => {
        return telefono.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-20">
            {/* Header fijo */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 sticky top-0 z-10 shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold">Seguimiento de Pedido</h1>
                        <p className="text-orange-100 text-sm">Rastrea tu orden en tiempo real</p>
                    </div>
                    <div className="bg-orange-400 p-2 rounded-full">
                        <Package size={20} />
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="p-4 space-y-4">
                {/* Búsqueda */}
                <div className="bg-white rounded-2xl p-4 shadow-lg">
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Phone size={16} className="inline mr-2 text-orange-500" />
                                Tu número de teléfono
                            </label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                    placeholder="Ej: 300 123 4567"
                                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-lg bg-gray-50"
                                    disabled={actualizandoEnTiempoReal}
                                    onKeyPress={(e) => e.key === 'Enter' && buscarOrden()}
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <Search size={20} className="text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                                <p className="text-red-700 text-sm flex items-center gap-2">
                                    <AlertTriangle size={16} />
                                    {error}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={() => buscarOrden()}
                            disabled={loading || !telefono.trim()}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                            ) : (
                                <Search size={20} />
                            )}
                            {loading ? 'Buscando...' : 'Buscar mi pedido'}
                        </button>
                    </div>

                    {/* Tips */}
                    <div className="mt-4 p-3 bg-orange-50 rounded-xl border border-orange-200">
                        <p className="text-orange-800 text-sm font-medium mb-1">💡 ¿Primera vez?</p>
                        <p className="text-orange-700 text-xs">
                            Usa el mismo teléfono que registraste al hacer tu pedido
                        </p>
                    </div>
                </div>

                {/* Estado de la orden */}
                {orden && (
                    <div className="space-y-4">
                        {/* Tarjeta de resumen */}
                        <div className="bg-white rounded-2xl p-4 shadow-lg border-l-4 border-orange-500">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <span className="text-xs text-gray-500">Orden #</span>
                                    <h2 className="text-lg font-bold text-gray-800">{orden.id.slice(-6)}</h2>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-orange-600">
                                        ${orden.total.toLocaleString('es-CO')}
                                    </div>
                                    <div className="text-xs text-gray-500 capitalize">
                                        {orden.tipo_orden === 'domicilio' ? '🚚 Domicilio' : '🏪 Para recoger'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <User size={16} className="text-gray-600" />
                                <div>
                                    <p className="text-sm font-medium text-gray-800">{orden.cliente_nombre}</p>
                                    {orden.cliente_telefono && (
                                        <p className="text-xs text-gray-600">{formatearTelefono(orden.cliente_telefono)}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Estado actual */}
                        <div className="bg-white rounded-2xl p-4 shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-3 rounded-full ${estadosConfig[orden.estado].color}`}>
                                    {React.createElement(estadosConfig[orden.estado].icon, {
                                        size: 24,
                                        className: estadosConfig[orden.estado].iconColor
                                    })}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-800">
                                        {estadosConfig[orden.estado].label}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {obtenerTiempoEstimado(orden.estado, orden.tipo_orden) || 'Proceso completado'}
                                    </p>
                                </div>
                                {actualizandoEnTiempoReal && (
                                    <div className="animate-pulse w-3 h-3 bg-orange-500 rounded-full"></div>
                                )}
                            </div>

                            {/* Barra de progreso */}
                            <div className="mb-4">
                                <div className="flex justify-between text-xs text-gray-500 mb-2">
                                    <span>Recibido</span>
                                    <span>Entregado</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-500 ${orden.estado === 'orden_tomada' ? 'w-1/4' :
                                            orden.estado === 'lista' ? 'w-1/2' :
                                                orden.estado === 'en_camino' ? 'w-3/4' :
                                                    'w-full'
                                            } ${estadosConfig[orden.estado].progressColor}`}
                                    ></div>
                                </div>
                            </div>

                            {/* Botón de cancelación */}
                            {orden.puede_cancelar && !mostrandoCancelacion && (
                                <button
                                    onClick={() => setMostrandoCancelacion(true)}
                                    className="w-full py-3 border-2 border-red-500 text-red-600 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
                                >
                                    <XCircle size={18} />
                                    Cancelar Pedido
                                </button>
                            )}
                        </div>

                        {/* Modal de cancelación */}
                        {mostrandoCancelacion && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                                <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
                                    <div className="text-center mb-4">
                                        <XCircle size={48} className="text-red-500 mx-auto mb-2" />
                                        <h3 className="text-lg font-bold text-gray-800">Cancelar Pedido</h3>
                                        <p className="text-gray-600 text-sm mt-1">
                                            ¿Estás seguro de que quieres cancelar este pedido?
                                        </p>
                                    </div>

                                    <textarea
                                        value={motivoCancelacion}
                                        onChange={(e) => setMotivoCancelacion(e.target.value)}
                                        placeholder="Motivo (opcional)"
                                        className="w-full p-3 border border-gray-300 rounded-lg text-sm mb-4 resize-none"
                                        rows={3}
                                    />

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setMostrandoCancelacion(false);
                                                setMotivoCancelacion('');
                                            }}
                                            className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-lg font-medium"
                                        >
                                            Volver
                                        </button>
                                        <button
                                            onClick={handleCancelarOrden}
                                            disabled={cancelando}
                                            className="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {cancelando ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            ) : (
                                                'Cancelar'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Información de entrega */}
                        {orden.tipo_orden === 'domicilio' && (
                            <div className="bg-white rounded-2xl p-4 shadow-lg">
                                <div className="flex items-center gap-3 mb-3">
                                    <MapPin size={20} className="text-orange-500" />
                                    <h4 className="font-bold text-gray-800">Dirección de entrega</h4>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-gray-700">{orden.cliente_direccion}</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone size={14} />
                                        <span>{orden.cliente_telefono ? formatearTelefono(orden.cliente_telefono) : 'Sin teléfono'}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Productos */}
                        <div className="bg-white rounded-2xl p-4 shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <Package size={20} className="text-orange-500" />
                                <h4 className="font-bold text-gray-800">Tu Pedido</h4>
                            </div>

                            <div className="space-y-3">
                                {orden.productos.map((producto, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                            <span className="text-orange-600 font-bold text-sm">{producto.cantidad}</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800">{producto.nombre}</p>
                                            {producto.personalizaciones && producto.personalizaciones.length > 0 && (
                                                <p className="text-xs text-orange-600 mt-1">
                                                    {producto.personalizaciones.join(', ')}
                                                </p>
                                            )}
                                        </div>
                                        <ChevronRight size={16} className="text-gray-400" />
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-800">Total</span>
                                    <span className="text-xl font-bold text-orange-600">
                                        ${orden.total.toLocaleString('es-CO')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Tiempo y actualización */}
                        <div className="bg-gray-50 rounded-2xl p-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Pedido realizado</p>
                                    <p className="font-medium text-gray-800">{formatearFecha(orden.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Última actualización</p>
                                    <p className="font-medium text-gray-800">{formatearFecha(orden.updated_at)}</p>
                                </div>
                            </div>

                            {actualizandoEnTiempoReal && (
                                <div className="mt-3 p-2 bg-orange-50 rounded-lg border border-orange-200">
                                    <p className="text-orange-700 text-xs text-center">
                                        🔄 Actualizando en tiempo real
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Ayuda */}
                        <div className="bg-white rounded-2xl p-4 shadow-lg">
                            <h4 className="font-bold text-gray-800 mb-3">¿Necesitas ayuda?</h4>
                            <div className="space-y-2">
                                <button className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <Phone size={18} className="text-orange-500" />
                                    <span className="text-gray-700">Llamar al restaurante</span>
                                </button>
                                <button className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <FaMotorcycle size={18} className="text-orange-500" />
                                    <span className="text-gray-700">Contactar repartidor</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Estado vacío */}
                {!orden && !loading && (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                            <Package size={32} className="text-orange-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Busca tu pedido</h3>
                        <p className="text-gray-600 text-sm">
                            Ingresa tu número de teléfono para ver el estado de tu pedido
                        </p>
                    </div>
                )}
            </div>

            {/* Footer fijo para ayuda */}
            {orden && (
                <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm">¿Problemas con tu pedido?</p>
                            <p className="text-orange-100 text-xs">Estamos aquí para ayudarte</p>
                        </div>
                        <button className="bg-white text-orange-600 px-4 py-2 rounded-lg font-medium text-sm">
                            Contactar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}