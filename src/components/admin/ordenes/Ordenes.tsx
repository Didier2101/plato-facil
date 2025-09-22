"use client";

import React, { useEffect, useState } from 'react';
import { obtenerOrdenesAction } from '@/src/actions/obtenerOrdenesAction';

import { eliminarOrdenAction } from '@/src/actions/eliminarOrdenAction';
import type { OrdenCompleta } from '@/src/types/orden';
import { Clock, ChefHat, CheckCircle, XCircle, ChevronDown, ChevronUp, MapPin, Phone } from 'lucide-react';
import Swal from 'sweetalert2';
import { actualizarEstadoOrdenAction } from '@/src/actions/actualizarEstadoOrdenAction';

export default function Ordenes() {
    const [ordenes, setOrdenes] = useState<OrdenCompleta[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
    const [processingOrder, setProcessingOrder] = useState<string | null>(null);

    // Cargar órdenes al montar el componente
    useEffect(() => {
        const cargarOrdenes = async () => {
            try {
                const resultado = await obtenerOrdenesAction();
                if (resultado.success && resultado.ordenes) {
                    // Solo mostrar órdenes en estado 'orden_tomada'
                    const ordenesPendientes = resultado.ordenes.filter(
                        orden => orden.estado === 'orden_tomada'
                    );
                    setOrdenes(ordenesPendientes);
                }
            } catch (error) {
                console.error('Error cargando órdenes:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarOrdenes();

        // Actualizar cada 30 segundos
        const interval = setInterval(cargarOrdenes, 30000);
        return () => clearInterval(interval);
    }, []);

    // Toggle para expandir/colapsar orden
    const toggleExpanded = (ordenId: string) => {
        const newExpanded = new Set(expandedOrders);
        if (newExpanded.has(ordenId)) {
            newExpanded.delete(ordenId);
        } else {
            newExpanded.add(ordenId);
        }
        setExpandedOrders(newExpanded);
    };

    // Cambiar estado de orden o eliminarla completamente
    const cambiarEstado = async (ordenId: string, accion: 'lista' | 'eliminar') => {
        const orden = ordenes.find(o => o.id === ordenId);
        if (!orden) return;

        let titulo: string, texto: string, confirmText: string, icon: 'question' | 'warning', color: string;

        if (accion === 'lista') {
            titulo = 'Marcar como lista';
            texto = `Orden #${orden.id.slice(-6)} - ${orden.cliente_nombre}`;
            confirmText = 'Sí, está lista';
            icon = 'question';
            color = '#10b981';
        } else {
            titulo = 'Eliminar orden completamente';
            texto = `Esta acción eliminará permanentemente la orden #${orden.id.slice(-6)} - ${orden.cliente_nombre}`;
            confirmText = 'Sí, eliminar';
            icon = 'warning';
            color = '#ef4444';
        }

        const resultado = await Swal.fire({
            title: titulo,
            text: texto,
            icon: icon,
            showCancelButton: true,
            confirmButtonColor: color,
            cancelButtonColor: '#6b7280',
            confirmButtonText: confirmText,
            cancelButtonText: 'No, volver'
        });

        if (resultado.isConfirmed) {
            setProcessingOrder(ordenId);
            try {
                let response;

                if (accion === 'lista') {
                    response = await actualizarEstadoOrdenAction(ordenId, 'lista');
                } else {
                    response = await eliminarOrdenAction(ordenId);
                }

                if (response.success) {
                    // Remover la orden de la lista
                    setOrdenes(prev => prev.filter(o => o.id !== ordenId));
                    Swal.fire({
                        icon: 'success',
                        title: accion === 'lista' ? 'Orden lista para entrega' : 'Orden eliminada',
                        timer: 2000,
                        showConfirmButton: false,
                        toast: true,
                        position: 'top-end'
                    });
                } else {
                    Swal.fire('Error', response.error || 'No se pudo procesar la orden', 'error');
                }
            } catch {
                Swal.fire('Error', 'Ocurrió un error al procesar la orden', 'error');
            } finally {
                setProcessingOrder(null);
            }
        }
    };

    // Formatear tiempo transcurrido
    const calcularTiempoTranscurrido = (fecha: string) => {
        const ahora = new Date();
        const ordenFecha = new Date(fecha);
        const diffMs = ahora.getTime() - ordenFecha.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Ahora';
        if (diffMins < 60) return `${diffMins}m`;

        const horas = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return `${horas}h ${mins}m`;
    };

    // Obtener color según tiempo transcurrido
    const getTimeColor = (fecha: string) => {
        const diffMins = Math.floor((new Date().getTime() - new Date(fecha).getTime()) / 60000);
        if (diffMins < 10) return 'text-green-600';
        if (diffMins < 20) return 'text-yellow-600';
        return 'text-red-600';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
                <div className="text-center">
                    <ChefHat className="animate-bounce mx-auto mb-4 text-orange-500" size={48} />
                    <p className="text-gray-600 font-medium">Cargando órdenes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header fijo */}
            <div className="bg-white shadow-sm border-b-2 border-orange-500 sticky top-0 z-10">
                <div className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-500 p-2 rounded-xl">
                                <ChefHat className="text-white" size={24} />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Cocina</h1>
                                <p className="text-sm text-gray-600">
                                    {ordenes.length} orden{ordenes.length !== 1 ? 'es' : ''} pendiente{ordenes.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-orange-600">{ordenes.length}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider">NUEVAS</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="p-4 space-y-4">
                {ordenes.length === 0 ? (
                    <div className="text-center py-16">
                        <CheckCircle className="mx-auto mb-4 text-green-500" size={64} />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">¡Todo preparado!</h3>
                        <p className="text-gray-500">No hay órdenes pendientes por preparar</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {ordenes.map((orden) => {
                            const isExpanded = expandedOrders.has(orden.id);
                            const tiempoTranscurrido = calcularTiempoTranscurrido(orden.created_at);
                            const timeColor = getTimeColor(orden.created_at);

                            return (
                                <div
                                    key={orden.id}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    {/* Header compacto */}
                                    <div
                                        className="p-4 border-l-4 border-l-orange-500 cursor-pointer"
                                        onClick={() => toggleExpanded(orden.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="bg-orange-100 px-3 py-1 rounded-full">
                                                        <span className="text-orange-700 font-bold text-sm">
                                                            #{orden.id.slice(-6)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={14} className={timeColor} />
                                                        <span className={`text-sm font-medium ${timeColor}`}>
                                                            {tiempoTranscurrido}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-lg">
                                                            {orden.tipo_orden === 'domicilio' ? 'A domicilio' : 'Establecimiento'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{orden.cliente_nombre}</p>
                                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                                            <span>{orden.orden_detalles?.length || 0} producto{(orden.orden_detalles?.length || 0) !== 1 ? 's' : ''}</span>
                                                            <span className="font-semibold text-green-600">
                                                                ${orden.total.toLocaleString('es-CO')}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {isExpanded ? (
                                                            <ChevronUp className="text-gray-400" size={20} />
                                                        ) : (
                                                            <ChevronDown className="text-gray-400" size={20} />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contenido expandible */}
                                    {isExpanded && (
                                        <div className="border-t bg-gray-50">
                                            {/* Info del cliente */}
                                            <div className="p-4 border-b bg-white">
                                                <div className="grid grid-cols-1 gap-2 text-sm">
                                                    {orden.cliente_telefono && (
                                                        <div className="flex items-center gap-2">
                                                            <Phone size={14} className="text-gray-500" />
                                                            <span>{orden.cliente_telefono}</span>
                                                        </div>
                                                    )}
                                                    {orden.tipo_orden === 'domicilio' && orden.cliente_direccion !== 'En establecimiento' && (
                                                        <div className="flex items-start gap-2">
                                                            <MapPin size={14} className="text-gray-500 mt-0.5 flex-shrink-0" />
                                                            <span className="break-words">{orden.cliente_direccion}</span>
                                                        </div>
                                                    )}
                                                    {orden.cliente_notas && (
                                                        <div className="mt-2 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                                            <p className="text-blue-800">
                                                                <span className="font-medium">Nota del pedido:</span> {orden.cliente_notas}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Productos */}
                                            <div className="p-4">
                                                <h4 className="font-semibold mb-3 text-gray-900 flex items-center gap-2">
                                                    <ChefHat size={16} />
                                                    Productos a preparar
                                                </h4>

                                                <div className="space-y-3">
                                                    {orden.orden_detalles?.map((detalle) => (
                                                        <div key={detalle.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <h5 className="font-bold text-gray-900 text-lg">
                                                                    {detalle.producto_nombre}
                                                                </h5>
                                                                <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                                                                    {detalle.cantidad}
                                                                </div>
                                                            </div>

                                                            {/* Solo mostrar ingredientes excluidos (Sin:) */}
                                                            {detalle.orden_personalizaciones && detalle.orden_personalizaciones.filter(p => !p.incluido).length > 0 && (
                                                                <div className="mb-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                                                    <div className="flex items-start gap-2">
                                                                        <span className="font-bold text-red-700 text-sm">SIN:</span>
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {detalle.orden_personalizaciones
                                                                                .filter(p => !p.incluido)
                                                                                .map((p, index, array) => (
                                                                                    <span key={p.ingrediente_id} className="text-red-700 font-medium text-sm">
                                                                                        {p.ingrediente_nombre.toUpperCase()}
                                                                                        {index < array.length - 1 ? ', ' : ''}
                                                                                    </span>
                                                                                ))
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Notas del producto */}
                                                            {detalle.notas_personalizacion && (
                                                                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                                                    <p className="text-yellow-800">
                                                                        <span className="font-bold">NOTA:</span> {detalle.notas_personalizacion}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Botones de acción */}
                                            <div className="p-4 bg-white border-t">
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            cambiarEstado(orden.id, 'lista');
                                                        }}
                                                        disabled={processingOrder === orden.id}
                                                        className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        {processingOrder === orden.id ? (
                                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                        ) : (
                                                            <>
                                                                <CheckCircle size={18} />
                                                                ORDEN LISTA
                                                            </>
                                                        )}
                                                    </button>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            cambiarEstado(orden.id, 'eliminar');
                                                        }}
                                                        disabled={processingOrder === orden.id}
                                                        className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <XCircle size={18} />
                                                        ELIMINAR
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}