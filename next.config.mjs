/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporarily disable TypeScript errors during build
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Explicitly define environment variables to be made available at build time
  env: {
    NEXT_PUBLIC_AGENT_ID: process.env.NEXT_PUBLIC_AGENT_ID,
    NEXT_PUBLIC_ELEVENLABS_API_KEY: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
    NEXT_PUBLIC_ELEVENLABS_API_URL: process.env.NEXT_PUBLIC_ELEVENLABS_API_URL || 'https://api.elevenlabs.io',
  },
  // Ensure public environment variables are properly exposed
  publicRuntimeConfig: {
    NEXT_PUBLIC_AGENT_ID: process.env.NEXT_PUBLIC_AGENT_ID,
    NEXT_PUBLIC_ELEVENLABS_API_KEY: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
    NEXT_PUBLIC_ELEVENLABS_API_URL: process.env.NEXT_PUBLIC_ELEVENLABS_API_URL || 'https://api.elevenlabs.io',
  },
};

export default nextConfig;
