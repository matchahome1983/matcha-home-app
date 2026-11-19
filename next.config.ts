import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'apcesaukgaennaqkepfo.supabase.co',
      },
    ],
  },
}

export default nextConfig