/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "crack-be-ai-novanx-staging.up.railway.app",
        port: "",
        pathname: "/covers/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
