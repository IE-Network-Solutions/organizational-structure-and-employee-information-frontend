if (!self.define) {
  let e,
    i = {};
  const n = (n, s) => (
    (n = new URL(n + '.js', s).href),
    i[n] ||
      new Promise((i) => {
        if ('document' in self) {
          const e = document.createElement('script');
          ((e.src = n), (e.onload = i), document.head.appendChild(e));
        } else ((e = n), importScripts(n), i());
      }).then(() => {
        let e = i[n];
        if (!e) throw new Error(`Module ${n} didn’t register its module`);
        return e;
      })
  );
  self.define = (s, a) => {
    const c =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href;
    if (i[c]) return;
    let t = {};
    const r = (e) => n(e, c),
      o = { module: { uri: c }, exports: t, require: r };
    i[c] = Promise.all(s.map((e) => o[e] || r(e))).then((e) => (a(...e), t));
  };
}
define(['./workbox-00a24876'], function (e) {
  'use strict';
  (importScripts('fallback-cPFp8zdZu6NfewheSy0hB.js'),
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
          revision: '1a31920616d2309cb8c246767c8816a6',
        },
        {
          url: '/_next/static/cPFp8zdZu6NfewheSy0hB/_buildManifest.js',
          revision: '3e2d62a10f4d6bf0b92e14aecf7836f4',
        },
        {
          url: '/_next/static/cPFp8zdZu6NfewheSy0hB/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        {
          url: '/_next/static/chunks/0e762574-f41e02d330293e8f.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/1003-3a92bb59ed23604f.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/1004-829a41bbf89fcf34.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/1084-5936bde27ec49831.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/110-94e61e2b4f8fc056.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/1113-b2ec05ea48702bd4.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/11390db7-3039854f365bab9a.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/1160-92ddfa64cca8ac24.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/13-27762fccbdf60bbc.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/135.94cde4773e8a4989.js',
          revision: '94cde4773e8a4989',
        },
        {
          url: '/_next/static/chunks/1360-6ea396ae01b306c2.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/1461-076eb99832c53b7d.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/1494-283f744935dce840.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/1496-3ccc523be51604b0.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/1506-6b9cd7db900b50c0.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/152-4654c4751a375216.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/1569-ca7dd708990caf09.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/164f4fb6-a4176ac3c168486b.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/1684-0d2ba0432d471f45.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/169-0534f439e382a089.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/1741-6a8fdacaf4ed642e.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/1838.20f56d2166206178.js',
          revision: '20f56d2166206178',
        },
        {
          url: '/_next/static/chunks/1899-f05450d89e4371ed.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/1937-4b1855779ced76f8.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/2129-387976310b8dbb2d.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/217-042fbb0d89d3d0b6.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/2214-3fbc434ea396865f.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/2297-d569cb7c5e62252a.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/2324-5200cf3b8e66e960.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/2407-02b883dba9e635d3.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/2459-29bb771a59bd97ac.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/2540-1196df052061342b.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/256-3ec7caa236411b86.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/2625-506f52ccbf6435cd.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/2649-c2f4adb311cf1be5.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/3020-2a0333a1ef6cbd9f.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/30a37ab2-a460757850b45c64.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/3122-139722234464c644.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/3149-be90b16271bb1dcf.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/3166-10eecce52fb835ce.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/3190-5f7e66cad5f1f776.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/3223-15bb107cc8d920d2.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/3302-89da50ec469828d8.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/3539-00bdbddb82be77a1.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/3562-bd20a3ed84900dfe.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/3600-8886ee3a9acf1505.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/3608-5e7abb08ffe3f8e1.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/3742-74a5180b4a8e0535.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/3788-0bd9fb6e44e38563.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/3800-a62d94d76ef053e1.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/3829-e2e2e5201b8dfb95.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/3839-146f4d7e2978d659.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/385cb88d-551da5ab57360a6e.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/3883-858b941455ebb394.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/3884-340a76fa2167133b.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/3896-83c3f40c7924ab3b.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/3936-e3e54a085de034df.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/3961-5d0f8f32c955ff37.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/3962-4a6cc9d2a4d968aa.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/3d47b92a-2223e9f4e3874a9b.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/40-aac7ca11696667f7.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/4025-d4f897b0665368f6.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/4066-f8d3aa2457825c3c.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/4163-8479bfef91317746.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/4165-18d1fbbb2d580e44.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/4230-e0142e2f022c6719.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/4535-7ec1ee0db41169b6.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/4616-a107cb3c4e05b146.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/462095b7-a435d8e876f42bc8.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/4624-d5b4909807a1f662.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/4661-2bdae7f510ed8bbd.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/4697-779aeece82aef1d8.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/4786-0439848d42fb33d5.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/479ba886-a1bc7036e103b388.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/4858-e414fe721f074bb3.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/4873-d34a30a91f2adfdf.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/495-d557bf47d755db6d.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/4979-3c039268bced431e.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/5002-ee28286223a0f6c8.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/5066-af3be86ae33ec420.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/5295-4ed0bb71788d7db5.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/52ab8b6c-cab1d6bac8bb745b.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/5325-757895e7e2f8d04f.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/5345-fd429f21262d4afe.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/53c13509-ac5efc0264558f44.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/5406-d2f985c010a362e2.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/5443-270f89406cb0298b.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/5479-7d91beacf09d0b75.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/54a60aa6-e47e3bfc808452bd.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/5507-b1721782372d6c67.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/5548-96dcc0de1a419dcd.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/5569-e94b324b73424c93.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/56-69a5dfe97f26d743.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/5619-4b0cf66774799fb9.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/5637-2b9230291ba60fb9.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/5703-4b19a5cfebe6e83a.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/5738-1ef5d730314707b6.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/5758-8ba45397ce078661.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/5783-4bb4f91e531c7904.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/5785-3ec6b8b24c7df5b0.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/5786-5122ae8e45441c20.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/578c2090-fb35812c82abe289.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/5836-3a37877dac23c707.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/5892-4181386cfcc93dbd.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/5913-c1e2f445ac27940a.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/59650de3-53e6059f01606fe1.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/5e22fd23-f8d7602ebeca6f1d.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/6007-354aa4d150a0ff4f.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/6040-aced153bce93bae9.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/6098-006514ac8adde89e.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/6101-a9ba50f5c97e0d70.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/6141-e464dce8f1bc63c9.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/6151-53c285bbee4056ac.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/6168-535963cd1c63305c.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/6255-69af6797c15ffa2c.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/6317-90c7024fede054ee.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/633-a7cf8feb77422bb1.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/6350-2fb957c5062f497a.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/6406-30c0f373df38f3c7.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/6469-f128732aaf9ff721.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/6512-9e6e90f3f1050e34.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/6518-5ba0f7ce9f2c7f9f.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/6567-e8f25dd7aaddf848.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/6697-2242b81dec21f0da.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/66ec4792-cd23fa2e2c460383.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/6700-873fe5bcfad66ed8.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/6716-b3c41837bc5f54b8.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/6780-52e6e4304b6d962b.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/6817-cc67caadbbeb54b7.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/6827-b4bae0bba41027f0.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/6901-4c656e8789e263b9.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/6959-126c74f2a6fbd970.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/6977-218fc6b56520eb1d.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/69806262-346e49452de380e4.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/6edf0643-3339f6c96a12fdde.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/7005-e187f4e2cc960338.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/7023-bf025b709ee5eb0d.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/7064611b-4506a439cc3ebeed.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/7088.c8abebd0266ef78c.js',
          revision: 'c8abebd0266ef78c',
        },
        {
          url: '/_next/static/chunks/70e0d97a-92de8b1495483d75.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/711-74c7bfd4974500bd.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/7138-8ad09c5bd276b562.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/7168-e8d87bf1606aaff2.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/718-ab233b19a6415f70.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/7182-99d9f534e1b82e33.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/7220-537852e4c223e7fb.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/7269-507e425591b0e5f6.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/7342-78175ce51212114c.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/7365-baaf1763480d1704.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/7460-899b3d0259d7c11e.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/750-c7307e886edde4b5.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/7621-9806027b2e4a3ae8.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/7701-af579757ed02b82d.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/7714-729e9311667decc7.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/7842-3c6274f4b8958765.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/795d4814-e90754b0b008657c.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/797-87a6dd0c24fef6e0.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/8025-18d1366519bec659.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/8044-ad6caa7f518c4067.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/8122-54f11e1b4b79b214.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/8202-69765f7104431667.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/8256-cbb5ffa4840bcab5.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/8285-f645bb9cc876a75a.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/8328-ab3d2bb5f20b5ec7.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/8354-71fb3549e6592274.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/8357-091e6293047401e4.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/8375-45bf39ad108a65a9.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/8387-2d9caaf8839426c9.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/8406-fbb4464a4d13076e.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/8436.acfc52fd47e83fa1.js',
          revision: 'acfc52fd47e83fa1',
        },
        {
          url: '/_next/static/chunks/8441-523ff4a56ffb5ff0.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/8556-d24451333e9e6c73.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/8562-32555e6fa894ab83.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/858-c2c8c2661afcabf2.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/8663-9fbdcdeebd060eb3.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/8671-2853bdeb70d5fce5.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/8784-b75a67d942415a77.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/8836-291458eba48ac32a.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/8874-b02045bb571b57f3.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/8889-a59d5b3ade0307fb.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/8e1d74a4-31fc1d6a42fd4136.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/902-9309737002ac086d.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/9025-24aa48b882698a06.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/904-49fa8ceeff530b67.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/9046-923c97ab8b277dfb.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/9143-ad0f18b1a24da76b.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/9172-b65e3e715e196469.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/9198-8e2eaccbdf07997a.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/922-c2eea56585075128.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/9257-3eae50947ac25f89.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/9314-ebb16b0fe3de6548.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/932-00611e91792ffce4.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/9403-154bb7dcc7a1cbdb.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/943-12145dccaf9a5dfd.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/9464-e407242d6df7f315.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/94730671-b4487d1e3f624427.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/9497-9758af42128cae0d.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/9548-9faa6f95b5ce8e48.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/9564-83a378fb4a6bd7e0.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/9637-8d6adcb01e1fcc4e.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/9790-68a3c15722539334.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/9795-891a785929cd6f1e.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/9804-394308b6d17e4462.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/9876-278ce26544edf32f.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/9973-6c23c4ca28b207a7.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/9974-3edafd0f88fbf67d.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/9c4e2130-430144973dd74575.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/ad2866b8-b2aba5370a0d21e8.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/%5Bid%5D/page-58814d41f636cd94.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/allAllowance/page-de814588f6e2dc90.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/layout-989a2853d01a1e56.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/page-97b55a35be7c4723.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/%5Bid%5D/page-b513a6948dedd4f0.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/layout-562a24c828a2573f.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/page-612edd0b011c0513.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/variablePay/page-0a9f5b43d5ee8eaf.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/allowanceType/page-9fff97bceb144211.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/benefitType/page-6e69f14e56e7691d.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/deductionType/page-e0c47afa6d17e751.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/layout-5451991fbecadc7f.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/page-82b8ed9973946f6d.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/%5Bid%5D/page-240faa950cf793c3.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/allDeduction/page-22f470d9f401ffd0.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/layout-d81fa41d43c527bc.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/page-857142973a951ab8.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/departmentRequest/page-d9d3b1aba71f07db.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/manage-employees/%5Bid%5D/page-02b15ec0635f2626.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/manage-employees/page-5a718dc643649543.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/notification/page-2691a25090b39d20.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/approvals/page-52c075b21bdecf91.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/employementType/page-655b20cd0cce9307.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/layout-eba56b874a5a3684.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/page-7238ac97dac6777d.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/positions/page-7c135fa3bcdbc169.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/rolePermission/page-a0f08d2f76c8504c.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/action-plan/page-3c157deec02514df.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/categories/%5Bid%5D/page-bc106685ff5b99c1.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/categories/%5Bid%5D/survey/%5Bslug%5D/page-dba19798ad64a7ec.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/categories/page-0087f1d4f613e773.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/%5Bid%5D/%5Bslug%5D/meetings/page-a914182d8c71f861.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/%5Bid%5D/%5Bslug%5D/page-b6d97f7c6b8f9c07.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/%5Bid%5D/page-0ee2413152bfb695.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/page-1e5abf434a05cf43.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/feedback/page-dcf2a80e142d2e8e.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/meeting/%5Bid%5D/page-adb5e1f3cad217bd.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/meeting/page-0ad828f8f6a5009f.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/recognition/%5Bid%5D/page-d8dd19038dd2b8c5.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/recognition/page-8596d93ab4724573.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/define-feedback/page-4172719aae32565d.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/define-meeting-type/page-95ff4c62ddb8741d.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/define-questions/page-0261680ee8a80602.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/layout-7bbdd503b9dbc212.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/page-e2324711556fda39.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/recognition/page-5933ba586dfc5713.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/target-achievement/page-9d77e225b7154348.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/compensation/all/page-673b0b543823a84a.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/detail/%5BdataId%5D/page-75faefc8af1a127e.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/page-8eb4f2145e07aefe.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/payroll-detail/%5Bid%5D/page-d8a3e307c277d445.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/%5Bid%5D/page-779bb12ae0ebb096.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/defaultIncentiveCard/page-ab9349e3bafb27f0.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/layout-cb406d1e70a20eaa.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/page-6b942082e98fdb92.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/variable-pay/page-861e4cee42c5456f.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/page-26ff4ddb04a2134f.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/reprimand-appreciation/appreciation/%5Bid%5D/page-38c1c5f34a37fffc.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/reprimand-appreciation/page-b39236c58cbfaa23.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/reprimand-appreciation/reprimand/%5Bid%5D/page-3f909d3f013a2c76.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/dashboard/%5BemployeeId%5D/page-1303107afee0ecdb.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/dashboard/page-f536c959c1347a65.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/page-649382ec842ff8ac.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/check-in-rule/page-4f8ec612a2427d44.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/criteria-management/page-f51f65ec96922547.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/define-appreciation/page-051f875275d21dd0.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/define-okr-rule/page-00a2844a04397d1f.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/define-reprimand/page-266ce7c88a69a2c3.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/edit-access/page-b2c91949c3671579.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/layout-8e5f332d73358857.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/okr-setting-menu/page-c9e165e1d610abe2.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/okr-type/page-fc8e457acbdf7178.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/page-9c1454a8b5b40872.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/planning-assignation/page-d19776e43fb297f3.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/planning-period/page-f5f3344e27a700c1.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/target-assignment/page-b37ca5ba395b4d07.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(onboarding)/onboarding/page-51cf5f00e53fa1fe.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/layout-89f55d4d47df46fb.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/org-chart/page-645657f6ca688b7d.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/org-structure/page-2e69760b0e8b570f.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/page-8c66c881a348f221.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/branches/page-b00a856d8c2d2cef.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/fiscalYear/fiscalYearCard/page-a0e7842531f40b57.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/layout-28c94bb2f6caa9e3.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/page-12f888726933b8d5.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/workSchedule/page-8804dddacf3a4d2f.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/employee-information/%5Bid%5D/page-3ec3f2d5605a4e57.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/employee-information/page-682bbe5b8e742268.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/myPayroll/page-fa705635a0a0efe2.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/payroll/page-0634dd87fd825d19.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/payroll/reconcilation/page-342117c785b1741d.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/approvals/page-b34ffc8057c9a950.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/banks/page-42ece478db4b894f.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/layout-2b75e3eca7b4572a.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/page-8e559ef8b67edfda.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/pay-period/page-89eb17d146439d5d.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/pension/page-d9ee7b227f445daa.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/tax-rule/page-ed08ebb576b423c8.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(planningAndReporting)/planning-and-reporting/page-c36c6ab769b9b413.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/ai-job-matching/%5BjobId%5D/page-714776a92ff8d19f.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/ai-job-matching/page-c1fb4ee38e475db7.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/candidate/page-3dc6ef931e800dae.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/dashboard/page-6859911acee693bf.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/hrflow.ai/candidate/%5Bid%5D/page-66a38131690a03d0.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/hrflow.ai/page-34088d98fb78f384.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/jobs/%5Bid%5D/page-dfef92e9ddb8f831.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/jobs/page-56e5c19f2e43e0e1.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/customFields/page-757ef6fd86b4a571.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/layout-3b1e8fea85d396a5.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/page-66953d3048085c7b.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/status/page-9cadc2c08967648c.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/talentPoolCategory/talentPoolCategoryTab/page-b13ba594dce0f6ab.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/intern/%5Bid%5D/page-99d6eb5c8868e978.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/intern/page-8a72cca8530ce950.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/page-49eceda1b4c12c2f.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/talent-pool/page-435ef0d1112cca57.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/talent-roaster/%5Bid%5D/page-4aa31d87d18bef1e.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/talent-roaster/page-834c8e43b392b01f.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/dashboard/page-71c3e3e3c50e7b70.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/employee-attendance/page-b4bd1169ad2082b1.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/layout-ec66984d942360ef.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/leave-balance/page-71547e38aaf01e34.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/leaves/page-2d9a31c75f4ba725.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/page-f086a6ef9d5d7dff.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/my-timesheet/page-dae736ebf763ec10.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/accrual-rule/page-84fcff91f99686b0.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/allowed-areas/page-02806a157b97526d.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/approvals/page-58ffe823db7c3774.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/approvals/workFlow/approvalSetting/page-3bf60755b3d46479.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/approvals/workFlow/page-af2b61e9475946a1.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/attendance-rules/page-5cdacdce5e6adeff.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/break-type/page-38eca78ca97f599b.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/carry-over-rule/page-77c049bfef3d17a5.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/closed-date/page-3a98d1d43c1fecfc.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/imported-logs/page-ade8d28157bf663b.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/layout-678f606c55abadb7.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/leave-types-and-policies/page-45ad957403ab941a.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/page-f7e2b3cce7da022d.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/time-zone/page-598d9b84c4aab2b2.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/zkt-addon/page-024bbfdbd470c383.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/%5Bid%5D/%5BlessonId%5D/%5BmaterialId%5D/page-cdaf3b9c652d6153.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/%5Bid%5D/layout-2c37768be3d0c454.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/%5Bid%5D/page-bde179c140eeeb0f.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/page-b7f876ebb76b2bc5.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/my-training/%5Bid%5D/page-4fee8af33c60209b.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/my-training/page-5b06fbcac1808c75.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/review/%5Bid%5D/page-e32c320214fee4f9.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/review/page-23066c2889354496.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/approvals/page-505ad0643a16e374.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/approvals/workFlow/approvalSetting/page-a091b2bb8afef17f.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/approvals/workFlow/page-2640a00a4a4fbe40.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/commitment-rule/page-4a8b295c7f90df13.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/course-category/page-33dfbe40d06ee346.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/layout-f997d30d92fac3d9.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/tna-category/page-468545a9e97cf1d0.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(weeklyPriority)/weekly-priority/page-5f69142ca2504582.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/billing/page-1800704bae365626.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/dashboard/page-2c585f62092bd7b3.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/invoice/%5Bid%5D/page-e3155cdd199895bb.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/plan/page-9d0f2f5aec4d2d76.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/profile/page-704c6e37cea5211c.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/audit-log/%5Bid%5D/page-07ed6dfd9d25f2f7.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/audit-log/page-89ad11f14d77bdd1.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/dashboard/page-4de7dd07674eaacb.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/dashboard/vp/page-c882b8bd15d3ac2c.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(beforeLogin)/authentication/forget-password/page-388a45c65ddaffc5.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(beforeLogin)/authentication/login/page-a94e33ee9491ee29.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(beforeLogin)/authentication/new-password/page-8fac24fb47fe95ee.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(beforeLogin)/authentication/reset-password/page-c6e7024a9df42866.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(publicForms)/job/%5BtenantId%5D/%5BjobId%5D/page-b6bd34359d97db4b.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(publicForms)/job/openPositions/%5Bid%5D/page-fb255ea5e4fbbf35.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(publicForms)/job/openPositions/page-e23ec7b0c8cfb705.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/(publicForms)/surveys/%5Bid%5D/page-a7eee66618e94567.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-89110f115e3059ee.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/layout-f522ce6dea5e9a11.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/loading-30bc5f0b7c1a1a3b.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/not-found-4a8e316ce7d68f8d.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/offline/page-ea19f73483fd21c3.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/app/page-964bb518e4c261e8.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/b2d98e07-1948317d489cbde4.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/b563f954-d3ca46153dc3fcb3.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/bc98253f.aa27182464c58412.js',
          revision: 'aa27182464c58412',
        },
        {
          url: '/_next/static/chunks/c916193b-01e71ab4a1fb4de6.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/ca377847-cc336e09288b791f.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
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
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/ee560e2c-2dd2c9b10bfe0f85.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/eec3d76d-327495402e145a9c.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/f25cdb8d-0a4b9d1ee45595fe.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/f7333993-dcee63933cda82cc.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/f8025e75-99fe32d3f26cd165.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/f97e080b-3d8720c4bd1fda1b.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/fd9d1056-f067ed350b7d4b38.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/ff804112-19c01e31cf8a2d42.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/framework-56dfd39ab9a08705.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/main-6bc5cf961353e384.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/main-app-617d369b09134a95.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/pages/_app-f870474a17b7f2fd.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/chunks/pages/_error-c66a4e8afc46f17b.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
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
          url: '/_next/static/chunks/webpack-0759351cf33435f7.js',
          revision: 'cPFp8zdZu6NfewheSy0hB',
        },
        {
          url: '/_next/static/css/015f3e7ccfd4b514.css',
          revision: '015f3e7ccfd4b514',
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
        { url: '/offline', revision: 'cPFp8zdZu6NfewheSy0hB' },
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
              response: i,
              event: n,
              state: s,
            }) =>
              i && 'opaqueredirect' === i.type
                ? new Response(i.body, {
                    status: 200,
                    statusText: 'OK',
                    headers: i.headers,
                  })
                : i,
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
