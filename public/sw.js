if (!self.define) {
  let e,
    s = {};
  const n = (n, c) => (
    (n = new URL(n + '.js', c).href),
    s[n] ||
      new Promise((s) => {
        if ('document' in self) {
          const e = document.createElement('script');
          (e.src = n), (e.onload = s), document.head.appendChild(e);
        } else (e = n), importScripts(n), s();
      }).then(() => {
        let e = s[n];
        if (!e) throw new Error(`Module ${n} didn’t register its module`);
        return e;
      })
  );
  self.define = (c, i) => {
    const a = e || ('document' in self ? document.currentScript.src : '') || location.href;
    if (s[a]) return;
    let t = {};
    const r = (e) => n(e, a),
      u = { module: { uri: a }, exports: t, require: r };
    s[a] = Promise.all(c.map((e) => u[e] || r(e))).then((e) => (i(...e), t));
  };
}
define(['./workbox-4754cb34'], function (e) {
  'use strict';
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        { url: '/_next/app-build-manifest.json', revision: '848e878fb729c71c81671f5d069564cb' },
        {
          url: '/_next/static/98n8UtW95373KzYx9cuJ5/_buildManifest.js',
          revision: 'b98e19c30f4739f7ab94c1cafcc756dd',
        },
        {
          url: '/_next/static/98n8UtW95373KzYx9cuJ5/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        { url: '/_next/static/chunks/214-fca7d19b60a7370f.js', revision: '98n8UtW95373KzYx9cuJ5' },
        { url: '/_next/static/chunks/449-b80c3626bda7afc7.js', revision: '98n8UtW95373KzYx9cuJ5' },
        { url: '/_next/static/chunks/538-6139c95092b7234b.js', revision: '98n8UtW95373KzYx9cuJ5' },
        { url: '/_next/static/chunks/69-8ba2c75f91961bb3.js', revision: '98n8UtW95373KzYx9cuJ5' },
        {
          url: '/_next/static/chunks/69b09407-18b093481be36608.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        { url: '/_next/static/chunks/792-1d83fc71a49e4786.js', revision: '98n8UtW95373KzYx9cuJ5' },
        {
          url: '/_next/static/chunks/870fdd6f-5d4abe0b4f022631.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        {
          url: '/_next/static/chunks/app/_not-found-7030cd40acdaae4f.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        {
          url: '/_next/static/chunks/app/construction/page-fed4dd388b1c6ecc.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        {
          url: '/_next/static/chunks/app/entreprise/home/page-240048ae5efd3c9e.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        {
          url: '/_next/static/chunks/app/entreprise/login/page-dc0e5ca72436a0c4.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        {
          url: '/_next/static/chunks/app/entreprise/offers/%5Bid%5D/candidatures/page-f44927bad6b323ea.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        {
          url: '/_next/static/chunks/app/entreprise/offers/%5Bid%5D/page-df4c40f8b84c4254.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        {
          url: '/_next/static/chunks/app/entreprise/offers/new/page-1daab25d56380021.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        {
          url: '/_next/static/chunks/app/entreprise/offers/page-68c0a4baaaf146e8.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        {
          url: '/_next/static/chunks/app/entreprise/profile/%5Bid%5D/page-91353f640749b839.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        {
          url: '/_next/static/chunks/app/entreprise/profile/edit/page-6ac9641c4a8b9d0f.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        {
          url: '/_next/static/chunks/app/entreprise/register/page-f953a8e72ebb1fe9.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        {
          url: '/_next/static/chunks/app/entreprise/stats/page-c4f6b752811db055.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        {
          url: '/_next/static/chunks/app/layout-56896fde635b926f.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        {
          url: '/_next/static/chunks/app/mentions-legales/page-c3c9f9857d850488.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        {
          url: '/_next/static/chunks/app/page-6ed20a6aed4c1916.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        {
          url: '/_next/static/chunks/app/ugc/candidatures/page-6b40147b0b1e06b5.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        {
          url: '/_next/static/chunks/app/ugc/collaborations/completed/page-16909c566fd8a3ae.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        {
          url: '/_next/static/chunks/app/ugc/home/page-78acc4708efaf499.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        {
          url: '/_next/static/chunks/app/ugc/login/page-73a34da4c656ce9a.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        {
          url: '/_next/static/chunks/app/ugc/offer/%5Bid%5D/page-8c79dcf67355ecaf.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        {
          url: '/_next/static/chunks/app/ugc/offers/page-c0016b2f0d69000e.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        {
          url: '/_next/static/chunks/app/ugc/profile/%5Bid%5D/page-2f3e0338794b4b4f.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        {
          url: '/_next/static/chunks/app/ugc/profile/edit/page-da2506001824ead7.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        {
          url: '/_next/static/chunks/app/ugc/register/page-53842cb65a66e710.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        {
          url: '/_next/static/chunks/app/ugc/resources/page-3b6d301e10b8d0b3.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        {
          url: '/_next/static/chunks/fd9d1056-c184c5246ef850bc.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        {
          url: '/_next/static/chunks/framework-f66176bb897dc684.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        { url: '/_next/static/chunks/main-0ee927dd19426709.js', revision: '98n8UtW95373KzYx9cuJ5' },
        {
          url: '/_next/static/chunks/main-app-b6c8feab3ef6694f.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        {
          url: '/_next/static/chunks/pages/_app-75f6107b0260711c.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        {
          url: '/_next/static/chunks/pages/_error-3cb9820ce48c08b4.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        {
          url: '/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js',
          revision: '837c0df77fd5009c9e46d446188ecfd0',
        },
        {
          url: '/_next/static/chunks/webpack-2d5961f5ceb71754.js',
          revision: '98n8UtW95373KzYx9cuJ5',
        },
        { url: '/_next/static/css/1d13aebdc03d7a71.css', revision: '1d13aebdc03d7a71' },
        { url: '/_next/static/css/59996bdb2e04e5fb.css', revision: '59996bdb2e04e5fb' },
        { url: '/_next/static/css/8ea1bf87553c3721.css', revision: '8ea1bf87553c3721' },
        { url: '/_next/static/css/cd7b7834ea1bea71.css', revision: 'cd7b7834ea1bea71' },
        {
          url: '/_next/static/media/26a46d62cd723877-s.woff2',
          revision: 'befd9c0fdfa3d8a645d5f95717ed6420',
        },
        {
          url: '/_next/static/media/55c55f0601d81cf3-s.woff2',
          revision: '43828e14271c77b87e3ed582dbff9f74',
        },
        {
          url: '/_next/static/media/581909926a08bbc8-s.woff2',
          revision: 'f0b86e7c24f455280b8df606b89af891',
        },
        {
          url: '/_next/static/media/6d93bde91c0c2823-s.woff2',
          revision: '621a07228c8ccbfd647918f1021b4868',
        },
        {
          url: '/_next/static/media/97e0cb1ae144a2a9-s.woff2',
          revision: 'e360c61c5bd8d90639fd4503c829c2dc',
        },
        {
          url: '/_next/static/media/a34f9d1faa5f3315-s.p.woff2',
          revision: 'd4fe31e6a2aebc06b8d6e558c9141119',
        },
        {
          url: '/_next/static/media/df0a9ae256c0569c-s.woff2',
          revision: 'd54db44de5ccb18886ece2fda72bdfe0',
        },
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
            cacheWillUpdate: async ({ request: e, response: s, event: n, state: c }) =>
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
