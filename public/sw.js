if (!self.define) {
  let e,
    i = {};
  const s = (s, n) => (
    (s = new URL(s + '.js', n).href),
    i[s] ||
      new Promise((i) => {
        if ('document' in self) {
          const e = document.createElement('script');
          ((e.src = s), (e.onload = i), document.head.appendChild(e));
        } else ((e = s), importScripts(s), i());
      }).then(() => {
        let e = i[s];
        if (!e) throw new Error(`Module ${s} didn’t register its module`);
        return e;
      })
  );
  self.define = (n, c) => {
    const a =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href;
    if (i[a]) return;
    let r = {};
    const t = (e) => s(e, a),
      o = { module: { uri: a }, exports: r, require: t };
    i[a] = Promise.all(n.map((e) => o[e] || t(e))).then((e) => (c(...e), r));
  };
}
define(['./workbox-00a24876'], function (e) {
  'use strict';
  (importScripts('fallback-4L5zlroQbpd3YcEfgB-zw.js'),
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
        { url: '/Group2.png', revision: '8091a52f6cbda42879a61425a6d59b10' },
        { url: '/Group3.png', revision: '75d095eab2dafa749c6888f1ecf4e0b0' },
        { url: '/Uploading.png', revision: '6d146f1e502895fc44f2587b1d0f975c' },
        {
          url: '/_next/app-build-manifest.json',
          revision: '204e9319708a6fb33eab6a906352011d',
        },
        {
          url: '/_next/static/4L5zlroQbpd3YcEfgB-zw/_buildManifest.js',
          revision: '3e2d62a10f4d6bf0b92e14aecf7836f4',
        },
        {
          url: '/_next/static/4L5zlroQbpd3YcEfgB-zw/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        {
          url: '/_next/static/chunks/0e762574-0dd1eb9fd2fc7f83.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/1009-610998db9383a7cc.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/1057-00cae2f53f773d00.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/1072-bdeb4ec3570da627.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/1113-75d86b1097ed0634.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/1117-5ccb4f1aaeb331c9.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/11390db7-3039854f365bab9a.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/1260-0ef7d17e57d0a539.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/127-b1f97db4b4bc3f3f.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/1279-e97e285c163ffe43.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/1304-e6e25894f8ac507d.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/135.94cde4773e8a4989.js',
          revision: '94cde4773e8a4989',
        },
        {
          url: '/_next/static/chunks/1354-1475cf8485204140.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/1412-3072f7bdb1672067.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/1419-84b70f5d3b99bd45.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/1444-b561161b87253de9.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/1463-28df8937064d5e44.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/1464-ed1f3e45ad8ff073.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/1482-26e197c6121d6218.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/152-7d7bb0603cc5123e.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/1616-00a9d19127bdf3cb.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/164f4fb6-65892ce74f91e5fa.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/1678-324b05a8c7237aea.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/1684-5ed874a0feb09991.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/1705-0cf1675f0344803c.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/1763-f6bc6aa319d2f7ad.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/1769-e02b31e0cc490d7d.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/1792-9e8693e45ae7e7f1.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/1838.20f56d2166206178.js',
          revision: '20f56d2166206178',
        },
        {
          url: '/_next/static/chunks/1841-712e736ceee160fa.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/1843-10d60b5e53dbf993.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/1846-2af0888dcfc0ad67.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/1901-2d64a66e51ff53e5.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/1937-e10ae3e722d797a0.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/1a258343-d7886f0e3112a778.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/2095-54c26e2964ed596a.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/2117-0eb35fd5d4d7c97b.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/2126-0388a4457cc7fb4b.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/233-29da5bf7dafb665f.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/2451-73d74c31f7b75046.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/2459-0a2f77b3189b53d2.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/2467-4af33791e584dcaf.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/2526-d85e36a01219fce2.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/2529-10f3f92ba6399baa.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/2533-1a10a2fa030a37c5.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/2591-2693b216ec0b220c.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/2604-5f16367d70ddaa5e.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/2625-b4cf9a3b47932b0c.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/2649-c614c122b10f8ec8.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/2663-52c4b9e6ecf83516.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/2800-3ceff4a1a70c8c0d.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/2845-cf1f905b69223f98.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/2854-015286e7cd43e582.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/2886-88ad43c85d9091e4.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/3054-85166d614a8f3c03.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/3122-438619afc8a205c6.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/3144-cba48cfde87ff25f.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/3331-43d5149c34748991.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/3407-a3cc181d1fe3fa72.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/342-8c430b276e0c7445.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/3448-b59034ad36ca8929.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/3463-114e98bf89fc0ad7.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/3533-bfab84e276db6e57.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/3557-19d4ea270f9f8080.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/361-6bc683b6bd0a0af9.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/3730-3795a9c54ccce3f7.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/3742-cb0eb2f2a0316583.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/3752-edf72dbb01c3aa21.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/3788-4c527d3ff157af9f.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/381-3e935f52835eb683.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/3813-7c771252bdd42b35.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/3829-4fed16d8cdedaa98.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/3831-22b896bd98b1639e.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/385cb88d-551da5ab57360a6e.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/3867-7639f452ce3dd371.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/3884-fad8bd0afb5a7d57.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/3888-544a475671c85d36.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/3896-e3063bc7e3210b1c.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/3938-e023a2b8c6323b3b.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/3d47b92a-7b95cc4188e33278.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/4062-ef1fe3f30403754f.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/4066-c20d9fde79dfb2f8.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/4071-be76d400d006bf7d.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/410-0a76730939e65d5c.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/4179-be96bf81a4c03bae.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/419-3c1c1cc16c21eaaa.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/4230-739d33560047ce59.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/4270-9b27bf14550fc545.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/4293-b6b114df5825f283.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/4301-f05a80dc6fe32168.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/4369-2c6f8c21ed05570c.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/4383-d696532e4bc81cef.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/4456.5164344691fad66a.js',
          revision: '5164344691fad66a',
        },
        {
          url: '/_next/static/chunks/4559.238e3f485662c60a.js',
          revision: '238e3f485662c60a',
        },
        {
          url: '/_next/static/chunks/4561-2c56365d16622434.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/461-6765fbb504444ec9.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/4615-5355872fd66f56c5.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/4616-12a1541a95bc1a75.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/462095b7-a435d8e876f42bc8.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/4634.fc13e13ca54f496a.js',
          revision: 'fc13e13ca54f496a',
        },
        {
          url: '/_next/static/chunks/4657-d0e73be7694bc9a1.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/4701-83a55b6d03de6880.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/4729-4ceebc2c23704464.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/4749-cbb7ad4cbd4aae31.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/4786-f94f90d3d05b86af.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/479ba886-595c1041f69abdd3.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/4850-6e689e4b2cf84278.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/4851-d930b10e6d54f24c.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/4866-fd20bf00fbbd5c29.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/4873-d34a30a91f2adfdf.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/4898-30d14ccb309a1d29.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/495-8efbd80f355fd0d6.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/4979-58f13a672183bf81.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/5066-5a6613cdc3f62af9.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/5090-23fe74076b848c4a.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/5149-f3a50c6d4376c06c.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/5196-d5b759639c365b2c.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/5247-a28e4d9fa2df3e76.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/52ab8b6c-cab1d6bac8bb745b.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/5313-bbc0d8ec3a3eecee.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/5395-f36cc7511bdd0566.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/53c13509-4cd23936269a3758.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/541-0d8ece9a0736203f.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/5441.c13ed7100cfc04f2.js',
          revision: 'c13ed7100cfc04f2',
        },
        {
          url: '/_next/static/chunks/5457-97a270af703ca673.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/54a60aa6-e47e3bfc808452bd.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/5504-7af6d172d5c1fc84.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/5569-70985c82269d71f8.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/56-cace0657fbc530cb.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/5617-202cc2a233efdcaf.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/5637-58f0da3aa9c1da38.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/5644-55340421b7292a23.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/5738-c36b5f8298848f52.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/5753-7793384401da33c8.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/5785-8ea0b21be0a802e5.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/5786-da7231acedabd4cf.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/578c2090-fb35812c82abe289.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/5803-dfc418a471e319c4.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/583-2782146bfd768cc6.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/5836-3a37877dac23c707.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/5840-f4a5d0d4e9cbecb2.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/5913-825f296c9e8bbc4d.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/59650de3-947185c9c61b9991.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/5e22fd23-b67266bc6b8d3abd.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/60-130f6df1ac0f078e.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/6006-90130581749ce5d6.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/6132-a7151072977ec083.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/6141-410492797660188f.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/617-a4fe299454990e10.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/6186-80c15ac378531246.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/6255-b7ded7e6d1b3c6d3.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/6285-c6a0ed1211b0b7e1.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/6317-2d02bacfb38e74d0.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/634-1329dcacadaea99f.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/6352-7d290af5b50b2c5b.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/6369-9ddab94e8d7fd347.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/6472-0bcf7612e8654d7f.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/6474-b73e1b47a73f3765.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/6512-c61b5afc941e6016.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/6644-117e9ca5c6ed73af.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/66ec4792-a0ad2a1c3c834b13.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/6700-e05de56fecd9c449.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/6703-1e243089f2a1e353.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/6750-493382be39e880d5.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/6755-59c93dfb692f5e90.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/6817-e63f81424713d6d1.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/6827-b51bd69ef5a79185.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/6832-857a692d4d089096.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/6846-916cd9d4ef606ccf.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/6977-9a1e9e0b41343bec.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/69806262-346e49452de380e4.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/6edf0643-3339f6c96a12fdde.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/7023-3a850748796d1c32.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/7029-48ac2693a96d388b.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/7064611b-4506a439cc3ebeed.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/7088.37794a5f598f849c.js',
          revision: '37794a5f598f849c',
        },
        {
          url: '/_next/static/chunks/70e0d97a-92de8b1495483d75.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/7106-6a2b99afcdd0e50c.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/711-38c9d882fb1ec239.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/7119-260f1c95e4e64a83.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/7128-c3ce0aa301b4832b.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/7138-5b62d0c76b2ce562.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/718-bb4a126d91291ee1.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/7239-58f854caa9ee8b92.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/7250-f8fa960d773026d9.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/7269-3f72eedc8306ed3b.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/7383-6df4b9afa426488a.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/7435-30190ed15a8f5e3e.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/7436-5267b2388a8cba7f.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/7455-dd07c208c16625b5.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/7460-84c4327af5df5609.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/7485-bfd5f49c5c226165.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/7494-5f33ac2f756e70d0.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/7523-bc2f9951d668b209.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/7631-4ce7f9cb196c89c9.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/7642-3c90a0ddfd11d410.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/7652-fe3d4198149fbf2b.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/7701-3bfa552130778c48.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/7806-724844b40f1a94ab.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/7912-93134d0011098bb6.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/7940-08c5f2ef6abbc762.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/795d4814-77c80f84df43a9bd.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/8017-2ae329a97432f220.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/816-e4ac8335ccd9adb2.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/8270-f2f99a7fa1f0dd2b.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/8337-5f0e30420d646a8e.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/8354-198e025b4b891e7d.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/8357-52bd5a17fd224703.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/8390-9d04386bcdd518bd.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/8406-da490f1b9b7b5431.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/8413-1ee1957a1ecea1af.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/8415-16dff8fb42dd30fc.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/8436.acfc52fd47e83fa1.js',
          revision: 'acfc52fd47e83fa1',
        },
        {
          url: '/_next/static/chunks/8442-00d6c2dedbd7cc45.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/8521-9ca3eee0234774f6.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/8625-e672f8aa09ad48e3.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/8662-ff3ae1f228317661.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/8766-81f55a132c1a2561.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/8836-0f47be9d9a0e5e45.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/8856-7131e6e54c73edc9.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/8950-aaa22f833468e535.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/8e1d74a4-da5f0a0a604fcc9b.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/9010-62a7af165f286c94.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/902-9309737002ac086d.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/9081-f7c18468e6bbe2fe.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/9155-b48ece4770c5d93f.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/9189-adaf5a5b6aed5280.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/9198-23fd119f818f7e2c.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/9199-7e0ffd2b1c60ff68.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/922-9c145005994ee37c.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/9240-287e78578254011c.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/9255-7f3c480c772f40d5.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/9257-b49f80ba164d47ae.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/9461-624716060a184cff.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/9464-140b060322f33885.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/94730671-0606797528157869.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/9547-9f9fe239d8459673.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/9626-ada9e33cb9817116.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/9628-1d79d9ca26241723.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/9633-dee9a8e2f2faa8cb.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/9678-585e1dc9356657b9.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/9751-fcd30644cab75e0d.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/9795-855fd5b1bd82e569.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/9847-82d8c49c3d0dbee1.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/9882-eb98b01523aee512.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/9907-692932070602e9c5.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/9974-6ecb744b4543cfab.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/9c4e2130-e45b786271cc9735.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/ad2866b8-b2aba5370a0d21e8.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/%5Bid%5D/page-e9d172c6c8261105.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/allAllowance/page-a54f1d0769143c9c.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/layout-eac23d52b4a4af99.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/page-97b55a35be7c4723.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/%5Bid%5D/page-fefe599010194352.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/layout-c5131017db0a8d57.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/page-612edd0b011c0513.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/variablePay/page-6690613f5188fc1d.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/allowanceType/page-174479536427e962.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/benefitType/page-e381e4629050e77f.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/deductionType/page-c938097726ecbf53.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/layout-512c2a342210c5b5.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/page-82b8ed9973946f6d.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/%5Bid%5D/page-1b2c70d9ed6dd13b.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/allDeduction/page-4f9c48dc2b103ca3.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/layout-f5436d777bc3d92f.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/page-857142973a951ab8.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/departmentRequest/page-03c6179c81993589.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/manage-employees/%5Bid%5D/page-bd5abd2f7ae36d45.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/manage-employees/page-5784e9cf4fe04b31.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/notification/page-c905ef0515fffe79.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/approvals/page-f969a2c53d76cb97.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/customFields/page-7f5dded05ec6ebf1.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/employementType/page-4d6da2b2fd817b46.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/layout-2d7c36d2e909595b.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/page-7238ac97dac6777d.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/positions/page-3d6d1b7751288a66.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/rolePermission/page-537fe122be55ab1c.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/action-plan/page-44c5178a46bcd047.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/categories/%5Bid%5D/page-7034f21d955b7ea9.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/categories/%5Bid%5D/survey/%5Bslug%5D/page-16dd8e50be86d2bf.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/categories/page-22651d06bc7ae7b3.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/%5Bid%5D/%5Bslug%5D/meetings/page-63ef234339cb48fb.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/%5Bid%5D/%5Bslug%5D/page-598fbb4207002f6c.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/%5Bid%5D/page-9d9b2f12ea324a4d.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/page-5e466e844fbdd0a7.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/feedback/page-d323f656e7e3e3be.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/meeting/%5Bid%5D/page-e73771b475bf91ee.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/meeting/page-04ad650628d794c0.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/recognition/%5Bid%5D/page-e195b482248b3c5f.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/recognition/page-da4d7ba0b3b667a6.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/define-feedback/page-3c5ed873b32adc30.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/define-meeting-type/page-4163bbf23fb229be.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/define-questions/page-964b400a5f3dcf6d.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/layout-a1b21175d3177ffb.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/page-e2324711556fda39.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/recognition/page-f30a56cadcde52b6.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/target-achievement/page-f0a98f7c3f030028.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/compensation/all/page-99c118b69867a7e5.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/detail/%5BdataId%5D/page-0c46312988cf5834.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/page-0902f63085f2594f.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/payroll-detail/%5Bid%5D/page-5e9f9d0f62071b55.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/%5Bid%5D/page-f2bd4e065106c294.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/defaultIncentiveCard/page-e9eae58cafffa73a.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/layout-7f538ff29d1043cd.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/page-6b942082e98fdb92.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/variable-pay/page-2f2d5ddb44378689.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/page-fb63a0bf18c29f4e.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/reprimand-appreciation/appreciation/%5Bid%5D/page-b3dcffaf176bdcb1.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/reprimand-appreciation/page-d1c01e6a3459f740.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/reprimand-appreciation/reprimand/%5Bid%5D/page-ef78155ad38978c8.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/dashboard/%5BemployeeId%5D/page-061a8798929c28dd.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/dashboard/page-a725fe25c05d6914.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/page-ee7770275cdeb5a8.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/check-in-rule/page-fb745a835a183bae.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/criteria-management/page-c5684c966f4cb0c7.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/define-appreciation/page-0e6de63a736a339d.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/define-okr-rule/page-547ba3888db85630.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/define-reprimand/page-da21f0da065e480a.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/edit-access/page-9a47014008553563.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/layout-35c79cbb7c1d73d5.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/okr-setting-menu/page-3c07bfa161f0a7fe.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/okr-type/page-06d7a325a67bdc01.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/page-efd008d31c54d8e8.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/planning-assignation/page-488045386ac38d31.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/planning-period/page-dccea651b9cb792e.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/target-assignment/page-7636b23e9cfda52c.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(onboarding)/onboarding/page-d53de1dfc97e90f3.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/layout-ab0f14ff7015b48f.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/org-chart/page-7d161470fb2af2dd.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/org-structure/page-40902eb631994237.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/page-55f00331b15ec0b6.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/branches/page-de5cb28951ae92d6.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/fiscalYear/fiscalYearCard/page-3e4c7e572ebb78de.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/layout-50cc5b7ab5f4f108.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/merge/page-8663aeac4973ccc8.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/page-12f888726933b8d5.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/transfer/page-2085a06ccd655a26.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/workSchedule/page-7a3fa55c051a7ae2.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/employee-information/%5Bid%5D/page-f429a3ea727035be.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/employee-information/page-c8c92ed82e11da36.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/myPayroll/page-ef415a495c6980ec.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/payroll/page-46294dc1a33fb066.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/payroll/reconcilation/page-eef91d57d1e06d2b.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/approvals/page-63a5d304051d7350.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/banks/page-6ca236878387385e.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/layout-a821795fc7d4bde0.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/page-8e559ef8b67edfda.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/pay-period/page-a2e47b982ea33a54.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/pension/page-2fc83bd05bf514b8.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/tax-rule/page-748b092391cc5024.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(planningAndReporting)/planning-and-reporting/page-e5b60f79fdbc884e.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/ai-job-matching/%5BjobId%5D/page-19d8cf428d38eced.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/ai-job-matching/page-cc6198ac5c113e28.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/candidate/%5Bid%5D/page-488b4c6084e25cc4.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/candidate/page-9ba3d33288e6c783.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/dashboard/page-d4583e951b88f049.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/hrflow.ai/candidate/%5Bid%5D/page-66a38131690a03d0.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/hrflow.ai/page-258a058d160b8f48.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/jobs/%5Bid%5D/page-44de66af17592b4f.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/jobs/page-384f52858931e065.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/customFields/page-8c26be0f90fa83c9.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/layout-864a4b9bff47be3b.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/page-66953d3048085c7b.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/status/page-5fce5ff3a8654994.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/talentPoolCategory/talentPoolCategoryTab/page-7a5f9cb9a9a1a31c.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/intern/%5Bid%5D/page-3a26ed3f00fee35e.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/intern/page-c149f923106a69be.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/page-107b05d6520e813f.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/talent-pool/page-4a52c69c2f9d14cc.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/talent-roaster/%5Bid%5D/page-29c4b9c76c970051.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/talent-roaster/page-3205befabe096dfa.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/dashboard/page-6571f2b4e9210cb7.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/employee-attendance/page-e0b631127fb693e7.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/layout-3b3ee883b1f8ca25.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/leave-balance/page-9f3522496319722e.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/leaves/page-86f66bd4f2f9b715.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/page-f086a6ef9d5d7dff.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/my-timesheet/page-c6cdf9830448c04f.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/accrual-rule/page-410ba8530bc40d9a.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/allowed-areas/page-a3f3dfd6413a6709.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/approvals/page-e23166bf2fb9d3a8.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/approvals/workFlow/approvalSetting/page-e27525960c41212d.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/approvals/workFlow/page-c00c82a320f1228d.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/attendance-rules/page-abbe2a4639577c60.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/break-type/page-e8b62ea3586955ad.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/carry-over-rule/page-7d3135caba38b128.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/closed-date/page-5cae546782537a0c.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/imported-logs/page-763672c9cd0a052e.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/layout-1a49ee1313bfeee8.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/leave-types-and-policies/page-bdda6076a62386ef.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/page-f7e2b3cce7da022d.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/time-zone/page-d5c6f895ec336036.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/zkt-addon/page-49cddb417a22e1a9.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/%5Bid%5D/%5BlessonId%5D/%5BmaterialId%5D/page-35ef7e77a6ed88f3.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/%5Bid%5D/layout-1130609510f88a6d.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/%5Bid%5D/page-1ef1d646ea605410.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/page-f3d7567104529595.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/my-training/%5Bid%5D/page-6c148f795fc9b284.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/my-training/page-cdea83e2b3eb14a3.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/review/%5Bid%5D/page-f897b9ed9906d8a6.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/review/page-7600ae37b7893af9.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/approvals/page-966320441fad3359.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/approvals/workFlow/approvalSetting/page-a7bdf5b6cf2bec6f.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/approvals/workFlow/page-8e7dcab522ea5dc1.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/commitment-rule/page-b37c3110f50a7793.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/course-category/page-a6a517a5d71cc8e3.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/layout-199ed539ef5bc183.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/tna-category/page-408e412f8caf3049.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(weeklyPriority)/weekly-priority/page-04ebed46bd028c14.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/billing/page-133e18aa0dcb9542.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/dashboard/page-fa3fe73accb953bd.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/invoice/%5Bid%5D/page-0cc343c17083e981.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/plan/page-2a5a9b35823321f9.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/profile/page-49889a34d39c496d.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/audit-log/%5Bid%5D/page-2118ea27fbc16cd9.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/audit-log/page-4ff7bbb58588bbc9.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/dashboard/page-1e636c846c1909b1.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/dashboard/vp/page-5a985193c36cba5a.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(beforeLogin)/authentication/forget-password/page-7ca1c7fddc623e65.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(beforeLogin)/authentication/login/page-61409f9df8f98f9e.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(beforeLogin)/authentication/new-password/page-a8de9641caf2fa7e.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(beforeLogin)/authentication/reset-password/page-a607a5f611e56295.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(publicForms)/job/%5BtenantId%5D/%5BjobId%5D/page-d05a4563753859bd.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(publicForms)/job/openPositions/%5Bid%5D/page-30d42d81a63fbdb3.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(publicForms)/job/openPositions/page-c4b76be8ed639ad4.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/(publicForms)/surveys/%5Bid%5D/page-a0030c5e058be7f7.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-89110f115e3059ee.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/layout-7e9d6b5e753b7008.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/loading-a89e50d8b967b8a2.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/not-found-6654e8341b6db23c.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/offline/page-a6185c8e1b570327.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/app/page-964bb518e4c261e8.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/b2d98e07-1948317d489cbde4.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/b563f954-d3ca46153dc3fcb3.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/bc98253f.aa27182464c58412.js',
          revision: 'aa27182464c58412',
        },
        {
          url: '/_next/static/chunks/c37d3baf.43c830de2c266ca1.js',
          revision: '43c830de2c266ca1',
        },
        {
          url: '/_next/static/chunks/c916193b-01e71ab4a1fb4de6.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/ca377847-cc336e09288b791f.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
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
          url: '/_next/static/chunks/e34aaff9-72d930699cb722da.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/ee560e2c-a713f9686b8729f2.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/eec3d76d-327495402e145a9c.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/f25cdb8d-0a4b9d1ee45595fe.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/f8025e75-b1c79f650d6b512d.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/f97e080b-b47ddad76163ec77.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/fd9d1056-f067ed350b7d4b38.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/ff804112-19c01e31cf8a2d42.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/framework-56dfd39ab9a08705.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/main-app-617d369b09134a95.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/main-bd5060c98c080b65.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/pages/_app-f870474a17b7f2fd.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/chunks/pages/_error-c66a4e8afc46f17b.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
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
          url: '/_next/static/chunks/webpack-e835fd1ed72e6ec5.js',
          revision: '4L5zlroQbpd3YcEfgB-zw',
        },
        {
          url: '/_next/static/css/153beb49368e3bdd.css',
          revision: '153beb49368e3bdd',
        },
        {
          url: '/_next/static/css/32df9a4d493f8b0f.css',
          revision: '32df9a4d493f8b0f',
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
          url: '/_next/static/css/aff95765b104a583.css',
          revision: 'aff95765b104a583',
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
          url: '/_next/static/media/Button.b30635aa.svg',
          revision: 'da23e3b029d7db9ae24f6c2b84aebfaf',
        },
        {
          url: '/_next/static/media/Group2.d6781641.png',
          revision: '8091a52f6cbda42879a61425a6d59b10',
        },
        {
          url: '/_next/static/media/Group3.c09e8261.png',
          revision: '75d095eab2dafa749c6888f1ecf4e0b0',
        },
        {
          url: '/_next/static/media/ZKTeco.e0e747d5.png',
          revision: 'b2515f4fd0f0c2f87ee281daeff61089',
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
          url: '/_next/static/media/gender_neutral_avatar.230de99d.jpg',
          revision: '45d542824fb7724e4015d67df272855c',
        },
        {
          url: '/_next/static/media/image14.917ce561.png',
          revision: 'b7c26a7e9db9d8ee764be370bd65001c',
        },
        {
          url: '/_next/static/media/image15.ebe88c61.png',
          revision: 'a7b423233de722d8f24027f12aaf5a54',
        },
        {
          url: '/_next/static/media/image16.5b72278a.png',
          revision: '999a97857b38ad90e6e9ed88d7b4009d',
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
          url: '/calibre/Calibre-Black.otf',
          revision: '41059a6aa24358469dbc54c629c9030a',
        },
        {
          url: '/calibre/Calibre-BlackItalic.otf',
          revision: '9d3c9c6d42dc032771b4338b706158e7',
        },
        {
          url: '/calibre/Calibre-Bold.otf',
          revision: 'fa297f7ae5159e50f3ec48e63cc69136',
        },
        {
          url: '/calibre/Calibre-BoldItalic.otf',
          revision: 'a12f7538fca1f1ad21f61475e6116045',
        },
        {
          url: '/calibre/Calibre-Light.otf',
          revision: '2196668c6c8008bb6d4284a36f39d36d',
        },
        {
          url: '/calibre/Calibre-LightItalic.otf',
          revision: '2e0f5034a29bee864b514bfbb78ecfc0',
        },
        {
          url: '/calibre/Calibre-Medium.otf',
          revision: 'a1f597d9b147765bc57cef99ec39cae4',
        },
        {
          url: '/calibre/Calibre-MediumItalic.otf',
          revision: '59f97fa175fd74edad3f46d038ef1f1c',
        },
        {
          url: '/calibre/Calibre-Regular.otf',
          revision: 'f91d75a8674c50aa000711160c9729e1',
        },
        {
          url: '/calibre/Calibre-RegularItalic.otf',
          revision: '2e5dcabbfd5fa07e9de6413dc4ccc201',
        },
        {
          url: '/calibre/Calibre-Semibold.otf',
          revision: 'da84f0257779cc82fc3c178c2eb4aecf',
        },
        {
          url: '/calibre/Calibre-SemiboldItalic.otf',
          revision: '6f6c0536db13e3747bc0a34a5f7cf04f',
        },
        {
          url: '/calibre/Calibre-Thin.otf',
          revision: '2f177ac231e9bdb6fe83108c111985ff',
        },
        {
          url: '/calibre/Calibre-ThinItalic.otf',
          revision: 'fb253479c7190da9fa84b0433d19709e',
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
        { url: '/image14.png', revision: 'b7c26a7e9db9d8ee764be370bd65001c' },
        { url: '/image15.png', revision: 'a7b423233de722d8f24027f12aaf5a54' },
        { url: '/image16.png', revision: '999a97857b38ad90e6e9ed88d7b4009d' },
        {
          url: '/login-background.png',
          revision: '715addd23ceff9820a0eb97d8d40bb6f',
        },
        { url: '/manifest.json', revision: '754be94b9a2846bf31a3f310ea8972a7' },
        { url: '/next.svg', revision: '8e061864f388b47f33a1c3780831193e' },
        { url: '/offline', revision: '4L5zlroQbpd3YcEfgB-zw' },
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
              event: s,
              state: n,
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
