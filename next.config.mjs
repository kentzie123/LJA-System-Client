/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // Keeps your local server CPU usage low
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
      },
      {
        protocol: 'http',
        hostname: '192.168.100.244',
        port: '5000',
      },
      {
        protocol: 'https', // Note: https!
        hostname: 'ljapowerlimitedcosystem.com', // Your live domain
        port: '', // Leave empty for standard https (port 443)
      },
    ],
  },
};

export default nextConfig;