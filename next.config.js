/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output standalone build for Docker
  output: 'standalone',
  
  webpack: (config) => {
    // Disable handling of node modules that shouldn't be processed
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    
    // Optimize PDF.js chunks
    config.module.rules.push({
      test: /pdf\.worker\.(min\.)?js/,
      type: 'asset/resource',
      generator: {
        filename: 'static/chunks/[name].[hash][ext]',
      },
    });
    
    return config;
  },
  // Add experimental configuration for Turbopack
  experimental: {
    turbo: {
      resolveAlias: {
        canvas: {},
        encoding: {}
      }
    }
  },
  // Optimize image and asset handling
  images: {
    minimumCacheTTL: 60,
  },
  // Increase the static generation timeout for large PDFs
  staticPageGenerationTimeout: 120,
  // Add headers to allow PDF files to be loaded properly
  async headers() {
    return [
      {
        source: '/pdfs/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
          {
            key: 'Content-Type',
            value: 'application/pdf',
          },
          {
            key: 'Accept-Ranges',
            value: 'bytes',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 