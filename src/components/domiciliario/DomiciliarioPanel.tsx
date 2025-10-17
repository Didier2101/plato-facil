"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    FaTruck,
    FaPhone,
    FaClock,
    FaBox,
    FaMapMarkerAlt,
    FaUser,
    FaSync,
    FaExclamationTriangle,
    FaMap,
    FaCreditCard,
    FaMotorcycle,
    FaSpinner
} from 'react-icons/fa';
import { obtenerOrdenesAction } from '@/src/actions/obtenerOrdenesAction';
import { actualizarEstadoOrdenAction } from '@/src/actions/actualizarEstadoOrdenAction';
import Loading from '../ui/Loading';
import type { OrdenCompleta } from '@/src/types/orden';
import PanelCobro from '../admin/caja/PanelCobro';

type MetodoPago = "efectivo" | "tarjeta" | "transferencia";
interface CajaListaProps {
    usuarioId: string;
}

export default function DomiciliarioPanel({ usuarioId }: CajaListaProps) {
    const [ordenes, setOrdenes] = useState<OrdenCompleta[]>([]);
    const [metodoPago, setMetodoPago] = useState<MetodoPago | ''>('');
    const [propina, setPropina] = useState(0);
    const [propinaPorcentaje, setPropinaPorcentaje] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actualizando, setActualizando] = useState<string | null>(null);
    const [mostrarDetalles, setMostrarDetalles] = useState<string | null>(null);
    const [notas, setNotas] = useState<{ [key: string]: string }>({});

    // Estados para el cobro
    const [ordenParaCobrar, setOrdenParaCobrar] = useState<OrdenCompleta | null>(null);

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

    // ✅ FUNCIÓN ACTUALIZADA: Abrir mapa con coordenadas GPS o dirección de texto
    const abrirMapa = (orden: OrdenCompleta) => {
        // Priorizar coordenadas exactas si existen
        const url = orden.latitud_destino && orden.longitud_destino
            ? `https://maps.google.com/?q=${orden.latitud_destino},${orden.longitud_destino}`
            : `https://maps.google.com/maps?q=${encodeURIComponent(orden.cliente_direccion)}`;

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
                texto="Cargando órdenes..."
                tamaño="mediano"
                color="orange-500"
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-orange-500 p-4 rounded-xl">
                                <FaTruck className="text-2xl text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Panel de Domicilios</h1>
                                <p className="text-gray-600 mt-1">Gestiona las entregas de domicilio</p>
                            </div>
                        </div>

                        <button
                            onClick={() => cargarOrdenes()}
                            className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-xl transition-colors"
                        >
                            <FaSync className="text-lg" />
                        </button>
                    </div>

                    {/* Resumen */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Primer Card: Listas */}
                        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-yellow-500 p-2 rounded-lg">
                                        <FaBox className="text-white text-lg" />
                                    </div>
                                    <div>
                                        <p className="text-yellow-800 font-semibold">Listas</p>
                                        <p className="text-yellow-600 text-sm">Para entregar</p>
                                    </div>
                                </div>
                                <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-lg font-bold">
                                    {ordenesListas.length}
                                </span>
                            </div>
                        </div>

                        {/* Segundo Card: En Camino */}
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-500 p-2 rounded-lg">
                                        <FaMotorcycle className="text-white text-lg" />
                                    </div>
                                    <div>
                                        <p className="text-blue-800 font-semibold">En Camino</p>
                                        <p className="text-blue-600 text-sm">En entrega</p>
                                    </div>
                                </div>
                                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-lg font-bold">
                                    {ordenesEnCamino.length}
                                </span>
                            </div>
                        </div>

                        {/* Tercer Card: En Destino */}
                        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-500 p-2 rounded-lg">
                                        <FaMapMarkerAlt className="text-white text-lg" />
                                    </div>
                                    <div>
                                        <p className="text-green-800 font-semibold">En Destino</p>
                                        <p className="text-green-600 text-sm">Para cobrar</p>
                                    </div>
                                </div>
                                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-lg font-bold">
                                    {ordenesLlegueDestino.length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {error && (
                    <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                        <div className="flex items-center gap-3 text-red-800">
                            <FaExclamationTriangle className="text-xl" />
                            <span className="font-medium">{error}</span>
                        </div>
                    </div>
                )}

                {/* Órdenes Listas */}
                {ordenesListas.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            Listas para Entregar
                        </h2>
                        <div className="space-y-4">
                            {ordenesListas.map((orden) => (
                                <div key={orden.id} className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-bold">
                                                    #{orden.id.slice(-6)}
                                                </div>
                                                <span className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-full text-sm font-medium border border-yellow-200">
                                                    Lista para entregar
                                                </span>
                                            </div>

                                            <div className="space-y-2 text-gray-700">
                                                <div className="flex items-center gap-3">
                                                    <FaUser className="text-orange-500" />
                                                    <span className="font-semibold">{orden.cliente_nombre}</span>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <FaMapMarkerAlt className="text-orange-500 mt-1 flex-shrink-0" />
                                                    <span className="text-sm">{orden.cliente_direccion}</span>
                                                </div>
                                                {orden.cliente_telefono && (
                                                    <div className="flex items-center gap-3">
                                                        <FaPhone className="text-orange-500" />
                                                        <span className="text-sm">{orden.cliente_telefono}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-3 text-sm">
                                                    <FaClock className="text-orange-500" />
                                                    <span>{formatearFecha(orden.created_at)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-green-600 mb-2">
                                                ${(orden.total_final || orden.total).toLocaleString('es-CO')}
                                            </div>
                                            <div className="text-sm text-gray-500 space-y-1">
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
                                                className="text-orange-600 hover:text-orange-800 text-sm font-medium mt-2"
                                            >
                                                {mostrarDetalles === orden.id ? 'Ocultar productos' : 'Ver productos'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Detalles de productos */}
                                    {mostrarDetalles === orden.id && orden.orden_detalles && (
                                        <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                <FaBox className="text-orange-500" />
                                                Productos
                                            </h4>
                                            <div className="space-y-2">
                                                {orden.orden_detalles.map((detalle) => (
                                                    <div key={detalle.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                                        <span className="font-medium">{detalle.cantidad}x {detalle.producto_nombre}</span>
                                                        <span className="font-bold text-green-600">
                                                            ${detalle.subtotal.toLocaleString('es-CO')}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Notas opcionales */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Notas de entrega
                                        </label>
                                        <textarea
                                            value={notas[orden.id] || ''}
                                            onChange={(e) => setNotas(prev => ({
                                                ...prev,
                                                [orden.id]: e.target.value
                                            }))}
                                            placeholder="Piso, apartamento, referencias, instrucciones especiales..."
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                                            rows={3}
                                        />
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="flex gap-3 flex-1">
                                            <button
                                                onClick={() => abrirMapa(orden)}
                                                className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg transition-colors font-medium flex-1"
                                            >
                                                <FaMap className="text-lg" />
                                                Mapa
                                            </button>

                                            {orden.cliente_telefono && (
                                                <button
                                                    onClick={() => llamarCliente(orden.cliente_telefono!)}
                                                    className="flex items-center justify-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 px-4 py-3 rounded-lg transition-colors font-medium flex-1"
                                                >
                                                    <FaPhone className="text-lg" />
                                                    Llamar
                                                </button>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => actualizarEstado(orden.id, 'en_camino')}
                                            disabled={actualizando === orden.id}
                                            className="flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-6 py-3 rounded-lg transition-colors font-semibold flex-1 sm:flex-none"
                                        >
                                            {actualizando === orden.id ? (
                                                <>
                                                    <FaSpinner className="animate-spin text-lg" />
                                                    Tomando orden...
                                                </>
                                            ) : (
                                                <>
                                                    <FaTruck className="text-lg" />
                                                    Tomar Orden
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Órdenes En Camino */}
                {ordenesEnCamino.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            En Camino
                        </h2>
                        <div className="space-y-4">
                            {ordenesEnCamino.map((orden) => (
                                <div key={orden.id} className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold">
                                                    #{orden.id.slice(-6)}
                                                </div>
                                                <span className="bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm font-medium border border-blue-200">
                                                    En camino
                                                </span>
                                            </div>

                                            <div className="space-y-2 text-gray-700">
                                                <div className="flex items-center gap-3">
                                                    <FaUser className="text-orange-500" />
                                                    <span className="font-semibold">{orden.cliente_nombre}</span>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <FaMapMarkerAlt className="text-orange-500 mt-1 flex-shrink-0" />
                                                    <span className="text-sm">{orden.cliente_direccion}</span>
                                                </div>
                                                {orden.cliente_telefono && (
                                                    <div className="flex items-center gap-3">
                                                        <FaPhone className="text-orange-500" />
                                                        <span className="text-sm">{orden.cliente_telefono}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-green-600 mb-2">
                                                ${(orden.total_final || orden.total).toLocaleString('es-CO')}
                                            </div>
                                            <div className="text-sm text-gray-500 space-y-1">
                                                <div>Productos: ${(orden.subtotal_productos || 0).toLocaleString('es-CO')}</div>
                                                {orden.costo_domicilio && orden.costo_domicilio > 0 && (
                                                    <div>Domicilio: ${orden.costo_domicilio.toLocaleString('es-CO')}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="flex gap-3 flex-1">
                                            <button
                                                onClick={() => abrirMapa(orden)}
                                                className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg transition-colors font-medium flex-1"
                                            >
                                                <FaMap className="text-lg" />
                                                Mapa
                                            </button>

                                            {orden.cliente_telefono && (
                                                <button
                                                    onClick={() => llamarCliente(orden.cliente_telefono!)}
                                                    className="flex items-center justify-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 px-4 py-3 rounded-lg transition-colors font-medium flex-1"
                                                >
                                                    <FaPhone className="text-lg" />
                                                    Llamar
                                                </button>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => actualizarEstado(orden.id, 'llegue_a_destino')}
                                            disabled={actualizando === orden.id}
                                            className="flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-6 py-3 rounded-lg transition-colors font-semibold flex-1 sm:flex-none"
                                        >
                                            {actualizando === orden.id ? (
                                                <>
                                                    <FaSpinner className="animate-spin text-lg" />
                                                    Llegando...
                                                </>
                                            ) : (
                                                <>
                                                    <FaMapMarkerAlt className="text-lg" />
                                                    Llegué a Destino
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Órdenes Llegue a Destino */}
                {ordenesLlegueDestino.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            En Destino - Listo para Cobrar
                        </h2>
                        <div className="space-y-4">
                            {ordenesLlegueDestino.map((orden) => (
                                <div key={orden.id} className="bg-green-50 rounded-xl border border-green-200 p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold">
                                                    #{orden.id.slice(-6)}
                                                </div>
                                                <span className="bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm font-medium border border-green-200">
                                                    En destino
                                                </span>
                                            </div>

                                            <div className="space-y-2 text-gray-700">
                                                <div className="flex items-center gap-3">
                                                    <FaUser className="text-orange-500" />
                                                    <span className="font-semibold">{orden.cliente_nombre}</span>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <FaMapMarkerAlt className="text-orange-500 mt-1 flex-shrink-0" />
                                                    <span className="text-sm">{orden.cliente_direccion}</span>
                                                </div>
                                                {orden.cliente_telefono && (
                                                    <div className="flex items-center gap-3">
                                                        <FaPhone className="text-orange-500" />
                                                        <span className="text-sm">{orden.cliente_telefono}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-green-600 mb-2">
                                                ${(orden.total_final || orden.total).toLocaleString('es-CO')}
                                            </div>
                                            <div className="text-sm text-gray-500 space-y-1">
                                                <div>Productos: ${(orden.subtotal_productos || 0).toLocaleString('es-CO')}</div>
                                                {orden.costo_domicilio && orden.costo_domicilio > 0 && (
                                                    <div>Domicilio: ${orden.costo_domicilio.toLocaleString('es-CO')}</div>
                                                )}
                                            </div>
                                            <div className="text-sm text-green-600 font-semibold mt-2">
                                                Cobrar y entregar
                                            </div>
                                        </div>
                                    </div>

                                    {/* Botón para abrir panel de cobro */}
                                    <button
                                        onClick={() => setOrdenParaCobrar(orden)}
                                        className="flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors font-semibold w-full"
                                    >
                                        <FaCreditCard className="text-lg" />
                                        Cobrar y Entregar
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Estado vacío */}
                {ordenes.length === 0 && !loading && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <FaTruck className="text-3xl text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay órdenes disponibles</h3>
                        <p className="text-gray-600 mb-6">
                            No hay órdenes de domicilio listas para entregar en este momento.
                        </p>
                        <button
                            onClick={cargarOrdenes}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
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

                    onClose={() => {
                        setOrdenParaCobrar(null);
                        setMetodoPago('');
                        setPropina(0);
                        setPropinaPorcentaje(null);
                    }}
                />
            )}
        </div>
    );
}