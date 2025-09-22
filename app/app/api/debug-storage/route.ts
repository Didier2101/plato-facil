// pages/api/debug-storage.ts (o app/api/debug-storage/route.ts)
import { diagnosticarStorageAction } from '@/src/actions/crearProductoAction';

export default async function handler() {
    const result = await diagnosticarStorageAction();
    return Response.json(result);
}