/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para imágenes de Supabase Storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rmrelrctstkbuxhbilxv.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/productos/**',
      }
    ],
  },

  // ✅ ACTUALIZADO: serverExternalPackages (ya no es experimental)
  serverExternalPackages: ['sharp', '@supabase/supabase-js'],

  // ✅ ACTUALIZADO: Server Actions configuración
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // ⚠️ NOTA: api.bodyParser solo funciona en Pages Router
  // Para App Router, el límite se maneja automáticamente
}

module.exports = nextConfig