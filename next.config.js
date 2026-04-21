/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/webp", "image/avif"],
    unoptimized: process.env.NODE_ENV === "development",
  },
  serverExternalPackages: [],
};

export default nextConfig;
