
export interface FiltroReporte {
    fechaInicio: string;
    fechaFin: string;
    usuarioId?: string;
    estado?: string;
    tipoOrden?: string;
}

export interface Usuario {
    id: string;
    nombre: string;
    rol: string;
    email: string;
    activo: boolean;
}

export interface OrdenCompleta {
    orden: {
        id: string;
        cliente_nombre: string;
        cliente_telefono: string | null;
        cliente_direccion: string | null;
        cliente_notas: string | null;
        total: number;
        estado: string;
        tipo_orden: string;
        created_at: string;
        updated_at: string;
        fecha_entrega: string | null;
        usuario_vendedor_id: string | null;
        usuario_entregador_id: string | null;
        costo_domicilio: number;
        distancia_km: number | null;
        duracion_estimada: number | null;
        metodo_pago: string | null;
        monto_entregado: number | null;
        subtotal_productos: number;
        total_final: number;
    };
    detalles: Array<{
        id: string;
        producto_nombre: string;
        precio_unitario: number;
        cantidad: number;
        subtotal: number;
        notas_personalizacion: string | null;
        personalizaciones: Array<{
            ingrediente_nombre: string;
            incluido: boolean;
            obligatorio: boolean;
        }>;
    }>;
    pagos: Array<{
        metodo_pago: string;
        monto: number;
        propinas: Array<{
            monto: number;
            porcentaje: number | null;
        }>;
    }>;
    historial: Array<{
        estado_anterior: string | null;
        estado_nuevo: string;
        usuario_nombre: string;
        created_at: string;
        notas: string | null;
    }>;
    vendedor?: Usuario;
    entregador?: Usuario;
}

export interface ReporteDatos {
    totalVentas: number;
    totalPropinas: number;
    totalPedidos: number;
    promedioVenta: number;
    subtotalProductos: number;
    totalCostosDomicilio: number;
    totalFinal: number;
    efectivoEntregado: number;
    ventasPorUsuario: Array<{
        id: string;
        nombre: string;
        rol: string;
        totalVentas: number;
        pedidos: number;
        promedioVenta: number;
        propinasRecibidas: number;
    }>;
    masVendidos: Array<{
        nombre: string;
        cantidad: number;
        ingresos: number;
        categoria: string;
        precioPromedio: number;
    }>;
    menosVendidos: Array<{
        nombre: string;
        cantidad: number;
        ingresos: number;
        categoria: string;
    }>;
    ventasPorCategoria: Array<{
        nombre: string;
        categoria: string;
        cantidad: number;
        ingresos: number;
        porcentaje: number;
    }>;
    ventasPorHora: Array<{
        hora: number;
        ventas: number;
        pedidos: number;
        promedio: number;
    }>;
    ventasPorDia: Array<{
        dia: string;
        fecha: string;
        ventas: number;
        pedidos: number;
    }>;
    ordenesCompletas: OrdenCompleta[];
    ventasPorMetodoPago: Array<{
        metodo: string;
        cantidad: number;
        monto: number;
        porcentaje: number;
    }>;
    estadisticasEstados: Array<{
        estado: string;
        cantidad: number;
        porcentaje: number;
    }>;
    ventasPorTipoOrden: Array<{
        tipo: string;
        cantidad: number;
        monto: number;
        porcentaje: number;
    }>;
    estadisticasDomicilio: {
        totalDomicilios: number;
        totalIngresosDomicilio: number;
        promedioCostoDomicilio: number;
        distanciaPromedio: number;
        domiciliosFueraCobertura: number;
    };
    analisisTiempos: {
        tiempoPreparacionPromedio: number;
        tiempoEntregaPromedio: number;
        ordenesConRetraso: number;
    };
    eficienciaPersonal: Array<{
        usuario_id: string;
        nombre: string;
        rol: string;
        ordenesAtendidas: number;
        ventasGeneradas: number;
        propinasRecibidas: number;
        promedioVenta: number;
    }>;
    productosConMasPersonalizaciones: Array<{
        producto_nombre: string;
        personalizaciones_count: number;
        veces_pedido: number;
    }>;
}

export interface ReporteResponse {
    success: boolean;
    datos?: ReporteDatos;
    error?: string;
    details?: string;
}