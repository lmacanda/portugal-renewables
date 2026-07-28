/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cnpgb.apambiente.pt",
      },
    ],
  },
};

module.exports = nextConfig;