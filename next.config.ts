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

  // Configuración para server actions
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
  },

  // Límites de tamaño para archivos
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },

  serverActions: {
    bodySizeLimit: '10mb',
  },
}

module.exports = nextConfig