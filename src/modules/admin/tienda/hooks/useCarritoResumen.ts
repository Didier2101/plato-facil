'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCarritoStore } from '@/src/modules/admin/tienda/store/carritoStore';
import { useClienteStore } from '@/src/modules/cliente/domicilios/store/clienteStore';
import { crearOrdenAction } from '@/src/modules/admin/ordenes/actions/crearOrdenAction';
import { calcularDomicilioPorCoordenadasAction } from '@/src/modules/cliente/domicilios/actions/calculoDomicilioAction';
import { toast } from '@/src/shared/services/toast.service';
import type { TipoOrden } from "@/src/shared/types/orden";

interface DatosDomicilio {
    costo_domicilio: number;
    distancia_km: number;
    duracion_estimada: number;
    distancia_base_km: number;
    costo_base: number;
    distancia_exceso_km: number;
    costo_exceso: number;
    latitud_destino: number;
    longitud_destino: number;
}

/**
 * Hook para gestionar la lógica del resumen del carrito y el proceso de checkout.
 */
export function useCarritoResumen(tipo: TipoOrden, onClose: () => void) {
    const { productos, total, actualizarCantidad, removerProducto, limpiarCarrito } = useCarritoStore();
    const { cliente, setMostrarModal } = useClienteStore();

    const [procesando, setProcesando] = useState(false);
    const [notasCliente, setNotasCliente] = useState("");
    const [metodoPago, setMetodoPago] = useState<"efectivo" | "tarjeta" | "transferencia" | "">("");
    const [montoEntregado, setMontoEntregado] = useState<number | "">("");
    const [datosDomicilio, setDatosDomicilio] = useState<DatosDomicilio | null>(null);
    const [calculandoDomicilio, setCalculandoDomicilio] = useState(false);
    const [errorDomicilio, setErrorDomicilio] = useState("");
    const [datosEditados, setDatosEditados] = useState({
        nombre: cliente?.nombre || "",
        telefono: cliente?.telefono || "",
        direccion: cliente?.direccion || ""
    });

    const totalFinal = useMemo(() => total + (datosDomicilio?.costo_domicilio || 0), [total, datosDomicilio]);

    const cambio = useMemo(() =>
        metodoPago === "efectivo" && montoEntregado !== ""
            ? Number(montoEntregado) - totalFinal
            : null
        , [metodoPago, montoEntregado, totalFinal]);

    // Sincronizar datos editados cuando cambia el cliente en el store
    useEffect(() => {
        if (cliente) {
            setDatosEditados({
                nombre: cliente.nombre || "",
                telefono: cliente.telefono || "",
                direccion: cliente.direccion || ""
            });
        }
    }, [cliente]);

    /**
     * Calcula automáticamente el costo de domicilio basándose en la ubicación actual
     */
    const calcularDomicilioAutomatico = useCallback(async () => {
        if (!navigator.geolocation) {
            setErrorDomicilio('Tu navegador no soporta geolocalización');
            return;
        }

        setCalculandoDomicilio(true);
        setErrorDomicilio('');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    const resultado = await calcularDomicilioPorCoordenadasAction({
                        lat: latitude,
                        lng: longitude
                    });

                    if (resultado.success && resultado.ruta) {
                        if (resultado.ruta.fuera_de_cobertura) {
                            setErrorDomicilio(`Ubicación fuera de cobertura (${resultado.ruta.distancia_km} km)`);
                            setCalculandoDomicilio(false);
                            return;
                        }

                        setDatosDomicilio({
                            costo_domicilio: resultado.ruta.costo_domicilio,
                            distancia_km: resultado.ruta.distancia_km,
                            duracion_estimada: resultado.ruta.duracion_minutos,
                            distancia_base_km: resultado.ruta.distancia_base_km,
                            costo_base: resultado.ruta.costo_base,
                            distancia_exceso_km: resultado.ruta.distancia_exceso_km,
                            costo_exceso: resultado.ruta.costo_exceso,
                            latitud_destino: latitude,
                            longitud_destino: longitude
                        });
                    } else {
                        setErrorDomicilio(resultado.error || 'No se pudo calcular el domicilio');
                    }
                } catch {
                    setErrorDomicilio('Error calculando el costo de domicilio');
                } finally {
                    setCalculandoDomicilio(false);
                }
            },
            (error) => {
                setCalculandoDomicilio(false);
                let mensajeError = 'Error obteniendo ubicación';
                if (error.code === 1) mensajeError = 'Permiso de ubicación denegado';
                setErrorDomicilio(mensajeError);
            },
            { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
        );
    }, []);

    /**
     * Actualiza los datos de domicilio desde el CalculadorDomicilio
     */
    const actualizarDatosDomicilioDesdeCalculador = useCallback((resultado: {
        direccion: {
            direccion_formateada: string;
            coordenadas: { lat: number; lng: number };
        };
        ruta: {
            distancia_km: number;
            duracion_minutos: number;
            costo_domicilio: number;
            fuera_de_cobertura: boolean;
            distancia_base_km?: number;
            costo_base?: number;
            distancia_exceso_km?: number;
            costo_exceso?: number;
        };
        costo_domicilio: number;
    }) => {
        if (resultado.ruta.fuera_de_cobertura) {
            setErrorDomicilio(`Ubicación fuera de cobertura (${resultado.ruta.distancia_km} km)`);
            setDatosDomicilio(null);
            return;
        }

        setDatosDomicilio({
            costo_domicilio: resultado.costo_domicilio,
            distancia_km: resultado.ruta.distancia_km,
            duracion_estimada: resultado.ruta.duracion_minutos,
            distancia_base_km: resultado.ruta.distancia_base_km || 0,
            costo_base: resultado.ruta.costo_base || 0,
            distancia_exceso_km: resultado.ruta.distancia_exceso_km || 0,
            costo_exceso: resultado.ruta.costo_exceso || 0,
            latitud_destino: resultado.direccion.coordenadas.lat,
            longitud_destino: resultado.direccion.coordenadas.lng
        });
        setErrorDomicilio('');
        
        // Actualizar también la dirección en el cliente si existe
        if (cliente) {
            // Actualizar dirección en el store del cliente
            // Nota: Esto solo actualiza la dirección mostrada, no guarda en BD
        }
    }, [cliente]);

    // Iniciar cálculo de domicilio si es necesario
    useEffect(() => {
        if (tipo === "domicilio" && !datosDomicilio && !calculandoDomicilio && !errorDomicilio) {
            calcularDomicilioAutomatico();
        }
    }, [tipo, datosDomicilio, calculandoDomicilio, errorDomicilio, calcularDomicilioAutomatico]);

    /**
     * Valida que los datos del cliente estén completos según el tipo de orden
     */
    const verificarDatosCliente = useCallback(() => {
        if (tipo === "mesa" || tipo === "para_llevar") {
            if (!datosEditados.nombre?.trim()) {
                toast.warning("Datos requeridos", {
                    description: tipo === "mesa" ? "Ingresa el identificador de mesa" : "Ingresa el nombre del cliente"
                });
                return false;
            }
            return true;
        }

        if (tipo === "domicilio") {
            const faltantes = [];
            if (!cliente?.nombre?.trim()) faltantes.push("nombre");
            if (!cliente?.telefono?.trim()) faltantes.push("teléfono");
            if (!cliente?.direccion?.trim()) faltantes.push("dirección");

            if (faltantes.length > 0) {
                toast.warning("Datos incompletos", {
                    description: `Faltan: ${faltantes.join(", ")}`
                });
                setMostrarModal(true);
                return false;
            }
            return true;
        }
        return true;
    }, [tipo, datosEditados.nombre, cliente, setMostrarModal]);

    /**
     * Limpia todo el carrito con confirmación vía toast
     */
    const handleLimpiarTodo = useCallback(() => {
        toast.info("¿Vaciar carrito?", {
            description: "¿Seguro que deseas eliminar todos los productos del carrito?",
            action: {
                label: "Sí, vaciar",
                onClick: () => {
                    limpiarCarrito();
                    toast.success("Carrito vaciado correctamente");
                }
            },
            cancel: {
                label: "No",
                onClick: () => { }
            }
        });
    }, [limpiarCarrito]);


    /**
     * Procesa la orden y la envía al servidor
     */
    const handleProcesarOrden = useCallback(async () => {
        if (!verificarDatosCliente()) return;
        if (productos.length === 0) {
            toast.warning("Carrito vacío");
            return;
        }

        if (tipo === "domicilio") {
            if (!datosDomicilio) {
                toast.warning("Domicilio no calculado", { 
                    description: "Debes calcular el costo de envío antes de confirmar la orden. El cliente necesita saber el total completo." 
                });
                return;
            }
            if (calculandoDomicilio) {
                toast.warning("Calculando domicilio", { description: "Espera a que termine el cálculo del domicilio" });
                return;
            }
            if (!metodoPago) {
                toast.warning("Método de pago", { description: "Selecciona un método de pago" });
                return;
            }
            if (metodoPago === "efectivo" && (montoEntregado === "" || Number(montoEntregado) < totalFinal)) {
                toast.warning("Monto insuficiente", { description: "El pago no cubre el total" });
                return;
            }
        }

        setProcesando(true);
        try {
            const result = await crearOrdenAction({
                cliente: {
                    nombre: tipo !== "domicilio" ? datosEditados.nombre.trim() : cliente!.nombre.trim(),
                    telefono: tipo === "domicilio" ? cliente!.telefono?.trim() : undefined,
                    direccion: tipo === "domicilio" ? cliente!.direccion?.trim() : (tipo === "mesa" ? `Mesa: ${datosEditados.nombre}` : "Para llevar"),
                    notas: notasCliente?.trim() || undefined,
                },
                productos: productos.map(p => ({
                    producto_id: p.id,
                    nombre: p.nombre,
                    precio: p.precio,
                    cantidad: p.cantidad,
                    subtotal: p.precio * p.cantidad,
                    ingredientes_personalizados: p.ingredientes_personalizados,
                    notas: p.notas,
                    personalizacion_id: p.personalizacion_id
                })),
                total,
                estado: "orden_tomada",
                tipo_orden: tipo,
                domicilio: datosDomicilio || undefined,
                metodo_pago: metodoPago || undefined,
                monto_entregado: metodoPago === "efectivo" ? Number(montoEntregado) : undefined,
            });

            if (result.success) {
                toast.success("¡Orden creada!", {
                    description: `Pedido #${result.orden?.id.slice(-6).toUpperCase()} por $${totalFinal.toLocaleString("es-CO")}`
                });
                limpiarCarrito();
                onClose();
            } else {
                toast.error("Error al crear orden", { description: result.error || "Inténtalo de nuevo" });
            }
        } catch (error) {
            console.error("Error procesando orden:", error);
            toast.error("Error inesperado", { description: "No se pudo procesar tu pedido" });
        } finally {
            setProcesando(false);
        }
    }, [verificarDatosCliente, productos, tipo, datosDomicilio, metodoPago, montoEntregado, totalFinal, cliente, datosEditados.nombre, notasCliente, total, limpiarCarrito, onClose]);

    return {
        procesando,
        notasCliente,
        setNotasCliente,
        metodoPago,
        setMetodoPago,
        montoEntregado,
        setMontoEntregado,
        datosDomicilio,
        calculandoDomicilio,
        errorDomicilio,
        datosEditados,
        setDatosEditados,
        totalFinal,
        cambio,
        handleLimpiarTodo,
        handleProcesarOrden,
        recalcularDomicilio: calcularDomicilioAutomatico,
        actualizarDatosDomicilioDesdeCalculador,
        productos,
        removerProducto,
        actualizarCantidad,
        total,
        cliente
    };
}
