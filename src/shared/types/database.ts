// Tipos base de datos
export interface OrdenDB {
    id: string;
    cliente_nombre: string;
    cliente_telefono: string | null;
    cliente_direccion: string | null;
    cliente_notas: string | null;
    total: string | number;
    estado: string;
    tipo_orden: string;
    created_at: string;
    updated_at: string;
    fecha_entrega: string | null;
    usuario_vendedor_id: string | null;
    usuario_entregador_id: string | null;
    costo_domicilio: string | number;
    distancia_km: string | number | null;
    duracion_estimada: number | null;
    metodo_pago: string | null;
    monto_entregado: string | number | null;
    subtotal_productos: string | number;
    total_final: string | number;
}

export interface OrdenDetalleDB {
    id: string;
    orden_id: string;
    producto_id: number;
    producto_nombre: string;
    precio_unitario: string | number;
    cantidad: number;
    subtotal: string | number;
    notas_personalizacion: string | null;
    created_at: string;
    orden_personalizaciones?: PersonalizacionDB[];
}

export interface PersonalizacionDB {
    id: string;
    orden_detalle_id: string;
    ingrediente_id: string;
    ingrediente_nombre: string;
    incluido: boolean;
    obligatorio: boolean;
    created_at: string;
}

export interface PagoDB {
    id: string;
    orden_id: string;
    usuario_id: string;
    metodo_pago: string;
    monto: string | number;
    created_at: string;
    propinas?: PropinaDB[];
}

export interface PropinaDB {
    id: string;
    pago_id: string;
    monto: string | number;
    porcentaje: string | number | null;
    created_at: string;
}

export interface HistorialDB {
    id: string;
    orden_id: string;
    estado_anterior: string | null;
    estado_nuevo: string;
    usuario_id: string;
    notas: string | null;
    created_at: string;
    usuarios?: { nombre: string };
}

export interface UsuarioDB {
    id: string;
    nombre: string | null;
    rol: string;
    email: string;
    activo: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface ProductoDB {
    id: number;
    nombre: string;
    precio: string | number;
    categoria_id: string | null;
    descripcion: string | null;
    activo: boolean;
    categorias?: { nombre: string }[];
}