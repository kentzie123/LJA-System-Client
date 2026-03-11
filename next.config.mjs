/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ljapowerlimitedcosystem.com', 
        port: '', 
      },
    ],
  },
};

export default nextConfig;