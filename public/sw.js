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
    let t = {};
    const r = (e) => i(e, c),
      o = { module: { uri: c }, exports: t, require: r };
    s[c] = Promise.all(n.map((e) => o[e] || r(e))).then((e) => (a(...e), t));
  };
}
define(['./workbox-4754cb34'], function (e) {
  'use strict';
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        { url: '/_next/app-build-manifest.json', revision: '3d9332589005c28010b3506dbb7d3ebd' },
        {
          url: '/_next/static/WCKigKKeTVZ9Rn5kwVNk2/_buildManifest.js',
          revision: 'b98e19c30f4739f7ab94c1cafcc756dd',
        },
        {
          url: '/_next/static/WCKigKKeTVZ9Rn5kwVNk2/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        { url: '/_next/static/chunks/397-70e4abd09847ff02.js', revision: 'WCKigKKeTVZ9Rn5kwVNk2' },
        { url: '/_next/static/chunks/449-b80c3626bda7afc7.js', revision: 'WCKigKKeTVZ9Rn5kwVNk2' },
        { url: '/_next/static/chunks/538-6139c95092b7234b.js', revision: 'WCKigKKeTVZ9Rn5kwVNk2' },
        { url: '/_next/static/chunks/69-8ba2c75f91961bb3.js', revision: 'WCKigKKeTVZ9Rn5kwVNk2' },
        {
          url: '/_next/static/chunks/69b09407-18b093481be36608.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        { url: '/_next/static/chunks/703-537105fba40d1fd2.js', revision: 'WCKigKKeTVZ9Rn5kwVNk2' },
        { url: '/_next/static/chunks/792-1d83fc71a49e4786.js', revision: 'WCKigKKeTVZ9Rn5kwVNk2' },
        {
          url: '/_next/static/chunks/870fdd6f-bf227669973d45c8.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        {
          url: '/_next/static/chunks/app/_not-found-7030cd40acdaae4f.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        {
          url: '/_next/static/chunks/app/construction/page-c4068ebe61ccaa2f.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        {
          url: '/_next/static/chunks/app/entreprise/home/page-d21a7085fb710bee.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        {
          url: '/_next/static/chunks/app/entreprise/login/page-dc0e5ca72436a0c4.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        {
          url: '/_next/static/chunks/app/entreprise/offers/%5Bid%5D/candidatures/page-de44db5ea6c5eeed.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        {
          url: '/_next/static/chunks/app/entreprise/offers/%5Bid%5D/page-06bf16df5b083215.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        {
          url: '/_next/static/chunks/app/entreprise/offers/new/page-19fe7d21a28da6df.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        {
          url: '/_next/static/chunks/app/entreprise/offers/page-40ea63d9d19d70ab.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        {
          url: '/_next/static/chunks/app/entreprise/profile/%5Bid%5D/page-632e6d6cfbfe6d3b.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        {
          url: '/_next/static/chunks/app/entreprise/profile/edit/page-e1520affbfc6a939.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        {
          url: '/_next/static/chunks/app/entreprise/register/page-f953a8e72ebb1fe9.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        {
          url: '/_next/static/chunks/app/entreprise/stats/page-e6013ca465fd64e5.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        {
          url: '/_next/static/chunks/app/layout-f2462037eacc6d07.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        {
          url: '/_next/static/chunks/app/mentions-legales/page-a57758720cc18726.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        {
          url: '/_next/static/chunks/app/page-0c0ea13e61b91e75.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        {
          url: '/_next/static/chunks/app/test-image/%5Bid%5D/page-1d7ebc70621230bd.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        {
          url: '/_next/static/chunks/app/ugc/candidatures/page-cff78b630139320c.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        {
          url: '/_next/static/chunks/app/ugc/collaborations/completed/page-c4a945b89aba1e62.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        {
          url: '/_next/static/chunks/app/ugc/home/page-551127292a5d5d05.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        {
          url: '/_next/static/chunks/app/ugc/login/page-73a34da4c656ce9a.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        {
          url: '/_next/static/chunks/app/ugc/offer/%5Bid%5D/page-6736efd7c9c1ba28.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        {
          url: '/_next/static/chunks/app/ugc/offers/current/page-b82893b12be8c4b2.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        {
          url: '/_next/static/chunks/app/ugc/offers/page-035f6c1997d39c1d.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        {
          url: '/_next/static/chunks/app/ugc/profile/%5Bid%5D/page-3701af8ede2fd083.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        {
          url: '/_next/static/chunks/app/ugc/profile/edit/page-64fced97fa010b16.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        {
          url: '/_next/static/chunks/app/ugc/register/page-53842cb65a66e710.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        {
          url: '/_next/static/chunks/app/ugc/resources/page-0303c52150c410a7.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        {
          url: '/_next/static/chunks/fd9d1056-c184c5246ef850bc.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        {
          url: '/_next/static/chunks/framework-f66176bb897dc684.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        {
          url: '/_next/static/chunks/main-app-b6c8feab3ef6694f.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        { url: '/_next/static/chunks/main-be0623ee93b022fa.js', revision: 'WCKigKKeTVZ9Rn5kwVNk2' },
        {
          url: '/_next/static/chunks/pages/_app-75f6107b0260711c.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        {
          url: '/_next/static/chunks/pages/_error-3cb9820ce48c08b4.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        {
          url: '/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js',
          revision: '837c0df77fd5009c9e46d446188ecfd0',
        },
        {
          url: '/_next/static/chunks/webpack-47157b1f3be5b93c.js',
          revision: 'WCKigKKeTVZ9Rn5kwVNk2',
        },
        { url: '/_next/static/css/1d13aebdc03d7a71.css', revision: '1d13aebdc03d7a71' },
        { url: '/_next/static/css/2120f76ca4be52c7.css', revision: '2120f76ca4be52c7' },
        { url: '/_next/static/css/59996bdb2e04e5fb.css', revision: '59996bdb2e04e5fb' },
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
