/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
});

const nextConfig = withPWA({
    reactStrictMode: false,
    images: {
        domains: ['images.unsplash.com'],
    },
});

module.exports = nextConfig;
