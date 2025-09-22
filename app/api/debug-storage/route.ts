// app/api/debug-storage/route.ts
export async function GET() {
    return Response.json({
        message: "API funciona",
        timestamp: new Date().toISOString(),
        env: {
            hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        }
    });
}