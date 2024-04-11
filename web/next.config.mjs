/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  productionBrowserSourceMaps: true,
  reactStrictMode: false,
};

export default nextConfig;
