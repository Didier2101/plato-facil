// ==========================================
// 1. TYPES: src/types/factus.ts
// ==========================================
export interface CredencialesFactus {
    grant_type: string;
    client_id: string;
    client_secret: string;
    username: string;
    password: string;
    scope?: string;
}

export interface TokenResponse {
    token_type: string;
    expires_in: number;
    access_token: string;
    refresh_token?: string;
}

export interface Municipality {
    id: number;
    code: string;
    name: string;
    department?: {
        id: number;
        code: string;
        name: string;
    };
}

export interface FactusApiResponse<T> {
    status: string;
    message?: string;
    data: T;
}

export interface BillData {
    id: number;
    number: string;
    cufe: string;
    total: string | number;
    surcharge_amount?: string | number;
    status: number;
    send_email: number;
    qr?: string;
    qr_image?: string;
    validated?: string;
    created_at?: string;
    document: {
        code: string;
        name: string;
    };
}

export interface RespuestaPrueba {
    success: boolean;
    message?: string;
    error?: string;
    token?: string;
    detalles?: string;
    facturaData?: FactusApiResponse<{ bill: BillData }>;
}

export interface Customer {
    identification_document_id: number;
    identification: string;
    names: string;
    address: string;
    email: string;
    phone: string;
    legal_organization_id: number;
    tribute_id: number;
    municipality_id: number;
}

export interface BillItem {
    code_reference: string;
    name: string;
    quantity: number;
    discount_rate: number;
    price: number;
    tax_rate: string;
    unit_measure_id: number;
    standard_code_id: number;
    is_excluded: number;
    tribute_id: number;
}

export interface AllowanceCharge {
    concept_type: string;
    is_surcharge: boolean;
    reason: string;
    base_amount: number;
    amount: number;
}

export interface FacturaRequest {
    document: string;
    reference_code: string;
    observation: string;
    payment_method_code: number;
    customer: Customer;
    items: BillItem[];
    allowance_charges?: AllowanceCharge[];
}
