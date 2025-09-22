"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Clock, CheckCircle, XCircle, Package, Settings, AlertTriangle, Phone } from 'lucide-react';
import { buscarOrdenPorTelefonoAction, cancelarOrdenAction } from '@/src/actions/buscarOrdenPorTelefonoAction';


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

// Configuración de estados
const estadosConfig = {
    orden_tomada: {
        label: 'Preparando',
        icon: Clock,
        color: 'text-yellow-700 bg-yellow-100 border-yellow-300',
        descripcion: 'Tu orden está siendo preparada'
    },
    lista: {
        label: 'Lista',
        icon: CheckCircle,
        color: 'text-blue-700 bg-blue-100 border-blue-300',
        descripcion: 'Orden lista para entrega'
    },
    en_camino: {
        label: 'En Camino',
        icon: Package,
        color: 'text-purple-700 bg-purple-100 border-purple-300',
        descripcion: 'El domiciliario está en camino'
    },
    entregada: {
        label: 'Entregada',
        icon: Package,
        color: 'text-green-700 bg-green-100 border-green-300',
        descripcion: 'Orden entregada exitosamente'
    },
    cancelada: {
        label: 'Cancelada',
        icon: XCircle,
        color: 'text-red-700 bg-red-100 border-red-300',
        descripcion: 'Orden cancelada'
    }
};

