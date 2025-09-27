"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaMotorcycle, FaUtensils, FaInfoCircle, FaTimes } from "react-icons/fa";
import { useClienteStore } from "@/src/store/clienteStore";
import { buscarOrdenPorTelefonoAction } from "@/src/actions/buscarOrdenPorTelefonoAction";


interface NotificationProps {
    message: string;
    type: "welcome" | "welcome_back" | "order_ready" | "on_the_way" | "order_delivered" | "info";
    onClose: () => void;
    autoHideDuration?: number;
}

function Notification({ message, type, onClose, autoHideDuration = 15000 }: NotificationProps) {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        // Barra de progreso que disminuye
        const interval = setInterval(() => {
            setProgress(prev => Math.max(prev - (100 / (autoHideDuration / 100)), 0));
        }, 100);

        // Auto-ocultar después del tiempo especificado
        const timer = setTimeout(() => {
            onClose();
        }, autoHideDuration);

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, [onClose, autoHideDuration]);

    const getIcon = () => {
        switch (type) {
            case "welcome":
                return <FaInfoCircle className="text-blue-500" />;
            case "welcome_back":
                return <FaCheckCircle className="text-green-500" />;
            case "order_ready":
                return <FaUtensils className="text-orange-500" />;
            case "on_the_way":
                return <FaMotorcycle className="text-red-500" />;
            case "order_delivered":
                return <FaCheckCircle className="text-green-500" />;
            default:
                return <FaInfoCircle className="text-gray-500" />;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case "welcome":
                return "bg-blue-50 border-blue-200";
            case "welcome_back":
                return "bg-green-50 border-green-200";
            case "order_ready":
                return "bg-orange-50 border-orange-200";
            case "on_the_way":
                return "bg-red-50 border-red-200";
            case "order_delivered":
                return "bg-green-50 border-green-200";
            default:
                return "bg-gray-50 border-gray-200";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.9 }}
            className={`relative ${getBgColor()} border rounded-2xl shadow-lg max-w-sm w-full mb-3 overflow-hidden`}
        >
            {/* Barra de progreso */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
                <div
                    className="h-full bg-gray-400 transition-all duration-100"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                        {getIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{message}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                        <FaTimes size={12} className="text-gray-500" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

export default function UserWelcomeNotification() {
    const [notifications, setNotifications] = useState<Array<{
        id: string;
        message: string;
        type: NotificationProps["type"];
    }>>([]);

    const [ultimoEstadoOrden, setUltimoEstadoOrden] = useState<string | null>(null);
    const [ordenActualId, setOrdenActualId] = useState<string | null>(null);
    const [mostroWelcome, setMostroWelcome] = useState(false);

    const { nombre, telefono } = useClienteStore();

    // Función para agregar notificación
    const agregarNotificacion = (message: string, type: NotificationProps["type"]) => {
        const id = Math.random().toString(36).substr(2, 9);
        setNotifications(prev => [...prev, { id, message, type }]);
    };

    // Función para buscar órdenes del usuario usando useCallback
    const buscarOrdenActual = useCallback(async () => {
        if (!telefono?.trim()) return;

        try {
            const result = await buscarOrdenPorTelefonoAction({ telefono });

            if (result.success && result.orden) {
                const orden = result.orden;

                // Si es la primera vez que detectamos esta orden, guardarla
                if (ordenActualId !== orden.id) {
                    setOrdenActualId(orden.id);
                    setUltimoEstadoOrden(orden.estado);
                    return; // No mostrar notificación en el primer checkeo
                }

                // Si el estado cambió, mostrar notificación
                if (ultimoEstadoOrden && ultimoEstadoOrden !== orden.estado) {
                    const ordenIdCorto = orden.id.slice(-8);

                    // Mapear estados de DB a tipos de notificación visual
                    switch (orden.estado) {
                        case "lista":
                            agregarNotificacion(
                                `¡Tu pedido #${ordenIdCorto} está listo! 🎉`,
                                "order_ready"
                            );
                            break;
                        case "en_camino":
                            agregarNotificacion(
                                `🚚 Tu pedido #${ordenIdCorto} está en camino. Prepárate para recibirlo`,
                                "on_the_way"
                            );
                            break;
                        case "entregada":
                            agregarNotificacion(
                                `✅ Tu pedido #${ordenIdCorto} ha sido entregado. ¡Gracias por tu compra!`,
                                "order_delivered"
                            );
                            break;
                        case "cancelada":
                            agregarNotificacion(
                                `❌ Tu pedido #${ordenIdCorto} ha sido cancelado`,
                                "info"
                            );
                            break;
                    }

                    setUltimoEstadoOrden(orden.estado);
                }
            }
        } catch (error) {
            console.error("Error buscando orden:", error);
        }
    }, [telefono, ordenActualId, ultimoEstadoOrden]);

    // Efecto para mensaje de bienvenida inicial
    useEffect(() => {
        if (mostroWelcome) return;

        const firstVisit = localStorage.getItem("first_visit");
        const hasOrders = localStorage.getItem("has_orders");

        if (!firstVisit) {
            // Primera vez que visita
            setTimeout(() => {
                agregarNotificacion(
                    "¡Bienvenido! Realiza tu primer pedido a domicilio",
                    "welcome"
                );
                localStorage.setItem("first_visit", "true");
                setMostroWelcome(true);
            }, 1000);
        } else if (nombre && hasOrders) {
            // Usuario recurrente con nombre guardado
            setTimeout(() => {
                agregarNotificacion(
                    `¡Bienvenido de nuevo, ${nombre}! ¿Listo para otro pedido?`,
                    "welcome_back"
                );
                setMostroWelcome(true);
            }, 1500);
        } else if (hasOrders) {
            // Usuario recurrente sin nombre pero con órdenes
            setTimeout(() => {
                agregarNotificacion(
                    "¡Bienvenido de nuevo! Tus pedidos anteriores están listos para repetir",
                    "welcome_back"
                );
                setMostroWelcome(true);
            }, 1500);
        }
    }, [nombre, mostroWelcome]);

    // Efecto para monitorear cambios de estado de órdenes
    useEffect(() => {
        if (!telefono?.trim()) return;

        // Buscar inmediatamente
        buscarOrdenActual();

        // Configurar polling cada 30 segundos para órdenes activas
        const interval = setInterval(() => {
            // Solo hacer polling si hay una orden activa (no entregada ni cancelada)
            if (ultimoEstadoOrden && !['entregada', 'cancelada'].includes(ultimoEstadoOrden)) {
                buscarOrdenActual();
            }
        }, 30000); // 30 segundos

        return () => clearInterval(interval);
    }, [telefono, buscarOrdenActual, ultimoEstadoOrden]);

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col items-end">
            <AnimatePresence>
                {notifications.map((notification) => (
                    <Notification
                        key={notification.id}
                        message={notification.message}
                        type={notification.type}
                        onClose={() => removeNotification(notification.id)}
                        autoHideDuration={notification.type === "welcome" || notification.type === "welcome_back" ? 10000 : 15000}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}