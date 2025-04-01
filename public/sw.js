if (!self.define) {
  let e,
    s = {};
  const i = (i, n) => (
    (i = new URL(i + '.js', n).href),
    s[i] ||
      new Promise((s) => {
        if ('document' in self) {
          const e = document.createElement('script');
          (e.src = i), (e.onload = s), document.head.appendChild(e);
        } else (e = i), importScripts(i), s();
      }).then(() => {
        let e = s[i];
        if (!e) throw new Error(`Module ${i} didn’t register its module`);
        return e;
      })
  );
  self.define = (n, a) => {
    const c = e || ('document' in self ? document.currentScript.src : '') || location.href;
    if (s[c]) return;
    let r = {};
    const t = (e) => i(e, c),
      u = { module: { uri: c }, exports: r, require: t };
    s[c] = Promise.all(n.map((e) => u[e] || t(e))).then((e) => (a(...e), r));
  };
}
define(['./workbox-4754cb34'], function (e) {
  'use strict';
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        { url: '/_next/app-build-manifest.json', revision: '46f0432d25890c234870f746e56ea7ea' },
        {
          url: '/_next/static/SObxpRr4uNLU_e0NEigSl/_buildManifest.js',
          revision: 'b98e19c30f4739f7ab94c1cafcc756dd',
        },
        {
          url: '/_next/static/SObxpRr4uNLU_e0NEigSl/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        { url: '/_next/static/chunks/301-6c8e4dfecd54ae9a.js', revision: 'SObxpRr4uNLU_e0NEigSl' },
        { url: '/_next/static/chunks/35-48d2689b058d4b9b.js', revision: 'SObxpRr4uNLU_e0NEigSl' },
        { url: '/_next/static/chunks/397-70e4abd09847ff02.js', revision: 'SObxpRr4uNLU_e0NEigSl' },
        { url: '/_next/static/chunks/449-b80c3626bda7afc7.js', revision: 'SObxpRr4uNLU_e0NEigSl' },
        { url: '/_next/static/chunks/538-6139c95092b7234b.js', revision: 'SObxpRr4uNLU_e0NEigSl' },
        { url: '/_next/static/chunks/69-8ba2c75f91961bb3.js', revision: 'SObxpRr4uNLU_e0NEigSl' },
        {
          url: '/_next/static/chunks/69b09407-18b093481be36608.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        { url: '/_next/static/chunks/703-537105fba40d1fd2.js', revision: 'SObxpRr4uNLU_e0NEigSl' },
        { url: '/_next/static/chunks/792-1d83fc71a49e4786.js', revision: 'SObxpRr4uNLU_e0NEigSl' },
        {
          url: '/_next/static/chunks/870fdd6f-bf227669973d45c8.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/app/_not-found-7030cd40acdaae4f.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/app/construction/page-76f6ce2da9244b72.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/app/entreprise/home/page-2cf0b8ede2556a28.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/app/entreprise/login/page-dc0e5ca72436a0c4.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/app/entreprise/offers/%5Bid%5D/candidatures/page-3fbd5b27de8deae3.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/app/entreprise/offers/%5Bid%5D/page-9694132235e2e513.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/app/entreprise/offers/new/page-0c5e4c1b8f063b06.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/app/entreprise/offers/page-a5e9c4c3e5781b11.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/app/entreprise/profile/%5Bid%5D/page-b6280c12d0f1a376.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/app/entreprise/profile/edit/page-c4877ff2f5d32638.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/app/entreprise/register/page-f953a8e72ebb1fe9.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/app/entreprise/stats/page-3851cc51b606fda1.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/app/layout-61003065b1cbe253.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/app/mentions-legales/page-bed16da8387c7a96.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/app/notifications/page-c8788912b176ab24.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/app/page-1c84f4dd66b5a2b8.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/app/test-image/%5Bid%5D/page-2f86ac65e85ecc76.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/app/ugc/candidatures/page-61eb33d2f3b5996c.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/app/ugc/collaborations/completed/page-9defd10c978ef48f.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/app/ugc/home/page-32023d54fbca7a82.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/app/ugc/login/page-73a34da4c656ce9a.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/app/ugc/offer/%5Bid%5D/page-d6a209ac4920bbe7.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/app/ugc/offers/current/page-d3bde66476a137df.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/app/ugc/offers/page-dfc1bb7319837742.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/app/ugc/profile/%5Bid%5D/page-a840c5adfc288e6a.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/app/ugc/profile/edit/page-4ba201436adaee2f.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/app/ugc/register/page-53842cb65a66e710.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/app/ugc/resources/page-b194c1aa82dfeed8.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/fd9d1056-c184c5246ef850bc.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/framework-f66176bb897dc684.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        { url: '/_next/static/chunks/main-4492e0630808a0f0.js', revision: 'SObxpRr4uNLU_e0NEigSl' },
        {
          url: '/_next/static/chunks/main-app-b6c8feab3ef6694f.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/pages/_app-75f6107b0260711c.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/pages/_error-3cb9820ce48c08b4.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        {
          url: '/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js',
          revision: '837c0df77fd5009c9e46d446188ecfd0',
        },
        {
          url: '/_next/static/chunks/webpack-9e8e9a8700185cb6.js',
          revision: 'SObxpRr4uNLU_e0NEigSl',
        },
        { url: '/_next/static/css/1d13aebdc03d7a71.css', revision: '1d13aebdc03d7a71' },
        { url: '/_next/static/css/59996bdb2e04e5fb.css', revision: '59996bdb2e04e5fb' },
        { url: '/_next/static/css/f79c36e6e59cce1e.css', revision: 'f79c36e6e59cce1e' },
        {
          url: '/_next/static/media/logo.8a76ed43.png',
          revision: 'bb8e5209725ac6336083513b17bb61c4',
        },
        { url: '/icons/favicon.ico', revision: '489d66ce600269b27154cc1f6c5993b8' },
        { url: '/icons/icon-16x16.png', revision: '9755fc37677e2f8f64e0e8893ecd8f4e' },
        { url: '/icons/icon-32x32.png', revision: '00ca5065f02a7b08ee2fa20986dc2467' },
        { url: '/icons/icon-96x96.png', revision: '6e643baf9c9552ec0c5041d3b989a35c' },
        { url: '/icons/maskable.png', revision: 'c6065b8b62d9608f822edf5a02f13e6a' },
        { url: '/img/astrid.png', revision: 'a86e18da366f7148a2aba988110fdb84' },
        { url: '/img/camille.jpg', revision: 'bdbb9ce5589e082d2739df700daee5c1' },
        { url: '/img/camille.png', revision: 'aab3ea5e7a2b48439308bd1a59e18888' },
        { url: '/img/campagnenoel.png', revision: '8956f8728383712612cfdc3c31527183' },
        { url: '/img/default-company.png', revision: '77fb12e5ed1c12b82f6e97c2cda9b48d' },
        { url: '/img/entreprise.jpg', revision: '547098dbd45f1e2aaebe0549503821fa' },
        { url: '/img/instagram.png', revision: '0b6b3c8d2c74fc2e0be8f5d940ec1e14' },
        { url: '/img/maud.png', revision: 'b8fcf2fd896919496bc081685ca1649f' },
        { url: '/img/noemie.jpg', revision: '7cc31cfaee7f9a54daebd57ff30cacd9' },
        { url: '/img/pinterest.png', revision: '2430c14438f0b8b93b43959d71ac48a4' },
        { url: '/img/restaurant0.png', revision: '77fb12e5ed1c12b82f6e97c2cda9b48d' },
        { url: '/img/restaurant1.png', revision: 'fd4e798b2d75833fe6ae57dcdf22cc9b' },
        { url: '/img/restaurant2.png', revision: 'a591bfbf1f835f705bc8c895134bc19f' },
        { url: '/img/restaurant3.png', revision: 'c16c06a9aac9d6d27b96f5f90da76f32' },
        { url: '/img/restaurant4.png', revision: '188ae5d12836b974db27a7407dd502c8' },
        { url: '/img/restaurant5.png', revision: '8a0bd051d7d618228e96f36cf4d8a04c' },
        { url: '/img/stats.jpg', revision: 'aa826ae96ecd80b14082f4debffaa0ce' },
        { url: '/img/tiktok.png', revision: 'c28071fcea9742f039d0ae44468caf22' },
        { url: '/img/ugc.jpg', revision: '8ca9e6838128816e49965c91884c0328' },
        { url: '/manifest.json', revision: 'f7052787baae4d91c94d07f712156442' },
        { url: '/next.svg', revision: '8e061864f388b47f33a1c3780831193e' },
        { url: '/vercel.svg', revision: '61c6b19abff40ea7acd577be818f3976' },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({ request: e, response: s, event: i, state: n }) =>
              s && 'opaqueredirect' === s.type
                ? new Response(s.body, { status: 200, statusText: 'OK', headers: s.headers })
                : s,
          },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: 'static-audio-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: 'static-video-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: 'static-data-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        const s = e.pathname;
        return !s.startsWith('/api/auth/') && !!s.startsWith('/api/');
      },
      new e.NetworkFirst({
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        return !e.pathname.startsWith('/api/');
      },
      new e.NetworkFirst({
        cacheName: 'others',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => !(self.origin === e.origin),
      new e.NetworkFirst({
        cacheName: 'cross-origin',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 })],
      }),
      'GET'
    );
});
