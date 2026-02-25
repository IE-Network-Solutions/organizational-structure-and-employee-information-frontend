if (!self.define) {
  let e,
    t = {};
  const i = (i, s) => (
    (i = new URL(i + '.js', s).href),
    t[i] ||
      new Promise((t) => {
        if ('document' in self) {
          const e = document.createElement('script');
          ((e.src = i), (e.onload = t), document.head.appendChild(e));
        } else ((e = i), importScripts(i), t());
      }).then(() => {
        let e = t[i];
        if (!e) throw new Error(`Module ${i} didn’t register its module`);
        return e;
      })
  );
  self.define = (s, n) => {
    const a =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href;
    if (t[a]) return;
    let c = {};
    const o = (e) => i(e, a),
      r = { module: { uri: a }, exports: c, require: o };
    t[a] = Promise.all(s.map((e) => r[e] || o(e))).then((e) => (n(...e), c));
  };
}
define(['./workbox-00a24876'], function (e) {
  'use strict';
  (importScripts('fallback-QoQfQEtuQ0Y5Gqf5A5ZOq.js'),
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
          revision: 'dcca7993fe7a638e5c7b8481597ccfcc',
        },
        {
          url: '/_next/static/QoQfQEtuQ0Y5Gqf5A5ZOq/_buildManifest.js',
          revision: '3e2d62a10f4d6bf0b92e14aecf7836f4',
        },
        {
          url: '/_next/static/QoQfQEtuQ0Y5Gqf5A5ZOq/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        {
          url: '/_next/static/chunks/0e762574-39bd1a41093d392c.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/1003-3a92bb59ed23604f.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/1004-829a41bbf89fcf34.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/1080-6810a11aae43ddff.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/1084-a87d55a26570ca99.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/1113-b2ec05ea48702bd4.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/11390db7-3039854f365bab9a.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/1160-92ddfa64cca8ac24.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/13-27762fccbdf60bbc.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/135.94cde4773e8a4989.js',
          revision: '94cde4773e8a4989',
        },
        {
          url: '/_next/static/chunks/1461-076eb99832c53b7d.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/1482-591a0b3ec4d38082.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/1494-eb9d7249ea581a37.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/1496-3ccc523be51604b0.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/1506-6b9cd7db900b50c0.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/152-4654c4751a375216.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/1569-ca7dd708990caf09.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/164f4fb6-a4176ac3c168486b.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/1684-99ffa2d6015f01cd.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/169-dc731e2c907a3722.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/1741-6a8fdacaf4ed642e.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/1838.20f56d2166206178.js',
          revision: '20f56d2166206178',
        },
        {
          url: '/_next/static/chunks/1899-307ec7ccb9208326.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/1937-4b1855779ced76f8.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/2012-6f11c43ce34a0890.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/2090-c2128a605b653e8b.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/2129-387976310b8dbb2d.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/217-d51dfe6cde7a9ae1.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/2214-452a3c1113a0143b.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/2297-d569cb7c5e62252a.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/2300-52fc8d4d1798e137.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/2324-5200cf3b8e66e960.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/2407-02b883dba9e635d3.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/2459-b722849b5989177c.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/2540-98e03cbae205e57d.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/2625-506f52ccbf6435cd.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/2649-b380f1e4d88b2475.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/3020-2a0333a1ef6cbd9f.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/30a37ab2-a460757850b45c64.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/3122-139722234464c644.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/3149-be90b16271bb1dcf.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/3166-10eecce52fb835ce.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/3190-5f7e66cad5f1f776.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/3223-16e745dc69c6029b.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/3302-523bd780543a6f45.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/3342-f29cdf06731e7772.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/3539-84d53b92273f3ac5.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/3562-bd20a3ed84900dfe.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/3600-8886ee3a9acf1505.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/3608-5e7abb08ffe3f8e1.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/3742-74a5180b4a8e0535.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/3788-0bd9fb6e44e38563.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/3829-e2e2e5201b8dfb95.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/3839-146f4d7e2978d659.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/385cb88d-551da5ab57360a6e.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/3884-340a76fa2167133b.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/3896-83c3f40c7924ab3b.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/3936-e3e54a085de034df.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/3961-78f71710a03e52b1.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/3962-4a6cc9d2a4d968aa.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/3d47b92a-2223e9f4e3874a9b.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/40-e18ebfae1fccc0c0.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/4025-d4f897b0665368f6.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/4066-f8d3aa2457825c3c.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/4163-8479bfef91317746.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/4165-c181682a2e9ba092.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/4230-5a2da41cc9534077.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/4456.39c8c8c0200f3e28.js',
          revision: '39c8c8c0200f3e28',
        },
        {
          url: '/_next/static/chunks/4525-962e080dc69bfa1c.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/4535-7ec1ee0db41169b6.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/4559.48ba235c96365458.js',
          revision: '48ba235c96365458',
        },
        {
          url: '/_next/static/chunks/4561-21eec9c4ea38c2c0.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/4616-a107cb3c4e05b146.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/462095b7-a435d8e876f42bc8.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/4624-d5b4909807a1f662.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/4661-2bdae7f510ed8bbd.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/4697-779aeece82aef1d8.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/4786-0439848d42fb33d5.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/479ba886-fa4f521d8021366a.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/4858-e414fe721f074bb3.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/4873-d34a30a91f2adfdf.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/495-0d9119e2d62ef293.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/4979-3c039268bced431e.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/5002-ee28286223a0f6c8.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/5066-63047345c9aed3d4.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/5295-4ed0bb71788d7db5.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/52ab8b6c-cab1d6bac8bb745b.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/5325-757895e7e2f8d04f.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/5345-fd429f21262d4afe.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/5395-15a1615e9b5d7cc2.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/53c13509-ac5efc0264558f44.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/5406-2e3e17f84750efc3.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/5438-9b0a78a6421a5d95.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/5443-270f89406cb0298b.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/5457-256b35fe948716a8.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/5479-7d91beacf09d0b75.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/54a60aa6-e47e3bfc808452bd.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/5507-b1721782372d6c67.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/5548-96dcc0de1a419dcd.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/5569-cf5959cc612868c9.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/56-fd4fa73d65b0afff.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/5619-4b0cf66774799fb9.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/5637-2b9230291ba60fb9.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/5738-021c96021d99f062.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/5783-4bb4f91e531c7904.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/5785-eef0245ab5b940e2.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/5786-5122ae8e45441c20.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/578c2090-fb35812c82abe289.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/5836-3a37877dac23c707.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/5892-4181386cfcc93dbd.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/5913-c1e2f445ac27940a.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/59650de3-53e6059f01606fe1.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/5e22fd23-f8d7602ebeca6f1d.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/6007-354aa4d150a0ff4f.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/6040-aced153bce93bae9.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/6141-b57c98dff4ef4b28.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/6168-535963cd1c63305c.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/6255-ad0a7c55a8e16859.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/6317-eaed835108614b01.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/633-a7cf8feb77422bb1.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/6350-2fb957c5062f497a.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/6368-21a3ec88645d9298.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/6406-30c0f373df38f3c7.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/6469-97383c4e62da30b6.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/6512-9e6e90f3f1050e34.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/6518-5ba0f7ce9f2c7f9f.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/6567-e8f25dd7aaddf848.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/6697-33fd36224acbae96.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/66ec4792-cd23fa2e2c460383.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/6700-24e476f383d1309e.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/6716-b3c41837bc5f54b8.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/6780-52e6e4304b6d962b.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/6813-e7b381d5dbf4bd4f.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/6817-5a0ddf2f28607062.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/6827-f42346116d8d9625.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/6901-4c656e8789e263b9.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/6977-5b7200e49d7427dc.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/69806262-346e49452de380e4.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/6edf0643-3339f6c96a12fdde.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/7005-d26a7833a8287a64.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/7023-bf025b709ee5eb0d.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/7064611b-4506a439cc3ebeed.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/7088.c8abebd0266ef78c.js',
          revision: 'c8abebd0266ef78c',
        },
        {
          url: '/_next/static/chunks/70e0d97a-92de8b1495483d75.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/711-b8a121dda7cd6224.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/7138-8ad09c5bd276b562.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/7168-e8d87bf1606aaff2.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/718-bb43460545f3d942.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/7182-99d9f534e1b82e33.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/7220-fa271c32728ff667.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/7269-4c6dc882c69139b0.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/728-bc9bff6c12f11844.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/7342-156c17523d3d100b.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/7460-899b3d0259d7c11e.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/7572-69b6a57a4bbb0d48.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/7621-9806027b2e4a3ae8.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/7701-af579757ed02b82d.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/7714-a79164448d0be460.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/7842-3c6274f4b8958765.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/795d4814-d1527f04d7d57184.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/797-87a6dd0c24fef6e0.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/8025-18d1366519bec659.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/8043.daae937314fb3c5d.js',
          revision: 'daae937314fb3c5d',
        },
        {
          url: '/_next/static/chunks/8044-ad6caa7f518c4067.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/8122-594fffb6127d7e56.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/8127.dffc3476103c22f0.js',
          revision: 'dffc3476103c22f0',
        },
        {
          url: '/_next/static/chunks/8202-6c0231b707dc0914.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/8230-76635650b52db6a8.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/8256-cbb5ffa4840bcab5.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/8285-f645bb9cc876a75a.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/8328-921ebc0179c41d65.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/8357-091e6293047401e4.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/8375-e40ac97df5846aad.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/8381.bbb2b6e0229b2d97.js',
          revision: 'bbb2b6e0229b2d97',
        },
        {
          url: '/_next/static/chunks/8387-2d9caaf8839426c9.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/8406-fd1cb203645f98c0.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/8436.acfc52fd47e83fa1.js',
          revision: 'acfc52fd47e83fa1',
        },
        {
          url: '/_next/static/chunks/8441-523ff4a56ffb5ff0.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/8556-d24451333e9e6c73.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/858-c2c8c2661afcabf2.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/8663-9fbdcdeebd060eb3.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/8671-90a1764de977f67f.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/8784-b75a67d942415a77.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/8836-291458eba48ac32a.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/8889-bcc1897232ae63a9.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/8e1d74a4-31fc1d6a42fd4136.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/902-9309737002ac086d.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/9025-8a523129bdc7c672.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/904-49fa8ceeff530b67.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/9046-923c97ab8b277dfb.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/9143-ad0f18b1a24da76b.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/9172-b65e3e715e196469.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/9198-376f10544f4a91f3.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/922-c2eea56585075128.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/9257-3eae50947ac25f89.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/9314-ebb16b0fe3de6548.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/932-00611e91792ffce4.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/9371-b79285b5d77ae49f.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/9403-154bb7dcc7a1cbdb.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/9429-0d031ec84b8558f4.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/943-12145dccaf9a5dfd.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/9464-41f7ba926f248c2b.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/94730671-b4487d1e3f624427.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/9497-9758af42128cae0d.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/9548-143f5523213b68a2.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/9564-e5421e41a8f99d74.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/9751-fcd30644cab75e0d.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/9790-68a3c15722539334.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/9795-f25ac22ee4fcf3ca.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/9804-394308b6d17e4462.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/9876-278ce26544edf32f.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/9973-d07a0cf6e2aa8789.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/9974-3edafd0f88fbf67d.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/9c4e2130-430144973dd74575.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/ad2866b8-b2aba5370a0d21e8.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/%5Bid%5D/page-ecbe54851c3fb298.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/allAllowance/page-7ad00f68177f5c9f.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/layout-5c31ad774b5d41da.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/page-33a8ae7aeffbf59e.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/%5Bid%5D/page-89ae434d53157c8f.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/layout-221ba99544555dd0.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/page-a48f094bfbd91cc3.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/variablePay/page-ee2787bf6af003f0.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/allowanceType/page-72a89b77958d19de.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/benefitType/page-a966ad5b15e29b93.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/deductionType/page-66adac3866254ba6.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/layout-daae3fe6c6eff45a.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/page-7ebdfa2b1fa9847e.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/%5Bid%5D/page-3707abe88b95f4ce.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/allDeduction/page-f2e5ca3f070e38b4.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/layout-a042c691204b4af4.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/page-ff6559648a49a617.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/departmentRequest/page-0871f30e0c0c1c2e.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/manage-employees/%5Bid%5D/page-fa863acdf4f90d03.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/manage-employees/page-3906aa63d7e1b80b.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/notification/page-3df4d003a14f7d24.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/approvals/page-66de4db82249218f.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/employementType/page-3c77aa5c82d527c4.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/layout-b7c8079a47ce8744.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/page-d92cd6e19e1ef25e.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/positions/page-a95fd5739cf4d9dd.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/rolePermission/page-e6d7f29b61977db9.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/action-plan/page-82145c309c9a6001.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/categories/%5Bid%5D/page-f3b55e03b11b4e58.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/categories/%5Bid%5D/survey/%5Bslug%5D/page-b08de467767e764d.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/categories/page-10129b292264b682.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/%5Bid%5D/%5Bslug%5D/meetings/page-0f9f8f5d48fea1e4.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/%5Bid%5D/%5Bslug%5D/page-1c98923db02f3a8d.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/%5Bid%5D/page-b58c856560fce5e0.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/page-dadfe769c566d7c4.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/feedback/page-322d4712766dddef.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/meeting/%5Bid%5D/page-e25f55180fb722d4.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/meeting/page-3d738cfe1b3abc48.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/recognition/%5Bid%5D/page-a379c89b314f3d77.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/recognition/page-577e46a811139912.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/define-feedback/page-1f8538827b1ffe27.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/define-meeting-type/page-bde2273507ecc541.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/define-questions/page-b227247dba90edef.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/layout-162eb652ed638725.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/page-6d6d717961750175.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/recognition/page-ec251716f90fbebf.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/target-achievement/page-ff202f8c6edcea64.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/compensation/all/page-80d604ae4d3e5d38.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/detail/%5BdataId%5D/page-5bbb28736900b635.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/page-9c50a5141866cb83.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/payroll-detail/%5Bid%5D/page-5719fa99d9c20569.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/%5Bid%5D/page-26786768d8e22a85.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/defaultIncentiveCard/page-d8a1f14e934b266f.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/layout-76e5b024c1e9d120.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/page-638330f4677a01cd.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/variable-pay/page-ca3cc7034b2a633a.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/page-0e8cd658d1b71258.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/reprimand-appreciation/appreciation/%5Bid%5D/page-07becba7fab46d2d.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/reprimand-appreciation/page-e0299a30cd03e9ac.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/reprimand-appreciation/reprimand/%5Bid%5D/page-850670426e95ed8c.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/dashboard/%5BemployeeId%5D/page-d1c32fbc330fcdc2.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/dashboard/page-647de757340176e2.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/page-78218771eff7fc1f.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/check-in-rule/page-faaa7b555b82f1dd.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/criteria-management/page-61415935dd51e152.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/define-appreciation/page-1bd9aac86bcce43f.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/define-okr-rule/page-a982a4e913368bf5.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/define-reprimand/page-b02896fad03d6e58.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/edit-access/page-e5f3302ab0ece8bc.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/layout-9ee2eca9964bf5c6.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/okr-setting-menu/page-3e6710d13e17219c.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/okr-type/page-d628b17c9a54add0.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/page-dc0ff727e07af288.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/planning-assignation/page-b357547c1143fa47.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/planning-period/page-28f8b712412ae7fb.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/target-assignment/page-278ccbfc2f2dd2ca.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(onboarding)/onboarding/page-686c28c58f6672e2.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/layout-0f6a5b07aab90cab.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/org-chart/page-67a322dd0b14f3fc.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/org-structure/page-2dea870fab8f6570.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/page-6513df307feb4f89.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/branches/page-7184bdfeb216499a.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/fiscalYear/fiscalYearCard/page-de9bb5aec24c3798.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/layout-e553ce02b6d5ed29.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/merge/page-b376745c5191ea12.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/page-dbf18c7cc5e1e84f.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/transfer/page-2f352f21f334551e.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/workSchedule/page-c7b2286ad2099361.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/employee-information/%5Bid%5D/page-36507c32a62d8cc6.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/employee-information/page-f01d84b6a535f52c.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/myPayroll/page-e72ba2399f64693e.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/payroll/page-38ce437dfa3bacde.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/payroll/reconcilation/page-d2c29ec0ef7e1dd1.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/approvals/page-78a67658810b2104.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/banks/page-deaebadc62ee175e.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/layout-c77b3f5cee76bc52.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/page-c200a7cf278e0692.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/pay-period/page-2cb90806e54e0ec1.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/pension/page-0caaa91bfe85105a.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/tax-rule/page-a9a2ed3c6e0fb383.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(planningAndReporting)/planning-and-reporting/page-ac85ecfad3d0b873.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/ai-job-matching/%5BjobId%5D/page-96f68bce3a7540d9.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/ai-job-matching/page-ad306420a805b973.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/candidate/page-02bcb7b43c4b3ba5.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/dashboard/page-41c7f5f2c1877c1e.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/hrflow.ai/candidate/%5Bid%5D/page-66a38131690a03d0.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/hrflow.ai/page-30401b1ae4ec651b.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/jobs/%5Bid%5D/page-322de6480594d07b.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/jobs/page-323f68b7c2740dda.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/customFields/page-eb1caecc6a11730f.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/layout-b4fb6a88468ff828.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/page-5a68b2dc2bc75ff6.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/status/page-25fc4734e38919f8.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/talentPoolCategory/talentPoolCategoryTab/page-b1693f08d9d25da6.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/intern/%5Bid%5D/page-5eab1d24be14aa58.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/intern/page-b72571af8eb53f54.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/page-77964fd8d11e4995.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/talent-pool/page-0433a7f9e31323c4.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/talent-roaster/%5Bid%5D/page-009c5e1fb1462060.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/talent-roaster/page-8bc2e322996df504.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/dashboard/page-79a6bed20b01ca46.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/employee-attendance/page-650c04c4be61680d.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/layout-b47d080ec6be1f56.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/leave-balance/page-a0ac1c185fbd3f1a.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/leaves/page-eeeef74d008ae8b6.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/page-32101f8a68e23224.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/my-timesheet/page-cd1d67c8f08929dd.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/accrual-rule/page-49bd7b2adafbc50a.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/allowed-areas/page-2b0ce811452e06e3.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/approvals/page-22a341f0f1f607c3.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/approvals/workFlow/approvalSetting/page-65e8bbf10a8e774d.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/approvals/workFlow/page-2c7faa096659f420.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/attendance-rules/page-57f9d25b0ebe36ff.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/break-type/page-45dc5821aab0523f.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/carry-over-rule/page-f40232ad57e1d60a.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/closed-date/page-7bb7fb698e1269b8.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/imported-logs/page-8b7e56b40d6d81b5.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/layout-b0fc22084fe0dcd2.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/leave-types-and-policies/page-2fca40b8e3f834a0.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/page-12d0efc8fb92a2ae.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/time-zone/page-1beb761784a9ffa9.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/zkt-addon/page-e9a9a18487139fab.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/%5Bid%5D/%5BlessonId%5D/%5BmaterialId%5D/page-15760c962e9f4d8c.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/%5Bid%5D/layout-a1ef4878f660bee2.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/%5Bid%5D/page-097697eb30220226.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/page-24943db59d9a82e2.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/my-training/%5Bid%5D/page-1db2f9f247206d86.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/my-training/page-dda0fd70b94c94e8.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/review/%5Bid%5D/page-de7fc82fda7fef38.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/review/page-0b63353d36570e33.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/approvals/page-943d9565bb210bbc.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/approvals/workFlow/approvalSetting/page-9f7d7976d08e7e1f.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/approvals/workFlow/page-bf612659ebc2a3cf.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/commitment-rule/page-e25eb1312c9a9021.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/course-category/page-d4f30a53083bc4d5.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/layout-57fa3ab6913558d3.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/tna-category/page-1574eb083f83d4a3.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(weeklyPriority)/weekly-priority/page-663f2203364bb1b7.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/billing/page-195487221dfc3172.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/dashboard/page-547cbc7d71f45fa5.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/invoice/%5Bid%5D/page-ac0967449b771fcf.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/plan/page-511dbc65d5c4bbdf.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/profile/page-d90b2468b1b6fe0a.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/audit-log/%5Bid%5D/page-64659ea10df7a51c.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/audit-log/page-de2cbfd9abc47cd8.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/dashboard/page-74a60826ca83eba1.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/dashboard/vp/page-c8170922c912c750.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(beforeLogin)/authentication/forget-password/page-b4488ed85cac43c1.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(beforeLogin)/authentication/login/page-26923157a153f5fd.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(beforeLogin)/authentication/new-password/page-cf42ec3b41981636.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(beforeLogin)/authentication/reset-password/page-7e07d900a4307a9f.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(publicForms)/job/%5BtenantId%5D/%5BjobId%5D/page-b0ad4393b6e2e3d9.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(publicForms)/job/openPositions/%5Bid%5D/page-4c14b324a846bd1d.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(publicForms)/job/openPositions/page-814d01c912297658.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/(publicForms)/surveys/%5Bid%5D/page-0dd1976f314c963b.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-89110f115e3059ee.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/layout-dd8c3f3ce3de8abb.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/loading-86b0297c8c7f882a.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/not-found-59c6ec763f315b2f.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/offline/page-23f284544ddd0d91.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/app/page-964bb518e4c261e8.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/b2d98e07-1948317d489cbde4.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/b563f954-d3ca46153dc3fcb3.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/bc98253f.aa27182464c58412.js',
          revision: 'aa27182464c58412',
        },
        {
          url: '/_next/static/chunks/c37d3baf.bb735962c251e6ad.js',
          revision: 'bb735962c251e6ad',
        },
        {
          url: '/_next/static/chunks/c916193b-01e71ab4a1fb4de6.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/ca377847-cc336e09288b791f.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
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
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/ee560e2c-0ee6c59746153548.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/eec3d76d-327495402e145a9c.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/f25cdb8d-0a4b9d1ee45595fe.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/f7333993-dcee63933cda82cc.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/f8025e75-99fe32d3f26cd165.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/f97e080b-0b62b1ada87ac2ee.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/fd9d1056-f067ed350b7d4b38.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/ff804112-19c01e31cf8a2d42.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/framework-56dfd39ab9a08705.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/main-app-104da3c9b19a6903.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/main-cc39fdb03b0a7f9c.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/pages/_app-f870474a17b7f2fd.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/chunks/pages/_error-c66a4e8afc46f17b.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
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
          url: '/_next/static/chunks/webpack-ee1204cb602163e2.js',
          revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq',
        },
        {
          url: '/_next/static/css/0536b41ff71a7098.css',
          revision: '0536b41ff71a7098',
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
          url: '/_next/static/css/f59bfee53fbffbfb.css',
          revision: 'f59bfee53fbffbfb',
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
          revision: '2599cd29214558aeb8341abbbd058420',
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
          revision: '369e7534a01023045dd81424e1a59728',
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
        { url: '/manifest.json', revision: 'a85f0bd7b1d659c767e405df5c9e6a4e' },
        { url: '/next.svg', revision: '8e061864f388b47f33a1c3780831193e' },
        { url: '/offline', revision: 'QoQfQEtuQ0Y5Gqf5A5ZOq' },
        { url: '/sw-push.js', revision: '5d435c232d5b40f6638476e02fa1a51d' },
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
              response: t,
              event: i,
              state: s,
            }) =>
              t && 'opaqueredirect' === t.type
                ? new Response(t.body, {
                    status: 200,
                    statusText: 'OK',
                    headers: t.headers,
                  })
                : t,
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
