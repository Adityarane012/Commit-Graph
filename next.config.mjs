/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    '/api/**/*': ['./public/data/**/*'],
  },
};

export default nextConfig;
