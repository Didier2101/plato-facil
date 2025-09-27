// src/types/orden.ts

// Tipo para personalizaciones de ingredientes
export interface OrdenPersonalizacion {
    ingrediente_id: string;
    ingrediente_nombre: string;
    incluido: boolean;
    obligatorio: boolean;
}

// Tipo para detalles de orden con personalizaciones
export interface OrdenDetalle {
    id: string;
    orden_id: string;
    producto_id: number;
    producto_nombre: string;
    precio_unitario: number;
    cantidad: number;
    subtotal: number;
    notas_personalizacion?: string | null;
    created_at: string;
    // NUEVO: personalizaciones de ingredientes
    orden_personalizaciones?: OrdenPersonalizacion[];
}

// Tipo principal para orden completa
export interface OrdenCompleta {
    id: string;
    cliente_nombre: string;
    cliente_telefono?: string | null;
    cliente_direccion: string;
    cliente_notas?: string | null;
    total: number;
    estado: 'orden_tomada' | 'lista' | 'en_camino' | 'llegue_a_destino' | 'entregada' | 'cancelada';
    tipo_orden: 'establecimiento' | 'domicilio';
    created_at: string;
    updated_at: string;
    usuario_vendedor_id?: string | null;
    usuario_entregador_id?: string | null;
    fecha_entrega?: string | null;
    // Detalles con personalizaciones
    orden_detalles?: OrdenDetalle[];
}