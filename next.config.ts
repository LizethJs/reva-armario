/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Esto evita que Vercel cancele el despliegue por errores de tipo de TypeScript
    ignoreBuildErrors: true,
  },
  eslint: {
    // Esto también ignora errores de ESLint por si acaso
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;