// src/app/test/page.tsx

import { supabase } from "@/src/lib/supabaseClient"


export default async function TestPage() {
    const { data, error } = await supabase.from('usuarios').select('*')

    return (
        <main style={{ padding: 24, fontFamily: 'system-ui' }}>
            <h1>Prueba Supabase — PlatoFácil</h1>

            {error && (
                <section>
                    <h2>Error</h2>
                    <pre>{error.message}</pre>
                </section>
            )}

            {!error && (
                <section>
                    <h2>Usuarios</h2>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(data, null, 2)}</pre>
                </section>
            )}
        </main>
    )
}
