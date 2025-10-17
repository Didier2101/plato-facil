// src/lib/cookies.ts
import { cookies } from 'next/headers';

const CLIENTE_IDENTIFICADOR = 'cliente_domicilio_id';
const CLIENTE_TELEFONO = 'cliente_telefono';

export async function setClienteCookie(clienteIdentificador: string, telefono?: string) {
    const cookieStore = await cookies();

    cookieStore.set(CLIENTE_IDENTIFICADOR, clienteIdentificador, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 días
        path: '/',
    });

    // Guardar también el teléfono para búsqueda rápida
    if (telefono) {
        cookieStore.set(CLIENTE_TELEFONO, telefono, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30,
            path: '/',
        });
    }
}

export async function getClienteIdentificador() {
    const cookieStore = await cookies();
    return cookieStore.get(CLIENTE_IDENTIFICADOR)?.value;
}

export async function getClienteTelefono() {
    const cookieStore = await cookies();
    return cookieStore.get(CLIENTE_TELEFONO)?.value;
}

export async function deleteClienteCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(CLIENTE_IDENTIFICADOR);
    cookieStore.delete(CLIENTE_TELEFONO);
}

export async function clienteExisteCookie() {
    const identificador = await getClienteIdentificador();
    return !!identificador;
}