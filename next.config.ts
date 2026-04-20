import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  // Mermaidはクライアントサイド専用のため、サーバーサイドでのバンドルから除外する
  serverExternalPackages: ['mermaid'],
};

export default nextConfig;
