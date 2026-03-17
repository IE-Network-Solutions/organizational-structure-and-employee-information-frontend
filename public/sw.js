if (!self.define) {
  let s,
    e = {};
  const i = (i, n) => (
    (i = new URL(i + '.js', n).href),
    e[i] ||
      new Promise((e) => {
        if ('document' in self) {
          const s = document.createElement('script');
          ((s.src = i), (s.onload = e), document.head.appendChild(s));
        } else ((s = i), importScripts(i), e());
      }).then(() => {
        let s = e[i];
        if (!s) throw new Error(`Module ${i} didn’t register its module`);
        return s;
      })
  );
  self.define = (n, a) => {
    const t =
      s ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href;
    if (e[t]) return;
    let c = {};
    const r = (s) => i(s, t),
      d = { module: { uri: t }, exports: c, require: r };
    e[t] = Promise.all(n.map((s) => d[s] || r(s))).then((s) => (a(...s), c));
  };
}
define(['./workbox-00a24876'], function (s) {
  'use strict';
  (importScripts('fallback-kPXlsQXH3sRs0AXGmdmTI.js'),
    self.addEventListener('message', (s) => {
      s.data && 'SKIP_WAITING' === s.data.type && self.skipWaiting();
    }),
    s.clientsClaim(),
    s.precacheAndRoute(
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
          revision: 'ce98b255e06d2a921fdd2aafdd44fb97',
        },
        {
          url: '/_next/static/chunks/0e762574-f602d5910dcf4b93.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/1009-610998db9383a7cc.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/1057-fdab7cd26ecc9809.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/1113-75d86b1097ed0634.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/11390db7-3039854f365bab9a.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/1260-7bd32a9ee67ef44f.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/127-9a327fd574e949c3.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/1279-a115ac3d94019275.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/1304-e6e25894f8ac507d.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/135.94cde4773e8a4989.js',
          revision: '94cde4773e8a4989',
        },
        {
          url: '/_next/static/chunks/1360-91bc4fcb3d81f8f3.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/1412-3072f7bdb1672067.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/1419-84b70f5d3b99bd45.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/1444-b561161b87253de9.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/1463-0d2d8187502adf48.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/1464-ed1f3e45ad8ff073.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/1482-a142d92acfa9c311.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/1616-00a9d19127bdf3cb.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/164f4fb6-65892ce74f91e5fa.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/1678-324b05a8c7237aea.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/1684-68f34a71bd641316.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/1705-0cf1675f0344803c.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/1769-725193fdd8af8bb2.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/1785-3cfbcbfe9354f164.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/1792-c9098b9f0a12e48b.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/1800-26dd6f4c570d3bd5.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/1838.20f56d2166206178.js',
          revision: '20f56d2166206178',
        },
        {
          url: '/_next/static/chunks/1841-712e736ceee160fa.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/1843-10d60b5e53dbf993.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/1846-2af0888dcfc0ad67.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/1861-db482f7c39b4b7cb.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/1a258343-d7886f0e3112a778.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/2095-54c26e2964ed596a.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/2117-0eb35fd5d4d7c97b.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/233-29da5bf7dafb665f.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/2451-6763ffec1e70c958.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/2459-0a2f77b3189b53d2.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/2467-4af33791e584dcaf.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/2526-d85e36a01219fce2.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/2529-10f3f92ba6399baa.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/2533-1a10a2fa030a37c5.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/2591-3d93b6f43545bcee.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/2604-5f16367d70ddaa5e.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/2625-b4cf9a3b47932b0c.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/2649-50be76835e6e22ea.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/2663-52c4b9e6ecf83516.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/2673-c5943f91395bb9c1.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/2800-3ceff4a1a70c8c0d.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/2845-cf1f905b69223f98.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/2854-015286e7cd43e582.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/2886-88ad43c85d9091e4.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/2922-56ca94ef0a43ed3b.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/2949-ca8ff06f30691cfc.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/302-776836181651ec92.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/3122-438619afc8a205c6.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/3136-9b8de5e3cf88e77a.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/3144-cba48cfde87ff25f.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/3330-e7477570faf5b084.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/3331-43d5149c34748991.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/3407-a3cc181d1fe3fa72.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/342-8c430b276e0c7445.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/3423-876a068ea19e773e.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/3448-b59034ad36ca8929.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/3533-bfab84e276db6e57.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/361-6bc683b6bd0a0af9.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/3670-40431d4cc9c0e6e1.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/3730-ff7440dba5132b33.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/3732-9ad1c71751226d77.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/3742-cb0eb2f2a0316583.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/3763-a031c6a02190aa5b.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/3772-42a5ca57b583e7c0.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/3788-4c527d3ff157af9f.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/381-3e935f52835eb683.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/3813-7c771252bdd42b35.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/3829-4fed16d8cdedaa98.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/3831-22b896bd98b1639e.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/385cb88d-551da5ab57360a6e.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/3867-7639f452ce3dd371.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/3884-340a76fa2167133b.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/3888-544a475671c85d36.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/3896-e3063bc7e3210b1c.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/3899-2e9fba6831d1561c.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/3938-e023a2b8c6323b3b.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/3d47b92a-7b95cc4188e33278.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/4062-ef1fe3f30403754f.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/4071-be76d400d006bf7d.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/410-0a76730939e65d5c.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/419-5537c7e747d0dc66.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/4230-076f47aea91a8461.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/4248-dfd4f1b454d08e2f.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/4270-9b27bf14550fc545.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/4273-440f02a88779d473.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/4293-b6b114df5825f283.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/4301-f05a80dc6fe32168.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/4383-d696532e4bc81cef.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/4456.c58ead51e03da8d3.js',
          revision: 'c58ead51e03da8d3',
        },
        {
          url: '/_next/static/chunks/4529-6cc4d86e6162b242.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/4561-49bd2cb1f1e0a7d0.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/461-6765fbb504444ec9.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/4615-5355872fd66f56c5.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/4616-12a1541a95bc1a75.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/462095b7-a435d8e876f42bc8.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/4634.0ee293fcea95b658.js',
          revision: '0ee293fcea95b658',
        },
        {
          url: '/_next/static/chunks/4659-a27238ea09618275.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/4701-83a55b6d03de6880.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/4729-4ceebc2c23704464.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/4749-cbb7ad4cbd4aae31.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/4786-f94f90d3d05b86af.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/479ba886-45eeaf9342a57894.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/4850-6e689e4b2cf84278.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/4851-3dd9679bada8078f.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/4866-fd20bf00fbbd5c29.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/4873-5849b4c7dd3b2bb2.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/495-eec27b7e59f506ec.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/4979-58f13a672183bf81.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/4982-8f863b2f854b9a6d.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/5066-acf5d340787a9607.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/5149-f3a50c6d4376c06c.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/5166-e87603aea3952974.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/5196-d5b759639c365b2c.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/5247-a28e4d9fa2df3e76.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/52ab8b6c-cab1d6bac8bb745b.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/5313-243760c8c2876556.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/5395-f36cc7511bdd0566.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/53c13509-4cd23936269a3758.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/541-0d8ece9a0736203f.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/5441.c13ed7100cfc04f2.js',
          revision: 'c13ed7100cfc04f2',
        },
        {
          url: '/_next/static/chunks/54a60aa6-e47e3bfc808452bd.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/5504-7af6d172d5c1fc84.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/5569-f4782f5a04853d6c.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/56-ed58ec97993e5bf2.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/5617-202cc2a233efdcaf.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/5637-54578e93dba4c66f.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/5644-55340421b7292a23.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/5698-c0f0a3a4f96259de.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/5738-a96b60cf0c256b5d.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/574-8ff178a6ec1ddec8.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/5785-3061967ae2010be3.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/5786-da7231acedabd4cf.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/578c2090-fb35812c82abe289.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/5803-dfc418a471e319c4.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/583-2782146bfd768cc6.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/5836-3a37877dac23c707.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/5840-3d7db3624e91cc1f.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/5913-825f296c9e8bbc4d.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/592-ed2c8a4c0be8dabb.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/59650de3-d3e009388f77ee3b.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/5e22fd23-b67266bc6b8d3abd.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/60-130f6df1ac0f078e.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/6006-90130581749ce5d6.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/6132-a7151072977ec083.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/6141-33fce54127687152.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/617-a4fe299454990e10.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/6255-b1aa369dabecdb0b.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/6285-c6a0ed1211b0b7e1.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/6317-2ab3f5bba11b1896.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/634-1329dcacadaea99f.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/6352-7d290af5b50b2c5b.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/6369-9ddab94e8d7fd347.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/6472-0bcf7612e8654d7f.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/6474-b73e1b47a73f3765.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/6512-c61b5afc941e6016.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/6644-117e9ca5c6ed73af.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/66ec4792-a0ad2a1c3c834b13.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/6700-be7a3e3fa6830685.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/6703-1e243089f2a1e353.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/6750-493382be39e880d5.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/6755-59c93dfb692f5e90.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/6817-e63f81424713d6d1.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/6832-857a692d4d089096.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/6846-916cd9d4ef606ccf.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/6977-c41d8455fb080962.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/69806262-346e49452de380e4.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/6edf0643-3339f6c96a12fdde.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/7023-3a850748796d1c32.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/7029-48ac2693a96d388b.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/7064611b-4506a439cc3ebeed.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/7088.37794a5f598f849c.js',
          revision: '37794a5f598f849c',
        },
        {
          url: '/_next/static/chunks/70e0d97a-92de8b1495483d75.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/7106-6a2b99afcdd0e50c.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/711-6849e36cc7545099.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/7138-5b62d0c76b2ce562.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/7142-a729f5b86b28648b.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/718-bf41ea7ef8f25e24.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/7239-58f854caa9ee8b92.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/7314-555ed8e7d67b5d3a.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/7383-6df4b9afa426488a.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/7384-a11ba4962a44fb62.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/7435-30190ed15a8f5e3e.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/7436-5267b2388a8cba7f.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/7455-dd07c208c16625b5.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/7460-d305bc97e23ef07f.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/7485-bfd5f49c5c226165.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/7494-750c0a539039396f.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/7565-92dc8b72787ce145.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/7597-67ada70be3ae1593.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/7631-4ce7f9cb196c89c9.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/7642-3c90a0ddfd11d410.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/7652-fe3d4198149fbf2b.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/7701-3bfa552130778c48.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/7747-f10f4f8d1894a479.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/7806-724844b40f1a94ab.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/7823-68ea88fe736d8f5a.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/7912-93134d0011098bb6.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/795d4814-77c80f84df43a9bd.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/8003-f27f60385ed21d62.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/816-e4ac8335ccd9adb2.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/8270-f2f99a7fa1f0dd2b.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/83-3ffd3eb425ae5473.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/8337-5f0e30420d646a8e.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/8357-52bd5a17fd224703.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/8390-9d04386bcdd518bd.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/8406-1e819ab77daf5472.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/8413-1ee1957a1ecea1af.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/8415-16dff8fb42dd30fc.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/8436.acfc52fd47e83fa1.js',
          revision: 'acfc52fd47e83fa1',
        },
        {
          url: '/_next/static/chunks/845-68a748ce33dd8d7d.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/8521-9ca3eee0234774f6.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/8625-e672f8aa09ad48e3.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/8662-ff3ae1f228317661.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/867-58a434497a0ce9c6.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/8836-0f47be9d9a0e5e45.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/8880-9622cd02e2563925.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/8950-aaa22f833468e535.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/8e1d74a4-da5f0a0a604fcc9b.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/9010-62a7af165f286c94.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/902-9309737002ac086d.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/9155-b48ece4770c5d93f.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/9189-adaf5a5b6aed5280.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/9198-90aa413fe9b7ed68.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/9199-7e0ffd2b1c60ff68.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/922-9c145005994ee37c.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/9240-287e78578254011c.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/9255-88afa5e33853e7aa.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/9257-b49f80ba164d47ae.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/9314-7532032fd0b0161e.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/9458-acaf5da2302df3c0.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/9461-624716060a184cff.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/9464-23c43a82dcfcfa68.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/94730671-0606797528157869.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/9547-9f9fe239d8459673.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/9626-4228751ceed33cb3.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/9628-1d79d9ca26241723.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/9633-dee9a8e2f2faa8cb.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/9678-585e1dc9356657b9.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/9751-fcd30644cab75e0d.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/9795-7b2122b7f4bd8a85.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/9807-e01aee727d0768cc.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/9830-089c6bf117bdb941.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/9847-82d8c49c3d0dbee1.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/9882-eb98b01523aee512.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/9907-692932070602e9c5.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/9974-6ecb744b4543cfab.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/9c4e2130-2a1d7166f297ee93.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/ad2866b8-b2aba5370a0d21e8.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/%5Bid%5D/page-a9981dd9387f7c99.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/allAllowance/page-5762bb96b0bb2e33.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/layout-53be8a8a1bcc3a4f.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/page-97b55a35be7c4723.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/%5Bid%5D/page-cf6bee10661905c8.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/layout-cd41a879be47325c.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/page-612edd0b011c0513.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/variablePay/page-7a37eef2fd922280.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/allowanceType/page-a6b1c1207d1d9d7e.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/benefitType/page-317160380d36102f.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/deductionType/page-f511ba3df060cb51.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/layout-2b6ab9533e5f416c.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/page-82b8ed9973946f6d.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/%5Bid%5D/page-5e2e637587848bfe.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/allDeduction/page-91843096d6d01b9f.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/layout-b299ea79dd71a8e8.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/page-857142973a951ab8.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/departmentRequest/page-1b9d3e4c2f477508.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/manage-employees/%5Bid%5D/page-ef14b9c26194c1cb.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/manage-employees/page-96e80e7adc6dd3fc.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/notification/page-a8718e55ef134004.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/approvals/page-1bf438944e40aecd.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/customFields/page-2584e69f8a55978f.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/employementType/page-be9adc9c25b5b9f5.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/layout-d74cdadb90d8052b.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/page-7238ac97dac6777d.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/positions/page-112bb61f11bd5290.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/rolePermission/page-37c5f23d11f07479.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/action-plan/page-4ccb7702401ff932.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/categories/%5Bid%5D/page-a2f7d36064b10015.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/categories/%5Bid%5D/survey/%5Bslug%5D/page-b9e7d6e90e0a2a4d.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/categories/page-24761ffada3bcf7c.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/%5Bid%5D/%5Bslug%5D/meetings/page-59273d12275a5408.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/%5Bid%5D/%5Bslug%5D/page-3c3efe0276f17516.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/%5Bid%5D/page-5c060597d385fc91.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/page-6473af2aabed4cdb.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/feedback/page-20efa0bec5fa6c83.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/meeting/%5Bid%5D/page-8ac4a64fd24fc5fb.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/meeting/page-c3be571cca84f14a.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/recognition/%5Bid%5D/page-657ecc727d76e877.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/recognition/page-8f2140c96c7f370e.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/define-feedback/page-d20b85ab532087ab.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/define-meeting-type/page-fc0a5b52c81c538e.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/define-questions/page-c45ec82305936944.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/layout-dd6616117d086c61.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/page-e2324711556fda39.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/recognition/page-d2600fb16ae8421c.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/target-achievement/page-8d5ee99333859fdb.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/compensation/all/page-336e5f59ac575d6a.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/detail/%5BdataId%5D/page-957870741e62aea2.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/page-253f91834d164ee8.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/payroll-detail/%5Bid%5D/page-60ad72c75f84f24c.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/%5Bid%5D/page-d08923de7cd1f182.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/defaultIncentiveCard/page-880c9fbc1c2bd149.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/layout-35160d27081dbfdc.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/page-6b942082e98fdb92.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/variable-pay/page-52538779915b6a65.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/page-be78f3804db47759.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/reprimand-appreciation/appreciation/%5Bid%5D/page-ee779b8bc06b5bde.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/reprimand-appreciation/page-679208096c595eeb.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/reprimand-appreciation/reprimand/%5Bid%5D/page-ac48add5b31adb62.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/dashboard/%5BemployeeId%5D/page-c6a1e9e7eb850c68.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/dashboard/page-2a12edfde5a3fd01.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/page-91bf7a1091299df5.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/check-in-rule/page-b3cc9a77997fe51d.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/criteria-management/page-7bf9fb53e4c27b67.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/define-appreciation/page-16230f3b6f2a82fd.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/define-okr-rule/page-b1f3f2b5c50b7abb.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/define-reprimand/page-a21a924db25309ea.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/edit-access/page-45b5730f18a4e536.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/layout-4417c9d097e332b2.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/okr-setting-menu/page-3c07bfa161f0a7fe.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/okr-type/page-f51aa134f54dd7ab.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/page-efd008d31c54d8e8.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/planning-assignation/page-d80429cba0fb228a.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/planning-period/page-5740729c5bcbd49d.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/target-assignment/page-4cda346a430a3e13.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(onboarding)/onboarding/page-a1c8ffb93a6b47d8.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/layout-1b5850b14b0e84b5.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/org-chart/page-7d161470fb2af2dd.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/org-structure/page-1c1042ee85b7ca65.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/page-55f00331b15ec0b6.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/branches/page-3a63033337bf07fc.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/fiscalYear/fiscalYearCard/page-6d934739d691e3fe.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/layout-289161730e4ca81e.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/merge/page-ac1a843c19393893.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/page-12f888726933b8d5.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/transfer/page-657385d23ed05645.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/workSchedule/page-b3ec99411f4f4de3.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/employee-information/%5Bid%5D/page-1c9ac6af04023abc.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/employee-information/page-d4601cb6ea042aa7.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/myPayroll/page-ef415a495c6980ec.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/payroll/page-b2c908922bed4ac5.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/payroll/reconcilation/page-f54e5dfc91684b64.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/approvals/page-d8bdfd29587ab843.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/banks/page-bc260ee6f105c928.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/layout-5aace2cd40154512.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/page-8e559ef8b67edfda.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/pay-period/page-c69e0872ab11b90a.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/pension/page-6ae3dffa529890d7.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/tax-rule/page-7a83eb4d49cf0289.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(planningAndReporting)/planning-and-reporting/page-99203758d7beaa51.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/ai-job-matching/%5BjobId%5D/page-9d7d4873c7b88a28.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/ai-job-matching/page-80899b516683b0a9.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/candidate/%5Bid%5D/page-4062dfd1ce98296c.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/candidate/page-a62aa26f30b0c6e0.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/dashboard/page-87f72b40390dc029.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/hrflow.ai/candidate/%5Bid%5D/page-66a38131690a03d0.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/hrflow.ai/page-5137454ec8e287b9.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/jobs/%5Bid%5D/page-4f9fc80b494fe160.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/jobs/page-2d462c7e45c5522c.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/customFields/page-5469ee0daa16699e.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/layout-f13b7d7c932d0286.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/page-66953d3048085c7b.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/status/page-3667889a777e64e8.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/talentPoolCategory/talentPoolCategoryTab/page-6578897ef23fd4e1.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/intern/%5Bid%5D/page-daee8099082ff41d.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/intern/page-a5fc6ff171ad3b37.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/page-a18114f53674a9ea.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/talent-pool/page-d2c6d2d75897ea7c.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/talent-roaster/%5Bid%5D/page-bdcbaa606c30cfaf.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/talent-roaster/page-361ac3b836e3571a.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/dashboard/page-c0f969e5accb8c49.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/employee-attendance/page-ea6f5559c0046b39.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/layout-3b3ee883b1f8ca25.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/leave-balance/page-4e2056a6a9527594.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/leaves/page-d9459e861e905dc0.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/page-f086a6ef9d5d7dff.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/my-timesheet/page-3c7247abbd897144.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/accrual-rule/page-7ffc3e1ec27f6520.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/allowed-areas/page-efdeb67cf68a1b25.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/approvals/page-f3c3e05fd891747e.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/attendance-rules/page-2f69df189b75974a.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/break-type/page-80950e576b5cc9f3.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/carry-over-rule/page-43f3362b3b41fd45.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/closed-date/page-3f1efccdbb294016.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/imported-logs/page-7298cb7723a73105.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/layout-cc8e5c27ae273ac9.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/leave-types-and-policies/page-7653b40fd6883547.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/page-f7e2b3cce7da022d.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/time-zone/page-49f27f8310b22096.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/workSchedule/page-078c9e3cbb328329.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/zkt-addon/page-7d92ddfb91000743.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/%5Bid%5D/%5BlessonId%5D/%5BmaterialId%5D/page-f8f9f3387144f7b6.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/%5Bid%5D/layout-c062dbb7639cbc37.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/%5Bid%5D/page-b4d65ae87b7ee2e9.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/page-065750464e1a456f.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/my-training/%5Bid%5D/page-92d9c2182ad42d92.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/my-training/page-e16ff33fc1c574ea.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/review/%5Bid%5D/page-70cbd1aa9d530bc8.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/review/page-9c61aa75c31966da.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/approvals/page-bd902dee2b6c1f28.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/approvals/workFlow/approvalSetting/page-281a8f88c315745c.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/approvals/workFlow/page-8e7dcab522ea5dc1.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/commitment-rule/page-7b62d920e2eef46d.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/course-category/page-095ef7427b1c9837.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/layout-2ec8c0967681ab8e.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/tna-category/page-ed906a22450cd228.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(weeklyPriority)/weekly-priority/page-f76e81c58ed61b7f.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/billing/page-edf2bb7bdd4dfdab.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/dashboard/page-cf8c3b00e2ba0053.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/invoice/%5Bid%5D/page-e2b11bbc353a614d.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/plan/page-4e3e1d5f06e3d9af.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/profile/page-89d5809b045650dc.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/audit-log/%5Bid%5D/page-b8015a68f2dd5d3a.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/audit-log/page-c8ed8c11a5491d29.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/dashboard/page-c63685a1135bad7f.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/dashboard/vp/page-510adfd3479c44ed.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(beforeLogin)/authentication/forget-password/page-cfcc9f7aee910bc1.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(beforeLogin)/authentication/login/page-0adde2eba5db82a3.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(beforeLogin)/authentication/new-password/page-e80f737a394a0ade.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(beforeLogin)/authentication/reset-password/page-ebe5f7f9f659079f.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(publicForms)/job/%5BtenantId%5D/%5BjobId%5D/page-7d219134f76d2c29.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(publicForms)/job/openPositions/%5Bid%5D/page-a6bba0739dc300c9.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(publicForms)/job/openPositions/page-1b6f7ada9cef3ee6.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/(publicForms)/surveys/%5Bid%5D/page-69140e0ba91f2ea9.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-89110f115e3059ee.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/layout-96e75a6644e94b2b.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/loading-a89e50d8b967b8a2.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/not-found-6654e8341b6db23c.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/offline/page-a6185c8e1b570327.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/app/page-964bb518e4c261e8.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/b2d98e07-1948317d489cbde4.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/b563f954-bad21eb7d4a768ad.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
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
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/ca377847-cc336e09288b791f.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
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
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/ee560e2c-f518234ec5f7e42f.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/eec3d76d-3c31f39e28d84c50.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/f25cdb8d-0a4b9d1ee45595fe.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/f8025e75-f4b53b9a5e720285.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/f97e080b-067b1b69496f56ad.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/fd9d1056-f067ed350b7d4b38.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/ff804112-19c01e31cf8a2d42.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/framework-56dfd39ab9a08705.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/main-36c90bdefa48bb07.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/main-app-617d369b09134a95.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/pages/_app-f870474a17b7f2fd.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
        },
        {
          url: '/_next/static/chunks/pages/_error-c66a4e8afc46f17b.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
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
          url: '/_next/static/chunks/webpack-96bc6d91fb4d25b7.js',
          revision: 'kPXlsQXH3sRs0AXGmdmTI',
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
          url: '/_next/static/css/40c835faed7cfcde.css',
          revision: '40c835faed7cfcde',
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
          url: '/_next/static/css/c621e2cfc90a1bf9.css',
          revision: 'c621e2cfc90a1bf9',
        },
        {
          url: '/_next/static/css/f59bfee53fbffbfb.css',
          revision: 'f59bfee53fbffbfb',
        },
        {
          url: '/_next/static/kPXlsQXH3sRs0AXGmdmTI/_buildManifest.js',
          revision: '3e2d62a10f4d6bf0b92e14aecf7836f4',
        },
        {
          url: '/_next/static/kPXlsQXH3sRs0AXGmdmTI/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
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
        { url: '/offline', revision: 'kPXlsQXH3sRs0AXGmdmTI' },
        { url: '/sw-push.js', revision: '423099e2c538e26641318c5aca056565' },
        { url: '/userIcon.png', revision: '21290e54f2e18a286c44fe19846ab1fc' },
        { url: '/vercel.svg', revision: '61c6b19abff40ea7acd577be818f3976' },
      ],
      { ignoreURLParametersMatching: [] },
    ),
    s.cleanupOutdatedCaches(),
    s.registerRoute(
      '/',
      new s.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({
              request: s,
              response: e,
              event: i,
              state: n,
            }) =>
              e && 'opaqueredirect' === e.type
                ? new Response(e.body, {
                    status: 200,
                    statusText: 'OK',
                    headers: e.headers,
                  })
                : e,
          },
          { handlerDidError: async ({ request: s }) => self.fallback(s) },
        ],
      }),
      'GET',
    ),
    s.registerRoute(
      /^https:\/\/fonts\.googleapis\.com\/.*/i,
      new s.CacheFirst({
        cacheName: 'google-fonts',
        plugins: [
          new s.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
          { handlerDidError: async ({ request: s }) => self.fallback(s) },
        ],
      }),
      'GET',
    ),
    s.registerRoute(
      /^https:\/\/fonts\.gstatic\.com\/.*/i,
      new s.CacheFirst({
        cacheName: 'google-fonts-static',
        plugins: [
          new s.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
          { handlerDidError: async ({ request: s }) => self.fallback(s) },
        ],
      }),
      'GET',
    ),
    s.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new s.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [
          new s.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: s }) => self.fallback(s) },
        ],
      }),
      'GET',
    ),
    s.registerRoute(
      /\.(?:js|css)$/i,
      new s.StaleWhileRevalidate({
        cacheName: 'static-js-css-assets',
        plugins: [
          new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: s }) => self.fallback(s) },
        ],
      }),
      'GET',
    ),
    s.registerRoute(
      /^\/api\/.*/i,
      new s.NetworkFirst({
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        plugins: [
          new s.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: s }) => self.fallback(s) },
        ],
      }),
      'GET',
    ));
});