export default function MisOrdenes() {
    const [telefono, setTelefono] = useState('');
    const [orden, setOrden] = useState<OrdenEstado | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);
    const [actualizandoEnTiempoReal, setActualizandoEnTiempoReal] = useState(false);
    const [mostrandoCancelacion, setMostrandoCancelacion] = useState(false);
    const [motivoCancelacion, setMotivoCancelacion] = useState('');
    const [cancelando, setCancelando] = useState(false);

    // Referencias para polling y cleanup
    const pollingInterval = useRef<NodeJS.Timeout | null>(null);
    const isComponentMounted = useRef(true);

    // Función para cancelar orden
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
                mostrarNotificacionCancelacion();
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

    // Función para buscar orden
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
                        mostrarNotificacionCambioEstado(result.orden.estado);
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

    // Funciones auxiliares (igual que antes)
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

    const mostrarNotificacionCambioEstado = (nuevoEstado: string) => {
        const estadoInfo = estadosConfig[nuevoEstado as keyof typeof estadosConfig];

        if (typeof window !== 'undefined') {
            const notificacion = document.createElement('div');
            notificacion.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300';
            notificacion.innerHTML = `
                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span class="font-medium">¡Estado actualizado: ${estadoInfo.label}!</span>
                </div>
            `;

            document.body.appendChild(notificacion);

            setTimeout(() => {
                if (notificacion.parentNode) {
                    notificacion.style.transform = 'translateX(100%)';
                    setTimeout(() => notificacion.remove(), 300);
                }
            }, 4000);
        }
    };

    const mostrarNotificacionCancelacion = () => {
        if (typeof window !== 'undefined') {
            const notificacion = document.createElement('div');
            notificacion.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300';
            notificacion.innerHTML = `
                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 bg-white rounded-full"></div>
                    <span class="font-medium">Orden cancelada exitosamente</span>
                </div>
            `;

            document.body.appendChild(notificacion);

            setTimeout(() => {
                if (notificacion.parentNode) {
                    notificacion.style.transform = 'translateX(100%)';
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
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const obtenerTiempoEstimado = (estado: string, tipo: string) => {
        if (estado === 'entregada' || estado === 'cancelada') return null;

        if (estado === 'orden_tomada') {
            return tipo === 'domicilio' ? '25-35 min' : '15-20 min';
        }

        if (estado === 'lista') {
            return tipo === 'domicilio' ? 'Esperando domiciliario' : 'Lista para recoger';
        }

        if (estado === 'en_camino') {
            return 'El domiciliario está en camino';
        }

        return null;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Seguimiento de Orden</h2>
                <p className="text-gray-600">Busca tu pedido más reciente con tu teléfono</p>
            </div>

            {/* Formulario de búsqueda simplificado */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Phone size={16} className="inline mr-2" />
                            Número de teléfono *
                        </label>
                        <input
                            type="tel"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            placeholder="300 123 4567 o 3001234567"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
                            disabled={actualizandoEnTiempoReal}
                            onKeyPress={(e) => e.key === 'Enter' && buscarOrden()}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            💡 Ingresa el teléfono que usaste al hacer tu pedido
                        </p>
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={() => buscarOrden()}
                        disabled={loading || !telefono.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <Search size={20} />
                        )}
                        {loading ? 'Buscando...' : 'Buscar mi orden más reciente'}
                    </button>
                </div>

                {/* Tips para el usuario */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 ¿Cómo funciona?</h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                        <li>• Se mostrará tu <strong>orden más reciente</strong> con este teléfono</li>
                        <li>• Acepta diferentes formatos: con espacios, guiones o sin ellos</li>
                        <li>• Si tienes varias órdenes, aparecerá la última que hiciste</li>
                    </ul>
                </div>
            </div>

            {/* Resto del componente igual que antes: estado de la orden, productos, etc. */}
            {orden && (
                <div className="space-y-6">
                    {/* Información general */}
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Orden #{orden.id.slice(-6)}</h3>
                                <p className="text-gray-600">{orden.cliente_nombre}</p>
                                <p className="text-sm text-gray-500">{orden.cliente_telefono}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-green-600">
                                    ${orden.total.toLocaleString('es-CO')}
                                </p>
                                <p className="text-sm text-gray-500 capitalize">
                                    {orden.tipo_orden === 'domicilio' ? '🚚 Domicilio' : '🏪 Para llevar'}
                                </p>
                            </div>
                        </div>

                        <div className="text-xs text-gray-500 space-y-1">
                            <p>📅 Pedido: {formatearFecha(orden.created_at)}</p>
                            <p>🔄 Actualizado: {formatearFecha(orden.updated_at)}</p>
                            {ultimaActualizacion && (
                                <p>⏱️ Consultado: {formatearFecha(ultimaActualizacion.toISOString())}</p>
                            )}
                        </div>
                    </div>

                    {/* Estado actual */}
                    <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${estadosConfig[orden.estado].color.replace('text-', 'text-').replace('bg-', 'bg-')}`}>
                                    {React.createElement(estadosConfig[orden.estado].icon, { size: 24 })}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800">
                                        {estadosConfig[orden.estado].label}
                                    </h3>
                                    <p className="text-gray-600">
                                        {estadosConfig[orden.estado].descripcion}
                                    </p>
                                    {obtenerTiempoEstimado(orden.estado, orden.tipo_orden) && (
                                        <p className="text-sm text-blue-600 font-medium mt-1">
                                            ⏰ {obtenerTiempoEstimado(orden.estado, orden.tipo_orden)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Indicador de tiempo real */}
                            {actualizandoEnTiempoReal && orden.estado !== 'entregada' && orden.estado !== 'cancelada' && (
                                <div className="flex items-center gap-2 text-green-600 text-sm">
                                    <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Actualizando en tiempo real</span>
                                </div>
                            )}
                        </div>

                        {/* Botón de cancelación */}
                        {orden.puede_cancelar && !mostrandoCancelacion && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-yellow-800">
                                        <AlertTriangle size={16} />
                                        <span className="text-sm font-medium">¿Necesitas cancelar esta orden?</span>
                                    </div>
                                    <button
                                        onClick={() => setMostrandoCancelacion(true)}
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Cancelar Orden
                                    </button>
                                </div>
                                <p className="text-xs text-yellow-700 mt-2">
                                    Solo puedes cancelar órdenes dentro de los primeros 15 minutos
                                </p>
                            </div>
                        )}

                        {/* Modal de cancelación */}
                        {mostrandoCancelacion && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-red-800">
                                        <AlertTriangle size={20} />
                                        <h4 className="font-semibold">Cancelar Orden</h4>
                                    </div>

                                    <p className="text-sm text-red-700">
                                        ¿Estás seguro de que deseas cancelar esta orden? Esta acción no se puede deshacer.
                                    </p>

                                    <div>
                                        <label className="block text-sm font-medium text-red-700 mb-2">
                                            Motivo de cancelación (opcional)
                                        </label>
                                        <textarea
                                            value={motivoCancelacion}
                                            onChange={(e) => setMotivoCancelacion(e.target.value)}
                                            placeholder="Ej: Cambié de opinión, pedí por error, etc."
                                            className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm"
                                            rows={3}
                                            maxLength={200}
                                        />
                                        <p className="text-xs text-red-600 mt-1">
                                            {motivoCancelacion.length}/200 caracteres
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setMostrandoCancelacion(false);
                                                setMotivoCancelacion('');
                                            }}
                                            disabled={cancelando}
                                            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
                                        >
                                            No Cancelar
                                        </button>
                                        <button
                                            onClick={handleCancelarOrden}
                                            disabled={cancelando}
                                            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                            {cancelando ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Cancelando...
                                                </>
                                            ) : (
                                                'Sí, Cancelar Orden'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {orden.estado === 'cancelada' && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-800 text-sm">
                                    Esta orden fue cancelada. Si tienes preguntas, contacta al restaurante.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Progreso visual */}
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <h4 className="font-semibold text-gray-800 mb-4">Progreso de tu pedido</h4>
                        <div className="flex items-center justify-between">
                            {Object.entries(estadosConfig).filter(([key]) => key !== 'cancelada').map(([key, config], index, array) => {
                                const isActive = key === orden.estado;
                                const estadosOrdenados = ['orden_tomada', 'lista', 'en_camino', 'entregada'];
                                const isPast = estadosOrdenados.indexOf(key) < estadosOrdenados.indexOf(orden.estado);
                                const isCanceled = orden.estado === 'cancelada';

                                // Si es orden de establecimiento, saltear "en_camino"
                                if (key === 'en_camino' && orden.tipo_orden === 'establecimiento') {
                                    return null;
                                }

                                return (
                                    <div key={key} className="flex items-center flex-1">
                                        <div className="flex flex-col items-center w-full">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${isCanceled ? 'bg-gray-100 border-gray-300 text-gray-400' :
                                                isActive ? 'bg-blue-600 border-blue-600 text-white shadow-lg' :
                                                    isPast ? 'bg-green-600 border-green-600 text-white' :
                                                        'bg-gray-100 border-gray-300 text-gray-400'
                                                }`}>
                                                {React.createElement(config.icon, { size: 20 })}
                                            </div>
                                            <p className={`text-xs mt-2 text-center font-medium ${isActive ? 'text-blue-600' :
                                                isPast ? 'text-green-600' :
                                                    'text-gray-400'
                                                }`}>
                                                {config.label}
                                            </p>
                                        </div>
                                        {index < array.length - 1 && (
                                            <div className={`flex-1 h-1 mx-4 rounded-full transition-all ${isCanceled ? 'bg-gray-300' :
                                                isPast ? 'bg-green-600' : 'bg-gray-300'
                                                }`}></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Información de entrega */}
                    {orden.tipo_orden === 'domicilio' && (
                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                <span>🚚</span>
                                Información de entrega
                            </h4>
                            <div className="space-y-2 text-sm text-blue-800">
                                <p><strong>Dirección:</strong> {orden.cliente_direccion}</p>
                                <p><strong>Teléfono:</strong> {orden.cliente_telefono}</p>
                                {orden.estado === 'lista' && (
                                    <div className="bg-blue-100 p-3 rounded-lg mt-3">
                                        <p className="font-medium">El repartidor se contactará contigo pronto</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Productos en la orden */}
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Package size={20} />
                            Productos en tu orden
                        </h4>
                        <div className="space-y-4">
                            {orden.productos.map((producto, index) => (
                                <div key={index} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg border">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">{producto.nombre}</p>
                                        {producto.personalizaciones && producto.personalizaciones.length > 0 && (
                                            <div className="mt-2 flex items-start gap-1">
                                                <Settings size={14} className="text-orange-600 mt-0.5 flex-shrink-0" />
                                                <p className="text-sm text-orange-700">
                                                    <span className="font-medium">Personalizado:</span> {producto.personalizaciones.join(', ')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right ml-4">
                                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                                            ×{producto.cantidad}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold text-gray-800">Total</span>
                                <span className="text-xl font-bold text-green-600">
                                    ${orden.total.toLocaleString('es-CO')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Acciones adicionales */}
                    <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="font-semibold text-gray-800 mb-3">¿Necesitas ayuda?</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                                <span>📞</span>
                                <span>Llámanos: +57 (1) 123-4567</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <span>💬</span>
                                <span>WhatsApp: +57 300 123 4567</span>
                            </div>
                        </div>

                        {actualizandoEnTiempoReal && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-green-800 text-sm">
                                    Tu orden se está actualizando automáticamente. Recibirás notificaciones cuando cambie el estado.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Instrucciones si no hay orden */}
            {!orden && !loading && (
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                        <Search size={24} className="text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Busca tu orden más reciente</h3>
                    <p className="text-gray-600 text-sm max-w-md mx-auto">
                        Ingresa tu número de teléfono para ver el estado de tu pedido más reciente en tiempo real.
                    </p>
                </div>
            )}
        </div>
    );
}