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
  (importScripts(),
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
          revision: '83120b16fc5d9fbf3e5c38d315bff4f4',
        },
        {
          url: '/_next/static/YUAxIwuWtbAj0MGHoPb71/_buildManifest.js',
          revision: 'fb764700af8de664a40978f1a616c4f5',
        },
        {
          url: '/_next/static/YUAxIwuWtbAj0MGHoPb71/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        {
          url: '/_next/static/chunks/0e762574-947ea4e404419ff6.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/10897-728b372ce97d9f0e.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/11074-d19d3ce17df50464.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/11172-5e4d9c6b8d344fc5.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/11390db7-57d7420762ffcc14.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/11413-c22516908a240db7.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/11838.e5e917437663383e.js',
          revision: 'e5e917437663383e',
        },
        {
          url: '/_next/static/chunks/12444-8290fd266b9eec37.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/128-c07e7039faa68eef.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/13609-e2855ad52fce17d2.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/13720-bb5339bb9a4102f7.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/14186-534f154787411cb9.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/14446-ae7a97bc6bc8e6dc.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/14616-0f2398895a2c2b96.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/14786-44b6b3afe560dc7f.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/14914-89fdb492dedd17f8.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/15254-8d25737ad58560a9.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/15600-5cfc628af4cefb35.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/15892-6ee9fd8060647064.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/16395-5c462264b2d628b9.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/164f4fb6-6cf24012f3ba9265.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/16817-f738e11db8eef6ee.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/16872-8354beaa253fa33c.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/1690-1ee81502f884275a.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/17049-4b7cf0deddf7288a.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/17268-f262efd871766c6f.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/17373-c0be5d9ce8a71338.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/17426-bcdff228b19ebe6f.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/17460-e6a368009b604d53.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/17681.87f4bd30063f4eba.js',
          revision: '87f4bd30063f4eba',
        },
        {
          url: '/_next/static/chunks/17861-3daf2ac234f5bb45.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/18193-3c4dc4a5da84c72b.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/18357-c2d09cc9ad58ffc7.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/18437-1d22f67ab53e1dd7.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/19125-ade122199e99db5f.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/19155-634227b9a50edfcc.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/19273-106680444d753af5.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/19275-4eaa317e7c63779a.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/19703-0b669809db49b3f0.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/1a258343-3d875b2ae6a116f8.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/20130-5f31dc99aed0aaf2.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/2095-701c6a31aa68977a.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/21695-6614f03d6e61bcae.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/21945-c4d2af8d12e24ede.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/22094-1356ad2d9cedbcf9.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/2223-4e3bdcdc98dde9ec.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/22365-4fcbbae7854844fa.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/22611-6b92ddccc6aa79f9.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/2274-fe7b5fdd87e81354.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/2330-ca584e07b3de574d.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/23412-149154c2d7604552.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/23776-a823b6b8091f1f08.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/23886-a82c92909ab711e5.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/23992-954736c5d9a0acab.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/25271-ede595a890382712.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/25325-5771ef9d7989365c.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/25332-02b128136c9712e7.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/25855-9d341da29b310ae8.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/26053-d1fe60a81e0caa17.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/26072-ba1543ba5b423dc7.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/26296-34ca8e7f914356cb.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/26406.21f7d0b4f91e1410.js',
          revision: '21f7d0b4f91e1410',
        },
        {
          url: '/_next/static/chunks/26705-83fafc092244a7d9.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/28187-36f1872e5b7e3b05.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/28232-18f9cb3c2567c7c3.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/28421-48cb1102262f6eb1.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/29421-db8c3667e704c24f.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/29830-72c078544b8962ac.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/30399-4ab670d6795d4fb0.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/30997-32ff4b7a59c404f6.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/31047-a139900f985161ea.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/31175-90959a07318317ed.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/31384-68a5b90809b6faa7.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/32241-8492f4cd99769db9.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/32548-c649f92000444a5a.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/32566-72bc9465ee40501d.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/33216-568389be9761effc.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/33269-5aa62a22bed71926.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/33562-04616c1700be3d6b.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/33730-538238664390364b.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/33962-a50fdbaa78fe5e96.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/34472-da221d972888eef8.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/34486-f8b039b0f9ae9744.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/35098-e87c5b42f1964c7a.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/35295-5970f35e0c9e7800.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/35913-f90ca93850072f1d.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/36096-ce7dd9f97c578c97.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/3613-ad8b7231952e13f6.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/3664-da8a54cf808927cf.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/36841-501ae59baef381a5.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/37255-4baf981df847e19b.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/37673-e04e87cbc06beec7.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/37782-f5d991dd4abbf737.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/37911-a8c7580dd0c70c2a.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/38148-cb3f1c7db938c513.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/38423-8c7f4e865d3a53f2.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/38559-7d92b1704153fcd2.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/39322-f9191072e87997ce.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/39790-250dfe13ebc14786.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/39923-3a1b95ecd32f5b49.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/407-e47ea060c72b577e.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/40858-62e1898c82751b01.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/40902-505c27a5634b5726.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/41193-41f8d53babda130c.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/41226-be98b3e4801f3b9c.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/41640-cb425438f74ca630.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/41963-df1b6ab8a98047b3.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/42154-1ceaedac470d7267.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/42393-21782134eeb80ba2.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/42483-8f96f89c0e3f17ee.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/43616-28ac8ab0bc30a782.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/43742-4bf31372c67d8016.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/44438-cedd9df5c847e5f8.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/4492-bd904fc886eb3b63.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/44971-146fb72de37bfa89.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/44979-f0e4a00e28f7e154.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/45637-4a2cd6891d2bc679.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/462095b7-b537d92dfecd216d.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/47023-5716287c45fcf69e.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/4729-6ffa287dfc7a50f6.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/47522-3377e0f7e443aa54.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/47859-2ea0eec1a7154d2e.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/479ba886-a87e0701e24a2eeb.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/49010-596a6117faa72794.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/49732-e5e65e8454fd6871.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/50125-90daee4f4ccbf4af.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/50329-e17a8742fe2a8c93.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/50431-dc15df1daf87d78d.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/50972-8d5709f1e19db9b7.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/51672-429201caf0a6524a.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/51725-2667c74d55745cc9.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/51914-d4f8c710c3156edf.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/52191-6c2a3ab2585bb1c8.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/52458-273a6010652f5a2f.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/52ab8b6c-7b5a73c450eaf9ba.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/53829-139931f46a95c432.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/53c13509-9f96f6776d92574a.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/54a60aa6-3bb4a829abc71d63.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/55129-bd6a6688bd4485a3.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/55682-55fe2ba917a69356.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/56064-5bfaf4df68def303.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/56066-1f705e955c3b5ca4.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/56087-ab06fef436eb0745.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/56733-2e29613191fb2098.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/57851-054ce9f55e388c93.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/58452-db82d045cff85133.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/58615-38de117dfc2eb8af.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/58878-4faa74bc760e0be3.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/59192-c0d0b12c57f1f1d7.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/59650de3-dfa6475e789cb47a.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/59805-8f6ba1da18c5c43c.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/5e22fd23-2c515de58216f54c.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/60002-de26174ff2ff9aee.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/60461-f58065ab86594b9e.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/60621-61ac5662a932cad0.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/60670-6ea349ba877de5d0.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/60976-e0f550aaa8c57fd8.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/61229-479b45bb7a238231.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/61246-e5c3173ccc7fef8b.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/61938-ca21b75d9198c833.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/61996-e15462bb5784946b.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/619edb50-cd6bbb5bde50a537.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/62916-d4d65460dc90da97.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/63464-16e615958db51dfc.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/64448-e747c79954757ddd.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/64586-4770bb46c2db57b1.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/64708-bb883498a7779816.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/64821-c6c5bec4cae9a5fb.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/65007-1c21e53d875142c1.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/65010-6a245e739203c9c1.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/65105-b9e8410f01f087aa.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/65583-b37444592a397d85.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/65585-ccd8b520b4a9db11.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/65783-0ed895ad48457f84.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/65836-2a39524aa710da0f.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/66275-af0948931f415fee.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/66545-bd4d7aead3409346.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/66648-f832ba516635d7d5.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/66954-3c4b16b17d43c6fa.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/66ec4792-549e5b0a3b762e8b.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/67929-8bd0ccbb0cfbccce.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/68043.d8e5c1e9468ae4b1.js',
          revision: 'd8e5c1e9468ae4b1',
        },
        {
          url: '/_next/static/chunks/68070-6fff1d43a616a40f.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/68311-0ead1b179649c83b.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/68413-9a731070a347ed28.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/68781-7a939bb21327ed78.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/68859-89a066665a247a5d.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/6955-215a06f411ecf34e.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/69806262-ceb75e79cfa71fae.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/6edf0643-f89a99d1aae6a78e.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/70267-1187ed58a3bae9c9.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/70306-d028ed399f676600.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/70313-e29bf8699e5ff4df.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/70410-deb8426c795f94a5.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/70554-e215c7d2fdacf837.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/7064611b-ec49d644338ee599.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/70e0d97a-59c914a391f46adf.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/71809-c787f77fb3cad2cb.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/72301-b354ac812f1744a4.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/72535-739627e11c0f7d1c.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/73137-ba8393b31f43a183.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/73406-2b4174a19aa257b7.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/73632-554216ec9ed19f33.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/73788-8ba3a440c478df23.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/73896-fe0684464764c134.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/74390-154d37819ceee228.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/74561-007506b298be161a.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/7485-d9822b9981f4c1db.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/74890-c9f6d89b41e539f3.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/75149-0e1b0cf8a95f9ba3.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/76105-6b9929ad10efec2e.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/76214-c46cbae64ef5bc68.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/76247-7d1e7dd4622e5a5f.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/76917-c96c6258a00b68da.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/77088.1b6b03c30b9f6874.js',
          revision: '1b6b03c30b9f6874',
        },
        {
          url: '/_next/static/chunks/77277-759182712c74d28e.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/77447-e55c340082fe75d0.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/77724-fda326fe76debada.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/78458-72db921fe6ff6503.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/78695-6b4d6d2ab16c18bd.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/79170-f14dfc40b07f8a32.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/79458-b30a9f2111995675.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/795d4814-28df363e0796e472.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/79751-128b6703cea96f59.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/79835-81ae02456c59453a.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/8104-6e8641dcba78c746.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/81192-f9206ef0a26666e4.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/81599-9f7b072483205ecf.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/81942-6ba31fcaf0b8aba6.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/82335-0bc4f7306e80e845.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/82701-2f637ef296ee2d46.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/82995-196acc6d27c10d73.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/83268-72f79d105d1b0b4b.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/83360-a18cdbe1909a4380.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/83522-7131fec22a3fd202.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/83629-b96ed230949b9a28.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/8387-64028ae9ac7eacb7.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/84438-1bf1ffd0e51217bc.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/84873-b01efd241480ea57.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/84939-2d3a25c092be82f2.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/85152-bc22ad722aae84c3.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/85190-6554f821d3b4f1be.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/85908-8b9ed4e5f34b4920.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/86113-dd671e2e17d5e908.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/86211-ef07cf8786861505.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/86768-40c474fb4a993d69.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/86960-dc01b802ecafc183.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/87138-8e1fa5cfaf46595c.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/87182-917a991ad2a13704.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/8761-bacdb0c6c99a78e3.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/87614-1c8879e237b10b25.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/87701-3fcc7e761e03724c.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/87930-4dfb755881d69420.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/87994-ec9640f4990ba5cd.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/88256-a9d12dfc88e72584.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/8836-856d4da461517012.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/88813-9f0740d8acf63437.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/89363-511e4677f57226c7.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/89593.3a6f2ace9f663234.js',
          revision: '3a6f2ace9f663234',
        },
        {
          url: '/_next/static/chunks/89876-cd4d6ab066b4cf76.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/8e1d74a4-5edb1603ae7862d3.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/90233-0b0ddca0b4af1a30.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/90491-8203157029675b5a.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/92511-7ea435fffa336a33.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/9257-c006839f7cbc3840.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/92989-fbd4d32a23c4ca6f.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/93122-b4af13b8340dcabe.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/93401-762d2030558489bb.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/93445-f6605552dbde1025.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/94546-a8b5d86975815762.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/94730671-57511971d5fdfae8.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/95582-9c4de78c12b7c06e.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/96111-8326b3c464d79afe.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/96441-9d001c3bdcd966aa.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/96655-5de3f93f378eec5d.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/96761-f0afbdfedb86114a.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/96993-f44b981daec0a50f.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/97211-05c33db8dabb76a3.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/97521-c1e4bad3928f34da.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/97579-fc9e6ec2d1f0a40c.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/98436.5bca96346770ad17.js',
          revision: '5bca96346770ad17',
        },
        {
          url: '/_next/static/chunks/98577-06481d300dd26079.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/99486-279dd9c04fd3e37c.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/99804-ffe1c67cc9ae3ca3.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/9c4e2130-5670c26554b06177.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/ad2866b8-decfcfa34a868fd6.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/%5Bid%5D/page-b9b92fb12832ff86.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/allAllowance/page-2e5124523c3f97e8.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/layout-720d9fe0ba86ca5c.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/page-d9227aea909e0468.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/%5Bid%5D/page-0f31e90eaca0cfb2.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/layout-d874538a573f3833.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/page-48b7b419dad65983.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/variablePay/page-58c015fa65327e4b.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/allowanceType/page-18d11eb60c13781d.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/benefitType/page-bce5c409d678c138.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/deductionType/page-f00890b398231a41.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/layout-751641dda0b3882a.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/page-db6ebf52fcda2fc6.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/%5Bid%5D/page-a6da90439e76d1b5.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/allDeduction/page-a6a7505d0ba0c2d4.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/layout-9677a0d58902d495.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/page-d58690ba7e832fe0.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/dashboard/page-956e80b5e43e92fe.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/dashboard/timesheet/page-fa0e684fd00907d2.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/departmentRequest/page-0a284ec521d76806.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/manage-employees/%5Bid%5D/page-cc7faa8e5c6ccc41.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/manage-employees/page-b0041132e8dd313c.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/notification/page-173071d0aae3e9bc.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/approvals/page-0fd5f84442d7f3c2.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/customFields/page-96cfd086aac7ade3.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/employementType/page-385f639b691faf29.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/layout-b726a6f7b9433900.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/page-31b3fb4c73e80bbc.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/positions/page-8f672b10cb2b27a8.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/rolePermission/page-9681d41ec34b1e7e.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/action-plan/page-ffde72214e25353f.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/categories/%5Bid%5D/page-2c8acf0e5cb96fbd.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/categories/%5Bid%5D/survey/%5Bslug%5D/page-44b3ad1bb64b9acc.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/categories/page-ea86001e7646522c.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/%5Bid%5D/%5Bslug%5D/meetings/page-6eebcb88b1bc57a3.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/%5Bid%5D/%5Bslug%5D/page-ab9cfc90599c276e.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/%5Bid%5D/page-8e23b5f11c6e4510.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/page-35dc96fd3adab4d5.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/feedback/page-21ea95bb95378fe6.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/meeting/%5Bid%5D/page-c099431f5364edbf.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/meeting/page-2ebd51bb9c643447.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/recognition/%5Bid%5D/page-2d1b400702b11d36.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/recognition/detail/layout-1dc3185ef7faa1c2.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/recognition/detail/page-bf6b2b0b289daf3e.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/recognition/detail/recognition-type/page-d46f35a084b342a6.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/recognition/page-1f653177db42ec44.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/define-feedback/page-5573583185ad97d3.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/define-meeting-type/%5BmeetingTypeId%5D/page-f46acd650e694819.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/define-meeting-type/page-b09422fcdb6b4c8e.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/define-questions/page-1f68d43869dfae83.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/layout-499bfbcd8e318720.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/loading-82ff3ef480a4ebcb.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/page-8a84594a93304b7f.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/recognition/%5BrecognitionId%5D/page-d8233af00cb4ed59.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/recognition/page-9257d01f420ea1e5.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/survey-category/page-6d5354d20e9e4930.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/target-achievement/page-e52428e281d6dbbc.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/compensation/all/page-4f393047b0a0a85d.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/detail/%5BdataId%5D/page-c79dfcb362411652.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/page-aaf943b533d27e82.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/payroll-detail/%5Bid%5D/page-ea7cab039d8c8aaf.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/%5Bid%5D/page-18f5b262008d1eb7.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/defaultIncentiveCard/page-80a44f4adb469a3f.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/layout-e0eda2b6f30e8ffc.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/page-2ede8f85eeb4238b.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(incentive)/variable-pay/page-4128d504ee77476a.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(noAdminLayout)/admin/subscription-expired/page-9903fec20efeec08.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/page-329fdfd482ece3e6.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/reprimand-appreciation/appreciation/%5Bid%5D/page-547bf7465832360e.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/reprimand-appreciation/page-33040204b4aa7c5c.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/reprimand-appreciation/reprimand/%5Bid%5D/page-18769c912e36ad30.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/dashboard/%5BemployeeId%5D/page-b03908e08418769f.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/dashboard/page-a6292a356c8c34fc.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/page-b9144d7467031a47.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/assign-average-okr-rule/page-c0992572f731586d.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/check-in-rule/page-cbfe18fbb1f5f81c.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/criteria-management/page-ea1b96e3954759da.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/define-appreciation/page-297336108935ec5d.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/define-okr-rule/page-ab01291ffaef2ae0.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/define-reprimand/page-4620a27a9ef253fd.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/edit-access/page-73783a421368ae45.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/layout-3e5f11943ed4b052.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/loading-7885ee57bdcec3a8.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/okr-setting-menu/page-b858be7f36fa527a.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/okr-type/page-0021476d2fd45666.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/page-abb519c376e75d47.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/planning-assignation/page-460197b460c81517.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/planning-period/page-11e673f63f9a8ea7.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/target-assignment/page-148ef7399c4f3469.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(onboarding)/onboarding/page-c07a0e4c2c63504d.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/layout-0f48b34c9f8056b0.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/org-chart/page-07f9c1aea073f9bf.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/org-structure/page-c9947791ae7f140a.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/page-10fd3fc87fa83ce8.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/branches/page-66107691db78f4f0.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/fiscalYear/fiscalYearCard/page-205b702ea76f3aa1.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/layout-eca805fdf24e6016.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/merge/page-3cbcc8ac14d0ff8d.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/page-7be40a3a1ddab0d6.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/transfer/page-176879a09f17e723.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/workSchedule/page-480527f8b615e0b5.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/employee-information/%5Bid%5D/page-2d205969f86d6f91.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/employee-information/page-db9babadb1219a2e.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/finance-bashboard/page-fb1effe58cbb21a0.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/myPayroll/page-1c81a9aeb4b715df.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/payroll/page-7aa0f2025094fde1.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/payroll/reconcilation/page-2c4ca3116f0e69b9.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/approvals/page-d9c37477a0844c2f.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/banks/page-94dc89e983152613.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/layout-97e0db0962d6eb54.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/page-ec5821f0ddcafe21.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/pay-period/page-37107fa6b1066382.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/pension/page-99189eaacb72fb25.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/tax-rule/page-5b5bc3736add33a7.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(planningAndReporting)/planning-and-reporting/page-c537241075bfd7f0.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/ai-job-matching/%5BjobId%5D/page-989a0ebdafbd2402.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/ai-job-matching/page-a30cf569780073c0.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/candidate/%5Bid%5D/page-4cf6552478fb5d20.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/candidate/page-c195fb57c3b45a43.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/dashboard/page-a03b8e2804afef71.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/hrflow.ai/candidate/%5Bid%5D/page-ffa873352fdfa601.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/hrflow.ai/page-e06af9d35ef27a1b.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/jobs/%5Bid%5D/candidates/%5BcandidateId%5D/page-01c29bbac7c694e2.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/jobs/%5Bid%5D/page-70b1c3f4057e5477.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/jobs/page-14c7d7bda6b8e062.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/layout-f3b29b0dd4c86251.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/approvalWorkflow/page-eef88104c3d5cb6d.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/customFields/page-7ae3aed35f22a81d.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/layout-4d9da5a628c3d7a1.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/page-ccd6395a6d567161.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/status/page-bb3da376f2601deb.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/talentPoolCategory/talentPoolCategoryTab/page-38979cd60ea0e8c4.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/intern/%5Bid%5D/page-0f466de918651a55.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/intern/page-53dcca13e7a8d8d0.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/page-4a8b3013bcba0c0f.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/talent-pool/page-b100b41c35684cdd.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/talent-roaster/%5Bid%5D/page-7d144b9b525ff214.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/talent-roaster/page-b491fc7c6aab3c24.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/dashboard/page-aed97cc0af8dc60d.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/employee-attendance/page-722140a13d29d4a3.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/layout-1c47ba6da29a3189.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/leave-balance/page-4db7549734153b8d.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/leaves/page-9554ef8b3072d992.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/page-fd5231d6c51a4f82.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/my-timesheet/attendance/page-31250aba0de9875d.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/my-timesheet/layout-41599491b5bccfd8.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/my-timesheet/leave/page-ee5d9338473d1eb3.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/my-timesheet/my-approvals/page-96bc64ff5af41e16.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/my-timesheet/overview/page-327ec409e27e8449.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/my-timesheet/page-ea14a467e8ed790b.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/my-timesheet/work-from-home/page-8daa32d7c76e8903.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/accrual-rule/page-960cab6c4ba2122f.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/allowed-area-configuration/page-08a3b3e2b9150edc.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/allowed-areas/page-4a124e410f8dc4b3.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/approvals/page-7b5fa44c194d25a5.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/attendance-rules/page-b879ea8b3dcd631a.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/break-type/page-eeda8a856b9a237c.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/carry-over-rule/page-db0f6c6b4287f007.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/closed-date/page-cdd80ef304464d2f.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/configuration-vp-deduction/page-60d6017847734cf2.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/imported-logs/page-120f3cfb24788428.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/layout-650a8fb2ca05bb20.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/leave-types-and-policies/page-5411322f93c63347.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/page-7a662c3a656e0ada.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/time-zone/page-955585a9894ce4c4.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/workSchedule/page-3988e7c79dbf5f78.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/zkt-addon/page-a168588d7506f9e1.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/%5Bid%5D/%5BlessonId%5D/%5BmaterialId%5D/page-141f644d89ca85da.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/%5Bid%5D/layout-fa73544ce3a2394f.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/%5Bid%5D/page-1770b2e560ef6192.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/page-d4d24a73eb7e1978.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/my-training/%5Bid%5D/page-e6cc74e4021ddb55.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/my-training/page-2ba5ed12f774961d.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/review/%5Bid%5D/page-097e4233039a109b.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/review/page-974c027c7a33588d.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/approvals/page-e003066217f17da7.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/approvals/workFlow/approvalSetting/page-6dd826f0fd36ce30.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/approvals/workFlow/page-a49388061ff805a0.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/commitment-rule/page-7bb053f407bc4640.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/course-category/page-6629d8f3076bc743.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/layout-b7e0285e69719969.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/tna-category/page-347e40e7c9473f4e.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/(weeklyPriority)/weekly-priority/page-99e3a2c63a0a524c.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/billing/page-84bdd0ebda541409.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/dashboard/page-162e4826fb8d6f24.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/invoice/%5Bid%5D/page-39fd74377addf692.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/layout-eff774288db6a718.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/plan/page-0704644c302ce67f.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/admin/profile/page-7729c20d79daf6ee.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/audit-log/%5Bid%5D/page-5a9700171d929a47.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/audit-log/page-1927c6c5bea39a21.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/copilot/page-ddbcf0db5784d12a.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/dashboard/page-978b01c729988442.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/dashboard/vp/page-f5d788260c3b777f.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/performance/employees/page-6e414f6e39317f49.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(afterLogin)/performance/page-826c0b7c364a38e8.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(beforeLogin)/authentication/forget-password/page-149c5243ef05b2c6.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(beforeLogin)/authentication/login/page-f5a43959f97b47f7.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(beforeLogin)/authentication/new-password/page-b9f5a7e84ea6f26b.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(beforeLogin)/authentication/reset-password/page-35ea7db9b469780d.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(publicForms)/job/%5BtenantId%5D/%5BjobId%5D/page-a01427a6340d6581.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(publicForms)/job/openPositions/%5Bid%5D/page-ba6abbb99019e544.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(publicForms)/job/openPositions/page-840d2500ce8ae145.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/(publicForms)/surveys/%5Bid%5D/page-753d5810b1654376.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-35908e686a407458.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/layout-7910b780dd316110.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/loading-f00c510d4a2ea3c9.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/not-found-cf77879fded00e19.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/offline/page-2613e5dc065cf861.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/page-34664ed3e6de74f1.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/app/verify-email-change/page-94261908ed50383a.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/b2d98e07-b818a6bc88fe3308.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/b563f954-0da385f687c08029.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/bc98253f.5f6309329dba6fb0.js',
          revision: '5f6309329dba6fb0',
        },
        {
          url: '/_next/static/chunks/c37d3baf.775911096ca8af48.js',
          revision: '775911096ca8af48',
        },
        {
          url: '/_next/static/chunks/c916193b-f7d8680f2f76a37c.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/ca377847-d415324d6473a141.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/cff4c5fa.d47e0fd842c4e814.js',
          revision: 'd47e0fd842c4e814',
        },
        {
          url: '/_next/static/chunks/d0deef33-8ab9de873bac29a1.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/d78ee677-ee1bc52d56a68121.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/e34aaff9-2b0681df9f1224f7.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/ee560e2c-fc4ca985530e75e2.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/eec3d76d-245372a8f7f34761.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/f25cdb8d-2b206e915e7bdf2f.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/f7333993-b50d7f97027357da.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/f8025e75-c5a79f360d52439d.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/f97e080b-dd28df0104dcf4ab.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/fd9d1056-6fa5a42c5810fdb7.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/ff804112-34b819d03a291598.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/framework-fc8646f6d41d9275.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/main-51d4d4373331c11b.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/main-app-edf0f901dc612cab.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/pages/_app-d888e02deba93f3c.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/pages/_error-8ec9a1983a76c7f2.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/chunks/polyfills-78c92fac7aa8fdd8.js',
          revision: '79330112775102f91e1010318bae2bd3',
        },
        {
          url: '/_next/static/chunks/reactPlayerDailyMotion.68c47d26b0f7ccf7.js',
          revision: '68c47d26b0f7ccf7',
        },
        {
          url: '/_next/static/chunks/reactPlayerFacebook.e2cb719b674515b8.js',
          revision: 'e2cb719b674515b8',
        },
        {
          url: '/_next/static/chunks/reactPlayerFilePlayer.32f90de923dbbf21.js',
          revision: '32f90de923dbbf21',
        },
        {
          url: '/_next/static/chunks/reactPlayerKaltura.af03175f474244f3.js',
          revision: 'af03175f474244f3',
        },
        {
          url: '/_next/static/chunks/reactPlayerMixcloud.99aa417ffb6a8630.js',
          revision: '99aa417ffb6a8630',
        },
        {
          url: '/_next/static/chunks/reactPlayerMux.949401e77f8c4896.js',
          revision: '949401e77f8c4896',
        },
        {
          url: '/_next/static/chunks/reactPlayerPreview.1f5deef1b12fee24.js',
          revision: '1f5deef1b12fee24',
        },
        {
          url: '/_next/static/chunks/reactPlayerSoundCloud.fa4e8bd9418388db.js',
          revision: 'fa4e8bd9418388db',
        },
        {
          url: '/_next/static/chunks/reactPlayerStreamable.665487bd7774e821.js',
          revision: '665487bd7774e821',
        },
        {
          url: '/_next/static/chunks/reactPlayerTwitch.972fca171a6b1e1c.js',
          revision: '972fca171a6b1e1c',
        },
        {
          url: '/_next/static/chunks/reactPlayerVidyard.278864714a383d99.js',
          revision: '278864714a383d99',
        },
        {
          url: '/_next/static/chunks/reactPlayerVimeo.5c49eae38e870fdc.js',
          revision: '5c49eae38e870fdc',
        },
        {
          url: '/_next/static/chunks/reactPlayerWistia.a928d4d60ab3d2b4.js',
          revision: 'a928d4d60ab3d2b4',
        },
        {
          url: '/_next/static/chunks/reactPlayerYouTube.8746f2b11aa1fc59.js',
          revision: '8746f2b11aa1fc59',
        },
        {
          url: '/_next/static/chunks/webpack-dadb28406f260a1b.js',
          revision: 'YUAxIwuWtbAj0MGHoPb71',
        },
        {
          url: '/_next/static/css/013a8dad4c623f2b.css',
          revision: '013a8dad4c623f2b',
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
          url: '/_next/static/css/65f393144bdae2f1.css',
          revision: '65f393144bdae2f1',
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
          url: '/_next/static/css/913024b46807b6cc.css',
          revision: '913024b46807b6cc',
        },
        {
          url: '/_next/static/css/9a07e7845210a3db.css',
          revision: '9a07e7845210a3db',
        },
        {
          url: '/_next/static/css/f59bfee53fbffbfb.css',
          revision: 'f59bfee53fbffbfb',
        },
        {
          url: '/_next/static/media/Button.de1a4b87.svg',
          revision: 'b2b4e99c2daf40ed3527c64e8391c7b0',
        },
        {
          url: '/_next/static/media/criterion.e94e7317.svg',
          revision: '166495c92214a974069f3e2c24324a61',
        },
        {
          url: '/_next/static/media/gender_neutral_avatar.230de99d.jpg',
          revision: '45d542824fb7724e4015d67df272855c',
        },
        {
          url: '/_next/static/media/incentiveAmount.f0592182.svg',
          revision: '1e8e39063ed85298ce2c38cdb71d4920',
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
          url: '/_next/static/media/projects.967587f0.svg',
          revision: '719778ab1d8cad972fe964cbe0f213e6',
        },
        {
          url: '/_next/static/media/recognizedEmployees.812abd7b.svg',
          revision: 'e6291a2aa5435d08b87c40d75d23b660',
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
          revision: '6d4eaffbf8789be6a26a5c85b2ae30ef',
        },
        { url: '/deleteSvg.svg', revision: '744c3a9ebff8177e8bb8e09d8185a9c2' },
        { url: '/favicon.ico', revision: '6540cc8c08e61e7d85a0bc7595c9cd9c' },
        {
          url: '/gender_neutral_avatar.jpg',
          revision: '45d542824fb7724e4015d67df272855c',
        },
        { url: '/icons/192.png', revision: '55c1496af8c3fd0539c0adf6e3a93716' },
        { url: '/icons/256.png', revision: '7ae7dd35bb280456a022a8bd6368e23f' },
        { url: '/icons/404.svg', revision: 'c5492d9a5833b96527f63abc7e248d50' },
        { url: '/icons/512.png', revision: 'b98750e581cf0394d27cbdb8c4ad7946' },
        {
          url: '/icons/Logo.svg',
          revision: '4e00c6daf17e4e803873499b6fc381ed',
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
          revision: 'fcb8ffbe3041d53af164a53e609ab170',
        },
        {
          url: '/icons/datanotfound.svg',
          revision: 'd47460e003a9e8059af1ef094fdd5a7c',
        },
        {
          url: '/icons/file-download.svg',
          revision: 'bda031a40de12ba5727bc4901dabeb8f',
        },
        {
          url: '/icons/gallery-add.svg',
          revision: 'fe1a66697a0671de0e91d4679f656691',
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
          revision: '597e55088270440260b7f59617e8c6ab',
        },
        {
          url: '/icons/status/reject.svg',
          revision: '9e98238df1fde9d9e75c8f36bd35277c',
        },
        {
          url: '/icons/status/verify.svg',
          revision: 'e205773c2782f7c669952dbcf9262eff',
        },
        {
          url: '/icons/stripe-pay.svg',
          revision: '7e2352baaf4762bc783d01f6857908d5',
        },
        {
          url: '/icons/success.svg',
          revision: '319aa33fd69d495a9f46f76d1a72ed7c',
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
          revision: 'b2b4e99c2daf40ed3527c64e8391c7b0',
        },
        { url: '/image/IE.png', revision: '3144fe0276e36e258002b78cecc2db2f' },
        {
          url: '/image/Logo.png',
          revision: 'dbf6623ead59c845ad45997ba292ee56',
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
          url: '/image/selamnew-workspace-logo-collapsed.svg',
          revision: '2e671480fdd1ef00006bec088a7f2164',
        },
        {
          url: '/image/selamnew-workspace-logo.svg',
          revision: '381d8a11521c075808d8a7e93e5767b6',
        },
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
          revision: '3766314ef1572dfefa824037f3836229',
        },
        { url: '/image14.png', revision: 'b7c26a7e9db9d8ee764be370bd65001c' },
        { url: '/image15.png', revision: 'a7b423233de722d8f24027f12aaf5a54' },
        { url: '/image16.png', revision: '999a97857b38ad90e6e9ed88d7b4009d' },
        {
          url: '/images/auth-login/Group2.png',
          revision: '8091a52f6cbda42879a61425a6d59b10',
        },
        {
          url: '/images/auth-login/Group3.png',
          revision: '75d095eab2dafa749c6888f1ecf4e0b0',
        },
        {
          url: '/images/auth-login/image14.png',
          revision: 'b7c26a7e9db9d8ee764be370bd65001c',
        },
        {
          url: '/images/auth-login/image15.png',
          revision: 'a7b423233de722d8f24027f12aaf5a54',
        },
        {
          url: '/images/auth-login/image16.png',
          revision: '999a97857b38ad90e6e9ed88d7b4009d',
        },
        {
          url: '/login-background.png',
          revision: '715addd23ceff9820a0eb97d8d40bb6f',
        },
        { url: '/manifest.json', revision: '493e2b19ca63825e0550569fa1f4dd21' },
        { url: '/next.svg', revision: '8e061864f388b47f33a1c3780831193e' },
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
        ],
      }),
      'GET',
    ));
});
