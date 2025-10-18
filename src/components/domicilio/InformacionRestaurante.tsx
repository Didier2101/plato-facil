// src/components/domicilios/InformacionRestaurante.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
    FaStore,
    FaMotorcycle,
    FaClock,
    FaMapMarkerAlt,
    FaPhone,
    FaEnvelope,
    FaDollarSign,
    FaRoute,
    FaGlobe,
    FaBusinessTime,
    FaToggleOn,
    FaToggleOff
} from "react-icons/fa";
import { obtenerConfiguracionRestaurante, ConfiguracionRestaurante } from "@/src/actions/dueno/configuracionRestauranteActions";
import Loading from "../ui/Loading";

export default function InformacionRestaurante() {
    const [configuracion, setConfiguracion] = useState<ConfiguracionRestaurante | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const cargarConfiguracion = async () => {
            try {
                setLoading(true);
                const resultado = await obtenerConfiguracionRestaurante();

                if (resultado.success && resultado.configuracion) {
                    setConfiguracion(resultado.configuracion);
                } else {
                    setError(resultado.error || "No se pudo cargar la información del restaurante");
                }
            } catch (err) {
                setError("Error al cargar la información");
                console.error("Error cargando configuración:", err);
            } finally {
                setLoading(false);
            }
        };

        cargarConfiguracion();
    }, []);

    if (loading) {
        return (
            <Loading
                texto="Cargando informacion del restaurante..."
                tamaño="grande"
                color="orange-500"
            />
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 max-w-md mx-4">
                    <div className="text-red-500 text-4xl mb-4">⚠️</div>
                    <h3 className="text-lg font-semibold text-red-700 mb-2">Error</h3>
                    <p className="text-red-600 mb-4">{error}</p>
                    <p className="text-sm text-red-500">
                        La información del restaurante no está disponible en este momento.
                    </p>
                </div>
            </div>
        );
    }

    if (!configuracion) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-8 max-w-md mx-4">
                    <div className="text-yellow-500 text-4xl mb-4">ℹ️</div>
                    <h3 className="text-lg font-semibold text-yellow-700 mb-2">Información no configurada</h3>
                    <p className="text-yellow-600">
                        El restaurante aún no ha configurado su información.
                    </p>
                </div>
            </div>
        );
    }

    // Función para formatear horarios
    const formatearHora = (hora: string | undefined) => {
        if (!hora) return "No especificado";
        return hora.slice(0, 5); // Formato HH:MM
    };

    // Verificar si está abierto
    const estaAbierto = () => {
        if (!configuracion.hora_apertura || !configuracion.hora_cierre) return null;

        const ahora = new Date();
        const horaActual = ahora.getHours().toString().padStart(2, '0') + ':' +
            ahora.getMinutes().toString().padStart(2, '0');

        return horaActual >= configuracion.hora_apertura && horaActual <= configuracion.hora_cierre;
    };

    const estadoApertura = estaAbierto();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-500 p-4 rounded-xl">
                            <FaStore className="text-2xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {configuracion.nombre_restaurante || "Nuestro Restaurante"}
                            </h1>
                            <p className="text-gray-600 mt-1">Información completa del restaurante</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* Estado de Servicios */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Estado de Servicios
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Venta en Establecimiento */}
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="bg-orange-500 p-3 rounded-lg">
                                        <FaStore className="text-xl text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Venta en Establecimiento</h3>
                                        <p className="text-sm text-gray-600">Pedidos para recoger en local</p>
                                    </div>
                                </div>
                                <div>
                                    {configuracion.establecimiento_activo ? (
                                        <FaToggleOn className="text-4xl text-orange-500" />
                                    ) : (
                                        <FaToggleOff className="text-4xl text-gray-400" />
                                    )}
                                </div>
                            </div>
                            <div className={`text-sm font-medium ${configuracion.establecimiento_activo ? 'text-green-600' : 'text-red-600'}`}>
                                {configuracion.establecimiento_activo ? '✅ Servicio activo' : '❌ Servicio inactivo'}
                            </div>
                        </div>

                        {/* Servicio a Domicilio */}
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="bg-orange-500 p-3 rounded-lg">
                                        <FaMotorcycle className="text-xl text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Servicio a Domicilio</h3>
                                        <p className="text-sm text-gray-600">Entregas a domicilio</p>
                                    </div>
                                </div>
                                <div>
                                    {configuracion.domicilio_activo ? (
                                        <FaToggleOn className="text-4xl text-orange-500" />
                                    ) : (
                                        <FaToggleOff className="text-4xl text-gray-400" />
                                    )}
                                </div>
                            </div>
                            <div className={`text-sm font-medium ${configuracion.domicilio_activo ? 'text-green-600' : 'text-red-600'}`}>
                                {configuracion.domicilio_activo ? '✅ Servicio activo' : '❌ Servicio inactivo'}
                            </div>
                        </div>
                    </div>

                    {/* Estado de apertura */}
                    {estadoApertura !== null && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${estadoApertura ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                                    <span className="font-medium text-gray-900">
                                        {estadoApertura ? 'Abierto ahora' : 'Cerrado'}
                                    </span>
                                </div>
                                <span className="text-sm text-gray-600">
                                    Horario: {formatearHora(configuracion.hora_apertura)} - {formatearHora(configuracion.hora_cierre)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Información Básica */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Información Básica
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Logo e información principal */}
                        <div className="lg:col-span-1">
                            <div className=" rounded-xl p-6 border border-gray-100">
                                {configuracion.logo_url ? (
                                    <div className="text-center">
                                        <Image
                                            src={configuracion.logo_url}
                                            alt={configuracion.nombre_restaurante}
                                            width={160}
                                            height={160}
                                            className="w-40 h-40 mx-auto object-cover rounded-xl"
                                            priority
                                        />
                                        <h3 className="text-lg font-semibold text-gray-900 mt-4">
                                            {configuracion.nombre_restaurante}
                                        </h3>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-40 h-40 mx-auto bg-gray-200 rounded-xl flex items-center justify-center">
                                            <FaStore className="text-6xl text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mt-4">
                                            {configuracion.nombre_restaurante}
                                        </h3>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Información de contacto */}
                        <div className="lg:col-span-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                                        <FaMapMarkerAlt className="text-orange-500 text-xl" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Dirección</p>
                                            <p className="text-gray-900 font-semibold">
                                                {configuracion.direccion_completa}
                                            </p>
                                        </div>
                                    </div>

                                    {configuracion.telefono && (
                                        <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                                            <FaPhone className="text-orange-500 text-xl" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">Teléfono</p>
                                                <p className="text-gray-900 font-semibold">
                                                    {configuracion.telefono}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {configuracion.email && (
                                        <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                                            <FaEnvelope className="text-orange-500 text-xl" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">Email</p>
                                                <p className="text-gray-900 font-semibold">
                                                    {configuracion.email}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                                        <FaClock className="text-orange-500 text-xl" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Tiempo de preparación</p>
                                            <p className="text-gray-900 font-semibold">
                                                {configuracion.tiempo_preparacion_min} minutos
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>

                {/* Configuración de Domicilios */}
                {configuracion.domicilio_activo && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            Configuración de Domicilios
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-orange-50 rounded-xl p-6 border border-orange-100 text-center">
                                <FaDollarSign className="text-3xl text-orange-500 mx-auto mb-3" />
                                <h3 className="font-semibold text-gray-900 mb-2">Costo Base</h3>
                                <p className="text-2xl font-bold text-orange-600">
                                    ${configuracion.costo_base_domicilio.toLocaleString('es-CO')}
                                </p>
                            </div>

                            <div className="bg-orange-50 rounded-xl p-6 border border-orange-100 text-center">
                                <FaRoute className="text-3xl text-orange-500 mx-auto mb-3" />
                                <h3 className="font-semibold text-gray-900 mb-2">Costo por KM</h3>
                                <p className="text-2xl font-bold text-orange-600">
                                    ${configuracion.costo_por_km.toLocaleString('es-CO')}
                                </p>
                            </div>

                            <div className="bg-orange-50 rounded-xl p-6 border border-orange-100 text-center">
                                <FaGlobe className="text-3xl text-orange-500 mx-auto mb-3" />
                                <h3 className="font-semibold text-gray-900 mb-2">Distancia Máxima</h3>
                                <p className="text-2xl font-bold text-orange-600">
                                    {configuracion.distancia_maxima_km} km
                                </p>
                            </div>

                            <div className="bg-orange-50 rounded-xl p-6 border border-orange-100 text-center">
                                <FaBusinessTime className="text-3xl text-orange-500 mx-auto mb-3" />
                                <h3 className="font-semibold text-gray-900 mb-2">Tiempo Entrega</h3>
                                <p className="text-2xl font-bold text-orange-600">
                                    {configuracion.tiempo_preparacion_min + 15} min aprox.
                                </p>
                            </div>
                        </div>

                        {/* Información adicional */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">Horario de atención</h4>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Apertura:</span>
                                    <span className="font-medium">{formatearHora(configuracion.hora_apertura)}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-gray-600">Cierre:</span>
                                    <span className="font-medium">{formatearHora(configuracion.hora_cierre)}</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">Cálculo de domicilio</h4>
                                <p className="text-sm text-gray-600">
                                    Costo total = ${configuracion.costo_base_domicilio.toLocaleString('es-CO')} +
                                    (${configuracion.costo_por_km.toLocaleString('es-CO')} × distancia en km)
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Horarios */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Horarios de Atención
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FaClock className="text-orange-500" />
                                Horario Principal
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-orange-100">
                                    <span className="text-gray-700">Apertura:</span>
                                    <span className="font-semibold text-orange-600">
                                        {formatearHora(configuracion.hora_apertura)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-orange-100">
                                    <span className="text-gray-700">Cierre:</span>
                                    <span className="font-semibold text-orange-600">
                                        {formatearHora(configuracion.hora_cierre)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-700">Tiempo preparación:</span>
                                    <span className="font-semibold text-orange-600">
                                        {configuracion.tiempo_preparacion_min} minutos
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado Actual</h3>
                            <div className="text-center py-4">
                                <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold ${estadoApertura === true
                                    ? "bg-green-100 text-green-800"
                                    : estadoApertura === false
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}>
                                    <div className={`w-3 h-3 rounded-full mr-3 ${estadoApertura === true
                                        ? "bg-green-500 animate-pulse"
                                        : estadoApertura === false
                                            ? "bg-red-500"
                                            : "bg-gray-500"
                                        }`}></div>
                                    {estadoApertura === true
                                        ? "Abierto - Recibiendo pedidos"
                                        : estadoApertura === false
                                            ? "Cerrado - Fuera de horario"
                                            : "Horario no configurado"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}