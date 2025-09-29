"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    MapPin,
    Phone,
    Clock,
    Package,
    Truck,
    Navigation,
    User,
    RefreshCw,
    AlertCircle,
    MapIcon,
    CreditCard
} from 'lucide-react';
import { obtenerOrdenesAction } from '@/src/actions/obtenerOrdenesAction';
import { actualizarEstadoOrdenAction } from '@/src/actions/actualizarEstadoOrdenAction';
import { useUserStore } from '@/src/store/useUserStore';
import Loading from '../ui/Loading';

import type { OrdenCompleta } from '@/src/types/orden';
import PanelCobro from '../admin/caja/PanelCobro';

type MetodoPago = "efectivo" | "tarjeta" | "transferencia";

export default function DomiciliarioPanel() {
    const [ordenes, setOrdenes] = useState<OrdenCompleta[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actualizando, setActualizando] = useState<string | null>(null);
    const [mostrarDetalles, setMostrarDetalles] = useState<string | null>(null);
    const [notas, setNotas] = useState<{ [key: string]: string }>({});

    // Estados para el cobro
    const [ordenParaCobrar, setOrdenParaCobrar] = useState<OrdenCompleta | null>(null);
    const [metodoPago, setMetodoPago] = useState<MetodoPago | ''>('');
    const [propina, setPropina] = useState(0);
    const [propinaPorcentaje, setPropinaPorcentaje] = useState<number | null>(null);

    // Obtener usuario del store
    const { id: usuarioId, nombre: usuarioNombre } = useUserStore();

    // Cargar órdenes usando obtenerOrdenesAction y filtrar para domicilios
    const cargarOrdenes = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            console.log('Cargando órdenes...');

            const result = await obtenerOrdenesAction();
            console.log('Resultado de cargar órdenes:', result);

            if (result.success && result.ordenes) {
                // Filtrar solo domicilios con estados relevantes
                const ordenesDomicilio = result.ordenes.filter(orden =>
                    orden.tipo_orden === 'domicilio' &&
                    ['lista', 'en_camino', 'llegue_a_destino'].includes(orden.estado)
                );

                setOrdenes(ordenesDomicilio);
                console.log(`Se cargaron ${ordenesDomicilio.length} órdenes de domicilio`);
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

    // Actualizar estado de orden
    const actualizarEstado = async (ordenId: string, nuevoEstado: 'en_camino' | 'llegue_a_destino') => {
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
                // Recargar órdenes para obtener estado actualizado
                await cargarOrdenes();

                // Limpiar notas
                setNotas(prev => {
                    const nuevas = { ...prev };
                    delete nuevas[ordenId];
                    return nuevas;
                });

                // Mostrar confirmación
                const mensaje = nuevoEstado === 'en_camino' ? 'tomada' : 'llegó a destino';
                mostrarNotificacion(`Orden ${mensaje} exitosamente`);

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

    // Función para manejar el cobro exitoso
    const handleCobroExitoso = () => {
        setOrdenParaCobrar(null);
        setMetodoPago('');
        setPropina(0);
        setPropinaPorcentaje(null);
        cargarOrdenes(); // Recargar las órdenes
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
    const ordenesLlegueDestino = ordenes.filter(orden => orden.estado === 'llegue_a_destino');

    if (loading) {
        return (
            <Loading
                texto="Cargando ordenes..."
                tamaño="mediano"
                color="orange-500"
            />
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
                    <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                                <span className="text-yellow-800 font-medium text-xs">Listas</span>
                                <span className="bg-yellow-200 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                                    {ordenesListas.length}
                                </span>
                            </div>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                                <span className="text-blue-800 font-medium text-xs">En Camino</span>
                                <span className="bg-blue-200 text-blue-900 px-2 py-1 rounded-full text-xs font-bold">
                                    {ordenesEnCamino.length}
                                </span>
                            </div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                                <span className="text-green-800 font-medium text-xs">En Destino</span>
                                <span className="bg-green-200 text-green-900 px-2 py-1 rounded-full text-xs font-bold">
                                    {ordenesLlegueDestino.length}
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
                                                    ${(orden.total_final || orden.total).toLocaleString('es-CO')}
                                                </div>
                                                {/* Mostrar desglose de costos */}
                                                <div className="text-xs text-gray-500 space-y-0.5">
                                                    <div>Productos: ${(orden.subtotal_productos || 0).toLocaleString('es-CO')}</div>
                                                    {orden.costo_domicilio && orden.costo_domicilio > 0 && (
                                                        <div>Domicilio: ${orden.costo_domicilio.toLocaleString('es-CO')}</div>
                                                    )}
                                                    {orden.distancia_km && (
                                                        <div>Distancia: {orden.distancia_km}km</div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => setMostrarDetalles(
                                                        mostrarDetalles === orden.id ? null : orden.id
                                                    )}
                                                    className="text-blue-600 hover:text-blue-800 text-xs font-medium mt-1"
                                                >
                                                    {mostrarDetalles === orden.id ? 'Ocultar' : 'Ver productos'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Detalles de productos */}
                                        {mostrarDetalles === orden.id && orden.orden_detalles && (
                                            <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                                                <h4 className="font-medium text-gray-700 mb-1 text-sm">Productos:</h4>
                                                <div className="space-y-1">
                                                    {orden.orden_detalles.map((detalle) => (
                                                        <div key={detalle.id} className="flex justify-between text-xs">
                                                            <span>{detalle.cantidad}x {detalle.producto_nombre}</span>
                                                            <span className="font-medium">
                                                                ${detalle.subtotal.toLocaleString('es-CO')}
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
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-lg font-bold text-green-600 mb-1">
                                                    ${(orden.total_final || orden.total).toLocaleString('es-CO')}
                                                </div>
                                                <div className="text-xs text-gray-500 space-y-0.5">
                                                    <div>Productos: ${(orden.subtotal_productos || 0).toLocaleString('es-CO')}</div>
                                                    {orden.costo_domicilio && orden.costo_domicilio > 0 && (
                                                        <div>Domicilio: ${orden.costo_domicilio.toLocaleString('es-CO')}</div>
                                                    )}
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
                                                onClick={() => actualizarEstado(orden.id, 'llegue_a_destino')}
                                                disabled={actualizando === orden.id}
                                                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium w-full"
                                            >
                                                {actualizando === orden.id ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                                        Llegando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <MapIcon size={16} />
                                                        Llegué a Destino
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

                {/* Órdenes Llegue a Destino */}
                {ordenesLlegueDestino.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <CreditCard size={18} className="text-green-600" />
                            En Destino - Listo para Cobrar
                        </h2>
                        <div className="space-y-3">
                            {ordenesLlegueDestino.map((orden) => (
                                <div key={orden.id} className="bg-white rounded-xl shadow-sm border border-green-200">
                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="text-base font-semibold text-gray-800">
                                                        Orden #{orden.id.slice(-6)}
                                                    </h3>
                                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                                        En Destino
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
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-lg font-bold text-green-600 mb-1">
                                                    ${(orden.total_final || orden.total).toLocaleString('es-CO')}
                                                </div>
                                                <div className="text-xs text-gray-500 space-y-0.5">
                                                    <div>Productos: ${(orden.subtotal_productos || 0).toLocaleString('es-CO')}</div>
                                                    {orden.costo_domicilio && orden.costo_domicilio > 0 && (
                                                        <div>Domicilio: ${orden.costo_domicilio.toLocaleString('es-CO')}</div>
                                                    )}
                                                </div>
                                                <div className="text-xs text-green-600 font-medium mt-1">
                                                    Cobrar y entregar
                                                </div>
                                            </div>
                                        </div>

                                        {/* Botón para abrir panel de cobro */}
                                        <button
                                            onClick={() => setOrdenParaCobrar(orden)}
                                            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium w-full"
                                        >
                                            <CreditCard size={16} />
                                            Cobrar y Entregar
                                        </button>
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

            {/* Modal de Cobro */}
            {ordenParaCobrar && (
                <PanelCobro
                    ordenSeleccionada={ordenParaCobrar}
                    usuarioId={usuarioId}
                    metodoPago={metodoPago}
                    setMetodoPago={setMetodoPago}
                    propina={propina}
                    setPropina={setPropina}
                    propinaPorcentaje={propinaPorcentaje}
                    setPropinaPorcentaje={setPropinaPorcentaje}
                    onSuccess={handleCobroExitoso}
                    onRecargarOrdenes={cargarOrdenes}
                    isMobile={true}
                    onClose={() => setOrdenParaCobrar(null)}
                />
            )}
        </div>
    );
}