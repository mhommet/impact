/** @type {import('next').NextConfig} */
const runtimeCaching = require("next-pwa/cache");
const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    runtimeCaching
});

const nextConfig = {
    images: {
        domains: ['images.unsplash.com'],
    },
};

module.exports = withPWA({
    ...nextConfig,
});
