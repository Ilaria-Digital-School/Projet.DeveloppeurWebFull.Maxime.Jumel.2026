import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* vos autres options de configuration ici */
  experimental: {
    // Si vous utilisez une version récente de Next.js, 
    // la clé peut aussi être directement dans l'objet racine :
  },
  allowedDevOrigins: ["192.168.1.150:3000", "192.168.1.150"],
};

export default nextConfig;