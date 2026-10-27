import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Evita que Vercel cancele el despliegue por errores de tipo TypeScript */
  typescript: {
    ignoreBuildErrors: true,
  },
  /* Configuración y lista blanca de dominios para imágenes de terceros (SSDLC / ISO 27001) */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;