if (!self.define) {
  let e,
    s = {};
  const i = (i, n) => (
    (i = new URL(i + '.js', n).href),
    s[i] ||
      new Promise((s) => {
        if ('document' in self) {
          const e = document.createElement('script');
          ((e.src = i), (e.onload = s), document.head.appendChild(e));
        } else ((e = i), importScripts(i), s());
      }).then(() => {
        let e = s[i];
        if (!e) throw new Error(`Module ${i} didn’t register its module`);
        return e;
      })
  );
  self.define = (n, a) => {
    const t =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href;
    if (s[t]) return;
    let c = {};
    const r = (e) => i(e, t),
      u = { module: { uri: t }, exports: c, require: r };
    s[t] = Promise.all(n.map((e) => u[e] || r(e))).then((e) => (a(...e), c));
  };
}
define(['./workbox-00a24876'], function (e) {
  'use strict';
  (importScripts('fallback-eyGhUvhLERmLl-KLuUGSs.js'),
    self.addEventListener('message', (e) => {
      e.data && 'SKIP_WAITING' === e.data.type && self.skipWaiting();
    }),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: '/Attendance_Template.xlsx',
          revision: 'db5385179e74942d071a45ea264253b8',
        },
        {
          url: '/Background.png',
          revision: '545132783f3946cf982246b8ab66716b',
        },
        { url: '/Uploading.png', revision: '6d146f1e502895fc44f2587b1d0f975c' },
        {
          url: '/_next/app-build-manifest.json',
          revision: 'fc7f0f23c83d9cf55a3b3e4c850c10aa',
        },
        {
          url: '/_next/static/chunks/0e762574-f41e02d330293e8f.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/1080-b5d45dc2e50f4a96.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/1084-2f64a09204864b48.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/1107-c727cd974b90eca6.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/1122-5a9ac5019eeaa3a6.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/11390db7-3039854f365bab9a.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/1261-7c07b2eaeafe36a0.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/1338-d7108f5118a00bc0.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/135.94cde4773e8a4989.js',
          revision: '94cde4773e8a4989',
        },
        {
          url: '/_next/static/chunks/1424-992cf6b2e01072d9.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/1453-386f5702d6296d3a.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/1464-8f0e4ddf5b5e4771.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/1494-eb9d7249ea581a37.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/152-4654c4751a375216.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/164f4fb6-a4176ac3c168486b.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/1684-978636b803ccef4a.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/169-fe203e3a07c45a09.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/1721-ff29746ad61425eb.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/1838.20f56d2166206178.js',
          revision: '20f56d2166206178',
        },
        {
          url: '/_next/static/chunks/1901-c798943acbd372f1.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/1909-70b503c32aadb2cc.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/1937-4b1855779ced76f8.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/1962-8d82810b69079f13.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/2123-096e51051a7bac56.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/2129-387976310b8dbb2d.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/2300-52fc8d4d1798e137.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/2377-092a2f7136165a3a.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/2437-a7549a40faaa759a.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/2459-6b6976133c9ae8d2.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/2472-06736165cfa5bba9.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/2490-98952e9759e216c4.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/2499-974aeaa781bc16c8.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/2526-e3b65e553f87a70b.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/2539-63ea3c3e86520953.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/2550-b53bcb3c0aa62a70.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/256-3ec7caa236411b86.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/2625-b4cf9a3b47932b0c.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/2630-07c7ba85c8a53135.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/2649-2537bfbd241d735e.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/2693-3aa83eb74054971a.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/2730-87b6b751c57789ab.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/2789-b9b2241a4444190a.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/2798-737ea95b21736991.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/2810-1d846f61583d970e.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/2840-80caae978cdcf4db.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/2854-ee72ef8e51e6ef9c.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/2879-05150dc71591359e.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/2951-f119d8e2f666cb79.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/2990-3e0a0d42145c72b8.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/3054-64185471a2186989.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/3076-95f00308efa6fd1d.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/30a37ab2-a460757850b45c64.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/3122-139722234464c644.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/3190-5f7e66cad5f1f776.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/3448-9e7058702e4ae00b.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/3484-31f692cb1f3f40f6.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/3538-c3cd5d21d2f320bc.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/3607-1c5b284525db0c34.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/3717-ac07602ed8be45cb.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/3742-74a5180b4a8e0535.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/3788-0bd9fb6e44e38563.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/3789-8456abb5463ad03b.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/3829-e2e2e5201b8dfb95.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/385cb88d-551da5ab57360a6e.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/3867-17c16fe36366c4c1.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/3870-26959862d85d3dd0.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/3884-340a76fa2167133b.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/3896-83c3f40c7924ab3b.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/3923-082db330421ad8d0.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/3986-297ad02de9cab3e6.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/3d47b92a-2223e9f4e3874a9b.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/4066-f8d3aa2457825c3c.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/4163-8479bfef91317746.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/4183-a5953e7f3c747d0a.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/4230-53635c3579809432.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/438-344dca8be92d2f91.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/4525-b08348d983611e5a.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/4545-496bb060ad1a8bc3.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/4616-a107cb3c4e05b146.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/462095b7-a435d8e876f42bc8.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/4624-d5b4909807a1f662.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/4646-23c3dc162797d745.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/4729-3cf14882cf1f19ec.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/4749-134bcb4764d119c8.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/4786-0439848d42fb33d5.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/479ba886-fa4f521d8021366a.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/4807-8bc03bc7ffabd95c.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/4818-fa58aed425e3e460.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/4850-7c0a3925c2d1eadc.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/4854-770eb222e5d11ff4.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/486-aa414b1f87ef0701.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/4873-d34a30a91f2adfdf.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/4876-7acacfc8e313c74f.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/495-d210eb8a4721976e.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/4977-1eb3f0bc3dd8b883.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/4979-3c039268bced431e.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/5-abb787a001e68e38.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/5066-32b66908d2df6b6d.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/5196-e723af85d5f70d72.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/5295-4ed0bb71788d7db5.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/52ab8b6c-cab1d6bac8bb745b.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/5345-fd429f21262d4afe.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/5366-3e36e0373b030e1f.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/53c13509-ac5efc0264558f44.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/5406-2eb3462a40efda8f.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/5457-4d94c8230415f473.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/54a60aa6-e47e3bfc808452bd.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/5507-b1721782372d6c67.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/5569-07765966704967b4.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/56-f24fa77982c5e006.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/5637-2b9230291ba60fb9.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/5656-4920283ebad08bc2.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/5726-ab1c6dd91247e95f.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/5738-7e5d7f37d2af27a5.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/5779-1766180ba4a3af48.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/5783-2833cea185c6d102.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/5785-3ec6b8b24c7df5b0.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/578c2090-fb35812c82abe289.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/5836-3a37877dac23c707.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/5913-c1e2f445ac27940a.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/59650de3-53e6059f01606fe1.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/5e22fd23-f8d7602ebeca6f1d.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/6006-5af34e41fdf621bd.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/6098-006514ac8adde89e.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/6141-545286c693d5f21f.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/6151-53c285bbee4056ac.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/6186-c6095255fa82d74d.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/6255-154cf735c8415c25.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/6317-f78dc27d6ceea5f5.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/6326-b26fb4feea5effb9.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/6353-4739ad3a4f55269a.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/6469-dd9d4d2be07ff1d6.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/6474-48775baa451e81f0.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/6512-9e6e90f3f1050e34.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/6539-e33d778aefa8d0b8.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/6567-e8f25dd7aaddf848.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/6583-44eed8c916be3d73.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/6697-bd5cb214d0851750.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/66ec4792-cd23fa2e2c460383.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/6700-5aa5b06a001025da.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/6703-ec80c0af6b54434d.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/6716-b3c41837bc5f54b8.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/6750-02feb51f6c5b62c0.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/6817-10395d22da96a510.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/6827-dce95cf00f2e564a.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/6926-4bb9a411cb326a83.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/6977-7b3641f1a7b10d22.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/69806262-346e49452de380e4.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/6996-a1121869b6a860e5.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/6edf0643-3339f6c96a12fdde.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/7023-3a850748796d1c32.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/7029-2916ef93595c5b6d.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/7064611b-4506a439cc3ebeed.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/7088.c8abebd0266ef78c.js',
          revision: 'c8abebd0266ef78c',
        },
        {
          url: '/_next/static/chunks/70e0d97a-92de8b1495483d75.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/711-71cc7b2415882d2b.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/7138-5b62d0c76b2ce562.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/7160-30d1b5435552b5a0.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/718-098de6364f4f4596.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/7182-99d9f534e1b82e33.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/7243-96031385de108344.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/7269-8d199b7373d572b3.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/7274-63e1c4f74d1676c3.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/7342-a16b03a9ebaae885.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/7361-f3d94bdfa806e0bc.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/7365-77bfed07c1db3cff.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/7389-f01170ca3a440a61.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/7436-8317ccbedcb68450.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/7460-899b3d0259d7c11e.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/7523-813c7c2a384907b6.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/7631-3920b5c8384646b3.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/7701-af579757ed02b82d.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/7790-036602a312bfe27f.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/7851-63e4f57ad336c478.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/7887-5d1e481ab8cc3a09.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/7939-f46b111adb014059.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/7946-7f5675e931352b03.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/795d4814-e4c61ef2014069ff.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/7991-d6a3c770cdc50462.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/816-442e7ce6405f3921.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/8202-69765f7104431667.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/8256-cbb5ffa4840bcab5.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/8295-9459a39a595d75cc.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/8329-fb2cb2db57612d9c.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/8354-4fda247e0e1e7f33.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/8357-091e6293047401e4.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/8375-50ca8eb853cbbfbc.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/8406-41495c620b34377c.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/8415-eb0afdd8fa1f6480.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/8436.acfc52fd47e83fa1.js',
          revision: 'acfc52fd47e83fa1',
        },
        {
          url: '/_next/static/chunks/8441-523ff4a56ffb5ff0.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/8442-29a3875fccfb48a7.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/8456-d4644aa29c8bce64.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/8556-d24451333e9e6c73.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/858-c2c8c2661afcabf2.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/8582-4e13e89bbe1d6efa.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/8593-aa1484667af85603.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/8663-9fbdcdeebd060eb3.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/8666-444b80f633b6b7c2.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/8779-e0b65a1c3459a907.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/880-c49348bf313f33d2.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/8836-291458eba48ac32a.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/8874-d8c2718cb394556a.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/892-33c40c6e2c250896.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/8929-0026a07c65088633.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/8950-e71513febd9cb9ef.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/8962-452b51c20c711203.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/8e1d74a4-10399304fba36496.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/902-9309737002ac086d.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/9025-2fb4000bd13bde0a.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/904-8634ab6e1c0d395b.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/9143-f3e88ec7d04882e1.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/9198-c8deaaa13a4df520.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/922-c2eea56585075128.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/9257-3eae50947ac25f89.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/9319-dceee4d7b2d5851b.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/9395-4612e15cc493d1b7.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/9461-951067456f0310ad.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/9464-f93c0ea155e2e391.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/94730671-b4487d1e3f624427.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/9491-3729e1813a7861e3.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/951-992b4c8ab8650e93.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/9512-dd846b1522cb9167.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/9564-2c7edcc4a08ec2c9.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/9677-24a07d988250e710.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/9788-c3ca6081c9870555.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/9790-68a3c15722539334.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/9795-4e1a44648f9383ca.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/9802-12eec58184b2b58f.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/9816-178d8839f427aa63.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/9973-e9b60f69482fa7c9.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/9974-3edafd0f88fbf67d.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/9c4e2130-430144973dd74575.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/ad2866b8-b2aba5370a0d21e8.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/%5Bid%5D/page-1ce9958c2360f261.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/allAllowance/page-454d116e4957f89c.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/layout-ff9cb24196f1dff5.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/page-97b55a35be7c4723.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/%5Bid%5D/page-7fe66032f0a84718.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/layout-70703387cca5ff35.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/page-612edd0b011c0513.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/variablePay/page-89b7b3740aa4c96f.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/allowanceType/page-71a4f3886d83546f.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/benefitType/page-c342cd4d517dcd41.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/deductionType/page-56ea3a5d16ad28c1.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/layout-652fd7393d964f91.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/page-82b8ed9973946f6d.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/%5Bid%5D/page-d737ad82d6fa4338.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/allDeduction/page-62f395c7b078a167.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/layout-29fa82043ae1da65.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/page-857142973a951ab8.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/departmentRequest/page-58d005866168b737.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/manage-employees/%5Bid%5D/page-8930ad4ec6095a49.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/manage-employees/page-f60473193e86edb7.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/notification/page-23d7780a6e247182.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/approvals/page-ede8824fa2d4d10d.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/employementType/page-c8127755fd6c7aed.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/layout-9fdf618c60e714a8.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/page-7238ac97dac6777d.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/positions/page-e76d96428ec163c3.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/rolePermission/page-d6124f3611a4c63b.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/action-plan/page-ea41577d364f7440.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/categories/%5Bid%5D/page-bed1c98f01a6f7af.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/categories/%5Bid%5D/survey/%5Bslug%5D/page-8e896c35402e6de5.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/categories/page-1f07479dd412ee25.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/%5Bid%5D/%5Bslug%5D/meetings/page-d34f2f5cf7691768.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/%5Bid%5D/%5Bslug%5D/page-477fead6cf836242.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/%5Bid%5D/page-1e285caae70999e2.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/page-ecbf1190de2482b7.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/feedback/page-f8c5e7f835a0cd79.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/meeting/%5Bid%5D/page-16e7b790d75111cb.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/meeting/page-8f0b9c29325a8106.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/recognition/%5Bid%5D/page-d4b32dadf40dad10.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/recognition/page-ddd858ca352e3497.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/define-feedback/page-272f99361d7b3e7d.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/define-meeting-type/page-4f95b3e4917c8cb3.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/define-questions/page-aed68ff40919b39a.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/layout-68513c8b28f30021.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/page-e2324711556fda39.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/recognition/page-43c38ddc0c192480.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/target-achievement/page-60c304845306a1b5.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/compensation/all/page-2af47a2c53e890c8.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/detail/%5BdataId%5D/page-771ec4392ac1e847.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/page-2dec853b88b7c128.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/payroll-detail/%5Bid%5D/page-8ca709a8dff5925e.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/%5Bid%5D/page-3725bc9617b43844.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/defaultIncentiveCard/page-de83b708af892eb9.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/layout-b6737542aa795daa.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/page-6b942082e98fdb92.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/variable-pay/page-c736b93337ba143c.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/page-ba1839721e134109.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/reprimand-appreciation/appreciation/%5Bid%5D/page-6d6567bca93a082e.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/reprimand-appreciation/page-9c90f4cdc96add6d.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/reprimand-appreciation/reprimand/%5Bid%5D/page-979960ac7965d26f.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/dashboard/%5BemployeeId%5D/page-6c11e9ba4d4eb393.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/dashboard/page-ebb6ffcb43237fdc.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/page-c071bf1cc997be92.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/check-in-rule/page-2e781f59cf91f197.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/criteria-management/page-33f0f630b961bacb.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/define-appreciation/page-0fbef6eeb3645a5c.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/define-okr-rule/page-942559e52c363d05.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/define-reprimand/page-4ab5fcebad569f9c.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/edit-access/page-f457fa8e46e08a62.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/layout-5360b297619101bc.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/okr-setting-menu/page-3b927642ef07bd66.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/okr-type/page-e1244a8c70dce5e4.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/page-9c1454a8b5b40872.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/planning-assignation/page-4defb6164915cbdd.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/planning-period/page-96e2e3861759e046.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/target-assignment/page-db615537f8127da5.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(onboarding)/onboarding/page-687fc6e7675bd8b3.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/layout-7c606732ad62063b.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/org-chart/page-b76b7a15bdfeb39e.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/org-structure/page-0793118022dc396d.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/page-55f00331b15ec0b6.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/branches/page-ac41afcd218580c8.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/fiscalYear/fiscalYearCard/page-63acf0e3b4c3323e.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/layout-67ed981fe1d71504.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/page-12f888726933b8d5.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/workSchedule/page-959b00e68e257916.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/employee-information/%5Bid%5D/page-e5febd8097b55422.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/employee-information/page-80c46d5c79c94f67.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/myPayroll/page-d07948ada4c44475.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/payroll/page-99e542d787f9dcff.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/payroll/reconcilation/page-3cfb5dd0bab93146.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/approvals/page-7b9d7b1ba0ec32c3.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/banks/page-8588009909f17ebf.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/layout-953fa183172e30b0.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/page-8e559ef8b67edfda.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/pay-period/page-ff0c44323a834c4d.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/pension/page-76f545fc3c340c6f.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/tax-rule/page-078ae12ff39c626a.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(planningAndReporting)/planning-and-reporting/page-762c64f191786d55.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/ai-job-matching/%5BjobId%5D/page-71c2a8084163965d.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/ai-job-matching/page-90de8334173db002.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/candidate/page-812fa1c9e41c447e.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/dashboard/page-a0ed2636a787cdb8.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/hrflow.ai/candidate/%5Bid%5D/page-66a38131690a03d0.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/hrflow.ai/page-d787f0cce621a469.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/jobs/%5Bid%5D/page-ae0406744dd01e56.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/jobs/page-e3bc796b6d7e38e1.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/customFields/page-92e71b7edb2990d3.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/layout-aadb487690d558bc.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/page-66953d3048085c7b.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/status/page-f1ad73ef6a56972f.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/talentPoolCategory/talentPoolCategoryTab/page-da574920df8b7252.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/intern/%5Bid%5D/page-39a905cb5fe34284.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/intern/page-005d95cf2022e7fb.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/page-5d5232bec91cb832.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/talent-pool/page-d9e3416a74058e13.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/talent-roaster/%5Bid%5D/page-fb196ab7bd36f0d1.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/talent-roaster/page-0e32eee832e2ab48.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/dashboard/page-b123ae137c260f08.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/employee-attendance/page-943fb30553b67020.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/layout-3b3ee883b1f8ca25.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/leave-balance/page-a2f51f2f613c7dfb.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/leaves/page-29c755e5274080d7.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/page-f086a6ef9d5d7dff.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/my-timesheet/page-7c5f5efac9377da3.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/accrual-rule/page-e7cdd53627b30423.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/allowed-areas/page-e23bcb912c404a21.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/approvals/page-7c8d526ff255542e.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/approvals/workFlow/approvalSetting/page-571e5681d3a0aa66.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/approvals/workFlow/page-bce4597ef06c28b6.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/attendance-rules/page-3ba65a73a90099ff.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/break-type/page-9592ebc87cda3a30.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/carry-over-rule/page-0f5b2cd27e82d5a5.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/closed-date/page-6aefe6d48adc198a.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/imported-logs/page-d76a64e654f3e38b.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/layout-f0046a3258dd0a3e.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/leave-types-and-policies/page-e0e6a7f990afeeb6.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/page-f7e2b3cce7da022d.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/time-zone/page-2fc772cb060f390d.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/zkt-addon/page-191e1178ce150461.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/%5Bid%5D/%5BlessonId%5D/%5BmaterialId%5D/page-1f1e4cba32a840ec.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/%5Bid%5D/layout-b424b9d91e12e85a.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/%5Bid%5D/page-3ad806aa602858ad.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/page-18658945f4e4e3f7.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/my-training/%5Bid%5D/page-6386591f9783808d.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/my-training/page-c458f8723bbd3fc8.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/review/%5Bid%5D/page-a03a8d9445dd46b6.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/review/page-ff910902cfdc5964.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/approvals/page-11c10fefb12807c7.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/approvals/workFlow/approvalSetting/page-478f2cdf3de5003b.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/approvals/workFlow/page-706f7be3c5637805.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/commitment-rule/page-ccc96ec63e176f30.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/course-category/page-57839afa30832a9e.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/layout-5fec42793a156023.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/tna-category/page-b649c70e588554a8.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(weeklyPriority)/weekly-priority/page-911b56975531730d.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/billing/page-d72e99743515c782.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/dashboard/page-7f38b9ad64a551d8.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/invoice/%5Bid%5D/page-fbe2812fa3e9daff.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/plan/page-d54e6fe3dcdf3360.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/profile/page-749c6d3c2fbfb6cb.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/audit-log/%5Bid%5D/page-2d2ec2d2317b8fcf.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/audit-log/page-8a318a75eef80e6b.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/dashboard/page-ce0a90b0715fe543.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/dashboard/vp/page-27bd0759a3cf255a.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(beforeLogin)/authentication/forget-password/page-c4cb0d08c06dd8a6.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(beforeLogin)/authentication/login/page-1b37851fb5cae3b3.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(beforeLogin)/authentication/new-password/page-8b28b7473737e0b5.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(beforeLogin)/authentication/reset-password/page-44bbb42ca7df5d62.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(publicForms)/job/%5BtenantId%5D/%5BjobId%5D/page-187bcc99748020d2.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(publicForms)/job/openPositions/%5Bid%5D/page-658c479ece9f383a.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(publicForms)/job/openPositions/page-7168c27ab1ed94cc.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/(publicForms)/surveys/%5Bid%5D/page-1e0b220c2e77954d.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-89110f115e3059ee.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/layout-d0763196f175c489.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/loading-77c3e0c518dffcf9.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/not-found-e2a2c83ed790f5f8.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/offline/page-e64b4358ad68894b.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/app/page-964bb518e4c261e8.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/b2d98e07-1948317d489cbde4.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/b563f954-d3ca46153dc3fcb3.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/bc98253f.aa27182464c58412.js',
          revision: 'aa27182464c58412',
        },
        {
          url: '/_next/static/chunks/c916193b-01e71ab4a1fb4de6.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/ca377847-cc336e09288b791f.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/cff4c5fa.d1c1c32a597e5fd6.js',
          revision: 'd1c1c32a597e5fd6',
        },
        {
          url: '/_next/static/chunks/d0deef33.a258e96be4bdf431.js',
          revision: 'a258e96be4bdf431',
        },
        {
          url: '/_next/static/chunks/e34aaff9-945b3be1a64d7f3c.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/ee560e2c-0ee6c59746153548.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/eec3d76d-327495402e145a9c.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/f25cdb8d-0a4b9d1ee45595fe.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/f8025e75-783dee58e0a777d2.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/f97e080b-0b62b1ada87ac2ee.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/fd9d1056-f067ed350b7d4b38.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/ff804112-19c01e31cf8a2d42.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/framework-56dfd39ab9a08705.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/main-6bc5cf961353e384.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/main-app-617d369b09134a95.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/pages/_app-f870474a17b7f2fd.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/pages/_error-c66a4e8afc46f17b.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/chunks/polyfills-78c92fac7aa8fdd8.js',
          revision: '79330112775102f91e1010318bae2bd3',
        },
        {
          url: '/_next/static/chunks/reactPlayerDailyMotion.2d2a96cf93df6928.js',
          revision: '2d2a96cf93df6928',
        },
        {
          url: '/_next/static/chunks/reactPlayerFacebook.5e29a6aa92480d07.js',
          revision: '5e29a6aa92480d07',
        },
        {
          url: '/_next/static/chunks/reactPlayerFilePlayer.7a88508ebfe931ba.js',
          revision: '7a88508ebfe931ba',
        },
        {
          url: '/_next/static/chunks/reactPlayerKaltura.d541e7ebd0134de6.js',
          revision: 'd541e7ebd0134de6',
        },
        {
          url: '/_next/static/chunks/reactPlayerMixcloud.00a4690fd21954f6.js',
          revision: '00a4690fd21954f6',
        },
        {
          url: '/_next/static/chunks/reactPlayerMux.56c6576e9c4cc183.js',
          revision: '56c6576e9c4cc183',
        },
        {
          url: '/_next/static/chunks/reactPlayerPreview.bf92c2d478ff3c8c.js',
          revision: 'bf92c2d478ff3c8c',
        },
        {
          url: '/_next/static/chunks/reactPlayerSoundCloud.fa4e8bd9418388db.js',
          revision: 'fa4e8bd9418388db',
        },
        {
          url: '/_next/static/chunks/reactPlayerStreamable.68f702377b023f54.js',
          revision: '68f702377b023f54',
        },
        {
          url: '/_next/static/chunks/reactPlayerTwitch.2b13d1904c1efe94.js',
          revision: '2b13d1904c1efe94',
        },
        {
          url: '/_next/static/chunks/reactPlayerVidyard.e7ba3a906618af5f.js',
          revision: 'e7ba3a906618af5f',
        },
        {
          url: '/_next/static/chunks/reactPlayerVimeo.b6fbb3210792e76a.js',
          revision: 'b6fbb3210792e76a',
        },
        {
          url: '/_next/static/chunks/reactPlayerWistia.5a2d6fc3f2f652be.js',
          revision: '5a2d6fc3f2f652be',
        },
        {
          url: '/_next/static/chunks/reactPlayerYouTube.1e56c8eba27369d5.js',
          revision: '1e56c8eba27369d5',
        },
        {
          url: '/_next/static/chunks/webpack-7ceaccfadc2b3472.js',
          revision: 'eyGhUvhLERmLl-KLuUGSs',
        },
        {
          url: '/_next/static/css/4d3d9169b46fed63.css',
          revision: '4d3d9169b46fed63',
        },
        {
          url: '/_next/static/css/6acf85b5e82f06c0.css',
          revision: '6acf85b5e82f06c0',
        },
        {
          url: '/_next/static/css/857aa62baa17c894.css',
          revision: '857aa62baa17c894',
        },
        {
          url: '/_next/static/css/8b54669db085020c.css',
          revision: '8b54669db085020c',
        },
        {
          url: '/_next/static/css/a8c7d01d323e33e3.css',
          revision: 'a8c7d01d323e33e3',
        },
        {
          url: '/_next/static/css/bd1adb41bd30e2a7.css',
          revision: 'bd1adb41bd30e2a7',
        },
        {
          url: '/_next/static/css/c621e2cfc90a1bf9.css',
          revision: 'c621e2cfc90a1bf9',
        },
        {
          url: '/_next/static/eyGhUvhLERmLl-KLuUGSs/_buildManifest.js',
          revision: '3e2d62a10f4d6bf0b92e14aecf7836f4',
        },
        {
          url: '/_next/static/eyGhUvhLERmLl-KLuUGSs/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        {
          url: '/_next/static/media/438aa629764e75f3-s.woff2',
          revision: '28f2a82ccec846f227a8208eb1ca0e01',
        },
        {
          url: '/_next/static/media/4c9affa5bc8f420e-s.p.woff2',
          revision: '101877a7a906c31436104fe33740ae44',
        },
        {
          url: '/_next/static/media/51251f8b9793cdb3-s.woff2',
          revision: '75ae12b7d0d290534626028cad12724a',
        },
        {
          url: '/_next/static/media/875ae681bfde4580-s.woff2',
          revision: '8fc0aa17e1291e522dc51c63869b051a',
        },
        {
          url: '/_next/static/media/Button.b30635aa.svg',
          revision: 'da23e3b029d7db9ae24f6c2b84aebfaf',
        },
        {
          url: '/_next/static/media/ZKTeco.e0e747d5.png',
          revision: 'b2515f4fd0f0c2f87ee281daeff61089',
        },
        {
          url: '/_next/static/media/cc978ac5ee68c2b6-s.woff2',
          revision: '623714ac1d9949c8891464126e565fcb',
        },
        {
          url: '/_next/static/media/criterion.97fd77fc.svg',
          revision: '6c5f9f48111cbce5122567926b16fd7e',
        },
        {
          url: '/_next/static/media/cvUpload.23fdb1c2.png',
          revision: 'cc029c1dab6374227fa094d9edd8cb3d',
        },
        {
          url: '/_next/static/media/e857b654a2caa584-s.woff2',
          revision: 'aa01ffde85d9db48aab4b245e5e8f97a',
        },
        {
          url: '/_next/static/media/gender_neutral_avatar.230de99d.jpg',
          revision: '45d542824fb7724e4015d67df272855c',
        },
        {
          url: '/_next/static/media/incentiveAmount.688857ff.svg',
          revision: 'a4a1b964259ac570a3c5b282c1bdca8b',
        },
        {
          url: '/_next/static/media/layers-2x.9859cd12.png',
          revision: '9859cd12',
        },
        {
          url: '/_next/static/media/layers.ef6db872.png',
          revision: 'ef6db872',
        },
        {
          url: '/_next/static/media/marker-icon.d577052a.png',
          revision: 'd577052a',
        },
        {
          url: '/_next/static/media/projects.0574dabd.svg',
          revision: '5b9c66fb005117b1bfd6900b22a02e5a',
        },
        {
          url: '/_next/static/media/recognizedEmployees.b67d1f76.svg',
          revision: '4f0225260b63f2db218a51363a33039d',
        },
        {
          url: '/_next/static/media/successResult.a2b579dd.png',
          revision: 'b8f37c4b64ffbb8f5e755ae200933514',
        },
        {
          url: '/animated-splash-static.svg',
          revision: '34428dcdd95be6091444754b40837d9f',
        },
        {
          url: '/animated-splash.svg',
          revision: 'd733a2956fcdc9fbce8bdf279da7df9c',
        },
        {
          url: '/confirmSvg.svg',
          revision: '753387f33e3c90ee58daf3a6b0ed5995',
        },
        { url: '/deleteSvg.svg', revision: 'b11e4e8445e13c2d294a300e1bb99de1' },
        { url: '/favicon.ico', revision: '6540cc8c08e61e7d85a0bc7595c9cd9c' },
        {
          url: '/gender_neutral_avatar.jpg',
          revision: '45d542824fb7724e4015d67df272855c',
        },
        { url: '/icons/192.png', revision: '55c1496af8c3fd0539c0adf6e3a93716' },
        { url: '/icons/256.png', revision: '7ae7dd35bb280456a022a8bd6368e23f' },
        { url: '/icons/404.svg', revision: '6c22ddc3d86dba16ee45553131252591' },
        { url: '/icons/512.png', revision: 'b98750e581cf0394d27cbdb8c4ad7946' },
        {
          url: '/icons/Logo.svg',
          revision: '9f043fb6979856430766db72227f9244',
        },
        {
          url: '/icons/README.md',
          revision: 'b37ab38c416e743f11547516e071033f',
        },
        {
          url: '/icons/android/android-launchericon-144-144.png',
          revision: 'b815d387a849dc3f5c8900d59b00d228',
        },
        {
          url: '/icons/android/android-launchericon-192-192.png',
          revision: '55c1496af8c3fd0539c0adf6e3a93716',
        },
        {
          url: '/icons/android/android-launchericon-48-48.png',
          revision: 'cb4f26309d011e754362533f22a842d8',
        },
        {
          url: '/icons/android/android-launchericon-512-512.png',
          revision: 'b98750e581cf0394d27cbdb8c4ad7946',
        },
        {
          url: '/icons/android/android-launchericon-72-72.png',
          revision: '78dde68c836dd421b9a6d61eaa547a5b',
        },
        {
          url: '/icons/android/android-launchericon-96-96.png',
          revision: 'b6b6d98d5571fb9145170c6a383d09b0',
        },
        {
          url: '/icons/browserconfig.xml',
          revision: '842b22692fefb9655574fb49eaabbf5e',
        },
        {
          url: '/icons/chapa-pay.svg',
          revision: '3a70663168fd558ca96664081a427244',
        },
        {
          url: '/icons/datanotfound.svg',
          revision: 'c1b4406e6184b9a2a3a1caf762f944cc',
        },
        {
          url: '/icons/file-download.svg',
          revision: '08babb2303d54edcf3f446512f88d468',
        },
        {
          url: '/icons/gallery-add.svg',
          revision: 'b597c90c1b1879c8490a29ed0bab33f9',
        },
        {
          url: '/icons/icons.json',
          revision: '4b00c8d3f335ee495b2b5e1dc66d9bc3',
        },
        {
          url: '/icons/ios/100.png',
          revision: 'cbd3d7df1c1d234b5a1b0b25dbadebbc',
        },
        {
          url: '/icons/ios/1024.png',
          revision: '70d3784ae222068e9a4440cfe34f6b8e',
        },
        {
          url: '/icons/ios/114.png',
          revision: '6b3ad6f836718dc04e265b77b0ddfd3c',
        },
        {
          url: '/icons/ios/120.png',
          revision: 'd834685e8a0641cab354030b266cfbcc',
        },
        {
          url: '/icons/ios/128.png',
          revision: '0a060c470e289912aff73a1f53b886a9',
        },
        {
          url: '/icons/ios/144.png',
          revision: 'b815d387a849dc3f5c8900d59b00d228',
        },
        {
          url: '/icons/ios/152.png',
          revision: '1dd88137165ad4c9359b2ec78d9794d5',
        },
        {
          url: '/icons/ios/16.png',
          revision: '7a9608ad88e55c54440a2542e149fe0b',
        },
        {
          url: '/icons/ios/167.png',
          revision: '40cdd9381cf89d7e8df7c4946b7bfa0c',
        },
        {
          url: '/icons/ios/180.png',
          revision: '9a073eeea4964429708e2d7315898dd0',
        },
        {
          url: '/icons/ios/192.png',
          revision: '55c1496af8c3fd0539c0adf6e3a93716',
        },
        {
          url: '/icons/ios/20.png',
          revision: 'bf6c6ed0887602f1a22ec8015c433215',
        },
        {
          url: '/icons/ios/256.png',
          revision: '7ae7dd35bb280456a022a8bd6368e23f',
        },
        {
          url: '/icons/ios/29.png',
          revision: '52b0d7bcff6bd675942011255515be7f',
        },
        {
          url: '/icons/ios/32.png',
          revision: 'c04595bb432c33b7d32823747b921353',
        },
        {
          url: '/icons/ios/40.png',
          revision: '5dab0d566fe070910c07ab3e4df734a1',
        },
        {
          url: '/icons/ios/50.png',
          revision: '07c6bf94c144710e4786dfcc4ce2a222',
        },
        {
          url: '/icons/ios/512.png',
          revision: 'b98750e581cf0394d27cbdb8c4ad7946',
        },
        {
          url: '/icons/ios/57.png',
          revision: 'd3777bf337c0f71dfd5c221fbb3924dd',
        },
        {
          url: '/icons/ios/58.png',
          revision: '974db711bba1974eed8198daaae2099a',
        },
        {
          url: '/icons/ios/60.png',
          revision: '93c341072e323fd01d4ea24ecd888b11',
        },
        {
          url: '/icons/ios/64.png',
          revision: 'c37f69da16310d97982394423f43a083',
        },
        {
          url: '/icons/ios/72.png',
          revision: '78dde68c836dd421b9a6d61eaa547a5b',
        },
        {
          url: '/icons/ios/76.png',
          revision: '112cc07bc1a776a4b6b066bb7e8da305',
        },
        {
          url: '/icons/ios/80.png',
          revision: 'bc38fca3bdff884cddcdbf6846041582',
        },
        {
          url: '/icons/ios/87.png',
          revision: '408597e217f1e1075e407de0549748e7',
        },
        {
          url: '/icons/status/information.svg',
          revision: '1fdd8853fd2852baa82df6f577bc46f6',
        },
        {
          url: '/icons/status/reject.svg',
          revision: 'c2b8a740dd2efa18a9a37add4d4d4917',
        },
        {
          url: '/icons/status/verify.svg',
          revision: '07fab35357f8b718f1eb07c0a5ce4b35',
        },
        {
          url: '/icons/stripe-pay.svg',
          revision: '6069f22067b84531c568d634937ac310',
        },
        {
          url: '/icons/success.svg',
          revision: '1acb31ec0fe7be75a7197c4afc815dd2',
        },
        {
          url: '/icons/windows11/LargeTile.scale-100.png',
          revision: 'b5fe1cc6aff8cacd920560a62e201423',
        },
        {
          url: '/icons/windows11/LargeTile.scale-125.png',
          revision: 'be689cfdfe1677d8e811a7a6fff1d846',
        },
        {
          url: '/icons/windows11/LargeTile.scale-150.png',
          revision: '3ea1dca87cd2fecbaff585a65fd9682f',
        },
        {
          url: '/icons/windows11/LargeTile.scale-200.png',
          revision: '7e9bf9f1fda929a1f3fc03d6cfe26353',
        },
        {
          url: '/icons/windows11/LargeTile.scale-400.png',
          revision: '17e9bfd7e3a526b27bf1e7e2ec88617b',
        },
        {
          url: '/icons/windows11/SmallTile.scale-100.png',
          revision: 'cfef043c8756f11c65f44dd0aa793cee',
        },
        {
          url: '/icons/windows11/SmallTile.scale-125.png',
          revision: '8048ef606f37c5c5ebaa8050b972bdff',
        },
        {
          url: '/icons/windows11/SmallTile.scale-150.png',
          revision: '976c2da6eab5e37a131d455cd24b8f10',
        },
        {
          url: '/icons/windows11/SmallTile.scale-200.png',
          revision: '8f44c8f5eb2ebc96822d7334e438a10e',
        },
        {
          url: '/icons/windows11/SmallTile.scale-400.png',
          revision: '57f0f8e40df8a452e3a3fe4a0a0f4acb',
        },
        {
          url: '/icons/windows11/SplashScreen.scale-100.png',
          revision: '062c1ac8137e8549164b5fd15bce0cdd',
        },
        {
          url: '/icons/windows11/SplashScreen.scale-125.png',
          revision: '040d21d85d06d410ab836aed812b93c6',
        },
        {
          url: '/icons/windows11/SplashScreen.scale-150.png',
          revision: '376332b214103aa8c682ada545017d53',
        },
        {
          url: '/icons/windows11/SplashScreen.scale-200.png',
          revision: '23f05f1c09268ee35c8f9976a073a33e',
        },
        {
          url: '/icons/windows11/SplashScreen.scale-400.png',
          revision: 'd60b0f735d186b52fab43cca1d558743',
        },
        {
          url: '/icons/windows11/Square150x150Logo.scale-100.png',
          revision: '76e069f2bb93d5061a66203d9bf7b92a',
        },
        {
          url: '/icons/windows11/Square150x150Logo.scale-125.png',
          revision: 'fa6f967e325edc2421df8c44750bdb84',
        },
        {
          url: '/icons/windows11/Square150x150Logo.scale-150.png',
          revision: '582a42b09a7c758d7145d2ebeacab1d5',
        },
        {
          url: '/icons/windows11/Square150x150Logo.scale-200.png',
          revision: '9915136b0d0217aee9da7d6d6f424879',
        },
        {
          url: '/icons/windows11/Square150x150Logo.scale-400.png',
          revision: '09c7f0d8727e428b887fe1de36ebdec9',
        },
        {
          url: '/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-16.png',
          revision: '05fb3e3e601a6f78c95be1d8582e328f',
        },
        {
          url: '/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-20.png',
          revision: '44708c160aca24fce9a9233f2902f08a',
        },
        {
          url: '/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-24.png',
          revision: 'a30fc11d9c55092b632a43e4095a7953',
        },
        {
          url: '/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-256.png',
          revision: 'c2281e768039147bdac69b87c3ac7d0e',
        },
        {
          url: '/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-30.png',
          revision: 'c273b116a2efb3b9306f1931f4dc3aad',
        },
        {
          url: '/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-32.png',
          revision: 'bdf598490dfcea1af7d227c2bb122569',
        },
        {
          url: '/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-36.png',
          revision: 'ce40ee23e48558d569ccea644db64e9d',
        },
        {
          url: '/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-40.png',
          revision: 'dfa9dc260b788784540f75c3322917fa',
        },
        {
          url: '/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-44.png',
          revision: '40349ef340d03a20259847b21319f073',
        },
        {
          url: '/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-48.png',
          revision: '994001cad9d7c4c1953b613e1ebfca6e',
        },
        {
          url: '/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-60.png',
          revision: '348b6b5f05537bfa78311ba944407bd4',
        },
        {
          url: '/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-64.png',
          revision: '6d6e32b6efbc13424b16af608dbcb1d6',
        },
        {
          url: '/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-72.png',
          revision: '9749a695c2153cdd7f33606dded40a5e',
        },
        {
          url: '/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-80.png',
          revision: '2e023950ebce3ebbbb7bfff16e8703df',
        },
        {
          url: '/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-96.png',
          revision: '93c9d254e48de6dc6288764e549f4580',
        },
        {
          url: '/icons/windows11/Square44x44Logo.altform-unplated_targetsize-16.png',
          revision: '05fb3e3e601a6f78c95be1d8582e328f',
        },
        {
          url: '/icons/windows11/Square44x44Logo.altform-unplated_targetsize-20.png',
          revision: '44708c160aca24fce9a9233f2902f08a',
        },
        {
          url: '/icons/windows11/Square44x44Logo.altform-unplated_targetsize-24.png',
          revision: 'a30fc11d9c55092b632a43e4095a7953',
        },
        {
          url: '/icons/windows11/Square44x44Logo.altform-unplated_targetsize-256.png',
          revision: 'c2281e768039147bdac69b87c3ac7d0e',
        },
        {
          url: '/icons/windows11/Square44x44Logo.altform-unplated_targetsize-30.png',
          revision: 'c273b116a2efb3b9306f1931f4dc3aad',
        },
        {
          url: '/icons/windows11/Square44x44Logo.altform-unplated_targetsize-32.png',
          revision: 'bdf598490dfcea1af7d227c2bb122569',
        },
        {
          url: '/icons/windows11/Square44x44Logo.altform-unplated_targetsize-36.png',
          revision: 'ce40ee23e48558d569ccea644db64e9d',
        },
        {
          url: '/icons/windows11/Square44x44Logo.altform-unplated_targetsize-40.png',
          revision: 'dfa9dc260b788784540f75c3322917fa',
        },
        {
          url: '/icons/windows11/Square44x44Logo.altform-unplated_targetsize-44.png',
          revision: '40349ef340d03a20259847b21319f073',
        },
        {
          url: '/icons/windows11/Square44x44Logo.altform-unplated_targetsize-48.png',
          revision: '994001cad9d7c4c1953b613e1ebfca6e',
        },
        {
          url: '/icons/windows11/Square44x44Logo.altform-unplated_targetsize-60.png',
          revision: '348b6b5f05537bfa78311ba944407bd4',
        },
        {
          url: '/icons/windows11/Square44x44Logo.altform-unplated_targetsize-64.png',
          revision: '6d6e32b6efbc13424b16af608dbcb1d6',
        },
        {
          url: '/icons/windows11/Square44x44Logo.altform-unplated_targetsize-72.png',
          revision: '9749a695c2153cdd7f33606dded40a5e',
        },
        {
          url: '/icons/windows11/Square44x44Logo.altform-unplated_targetsize-80.png',
          revision: '2e023950ebce3ebbbb7bfff16e8703df',
        },
        {
          url: '/icons/windows11/Square44x44Logo.altform-unplated_targetsize-96.png',
          revision: '93c9d254e48de6dc6288764e549f4580',
        },
        {
          url: '/icons/windows11/Square44x44Logo.scale-100.png',
          revision: '40349ef340d03a20259847b21319f073',
        },
        {
          url: '/icons/windows11/Square44x44Logo.scale-125.png',
          revision: '8b7aa0264945f801a68050e2bb35a2d1',
        },
        {
          url: '/icons/windows11/Square44x44Logo.scale-150.png',
          revision: '71884c24d9c36cd82b6ecff869c778af',
        },
        {
          url: '/icons/windows11/Square44x44Logo.scale-200.png',
          revision: '3bd08b541cd71b0e8ef5f51734dc8560',
        },
        {
          url: '/icons/windows11/Square44x44Logo.scale-400.png',
          revision: 'aeb2401524e6a094aae89717bdbc61c8',
        },
        {
          url: '/icons/windows11/Square44x44Logo.targetsize-16.png',
          revision: '05fb3e3e601a6f78c95be1d8582e328f',
        },
        {
          url: '/icons/windows11/Square44x44Logo.targetsize-20.png',
          revision: '44708c160aca24fce9a9233f2902f08a',
        },
        {
          url: '/icons/windows11/Square44x44Logo.targetsize-24.png',
          revision: 'a30fc11d9c55092b632a43e4095a7953',
        },
        {
          url: '/icons/windows11/Square44x44Logo.targetsize-256.png',
          revision: 'c2281e768039147bdac69b87c3ac7d0e',
        },
        {
          url: '/icons/windows11/Square44x44Logo.targetsize-30.png',
          revision: 'c273b116a2efb3b9306f1931f4dc3aad',
        },
        {
          url: '/icons/windows11/Square44x44Logo.targetsize-32.png',
          revision: 'bdf598490dfcea1af7d227c2bb122569',
        },
        {
          url: '/icons/windows11/Square44x44Logo.targetsize-36.png',
          revision: 'ce40ee23e48558d569ccea644db64e9d',
        },
        {
          url: '/icons/windows11/Square44x44Logo.targetsize-40.png',
          revision: 'dfa9dc260b788784540f75c3322917fa',
        },
        {
          url: '/icons/windows11/Square44x44Logo.targetsize-44.png',
          revision: '40349ef340d03a20259847b21319f073',
        },
        {
          url: '/icons/windows11/Square44x44Logo.targetsize-48.png',
          revision: '994001cad9d7c4c1953b613e1ebfca6e',
        },
        {
          url: '/icons/windows11/Square44x44Logo.targetsize-60.png',
          revision: '348b6b5f05537bfa78311ba944407bd4',
        },
        {
          url: '/icons/windows11/Square44x44Logo.targetsize-64.png',
          revision: '6d6e32b6efbc13424b16af608dbcb1d6',
        },
        {
          url: '/icons/windows11/Square44x44Logo.targetsize-72.png',
          revision: '9749a695c2153cdd7f33606dded40a5e',
        },
        {
          url: '/icons/windows11/Square44x44Logo.targetsize-80.png',
          revision: '2e023950ebce3ebbbb7bfff16e8703df',
        },
        {
          url: '/icons/windows11/Square44x44Logo.targetsize-96.png',
          revision: '93c9d254e48de6dc6288764e549f4580',
        },
        {
          url: '/icons/windows11/StoreLogo.scale-100.png',
          revision: '07c6bf94c144710e4786dfcc4ce2a222',
        },
        {
          url: '/icons/windows11/StoreLogo.scale-125.png',
          revision: '2f183cca5ac1e5e002ac7fa222051107',
        },
        {
          url: '/icons/windows11/StoreLogo.scale-150.png',
          revision: 'e3bc469b0dcc12cec607c44e0c90ee05',
        },
        {
          url: '/icons/windows11/StoreLogo.scale-200.png',
          revision: 'cbd3d7df1c1d234b5a1b0b25dbadebbc',
        },
        {
          url: '/icons/windows11/StoreLogo.scale-400.png',
          revision: '0fdb71f20bf6c778a95f660e8a4504a1',
        },
        {
          url: '/icons/windows11/Wide310x150Logo.scale-100.png',
          revision: 'bdfdb2b4d306d24a44e6aafa08e3f230',
        },
        {
          url: '/icons/windows11/Wide310x150Logo.scale-125.png',
          revision: 'dce0f5ed575db98d7535e54c3297aecd',
        },
        {
          url: '/icons/windows11/Wide310x150Logo.scale-150.png',
          revision: 'b8258cf693d8608c36267c4f5f311870',
        },
        {
          url: '/icons/windows11/Wide310x150Logo.scale-200.png',
          revision: '062c1ac8137e8549164b5fd15bce0cdd',
        },
        {
          url: '/icons/windows11/Wide310x150Logo.scale-400.png',
          revision: '23f05f1c09268ee35c8f9976a073a33e',
        },
        {
          url: '/image/Button.svg',
          revision: 'da23e3b029d7db9ae24f6c2b84aebfaf',
        },
        {
          url: '/image/ZKTeco.png',
          revision: 'b2515f4fd0f0c2f87ee281daeff61089',
        },
        {
          url: '/image/bankLetterImages.tsx',
          revision: '5404ab0ab5dde1ffd08df38f1b7ca2ab',
        },
        {
          url: '/image/cvUpload.png',
          revision: 'cc029c1dab6374227fa094d9edd8cb3d',
        },
        { url: '/image/ie.png', revision: '3144fe0276e36e258002b78cecc2db2f' },
        {
          url: '/image/successResult.png',
          revision: 'b8f37c4b64ffbb8f5e755ae200933514',
        },
        {
          url: '/image/undraw_empty_re_opql 1.png',
          revision: '6cdf36e091f248c6ff98949aed7ae7a2',
        },
        {
          url: '/image/undraw_empty_re_opql 1.svg',
          revision: 'e691b669f7bce176b3b386126a4d5351',
        },
        {
          url: '/login-background.png',
          revision: '715addd23ceff9820a0eb97d8d40bb6f',
        },
        { url: '/manifest.json', revision: '754be94b9a2846bf31a3f310ea8972a7' },
        { url: '/next.svg', revision: '8e061864f388b47f33a1c3780831193e' },
        { url: '/offline', revision: 'eyGhUvhLERmLl-KLuUGSs' },
        { url: '/sw-push.js', revision: '423099e2c538e26641318c5aca056565' },
        { url: '/userIcon.png', revision: '21290e54f2e18a286c44fe19846ab1fc' },
        { url: '/vercel.svg', revision: '61c6b19abff40ea7acd577be818f3976' },
      ],
      { ignoreURLParametersMatching: [] },
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: s,
              event: i,
              state: n,
            }) =>
              s && 'opaqueredirect' === s.type
                ? new Response(s.body, {
                    status: 200,
                    statusText: 'OK',
                    headers: s.headers,
                  })
                : s,
          },
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /^https:\/\/fonts\.googleapis\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /^https:\/\/fonts\.gstatic\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts-static',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /\.(?:js|css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-js-css-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /^\/api\/.*/i,
      new e.NetworkFirst({
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET',
    ));
});
