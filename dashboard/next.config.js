/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects: () => [
    {
      source: '/dashboard',
      destination: '/',
      permanent: false,
    },
  ],
}

module.exports = nextConfig
