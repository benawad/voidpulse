/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  productionBrowserSourceMaps: true,
  output: "export",
};

export default nextConfig;
