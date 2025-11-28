if (!self.define) {
  let e,
    n = {};
  const t = (t, i) => (
    (t = new URL(t + '.js', i).href),
    n[t] ||
      new Promise((n) => {
        if ('document' in self) {
          const e = document.createElement('script');
          ((e.src = t), (e.onload = n), document.head.appendChild(e));
        } else ((e = t), importScripts(t), n());
      }).then(() => {
        let e = n[t];
        if (!e) throw new Error(`Module ${t} didn’t register its module`);
        return e;
      })
  );
  self.define = (i, s) => {
    const a =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href;
    if (n[a]) return;
    let c = {};
    const o = (e) => t(e, a),
      r = { module: { uri: a }, exports: c, require: o };
    n[a] = Promise.all(i.map((e) => r[e] || o(e))).then((e) => (s(...e), c));
  };
}
define(['./workbox-00a24876'], function (e) {
  'use strict';
  (importScripts('fallback-n8vo3XjzUh2KALzqNtfHC.js'),
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
          revision: '6673aa925f4f4bb32daff8c5e6976a97',
        },
        {
          url: '/_next/static/chunks/0e762574-f41e02d330293e8f.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/1004-afb35d5c994217c3.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/110-53c81054e55bd1e3.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/11390db7-3039854f365bab9a.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/1140-687d68a257a5a4d3.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/1305-180eae28515dc5b8.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/135.61c3f4b290055ff0.js',
          revision: '61c3f4b290055ff0',
        },
        {
          url: '/_next/static/chunks/1360-6d0d81a36e5ba005.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/1457-20fc2c0aa0ae5214.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/1505-0531869fb123fdcf.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/1616-00a9d19127bdf3cb.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/1640-1587cb30fb0bf75d.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/1642-e8d373c6cb4c5f20.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/164f4fb6-99a2e58922a3f5ec.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/1684-190e791773da240d.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/1725-2a950521e45aa8bf.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/1753-7daf6c351341e91b.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/1761-4628d5cdb29e5e92.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/1762-86344d73c9e928e4.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/1768-180cc5083d11d1a3.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/18-82b0a87c55bae476.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/1822-988764ff9e94dc8e.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/1838.20f56d2166206178.js',
          revision: '20f56d2166206178',
        },
        {
          url: '/_next/static/chunks/1867-751f580c9a980d8d.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/1899-ba970fbbcef8cfa8.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/1985-f601d84b65d24cc6.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/2075-7b45f54626507282.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/2091-2bac1e6156984f13.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/2095-54c26e2964ed596a.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/233-7ff2f4a85914de65.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/2420-6f3b74cba596d106.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/2459-5cd35c689fb42ad1.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/2478-603897d6cd4d6bd2.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/248-0894bc813037865a.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/256-3ec7caa236411b86.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/2625-506f52ccbf6435cd.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/2649-c80659c2717ef6ec.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/2845-cd3a8bd2b221e7c9.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/2854-4b660a75dec438d8.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/2905-55e4d614d49abcba.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/2929-3b51cafa53dc582f.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/3039-034f7addaa3b5cbe.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/307-1e6298ff4e175256.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/308-d95444ff347232ed.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/30a37ab2-a460757850b45c64.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/3223-bd2a6beea0c50962.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/325-d706be899e7ad2ae.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/3400-2e4d637c20c110ef.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/3497-e71a8a99d96136d0.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/361-6bc683b6bd0a0af9.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/3687-56d85c3d71124301.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/3690-959bddb87b5843d2.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/3717-c7c9dd8bc56dd23a.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/3742-cb0eb2f2a0316583.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/3788-4c527d3ff157af9f.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/3797-fe88a3c923f827c6.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/3829-4fed16d8cdedaa98.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/3831-22b896bd98b1639e.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/3835-bd59430f41d9ea38.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/385cb88d-551da5ab57360a6e.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/3867-7639f452ce3dd371.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/3884-340a76fa2167133b.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/3888-544a475671c85d36.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/3896-a975e04526daf847.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/3938-e023a2b8c6323b3b.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/3d47b92a-2223e9f4e3874a9b.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/4018-0d31ebcfa83f0901.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/4066-c20d9fde79dfb2f8.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/4081-b045a2338cfe6871.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/437-4f1aeac8350004d4.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/441-c8779c23dbe6db09.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/4429-c57c1ae81c8568cc.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/4465-738d12a030da245a.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/4468-d3c7593508a7cee9.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/4498-0f3bab06244fccf3.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/4525-8bf318895e71c94f.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/462095b7-a435d8e876f42bc8.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/4729-4ceebc2c23704464.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/4749-cbb7ad4cbd4aae31.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/4776-5144be7c879501b0.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/4786-f94f90d3d05b86af.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/479ba886-a1bc7036e103b388.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/4873-d34a30a91f2adfdf.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/495-099dc4bae4f190c4.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/4979-952897e54413debe.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/5109-e968c2b711ac3ed6.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/515-6d9a0e4775903341.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/5218-09cdedf37fc7ae63.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/5223-600bcdad361b64e9.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/52ab8b6c-cab1d6bac8bb745b.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/5354-4a463c418fa5edbc.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/53c13509-ac5efc0264558f44.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/5406-8045dae700fa8609.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/5445-0b0bfcf6aa01854a.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/5478-424f3c6e81d9676b.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/54a60aa6-e47e3bfc808452bd.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/554-1066fb8813df736c.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/5541-bb87290478e43aea.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/5592-2696fae7d3d4f9d9.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/56-46e824bcf9323d6f.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/5718-5a5bfac0baeba280.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/5738-37dbff4ce261988d.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/578-d56dbae84d001a78.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/5785-659ad7b8d3a34537.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/5786-da7231acedabd4cf.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/578c2090-fb35812c82abe289.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/5836-4dcbb2553e650013.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/5913-825f296c9e8bbc4d.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/5932-8394fa6f5e329bee.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/59650de3-53e6059f01606fe1.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/5986-17a22257438a4c85.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/5991-e911ad2e1f2aed8f.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/5e22fd23-b18dbc9e1b2b7ee4.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/6-85d2ba10a8387f74.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/6098-006514ac8adde89e.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/61-7b785b975a3fb955.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/6141-f5ef022a1809afa5.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/6151-53c285bbee4056ac.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/617-a4fe299454990e10.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/6186-b41a8aa66963c39e.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/6255-5625dc947699c3da.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/6266-3edfe3e398c2dc2f.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/633-21766b25b1358408.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/6349-21b06db00374b25e.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/6363-8eaff62bd74571dc.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/6469-4231f05a7ebc09fb.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/6474-b0302d48b6c70823.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/6479-b701f88fbba54138.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/6484-7455ad9fdb09d760.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/6494-d97c3efae9ec9fde.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/6511-00f8cf5c2498fe01.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/6540-ef0a01583e4e3013.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/6583-e68c12272395b0ac.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/6644-117e9ca5c6ed73af.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/66ec4792-cd23fa2e2c460383.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/6700-8eda07693f53661c.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/6703-1e243089f2a1e353.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/675-52df35616b74463e.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/6817-306c54e513bc7c5c.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/6827-f7c1e69eebd272be.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/6832-857a692d4d089096.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/6977-b506a872a3a2da85.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/69806262-346e49452de380e4.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/6993-6c9d8c59ae1cef77.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/6edf0643-3339f6c96a12fdde.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/7023-bf025b709ee5eb0d.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/7064611b-4506a439cc3ebeed.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/7074-a6606e4d8dbe84e5.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/7088.da74220ab5cdd5ba.js',
          revision: 'da74220ab5cdd5ba',
        },
        {
          url: '/_next/static/chunks/70e0d97a-92de8b1495483d75.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/7138-8ad09c5bd276b562.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/718-8264ffd3981dcafe.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/7220-06ecd4a4cc35731a.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/7223-a7fa237760448848.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/7342-8bfbaae8aa280530.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/7428-f3c9c2a6ccb03266.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/7460-84c4327af5df5609.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/7476-c8e39e50aef1e080.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/7531-11b5acfed5270c8e.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/7621-9806027b2e4a3ae8.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/7631-9fb3263b47f2e692.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/7701-3bfa552130778c48.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/7703-f363f0a8cd7de531.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/7782-f34bab764e7b7c69.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/7806-724844b40f1a94ab.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/7862-163a596aef89e0d8.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/795d4814-a39f68b410d96caa.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/7991-34f8bcb1d5e45673.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/8003-b6cdfdbcd4d26f1b.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/8039-75804cfdac6ef057.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/816-76a56e2b63d30c62.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/8187f03c-32cdd35874b2b4d2.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/8230-a903c50900fcf65a.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/829-aa12df8047923607.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/8328-485d6eab4a93710d.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/8337-5f0e30420d646a8e.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/8354-3705a38501843625.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/8357-52bd5a17fd224703.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/8381-53a495edd35808e3.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/8406-e1b948eca2ab6d7a.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/8413-9bc2d4d2496c9a20.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/8436.acfc52fd47e83fa1.js',
          revision: 'acfc52fd47e83fa1',
        },
        {
          url: '/_next/static/chunks/8454-9b1f93cc381539a1.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/8490-e7c328ba9abd50e2.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/8521-9ca3eee0234774f6.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/8532-7a88518efd7faa61.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/8625-5a5f6f50bb5fe67b.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/870-433608797a2c4a30.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/8836-0f47be9d9a0e5e45.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/8854-5975e1ebc0a5cfae.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/8874-f26deae7c29b77a7.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/8e1d74a4-a0c38aa660312657.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/9010-2c08de38f59f05f1.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/902-e04cf81d2afe3571.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/9025-837cf19d7889979c.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/9054-1df7e07e6c0fa6bc.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/9171-286fc79b1bc0020b.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/9198-1e2df017b31e4b52.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/922-9c145005994ee37c.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/9237-4bf1f663609fda80.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/9347-fb95636a7a6bc167.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/9461-f3b61019f3ef9f01.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/9464-fd97e007cdd8177d.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/94730671-b4487d1e3f624427.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/9501-84adb2fe9a01c602.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/9517-eea3f58ef1bc1809.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/955-c3cbbf5260d715d1.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/96-997b955f254cc745.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/9628-1d79d9ca26241723.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/971-985fe468266a9cec.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/9751-1e3a13986b1c8271.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/9790-c273d10af3e9e55b.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/9795-f674c5f95c4da4d0.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/9804-4e71061442524276.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/9827-8a38ec73fcd17ac7.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/9876-f94d040813c6fa29.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/9924-ff30d375e4dbcf8f.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/9974-6ecb744b4543cfab.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/9c4e2130-31e5f0d71622ee86.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/ad2866b8-b2aba5370a0d21e8.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/%5Bid%5D/page-adf14608d2bb00a0.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/allAllowance/page-7ae69f37b1b23076.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/layout-9d84559da4c4882f.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/page-ea90e33f6364bfe6.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/%5Bid%5D/page-b176992bace360d3.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/layout-8ec4ccbb5edc7cb4.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/page-54a7ab2c7dcdb1b2.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/variablePay/page-7c260921d9c3ec70.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/allowanceType/page-b2bc010d4334a493.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/benefitType/page-d25a4a53a1e2d1b2.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/deductionType/page-063c067020c91e64.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/layout-e7a57c2a1509207e.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/page-b8918a8863926d2e.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/%5Bid%5D/page-f733165606673ecc.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/allDeduction/page-6ffd134bd6c4d757.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/layout-c2544f090af0d7c0.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/page-e1ae6d0f9ba6b0af.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/departmentRequest/page-9fe784c787339362.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/manage-employees/%5Bid%5D/page-e587ab7430b4b9e9.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/manage-employees/page-ea4a6a8e457eb9e6.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/notification/page-0b65a83560b8f3e8.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/approvals/page-567e86507a8661d3.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/employementType/page-9a01ee21bcc441a6.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/layout-d88299d043fb9733.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/page-148128a10ca8f7bc.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/positions/page-48980878562e7ec1.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/rolePermission/page-7ffb232044acb163.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/action-plan/page-30b732ba40bfc920.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/categories/%5Bid%5D/page-a7be2d91685c3b43.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/categories/%5Bid%5D/survey/%5Bslug%5D/page-186665e5bc4d4418.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/categories/page-518909981100a884.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/%5Bid%5D/%5Bslug%5D/meetings/page-1fe2cccf4c639210.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/%5Bid%5D/%5Bslug%5D/page-6568338ddd09064e.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/%5Bid%5D/page-b76dd8b6c1442652.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/page-4216ce141a674435.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/feedback/page-6d76a081e7c5226b.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/meeting/%5Bid%5D/page-ef1980f06ff5d43c.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/meeting/page-8882cc1e803b8645.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/recognition/%5Bid%5D/page-47698ace24d45081.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/recognition/page-99aadffbcda748e9.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/define-feedback/page-ef1ab7b67d5756cd.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/define-meeting-type/page-49cdc12fda742fdd.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/define-questions/page-2fdd2fda23eae007.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/layout-583e3c9f7fab3be3.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/page-2d91d9a95884ab13.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/recognition/page-e9cb7868b5406fd0.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/target-achievement/page-e54bd60ae8b579f9.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/compensation/all/page-c06bb16a14d17499.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/detail/%5BdataId%5D/page-2c44f1f97e1ece35.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/page-abb584f449f073c9.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/payroll-detail/%5Bid%5D/page-008b064eb12aefe1.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/%5Bid%5D/page-45c1927cf495f627.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/defaultIncentiveCard/page-a57c836db737d911.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/layout-bc9bb26ac6e7d171.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/page-401df0a0ba9cf871.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/variable-pay/page-20f737a3b438d2ba.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/page-2ac6129c1ca28cef.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/reprimand-appreciation/appreciation/%5Bid%5D/page-138d524259936f29.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/reprimand-appreciation/page-3fcc4b8175601f1b.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/reprimand-appreciation/reprimand/%5Bid%5D/page-e7fa4f5835c72ee7.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/dashboard/%5BemployeeId%5D/page-8f909117d25f2027.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/dashboard/page-ee8bae0a03a2d835.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/page-3f57c8458e35d20f.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/check-in-rule/page-de9c8f35d439bc3d.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/criteria-management/page-9accc920ffd6d3b6.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/define-appreciation/page-f0edcf74131e90e7.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/define-okr-rule/page-09461df09ac1742e.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/define-reprimand/page-4b998f95be4e1516.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/edit-access/page-a6d7618b172213c2.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/layout-1cf0d8d5d75c5e10.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/okr-setting-menu/page-929f42da0485000f.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/page-dfd242c1a880aba8.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/planning-assignation/page-313d6555b9d69685.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/planning-period/page-2f722172bf7cb599.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/target-assignment/page-7508640b649b1af9.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(onboarding)/onboarding/page-f4fcc20217d05058.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/layout-b63c1f4c46759495.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/org-chart/page-0312b450c7288714.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/org-structure/page-9d8040dd8bf131c1.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/page-ac79db0306936f55.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/branches/page-a8ce09ef70608545.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/fiscalYear/fiscalYearCard/page-f16585a0fa6e160b.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/layout-507d74983335167d.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/page-0b4a4f5753a8bbd6.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/workSchedule/page-23bbe352c0ad1f6b.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/employee-information/%5Bid%5D/page-f44fd9466b3b0aee.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/employee-information/page-f7a7276e4e50ca8d.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/myPayroll/page-02be5e949f3efbc6.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/payroll/page-1eb526d73e36bc0a.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/banks/page-ad875a0a22e47ccd.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/layout-ce4f70ec1cbd1f67.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/page-1322cc67aa97dddc.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/pay-period/page-044c13504b4dba36.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/pension/page-23bfc8eadda9a572.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/tax-rule/page-4c251b333718ffdc.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(planningAndReporting)/planning-and-reporting/page-759e207f1a6e37b7.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/candidate/page-a712ec8dd95e8a99.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/dashboard/page-4ce2653264d0e491.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/hrflow.ai/candidate/%5Bid%5D/page-66a38131690a03d0.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/hrflow.ai/page-fa43c68194be9e70.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/jobs/%5Bid%5D/page-859af60afdc0b18c.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/jobs/page-747e5766f1ba59cb.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/customFields/page-539567630a30f0b2.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/layout-88e5683bd29f1e05.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/page-a90c1d0d60d8b5e3.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/status/page-926cb78b74559e5e.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/talentPoolCategory/talentPoolCategoryTab/page-1c2bac87dec4e02a.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/intern/%5Bid%5D/page-70f7a6a1a6ad529c.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/intern/page-9d6d7789b26879e2.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/page-f3b4e6e108f720d0.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/talent-pool/page-3a4dc2260ec29e78.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/talent-roaster/%5Bid%5D/page-87a9fb8a719ad543.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/talent-roaster/page-8cf5601a09d989ab.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/dashboard/page-248f3cfba53617ad.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/employee-attendance/page-22fa0ccc35036fb8.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/layout-ceda0723679f64f5.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/leave-balance/page-163069302ada756b.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/leaves/page-da893e64ff5def12.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/page-af9b78235e8531f0.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/my-timesheet/page-21f316e6e85a187b.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/accrual-rule/page-a7a76a15aea883c6.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/allowed-areas/page-a9dda31f38907c46.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/approvals/page-743219cf1877b337.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/approvals/workFlow/approvalSetting/page-c4edb77dce436af8.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/approvals/workFlow/page-a6bdbbe67c056ef6.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/attendance-rules/page-381a6a717fc71b99.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/break-type/page-fad4468c9c60be75.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/carry-over-rule/page-58e796b2180ff986.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/closed-date/page-70f0627986ea8980.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/imported-logs/page-4696a037da3c9722.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/layout-d6145135318e3fc5.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/leave-types-and-policies/page-4e23fb9474213e5a.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/page-f3726ef0ef98dae1.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/time-zone/page-d6519f824f0bf61f.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/%5Bid%5D/%5BlessonId%5D/%5BmaterialId%5D/page-2600b20d5fdeae71.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/%5Bid%5D/layout-6054b59a0871ae99.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/%5Bid%5D/page-8a86c74f8b07f3d3.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/page-a8a697f4948acf54.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/my-training/%5Bid%5D/page-0522fb3c2b91e1be.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/my-training/page-107c94a8e6299395.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/review/%5Bid%5D/page-73ba9730fe71ee20.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/review/page-ed250265fdd5c9e3.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/approvals/page-aa63602919b28716.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/approvals/workFlow/approvalSetting/page-21cf0062b7e234a8.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/approvals/workFlow/page-1e4f834e2f5e8a30.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/commitment-rule/page-1c485383dd47b204.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/course-category/page-b026fcbc275a9399.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/layout-3892f5ca87aabf3c.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/tna-category/page-54075b0ab061d9ca.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(weeklyPriority)/weekly-priority/page-570ed5b5a5471b36.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/billing/page-f549f461db56b644.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/dashboard/page-c29f3a0efeaef336.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/invoice/%5Bid%5D/page-8994eb288d35dda9.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/plan/page-a023723a21407e40.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/profile/page-b0bbaad957b162a2.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/dashboard/page-f4ba645d6d8bf6c9.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/dashboard/vp/page-9ea088a0e025dd8f.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(beforeLogin)/authentication/forget-password/page-6ddafe033958a075.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(beforeLogin)/authentication/login/page-9d24267f01fa8481.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(beforeLogin)/authentication/new-password/page-ccb9807737cb38ce.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(beforeLogin)/authentication/reset-password/page-df1b9803d2b6133a.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(publicForms)/job/%5BtenantId%5D/%5BjobId%5D/page-ae0ba56a6a5c5a3a.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(publicForms)/job/openPositions/%5Bid%5D/page-e1c20fa9acebdbeb.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(publicForms)/job/openPositions/page-3ce71c42792779a1.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/(publicForms)/surveys/%5Bid%5D/page-a8f54240f6960234.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-89110f115e3059ee.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/layout-5e8ac47968a64133.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/loading-63300b9924950fad.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/not-found-67771eb1fe91e8cb.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/offline/page-bd0c9a8ffcb219ab.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/app/page-964bb518e4c261e8.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/b2d98e07-1948317d489cbde4.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/b563f954-d3ca46153dc3fcb3.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/bc98253f.00a1b5f74e45da50.js',
          revision: '00a1b5f74e45da50',
        },
        {
          url: '/_next/static/chunks/c916193b-01e71ab4a1fb4de6.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/ca377847-cc336e09288b791f.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
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
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/ee560e2c-2dd2c9b10bfe0f85.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/eec3d76d-327495402e145a9c.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/f25cdb8d-0a4b9d1ee45595fe.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/f7333993-dcee63933cda82cc.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/f8025e75-8142e36afb1a6fee.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/f97e080b-94568624e165939e.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/fd9d1056-f067ed350b7d4b38.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/ff804112-f6ed25befc3f12e3.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/framework-56dfd39ab9a08705.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/main-app-c1c42861aae6f0b7.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/main-f552058675a23949.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/pages/_app-f870474a17b7f2fd.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
        },
        {
          url: '/_next/static/chunks/pages/_error-c66a4e8afc46f17b.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
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
          url: '/_next/static/chunks/webpack-fa8b85ac652eff3f.js',
          revision: 'n8vo3XjzUh2KALzqNtfHC',
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
          url: '/_next/static/css/9b0c991ffcbd870a.css',
          revision: '9b0c991ffcbd870a',
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
          url: '/_next/static/n8vo3XjzUh2KALzqNtfHC/_buildManifest.js',
          revision: '3e2d62a10f4d6bf0b92e14aecf7836f4',
        },
        {
          url: '/_next/static/n8vo3XjzUh2KALzqNtfHC/_ssgManifest.js',
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
        { url: '/offline', revision: 'n8vo3XjzUh2KALzqNtfHC' },
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
              event: t,
              state: i,
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
