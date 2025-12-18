if (!self.define) {
  let e,
    n = {};
  const i = (i, s) => (
    (i = new URL(i + '.js', s).href),
    n[i] ||
      new Promise((n) => {
        if ('document' in self) {
          const e = document.createElement('script');
          ((e.src = i), (e.onload = n), document.head.appendChild(e));
        } else ((e = i), importScripts(i), n());
      }).then(() => {
        let e = n[i];
        if (!e) throw new Error(`Module ${i} didn’t register its module`);
        return e;
      })
  );
  self.define = (s, a) => {
    const o =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href;
    if (n[o]) return;
    let t = {};
    const c = (e) => i(e, o),
      r = { module: { uri: o }, exports: t, require: c };
    n[o] = Promise.all(s.map((e) => r[e] || c(e))).then((e) => (a(...e), t));
  };
}
define(['./workbox-00a24876'], function (e) {
  'use strict';
  (importScripts('fallback-o28vVRBPNvA8nH-QoAG85.js'),
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
        { url: '/Uploading.png', revision: '6d146f1e502895fc44f2587b1d0f975c' },
        {
          url: '/_next/app-build-manifest.json',
          revision: '5388fc04d835d86913e58b7b7293419d',
        },
        {
          url: '/_next/static/chunks/0e762574-f41e02d330293e8f.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/1004-afb35d5c994217c3.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/110-53c81054e55bd1e3.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/11390db7-3039854f365bab9a.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/1140-687d68a257a5a4d3.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/135.bbd06a87f39efd7c.js',
          revision: 'bbd06a87f39efd7c',
        },
        {
          url: '/_next/static/chunks/1360-a3cb78910cb74921.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/1457-20fc2c0aa0ae5214.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/1505-0531869fb123fdcf.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/1616-00a9d19127bdf3cb.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/1640-1587cb30fb0bf75d.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/164f4fb6-a4176ac3c168486b.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/1684-5eea80db8980ece2.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/169-a3e89dcc71d014ba.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/1725-2a950521e45aa8bf.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/1753-7daf6c351341e91b.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/1761-4628d5cdb29e5e92.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/1762-776f806f7b1c9cff.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/1768-180cc5083d11d1a3.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/18-08167f70b35b0d4a.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/1822-988764ff9e94dc8e.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/1838.20f56d2166206178.js',
          revision: '20f56d2166206178',
        },
        {
          url: '/_next/static/chunks/1867-751f580c9a980d8d.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/1899-ba970fbbcef8cfa8.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/1997-0aa2ad5e2e9d58db.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/2075-7b45f54626507282.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/2091-2bac1e6156984f13.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/2095-54c26e2964ed596a.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/212-5ee267221cf32f7c.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/233-7ff2f4a85914de65.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/2420-6f3b74cba596d106.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/2459-8ae3badd82219921.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/2478-603897d6cd4d6bd2.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/248-05436fbcdbe7a723.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/256-3ec7caa236411b86.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/2625-506f52ccbf6435cd.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/2649-e0e45bff9319d51b.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/2682-66eb0b707ad66e5e.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/2845-cd3a8bd2b221e7c9.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/2854-e6824984501b626e.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/2929-3b51cafa53dc582f.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/3039-034f7addaa3b5cbe.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/30a37ab2-a460757850b45c64.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/3223-bd2a6beea0c50962.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/325-d706be899e7ad2ae.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/332-c2fefac56e26f9f1.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/3400-2e4d637c20c110ef.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/3497-e71a8a99d96136d0.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/3539-1f9b8ffb7af10530.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/361-6bc683b6bd0a0af9.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/3690-aae966751ff4eb7f.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/3717-c7c9dd8bc56dd23a.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/3742-cb0eb2f2a0316583.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/3788-4c527d3ff157af9f.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/3797-fe88a3c923f827c6.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/3829-4fed16d8cdedaa98.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/3831-22b896bd98b1639e.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/3835-bd59430f41d9ea38.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/385cb88d-551da5ab57360a6e.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/3867-7639f452ce3dd371.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/3884-340a76fa2167133b.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/3888-544a475671c85d36.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/3896-a975e04526daf847.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/3938-e023a2b8c6323b3b.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/3d47b92a-2223e9f4e3874a9b.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/4018-0d31ebcfa83f0901.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/4066-c20d9fde79dfb2f8.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/4264-858b7b7e3d50ab84.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/441-c8779c23dbe6db09.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/4429-c57c1ae81c8568cc.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/4468-d3c7593508a7cee9.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/4498-72a5535c40b1d7dc.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/4525-f410c05f8d86269d.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/4616-12a1541a95bc1a75.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/462095b7-a435d8e876f42bc8.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/4640-c0544e2391863697.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/4729-4ceebc2c23704464.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/4749-cbb7ad4cbd4aae31.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/4776-5144be7c879501b0.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/4786-f94f90d3d05b86af.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/479ba886-a1bc7036e103b388.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/4873-d34a30a91f2adfdf.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/4889-966a1bb73b77b5f8.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/495-32a16fb6051eb8f7.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/4979-952897e54413debe.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/5066-13fbaa0f410774db.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/5109-e968c2b711ac3ed6.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/515-6d9a0e4775903341.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/5223-80f95bddaabb3a4e.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/52ab8b6c-cab1d6bac8bb745b.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/5354-4a463c418fa5edbc.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/53c13509-ac5efc0264558f44.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/5406-f899367e21b9b3c5.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/5478-424f3c6e81d9676b.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/54a60aa6-e47e3bfc808452bd.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/5541-bb87290478e43aea.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/56-b06e100eae11438c.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/5718-5a5bfac0baeba280.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/5738-bd0069a318b837d6.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/578-d56dbae84d001a78.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/5785-7eeb54d3a154e161.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/5786-da7231acedabd4cf.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/578c2090-fb35812c82abe289.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/5836-3a37877dac23c707.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/5913-825f296c9e8bbc4d.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/5932-8394fa6f5e329bee.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/59650de3-53e6059f01606fe1.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/5986-17a22257438a4c85.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/5991-c36ed5aec278ed53.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/5e22fd23-b18dbc9e1b2b7ee4.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/6-85d2ba10a8387f74.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/6005-091fe6e6be52fa00.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/6033-99ed530f11624e10.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/6098-006514ac8adde89e.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/61-7b785b975a3fb955.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/6141-a2291e9c5c69653b.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/6151-53c285bbee4056ac.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/617-a4fe299454990e10.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/6186-b41a8aa66963c39e.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/6255-5625dc947699c3da.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/6266-3edfe3e398c2dc2f.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/633-21766b25b1358408.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/6349-21b06db00374b25e.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/6381-8757a20a483ac61c.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/6469-a7cb2ca722845d97.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/6474-b0302d48b6c70823.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/6479-b701f88fbba54138.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/6484-7455ad9fdb09d760.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/6492-8a6457ddf0da7687.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/6511-00f8cf5c2498fe01.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/6540-ef0a01583e4e3013.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/6583-ad90faaccb295227.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/6644-117e9ca5c6ed73af.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/66ec4792-cd23fa2e2c460383.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/6700-1ef08053f36e80f5.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/6703-1e243089f2a1e353.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/675-52df35616b74463e.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/6817-43acb600f03b70f6.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/6827-b58f967180def671.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/6832-857a692d4d089096.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/6959-66dcfb3c89082377.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/6977-a86b83ee7a7a2798.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/69806262-346e49452de380e4.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/6993-6c9d8c59ae1cef77.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/6edf0643-3339f6c96a12fdde.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/7015-6b2e7e862b56e1a4.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/7023-bf025b709ee5eb0d.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/7064611b-4506a439cc3ebeed.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/7074-a6606e4d8dbe84e5.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/7088.37794a5f598f849c.js',
          revision: '37794a5f598f849c',
        },
        {
          url: '/_next/static/chunks/70e0d97a-92de8b1495483d75.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/711-7af3cf5b969d83e8.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/7138-8ad09c5bd276b562.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/718-c38631e728bdbd9b.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/7220-06ecd4a4cc35731a.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/7223-a7fa237760448848.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/7342-48ee4ef79b1722ee.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/7365-5361d968014aca14.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/7460-84c4327af5df5609.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/7476-c8e39e50aef1e080.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/7621-9806027b2e4a3ae8.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/7631-6a0e0d9bb003c303.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/7701-3bfa552130778c48.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/7703-f363f0a8cd7de531.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/7782-f34bab764e7b7c69.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/7806-724844b40f1a94ab.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/7862-163a596aef89e0d8.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/795d4814-a39f68b410d96caa.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/7991-34f8bcb1d5e45673.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/8003-b6cdfdbcd4d26f1b.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/8039-75804cfdac6ef057.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/816-76a56e2b63d30c62.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/8202-69765f7104431667.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/8230-a903c50900fcf65a.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/829-aa12df8047923607.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/8337-5f0e30420d646a8e.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/8354-1d0e5b3c2978a706.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/8357-52bd5a17fd224703.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/8375-56cdab38d9902f1c.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/8381-53a495edd35808e3.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/8406-f0e8d428c86cf65e.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/8413-9bc2d4d2496c9a20.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/842-7473e499d29c4d4d.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/8436.acfc52fd47e83fa1.js',
          revision: 'acfc52fd47e83fa1',
        },
        {
          url: '/_next/static/chunks/8490-e7c328ba9abd50e2.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/8521-9ca3eee0234774f6.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/8532-7a88518efd7faa61.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/8574-1bb3a1a3c53d499e.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/8625-227e47939c065ee0.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/870-433608797a2c4a30.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/8836-0f47be9d9a0e5e45.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/8854-5975e1ebc0a5cfae.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/8874-f26deae7c29b77a7.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/8914-2850b726e78f1858.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/8e1d74a4-a0c38aa660312657.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/9010-2c08de38f59f05f1.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/902-9309737002ac086d.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/9025-cfb36b3334386b18.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/9054-1df7e07e6c0fa6bc.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/9143-383a69fbd3fa9fe5.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/9171-e42ca550fdf36907.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/9198-14b5cec534d2d9c1.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/922-9c145005994ee37c.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/9237-4bf1f663609fda80.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/9461-f3b61019f3ef9f01.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/9464-f8125e41c73a7df4.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/94730671-b4487d1e3f624427.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/9501-84adb2fe9a01c602.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/955-c3cbbf5260d715d1.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/96-997b955f254cc745.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/9628-1d79d9ca26241723.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/971-985fe468266a9cec.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/9751-1e3a13986b1c8271.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/9790-c39e3c0fda802afd.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/9795-c57e84bdad121f1b.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/9804-4e71061442524276.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/9876-f94d040813c6fa29.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/9924-ff30d375e4dbcf8f.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/9974-6ecb744b4543cfab.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/9c4e2130-31e5f0d71622ee86.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/ad2866b8-b2aba5370a0d21e8.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/%5Bid%5D/page-84fb0c7e9656dd8d.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/allAllowance/page-c522440e09372a8c.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/layout-fa8b91c2191ca801.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/page-97b55a35be7c4723.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/%5Bid%5D/page-5506494cb51efa9d.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/layout-28cc17edf3835a2a.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/page-612edd0b011c0513.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/variablePay/page-364d7885c637759e.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/allowanceType/page-2dffe7900eeddd6c.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/benefitType/page-a9c192842619c210.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/deductionType/page-a9a59936753241ff.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/layout-a3c6bc85325dbe6b.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/page-82b8ed9973946f6d.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/%5Bid%5D/page-373df7fa8ede85df.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/allDeduction/page-7dedc3b4f0cfbea4.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/layout-326f0147ee2cbb13.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/page-857142973a951ab8.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/departmentRequest/page-ac238f8d9cab45ac.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/manage-employees/%5Bid%5D/page-8ee0572545158cf8.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/manage-employees/page-36a3245b72e11767.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/notification/page-7eb7bc1a9d8bedbc.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/approvals/page-ff960a8e88bd4be8.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/employementType/page-43d73bc0115d94bf.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/layout-ccedbc66030e6dca.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/page-7238ac97dac6777d.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/positions/page-a1b4d0347dc52085.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/rolePermission/page-5812733055cd5d0c.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/action-plan/page-d15f5c55593ce256.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/categories/%5Bid%5D/page-ea2a9eb8b1a69258.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/categories/%5Bid%5D/survey/%5Bslug%5D/page-594c4509a59a5f34.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/categories/page-1c48e121615d9fb0.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/%5Bid%5D/%5Bslug%5D/meetings/page-d2bf51b24ab1f220.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/%5Bid%5D/%5Bslug%5D/page-19b1d284c784822e.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/%5Bid%5D/page-e2730f14835b1928.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/page-bd159945f76b955f.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/feedback/page-c007c6cba7e0a8d6.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/meeting/%5Bid%5D/page-73c1e1fab27c7dc6.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/meeting/page-d7a80518eae6ce9e.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/recognition/%5Bid%5D/page-65023553377f41cc.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/recognition/page-f0dff3b3d70916d6.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/define-feedback/page-11da3b6643866b45.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/define-meeting-type/page-d003667f46341086.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/define-questions/page-2bce170d2f23f215.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/layout-5fc2156e6961a926.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/page-e2324711556fda39.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/recognition/page-3206bcee16d526e1.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/target-achievement/page-a4578b266b66f9ab.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/compensation/all/page-1395272f6dd93495.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/detail/%5BdataId%5D/page-b3bcefa5fad39f65.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/page-84d3ead5224939f3.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/payroll-detail/%5Bid%5D/page-72bdd7f9562e8cf2.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/%5Bid%5D/page-ca6cd670e2e3308b.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/defaultIncentiveCard/page-cc298a0512b4ccbb.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/layout-69f48982d0ad2ffa.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/page-6b942082e98fdb92.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/variable-pay/page-3dfb2ed74d3c8336.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/page-1e1896fdccab5fe6.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/reprimand-appreciation/appreciation/%5Bid%5D/page-2529cd23344bdb1f.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/reprimand-appreciation/page-0ba35f8f953f0c7b.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/reprimand-appreciation/reprimand/%5Bid%5D/page-dfb3f937d41d9880.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/dashboard/%5BemployeeId%5D/page-ac57343380b72a8c.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/dashboard/page-d6e1a2e7d2cb89e3.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/page-58a4ca5eb090ea67.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/check-in-rule/page-6ad10a9040254056.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/criteria-management/page-7552967efed6d5e3.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/define-appreciation/page-e335468132f3ac9b.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/define-okr-rule/page-ae3347f30773d096.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/define-reprimand/page-c428e1921942ea33.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/edit-access/page-88b5ff25037055e1.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/layout-814592749be7fef7.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/okr-setting-menu/page-d735497eb3594889.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/page-9c1454a8b5b40872.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/planning-assignation/page-5f5571a0076d752a.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/planning-period/page-66c2ef1fe2ea6b0d.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/target-assignment/page-31bacf066e9bf1ca.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(onboarding)/onboarding/page-d3d93a963e95f456.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/layout-79b9d3bd3719a548.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/org-chart/page-528a0b935276e934.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/org-structure/page-b3d578ba701e53b6.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/page-8c66c881a348f221.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/branches/page-80f1abf69ef63c2f.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/fiscalYear/fiscalYearCard/page-8658f3d98a4b33e3.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/layout-a65c4ac99b711676.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/page-12f888726933b8d5.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/workSchedule/page-9b56e173dbdedd08.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/employee-information/%5Bid%5D/page-9ea38e6fa446dffa.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/employee-information/page-5a9245beab75422f.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/myPayroll/page-fa705635a0a0efe2.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/payroll/page-49a468fe43da8bb1.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/banks/page-1962b8a2b612f94f.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/layout-8ceeca8a34fa3745.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/page-8e559ef8b67edfda.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/pay-period/page-a650e1c82ebf8529.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/pension/page-31eb9725d7420e8a.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/tax-rule/page-1ab07699cefb2e1b.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(planningAndReporting)/planning-and-reporting/page-d2d1b582ee52f30a.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/ai-job-matching/%5BjobId%5D/page-3be49645354396a5.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/ai-job-matching/page-d6de2b8f583d94a0.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/candidate/page-a1eda914f46c3723.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/dashboard/page-223a27c726aa9536.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/hrflow.ai/candidate/%5Bid%5D/page-66a38131690a03d0.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/hrflow.ai/page-87f01f18fbd60a4c.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/jobs/%5Bid%5D/page-47a7f4a6a2e16933.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/jobs/page-6a30b484a69fba48.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/customFields/page-1bdab96905458945.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/layout-99538ead8e632756.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/page-66953d3048085c7b.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/status/page-c51a68e99414a684.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/talentPoolCategory/talentPoolCategoryTab/page-91717f8d09cf1d44.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/intern/%5Bid%5D/page-d46755023be04373.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/intern/page-7521aeed8e2af9be.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/page-66e17ad5c202130d.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/talent-pool/page-873e2dd1410d3da6.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/talent-roaster/%5Bid%5D/page-1aa244db40571ca3.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/talent-roaster/page-4c578a4b45632c60.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/dashboard/page-6aa287648f53a809.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/employee-attendance/page-39d594b623d48086.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/layout-aee427e93eb90beb.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/leave-balance/page-5dca7e792c00fc2a.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/leaves/page-80b51e16ba6ffa23.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/page-f086a6ef9d5d7dff.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/my-timesheet/page-6a84b8db9ac0dd1a.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/accrual-rule/page-0762db411bc5814d.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/allowed-areas/page-925f8d46e0a594e8.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/approvals/page-f4ce9afccfe3b9cd.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/approvals/workFlow/approvalSetting/page-5b5f6dddceb82907.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/approvals/workFlow/page-cb88acd27c488b3e.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/attendance-rules/page-dc3bac5d6e131666.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/break-type/page-c938a858a8b19220.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/carry-over-rule/page-66df2d161d0f4760.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/closed-date/page-1312d827a25c1e1e.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/imported-logs/page-96fe6016f496dc0f.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/layout-c79a5b44dea323dc.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/leave-types-and-policies/page-c3c9f79ed40bec2c.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/page-f7e2b3cce7da022d.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/time-zone/page-c5af860df712c82a.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/%5Bid%5D/%5BlessonId%5D/%5BmaterialId%5D/page-716ffa0a9f6cd385.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/%5Bid%5D/layout-6a7eeeccbe4cae19.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/%5Bid%5D/page-874f1860c50ac6a5.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/page-c9c1e8c6c07ac5bb.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/my-training/%5Bid%5D/page-14c4e162163b3b01.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/my-training/page-d9dffa5ea72a4cb1.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/review/%5Bid%5D/page-246e107f5ac9790a.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/review/page-e9b5375d45e235ce.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/approvals/page-ab1781097ce793cd.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/approvals/workFlow/approvalSetting/page-3ba6e1f4b114d40b.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/approvals/workFlow/page-51b257a3215e89b2.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/commitment-rule/page-430e9e6caaa5ecd0.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/course-category/page-5eaade722d6279b9.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/layout-cab5bbf43ea85cd1.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/tna-category/page-29c55bb8626a6510.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(weeklyPriority)/weekly-priority/page-945c64c62948b7cd.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/billing/page-edc4530c69c10b2b.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/dashboard/page-b0cf9c6696b32525.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/invoice/%5Bid%5D/page-11f3c62203f1f94d.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/plan/page-89b0f9f599f918ee.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/profile/page-34c4b2682815d23f.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/dashboard/page-fb362b1a5c71c553.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/dashboard/vp/page-131c264ccba095cd.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(beforeLogin)/authentication/forget-password/page-0a3512143f357975.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(beforeLogin)/authentication/login/page-baec9c2e00198ebc.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(beforeLogin)/authentication/new-password/page-41c23bf5e637029d.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(beforeLogin)/authentication/reset-password/page-3385e64f2d6c3ec4.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(publicForms)/job/%5BtenantId%5D/%5BjobId%5D/page-2b49b6af6c890ce6.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(publicForms)/job/openPositions/%5Bid%5D/page-206b5581d65a1bec.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(publicForms)/job/openPositions/page-ea69bb75320b137a.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/(publicForms)/surveys/%5Bid%5D/page-459f59e5e92ae2ce.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-89110f115e3059ee.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/layout-14fdbdba2aa06176.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/loading-f13654f55ba2d7cc.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/not-found-e1d58bffde002f46.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/offline/page-e8e26a999bce0e72.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/app/page-964bb518e4c261e8.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/b2d98e07-1948317d489cbde4.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/b563f954-d3ca46153dc3fcb3.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/bc98253f.aa27182464c58412.js',
          revision: 'aa27182464c58412',
        },
        {
          url: '/_next/static/chunks/c916193b-01e71ab4a1fb4de6.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/ca377847-cc336e09288b791f.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
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
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/ee560e2c-2dd2c9b10bfe0f85.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/eec3d76d-327495402e145a9c.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/f25cdb8d-0a4b9d1ee45595fe.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/f7333993-dcee63933cda82cc.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/f8025e75-8142e36afb1a6fee.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/f97e080b-94568624e165939e.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/fd9d1056-f067ed350b7d4b38.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/ff804112-19c01e31cf8a2d42.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/framework-56dfd39ab9a08705.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/main-app-617d369b09134a95.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/main-ca269f004e33af33.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/pages/_app-f870474a17b7f2fd.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/chunks/pages/_error-c66a4e8afc46f17b.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
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
          url: '/_next/static/chunks/webpack-7cd88e9e8cdb7b7c.js',
          revision: 'o28vVRBPNvA8nH-QoAG85',
        },
        {
          url: '/_next/static/css/087975534fc52cbf.css',
          revision: '087975534fc52cbf',
        },
        {
          url: '/_next/static/css/4d3d9169b46fed63.css',
          revision: '4d3d9169b46fed63',
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
          url: '/_next/static/o28vVRBPNvA8nH-QoAG85/_buildManifest.js',
          revision: '3e2d62a10f4d6bf0b92e14aecf7836f4',
        },
        {
          url: '/_next/static/o28vVRBPNvA8nH-QoAG85/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
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
        { url: '/offline', revision: 'o28vVRBPNvA8nH-QoAG85' },
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
              response: n,
              event: i,
              state: s,
            }) =>
              n && 'opaqueredirect' === n.type
                ? new Response(n.body, {
                    status: 200,
                    statusText: 'OK',
                    headers: n.headers,
                  })
                : n,
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
