// if (!self.define) {
//   let e,
//     n = {};
//   const t = (t, i) => (
//     (t = new URL(t + '.js', i).href),
//     n[t] ||
//       new Promise((n) => {
//         if ('document' in self) {
//           const e = document.createElement('script');
//           ((e.src = t), (e.onload = n), document.head.appendChild(e));
//         } else ((e = t), importScripts(t), n());
//       }).then(() => {
//         let e = n[t];
//         if (!e) throw new Error(`Module ${t} didn’t register its module`);
//         return e;
//       })
//   );
//   self.define = (i, s) => {
//     const a =
//       e ||
//       ('document' in self ? document.currentScript.src : '') ||
//       location.href;
//     if (n[a]) return;
//     let r = {};
//     const c = (e) => t(e, a),
//       o = { module: { uri: a }, exports: r, require: c };
//     n[a] = Promise.all(i.map((e) => o[e] || c(e))).then((e) => (s(...e), r));
//   };
// }
// define(['./workbox-00a24876'], function (e) {
//   'use strict';
//   (importScripts('fallback-rCFRjZSlGWTIHj3ontVOE.js'),
//     self.skipWaiting(),
//     e.clientsClaim(),
//     e.precacheAndRoute(
//       [
//         {
//           url: '/Attendance_Template.xlsx',
//           revision: 'db5385179e74942d071a45ea264253b8',
//         },
//         { url: '/Uploading.png', revision: '6d146f1e502895fc44f2587b1d0f975c' },
//         {
//           url: '/_next/app-build-manifest.json',
//           revision: '3ce56ecf66cb8c481bf9dc57c2367bda',
//         },
//         {
//           url: '/_next/static/chunks/0e762574-f41e02d330293e8f.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/1004-130ad867255d3eb6.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/1056-75ed61d1f2ff4ef5.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/110-53c81054e55bd1e3.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/1113-7234d9819a9380f8.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/11390db7-3039854f365bab9a.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/1266-460a9bdfb11f8bd4.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/1305-6c59cf57b9d6170a.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/1384-cc4be0ffbce2e1d7.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/147-949ac02b796ee057.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/1506-c3be3982e5c9acfa.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/152-85660e3fe27f2fa4.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/1569-e1cbb513bd1eff37.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/1587-5835d85498c4f57b.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/159-a1c578b47c09ea51.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/1642-be24bf72af408f96.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/164f4fb6-a4176ac3c168486b.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/1768-bade7807d63e6534.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/1822-b511b4d2a30e3d8e.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/1838.20f56d2166206178.js',
//           revision: '20f56d2166206178',
//         },
//         {
//           url: '/_next/static/chunks/1840-591841a021f51d18.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/1867-751f580c9a980d8d.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/1899-a14ffcc6b5e91031.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/1951-8790f98ae889c515.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/2091-f45115bc7cdaa249.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/2095-5694296678ae1c00.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/2140-c27b4f0057f80ae8.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/2300-2d25c3481847cbdf.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/2320-14239bede803790d.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/2324-3f09a8827d477f8d.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/233-0be96a788051e109.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/2459-bfd50620a35375f4.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/256-3ec7caa236411b86.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/2625-506f52ccbf6435cd.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/2649-2205adb5d9831ee4.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/2797-d24db4b34b34e338.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/2845-7719037afaf3f7b6.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/2929-15515ec8425e5a4b.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/2941-f91610059d9e2d89.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/3020-719a6cb1e5c0e501.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/3039-4cfb9768718e040b.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/308-113a80ce9003733c.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/30a37ab2-a460757850b45c64.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/3223-70f26399319f2973.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/325-919026e3aa8aef61.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/3405-085afd84a9924a4c.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/3461-3120d3f0d208bb86.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/3562-5da69d5e036b413e.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/3571-e83ea7cfedf0b0c2.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/3742-d36fc44d114cbbe2.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/3788-1891a55241307bfc.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/3829-00d2a6edee95aac2.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/385cb88d-551da5ab57360a6e.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/3884-340a76fa2167133b.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/3896-1e7b1e5faa22c5bb.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/3938-56e10a9b6e490707.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/3962-d4ef88842ffb3292.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/3d47b92a-565c0750f500b4ca.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/4025-918e26d6ef1574f6.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/4108-e4ec8a13c00d1982.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/4173-e7e4c12b9afe3758.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/4206-36da1fb6a649f761.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/4298-d681bf236643c0e1.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/4498-0f3bab06244fccf3.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/4548-a858aefdaa8f5ba5.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/455-4df56a275cba0146.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/462095b7-a435d8e876f42bc8.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/4775-8e82d0f382188537.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/4786-f94f90d3d05b86af.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/479ba886-a1bc7036e103b388.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/4850-c65c6e8c18e6ae63.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/4873-d34a30a91f2adfdf.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/495-57ea3a60b21dca80.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/4977-8e3add12f3ae2b88.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/4979-e95a78d95abd702e.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/5033-37409a46b933b5fc.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/5159-d0de15c0fef9bc24.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/52ab8b6c-cab1d6bac8bb745b.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/5332-c69cdcb5099147ce.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/53c13509-ac5efc0264558f44.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/5406-ec94ff48a0e991ad.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/5451-e147c2f34e3136cd.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/5478-c3ba10b4a23ba91c.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/5479-7b81c0026c0d10f4.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/54a60aa6-e47e3bfc808452bd.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/5541-75b255d2b75f4326.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/56-a81c47c5af542317.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/5623-3d6e1252b2f39424.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/5625-afb116908654d250.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/5710-b04f86069c4d675d.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/5738-1c7dc37b1f295018.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/5785-d37127fb63f7a788.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/578c2090-fb35812c82abe289.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/5836-09ec83f8991d8e75.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/5892-2a9e4c0c36bff35b.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/5913-912d1304874c9440.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/5922-5047530fd4485a86.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/59650de3-0815bf4e7ee36ce6.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/5982-db61c2faf9e2b6ad.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/5e22fd23-b18dbc9e1b2b7ee4.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/6049-e08f5fee96d8052f.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/6098-006514ac8adde89e.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/6119-510d996c254b7b1e.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/6151-53c285bbee4056ac.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/617-8a70f848642bec5d.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/6238-0549d787e66c5cc3.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/633-cfb3034c00d01619.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/6363-a842b0e91457a26b.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/6484-39b020cc13c49652.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/6494-b29630549471bd71.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/6496-275802eea09e30d5.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/6512-238ce89019c5be28.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/6514-722fc7cdb33eef2b.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/6515-4bffc1b775d7f152.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/6567-d79549a382863526.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/6697-6aebe01e8a376123.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/66ec4792-83173eb1d81638d8.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/6700-1c23a8c5ed2ce523.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/6817-a890d8e54c182f7d.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/6832-857a692d4d089096.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/6857-f8e68eb15d92a458.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/69806262-7b66b328cecc88bc.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/6edf0643-3339f6c96a12fdde.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/7005-af3dfa57e20a9514.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/7023-bf025b709ee5eb0d.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/7064611b-4506a439cc3ebeed.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/7088.da74220ab5cdd5ba.js',
//           revision: 'da74220ab5cdd5ba',
//         },
//         {
//           url: '/_next/static/chunks/70e0d97a-92de8b1495483d75.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/7121-1357230b8afe102b.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/7138-8ad09c5bd276b562.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/7168-a73635aa28e40ef4.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/718-55fcd861e44a945a.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/7220-4787183712a5fc4d.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/7269-373804a6bae9e6c1.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/7271-5587cee2dc6ab8a3.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/7342-0ce6c9683e18e647.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/7428-8bc8c14e4a7500b1.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/7431-f639c35b382827b7.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/7459-39ddd84a552432ab.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/7460-7d4b0f86a111bd63.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/7551-9b20d9fe6b7aa58c.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/7565-b474222a7593b19b.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/7605-c4e680a755d8a9fd.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/7610-3f6fa7958eda0c37.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/7621-9806027b2e4a3ae8.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/7701-3bfa552130778c48.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/7782-8bc006bc94d33ec1.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/7806-724844b40f1a94ab.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/7834-19d604d9e7921b22.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/7907-f2945c9e06515d7e.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/795d4814-208d291a5c031113.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/797-962d762a25a902c1.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/8025-51f52b540634d466.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/8103-0f060a7d45099a58.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/812-adb535242ea4dc29.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/8187f03c-32cdd35874b2b4d2.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/8246-3a3fa5a2c2a4ca2b.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/829-6bf27a74cddb5418.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/8337-f9d3f023629907ab.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/8354-5051393c794ceaa4.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/8357-6ae9dd4899d0ada8.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/8387-3be92f75fa87551f.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/8406-89ad6441d61198b3.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/8413-000034901370ef84.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/8418-fc52f1da133ade3d.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/8436.acfc52fd47e83fa1.js',
//           revision: 'acfc52fd47e83fa1',
//         },
//         {
//           url: '/_next/static/chunks/849-6015f484c15957f6.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/8521-2233790e0793cefc.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/8625-1c301e342b7db1af.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/8836-fb61435666bc5169.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/8854-8f1b0f152428266d.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/8874-586a31cc729f7138.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/8918-89e6768e765422e3.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/8970-1cfee1bdf21deab0.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/8e1d74a4-2ec4daf88e740da5.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/9004-4e61b7e993f41019.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/902-7a30f8b551bdca9b.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/9025-a91ae2dd10d72461.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/9029-b3398173a4434e85.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/9136-f025bf842c909a85.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/9197-92a38862ef131820.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/9364-176098efe9b1a1fa.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/94730671-b4487d1e3f624427.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/958-9ca456d527a91ae3.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/963-1b801543d9e94098.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/9790-c273d10af3e9e55b.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/9827-f12c81922244136a.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/9876-6c7187dbbb418bc9.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/9884-c17eeea67d16253d.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/9885-1782e691246e3e31.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/9974-bb8ebfdd3229d7a2.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/9c4e2130-31e5f0d71622ee86.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/ad2866b8-b2aba5370a0d21e8.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/%5Bid%5D/page-c25107e17a63626a.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/allAllowance/page-2d43cfb279f82be7.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/layout-b448d5ec58b5892b.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(compensation)/allowance/page-d23516a0096d6b66.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/%5Bid%5D/page-330e2d11ed626757.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/layout-f9d3dd29cfd1ff4f.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/page-a620b8f984245de6.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(compensation)/benefit/variablePay/page-370cdba8bf081aeb.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/allowanceType/page-6fc1ba3a1f8e54df.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/benefitType/page-edbe50257c29078d.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/deductionType/page-bad06955cd8a4a69.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/layout-a1c4c1800666c798.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(compensation)/compensationSetting/page-784c1b6518fd7f5b.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/%5Bid%5D/page-68110fa4329847b4.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/allDeduction/page-560f4b89409c3d95.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/layout-9af16a1cd43ae29d.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(compensation)/deduction/page-b75b434dcc6859ca.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/departmentRequest/page-cc4d983f231713cc.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/manage-employees/%5Bid%5D/page-08bde0e1c67c3901.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/manage-employees/page-5521f9d2291b764e.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/notification/page-4097aa7654104db1.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/approvals/page-12aa3a1eafbb214c.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/employementType/page-b9e182faf96d0639.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/layout-7b29260febeed123.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/page-6c3e5204d77080b8.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/positions/page-87586d03e4ca62f9.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(employeeInformation)/employees/settings/rolePermission/page-d902f6daa5acd3bf.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/action-plan/page-e4fad4f84d71f277.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/categories/%5Bid%5D/page-bb3644c76e9e31c7.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/categories/%5Bid%5D/survey/%5Bslug%5D/page-4ed3b8319cf2d80c.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/categories/page-2d0ec8e3b3ab6d23.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/%5Bid%5D/%5Bslug%5D/meetings/page-7c994b7b3ae11201.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/%5Bid%5D/%5Bslug%5D/page-b9b843f237829488.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/%5Bid%5D/page-2662a665cb49e3de.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/conversation/page-b5e2aece24bdcd6a.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/feedback/page-e6784aded2408762.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/meeting/%5Bid%5D/page-6df23761b0d75360.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/meeting/page-65ef73d2585985ad.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/recognition/%5Bid%5D/page-ebab33a57122b9e6.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/recognition/page-8423786342dcb389.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/define-feedback/page-f822ee0051031734.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/define-meeting-type/page-7a5cf6d7e34e2ca7.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/define-questions/page-90279b833eade207.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/layout-fc26cbcab9c59933.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/page-e0e846a22afdc2ac.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/recognition/page-c045c371a85e7cf6.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(feedback)/feedback/settings/target-achievement/page-077aaf437997ce7f.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/compensation/all/page-14f107d3acd4f3be.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/detail/%5BdataId%5D/page-c3bf02ec20379956.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/page-066feb7851689b8c.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/payroll-detail/%5Bid%5D/page-0fb68673a265c24b.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/%5Bid%5D/page-a180fb496604e5fe.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/defaultIncentiveCard/page-ab7814c7c564a192.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/layout-567ada15ec201613.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(incentive)/incentives/settings/page-8d3c8953fe3a6b68.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(incentive)/variable-pay/page-7206d85ef759407e.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/page-e413c93791e09678.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/reprimand-appreciation/appreciation/%5Bid%5D/page-99da687f5b736ced.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/reprimand-appreciation/page-4083555e1078a5e3.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/monitoring-evaluation/reprimand-appreciation/reprimand/%5Bid%5D/page-84c45a187087aba0.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/dashboard/%5BemployeeId%5D/page-06a1136172b6757e.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/dashboard/page-4c86021c2956de46.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/page-a0ffae57a0b201aa.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/criteria-management/page-830df67f16ea1b62.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/define-appreciation/page-4469b4e8dd19c7cb.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/define-okr-rule/page-3c4cf035a65b7701.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/define-reprimand/page-45132fbd3a8b4046.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/edit-access/page-b2f613dce4bad687.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/layout-11fdd184c423e816.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/okr-setting-menu/page-0286733889528c50.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/page-ca8b5f6315dbffdf.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/planning-assignation/page-bf0bfbfc7cf84798.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/planning-period/page-809e810da165af52.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(okrplanning)/okr/settings/target-assignment/page-f7cc4a8ad59bd04b.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(onboarding)/onboarding/page-b94df3a03e0f2240.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/layout-364480409e9a236b.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/org-chart/page-aef3077bb83c497c.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/org-structure/page-f8b528b55da6b320.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/chart/page-efb753a3f2ce915f.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/branches/page-bdd3a0062db51e8a.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/fiscalYear/fiscalYearCard/page-c65b66c3ac02d0a9.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/layout-299fae7f3d45e811.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/page-0d7e4dbeabfab419.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(organizationalStructure)/organization/settings/workSchedule/page-9a505b2f95d2e043.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(payroll)/employee-information/%5Bid%5D/page-b569ddd15e33b658.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(payroll)/employee-information/page-2ce46405b19acccb.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(payroll)/myPayroll/page-f72d39ed093b7f39.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(payroll)/payroll/page-fbfcc9ebdaef2d78.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/banks/page-369b1528532320d9.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/layout-53e9136797c9d7fc.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/page-1ce4f4a4078e309c.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/pay-period/page-ec17bd14ff1174cc.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/pension/page-5a4fe70ffb924834.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(payroll)/settings/tax-rule/page-53a4612fce9140db.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(planningAndReporting)/planning-and-reporting/page-7ebb19ff974944db.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/candidate/page-1a4b0b3ebfcad77e.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/dashboard/page-98a6dd86ed9d2094.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/hrflow.ai/candidate/%5Bid%5D/page-66a38131690a03d0.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/hrflow.ai/page-61ce4e203e1d6c68.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/jobs/%5Bid%5D/page-b09b3e8835fe7eaf.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/jobs/page-40632f93a573bb69.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/customFields/page-f19164a16c987f34.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/layout-eaa8a45b3fdf6a78.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/page-a58af168e633c438.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/status/page-16fc3f8ae2493453.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/settings/talentPoolCategory/talentPoolCategoryTab/page-e3b9b802ec28dcdd.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/intern/%5Bid%5D/page-55c1902fa8475ea6.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/intern/page-9984822e6a8e1f78.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/page-4d8d5bd472e1cfc6.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/talent-pool/page-3d67e2f6aa49ab45.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/talent-roaster/%5Bid%5D/page-cc93b40dd1221346.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(recruitment)/recruitment/talent-resource/talent-roaster/page-a79a998ea0315a74.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/dashboard/page-8c410f988b13d40e.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/employee-attendance/page-1783d46508f00f5f.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/layout-180adc8d4f2ac4cd.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/leave-balance/page-47033bd408de1404.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/leaves/page-cb5f12dbcc271e21.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/page-48ee1b434663165e.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/my-timesheet/page-5e84091b2dddb621.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/accrual-rule/page-b9c9dd3faa5c1bc1.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/allowed-areas/page-0b40cebd444fd790.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/approvals/page-d83c131ff669c118.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/approvals/workFlow/approvalSetting/page-88ac9a1d6cd0f609.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/approvals/workFlow/page-7bfc90e0a711b4aa.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/attendance-rules/page-cbf42bbed95592e9.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/break-type/page-89035a5cb243a9d5.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/carry-over-rule/page-6faf92652187ec98.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/closed-date/page-23147490f3744c37.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/imported-logs/page-12ec18660c619309.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/layout-dcacd20d0a68a97b.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/leave-types-and-policies/page-b6ee1fd25bb546ff.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/page-b33aa0adee58dc1e.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(timesheetInformation)/timesheet/settings/time-zone/page-7fbf76dfbb03492e.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/%5Bid%5D/%5BlessonId%5D/%5BmaterialId%5D/page-f1f6cb4c2e5da270.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/%5Bid%5D/layout-2fe26635de5f9de8.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/%5Bid%5D/page-3072929323d9bebb.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/management/page-1ad4e5fb84c3470a.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/my-training/%5Bid%5D/page-6c2060b1fcc8061d.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/my-training/page-19195425e49b402b.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/review/%5Bid%5D/page-1a2b3e9bc87dd49c.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/review/page-69ee66f7ab71f545.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/approvals/page-cbea9771562f1b29.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/approvals/workFlow/approvalSetting/page-d5b95ff382f02f94.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/approvals/workFlow/page-98e8a1c36fdfbe09.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/commitment-rule/page-abafbb717efcacac.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/course-category/page-0b010ac154fe00c1.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/layout-e13115d89a786076.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(tna)/tna/settings/tna-category/page-df2ff278ee6972e5.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/(weeklyPriority)/weekly-priority/page-3709d34c571dbf37.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/admin/billing/page-dd59e90441a9a0d1.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/admin/dashboard/page-42af36e2b1e152cb.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/admin/invoice/%5Bid%5D/page-09837efa5c4e390e.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/admin/plan/page-a7f951674e37091a.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/admin/profile/page-3b51b774266752ea.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/dashboard/page-44b4b118d1bcb2b0.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(afterLogin)/dashboard/vp/page-e52b668715152642.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(beforeLogin)/authentication/forget-password/page-22ab236c38cfb4ba.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(beforeLogin)/authentication/login/page-f47830f3a183e8a2.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(beforeLogin)/authentication/new-password/page-cd61b0b0503c674e.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(beforeLogin)/authentication/reset-password/page-a345e5aee38dd25a.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(publicForms)/job/%5BtenantId%5D/%5BjobId%5D/page-09cda95aff1a8f7a.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(publicForms)/job/openPositions/%5Bid%5D/page-adbc8936769518ab.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(publicForms)/job/openPositions/page-b21c48a09acdd798.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/(publicForms)/surveys/%5Bid%5D/page-bce7fd66a3f606c0.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/_not-found/page-89110f115e3059ee.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/layout-d7b562654d0d0178.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/not-found-610048ceaf6ec8a2.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/offline/page-688fa077ac9861e6.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/app/page-964bb518e4c261e8.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/b2d98e07-1948317d489cbde4.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/b563f954-d3ca46153dc3fcb3.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/bc98253f.00a1b5f74e45da50.js',
//           revision: '00a1b5f74e45da50',
//         },
//         {
//           url: '/_next/static/chunks/c916193b-01e71ab4a1fb4de6.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/ca377847-cc336e09288b791f.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/cff4c5fa.d1c1c32a597e5fd6.js',
//           revision: 'd1c1c32a597e5fd6',
//         },
//         {
//           url: '/_next/static/chunks/e34aaff9-945b3be1a64d7f3c.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/ee560e2c-2dd2c9b10bfe0f85.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/eec3d76d-327495402e145a9c.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/f25cdb8d-0a4b9d1ee45595fe.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/f7333993-4d58dc034e21021f.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/f8025e75-53fc167d3196c913.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/f97e080b-94568624e165939e.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/fd9d1056-f067ed350b7d4b38.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/ff804112-19c01e31cf8a2d42.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/framework-56dfd39ab9a08705.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/main-app-bbf3fe669eaa2941.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/main-dc36517c40afba48.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/pages/_app-f870474a17b7f2fd.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/pages/_error-c66a4e8afc46f17b.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/chunks/polyfills-78c92fac7aa8fdd8.js',
//           revision: '79330112775102f91e1010318bae2bd3',
//         },
//         {
//           url: '/_next/static/chunks/reactPlayerDailyMotion.2d2a96cf93df6928.js',
//           revision: '2d2a96cf93df6928',
//         },
//         {
//           url: '/_next/static/chunks/reactPlayerFacebook.5e29a6aa92480d07.js',
//           revision: '5e29a6aa92480d07',
//         },
//         {
//           url: '/_next/static/chunks/reactPlayerFilePlayer.7a88508ebfe931ba.js',
//           revision: '7a88508ebfe931ba',
//         },
//         {
//           url: '/_next/static/chunks/reactPlayerKaltura.d541e7ebd0134de6.js',
//           revision: 'd541e7ebd0134de6',
//         },
//         {
//           url: '/_next/static/chunks/reactPlayerMixcloud.00a4690fd21954f6.js',
//           revision: '00a4690fd21954f6',
//         },
//         {
//           url: '/_next/static/chunks/reactPlayerMux.56c6576e9c4cc183.js',
//           revision: '56c6576e9c4cc183',
//         },
//         {
//           url: '/_next/static/chunks/reactPlayerPreview.bf92c2d478ff3c8c.js',
//           revision: 'bf92c2d478ff3c8c',
//         },
//         {
//           url: '/_next/static/chunks/reactPlayerSoundCloud.fa4e8bd9418388db.js',
//           revision: 'fa4e8bd9418388db',
//         },
//         {
//           url: '/_next/static/chunks/reactPlayerStreamable.68f702377b023f54.js',
//           revision: '68f702377b023f54',
//         },
//         {
//           url: '/_next/static/chunks/reactPlayerTwitch.2b13d1904c1efe94.js',
//           revision: '2b13d1904c1efe94',
//         },
//         {
//           url: '/_next/static/chunks/reactPlayerVidyard.e7ba3a906618af5f.js',
//           revision: 'e7ba3a906618af5f',
//         },
//         {
//           url: '/_next/static/chunks/reactPlayerVimeo.b6fbb3210792e76a.js',
//           revision: 'b6fbb3210792e76a',
//         },
//         {
//           url: '/_next/static/chunks/reactPlayerWistia.5a2d6fc3f2f652be.js',
//           revision: '5a2d6fc3f2f652be',
//         },
//         {
//           url: '/_next/static/chunks/reactPlayerYouTube.1e56c8eba27369d5.js',
//           revision: '1e56c8eba27369d5',
//         },
//         {
//           url: '/_next/static/chunks/webpack-b105f068e5dbd2da.js',
//           revision: 'rCFRjZSlGWTIHj3ontVOE',
//         },
//         {
//           url: '/_next/static/css/4d3d9169b46fed63.css',
//           revision: '4d3d9169b46fed63',
//         },
//         {
//           url: '/_next/static/css/8b54669db085020c.css',
//           revision: '8b54669db085020c',
//         },
//         {
//           url: '/_next/static/css/a8c7d01d323e33e3.css',
//           revision: 'a8c7d01d323e33e3',
//         },
//         {
//           url: '/_next/static/css/b9515f2111023f1a.css',
//           revision: 'b9515f2111023f1a',
//         },
//         {
//           url: '/_next/static/css/bd1adb41bd30e2a7.css',
//           revision: 'bd1adb41bd30e2a7',
//         },
//         {
//           url: '/_next/static/media/438aa629764e75f3-s.woff2',
//           revision: '28f2a82ccec846f227a8208eb1ca0e01',
//         },
//         {
//           url: '/_next/static/media/4c9affa5bc8f420e-s.p.woff2',
//           revision: '101877a7a906c31436104fe33740ae44',
//         },
//         {
//           url: '/_next/static/media/51251f8b9793cdb3-s.woff2',
//           revision: '75ae12b7d0d290534626028cad12724a',
//         },
//         {
//           url: '/_next/static/media/875ae681bfde4580-s.woff2',
//           revision: '8fc0aa17e1291e522dc51c63869b051a',
//         },
//         {
//           url: '/_next/static/media/Button.b30635aa.svg',
//           revision: 'da23e3b029d7db9ae24f6c2b84aebfaf',
//         },
//         {
//           url: '/_next/static/media/cc978ac5ee68c2b6-s.woff2',
//           revision: '623714ac1d9949c8891464126e565fcb',
//         },
//         {
//           url: '/_next/static/media/criterion.97fd77fc.svg',
//           revision: '6c5f9f48111cbce5122567926b16fd7e',
//         },
//         {
//           url: '/_next/static/media/cvUpload.23fdb1c2.png',
//           revision: 'cc029c1dab6374227fa094d9edd8cb3d',
//         },
//         {
//           url: '/_next/static/media/e857b654a2caa584-s.woff2',
//           revision: 'aa01ffde85d9db48aab4b245e5e8f97a',
//         },
//         {
//           url: '/_next/static/media/gender_neutral_avatar.230de99d.jpg',
//           revision: '45d542824fb7724e4015d67df272855c',
//         },
//         {
//           url: '/_next/static/media/incentiveAmount.688857ff.svg',
//           revision: 'a4a1b964259ac570a3c5b282c1bdca8b',
//         },
//         {
//           url: '/_next/static/media/projects.0574dabd.svg',
//           revision: '5b9c66fb005117b1bfd6900b22a02e5a',
//         },
//         {
//           url: '/_next/static/media/recognizedEmployees.b67d1f76.svg',
//           revision: '4f0225260b63f2db218a51363a33039d',
//         },
//         {
//           url: '/_next/static/media/successResult.a2b579dd.png',
//           revision: 'b8f37c4b64ffbb8f5e755ae200933514',
//         },
//         {
//           url: '/_next/static/rCFRjZSlGWTIHj3ontVOE/_buildManifest.js',
//           revision: '3e2d62a10f4d6bf0b92e14aecf7836f4',
//         },
//         {
//           url: '/_next/static/rCFRjZSlGWTIHj3ontVOE/_ssgManifest.js',
//           revision: 'b6652df95db52feb4daf4eca35380933',
//         },
//         {
//           url: '/animated-splash-static.svg',
//           revision: '34428dcdd95be6091444754b40837d9f',
//         },
//         {
//           url: '/animated-splash.svg',
//           revision: 'd733a2956fcdc9fbce8bdf279da7df9c',
//         },
//         {
//           url: '/confirmSvg.svg',
//           revision: '753387f33e3c90ee58daf3a6b0ed5995',
//         },
//         { url: '/deleteSvg.svg', revision: 'b11e4e8445e13c2d294a300e1bb99de1' },
//         { url: '/favicon.ico', revision: '6540cc8c08e61e7d85a0bc7595c9cd9c' },
//         {
//           url: '/gender_neutral_avatar.jpg',
//           revision: '45d542824fb7724e4015d67df272855c',
//         },
//         { url: '/icons/192.png', revision: '55c1496af8c3fd0539c0adf6e3a93716' },
//         { url: '/icons/256.png', revision: '7ae7dd35bb280456a022a8bd6368e23f' },
//         { url: '/icons/404.svg', revision: '6c22ddc3d86dba16ee45553131252591' },
//         { url: '/icons/512.png', revision: 'b98750e581cf0394d27cbdb8c4ad7946' },
//         {
//           url: '/icons/Logo.svg',
//           revision: '9f043fb6979856430766db72227f9244',
//         },
//         {
//           url: '/icons/README.md',
//           revision: 'b37ab38c416e743f11547516e071033f',
//         },
//         {
//           url: '/icons/android/android-launchericon-144-144.png',
//           revision: 'b815d387a849dc3f5c8900d59b00d228',
//         },
//         {
//           url: '/icons/android/android-launchericon-192-192.png',
//           revision: '55c1496af8c3fd0539c0adf6e3a93716',
//         },
//         {
//           url: '/icons/android/android-launchericon-48-48.png',
//           revision: 'cb4f26309d011e754362533f22a842d8',
//         },
//         {
//           url: '/icons/android/android-launchericon-512-512.png',
//           revision: 'b98750e581cf0394d27cbdb8c4ad7946',
//         },
//         {
//           url: '/icons/android/android-launchericon-72-72.png',
//           revision: '78dde68c836dd421b9a6d61eaa547a5b',
//         },
//         {
//           url: '/icons/android/android-launchericon-96-96.png',
//           revision: 'b6b6d98d5571fb9145170c6a383d09b0',
//         },
//         {
//           url: '/icons/browserconfig.xml',
//           revision: '842b22692fefb9655574fb49eaabbf5e',
//         },
//         {
//           url: '/icons/chapa-pay.svg',
//           revision: '3a70663168fd558ca96664081a427244',
//         },
//         {
//           url: '/icons/datanotfound.svg',
//           revision: 'c1b4406e6184b9a2a3a1caf762f944cc',
//         },
//         {
//           url: '/icons/file-download.svg',
//           revision: '08babb2303d54edcf3f446512f88d468',
//         },
//         {
//           url: '/icons/gallery-add.svg',
//           revision: 'b597c90c1b1879c8490a29ed0bab33f9',
//         },
//         {
//           url: '/icons/icons.json',
//           revision: '4b00c8d3f335ee495b2b5e1dc66d9bc3',
//         },
//         {
//           url: '/icons/ios/100.png',
//           revision: 'cbd3d7df1c1d234b5a1b0b25dbadebbc',
//         },
//         {
//           url: '/icons/ios/1024.png',
//           revision: '70d3784ae222068e9a4440cfe34f6b8e',
//         },
//         {
//           url: '/icons/ios/114.png',
//           revision: '6b3ad6f836718dc04e265b77b0ddfd3c',
//         },
//         {
//           url: '/icons/ios/120.png',
//           revision: 'd834685e8a0641cab354030b266cfbcc',
//         },
//         {
//           url: '/icons/ios/128.png',
//           revision: '0a060c470e289912aff73a1f53b886a9',
//         },
//         {
//           url: '/icons/ios/144.png',
//           revision: 'b815d387a849dc3f5c8900d59b00d228',
//         },
//         {
//           url: '/icons/ios/152.png',
//           revision: '1dd88137165ad4c9359b2ec78d9794d5',
//         },
//         {
//           url: '/icons/ios/16.png',
//           revision: '7a9608ad88e55c54440a2542e149fe0b',
//         },
//         {
//           url: '/icons/ios/167.png',
//           revision: '40cdd9381cf89d7e8df7c4946b7bfa0c',
//         },
//         {
//           url: '/icons/ios/180.png',
//           revision: '9a073eeea4964429708e2d7315898dd0',
//         },
//         {
//           url: '/icons/ios/192.png',
//           revision: '55c1496af8c3fd0539c0adf6e3a93716',
//         },
//         {
//           url: '/icons/ios/20.png',
//           revision: 'bf6c6ed0887602f1a22ec8015c433215',
//         },
//         {
//           url: '/icons/ios/256.png',
//           revision: '7ae7dd35bb280456a022a8bd6368e23f',
//         },
//         {
//           url: '/icons/ios/29.png',
//           revision: '52b0d7bcff6bd675942011255515be7f',
//         },
//         {
//           url: '/icons/ios/32.png',
//           revision: 'c04595bb432c33b7d32823747b921353',
//         },
//         {
//           url: '/icons/ios/40.png',
//           revision: '5dab0d566fe070910c07ab3e4df734a1',
//         },
//         {
//           url: '/icons/ios/50.png',
//           revision: '07c6bf94c144710e4786dfcc4ce2a222',
//         },
//         {
//           url: '/icons/ios/512.png',
//           revision: 'b98750e581cf0394d27cbdb8c4ad7946',
//         },
//         {
//           url: '/icons/ios/57.png',
//           revision: 'd3777bf337c0f71dfd5c221fbb3924dd',
//         },
//         {
//           url: '/icons/ios/58.png',
//           revision: '974db711bba1974eed8198daaae2099a',
//         },
//         {
//           url: '/icons/ios/60.png',
//           revision: '93c341072e323fd01d4ea24ecd888b11',
//         },
//         {
//           url: '/icons/ios/64.png',
//           revision: 'c37f69da16310d97982394423f43a083',
//         },
//         {
//           url: '/icons/ios/72.png',
//           revision: '78dde68c836dd421b9a6d61eaa547a5b',
//         },
//         {
//           url: '/icons/ios/76.png',
//           revision: '112cc07bc1a776a4b6b066bb7e8da305',
//         },
//         {
//           url: '/icons/ios/80.png',
//           revision: 'bc38fca3bdff884cddcdbf6846041582',
//         },
//         {
//           url: '/icons/ios/87.png',
//           revision: '408597e217f1e1075e407de0549748e7',
//         },
//         {
//           url: '/icons/status/information.svg',
//           revision: '1fdd8853fd2852baa82df6f577bc46f6',
//         },
//         {
//           url: '/icons/status/reject.svg',
//           revision: 'c2b8a740dd2efa18a9a37add4d4d4917',
//         },
//         {
//           url: '/icons/status/verify.svg',
//           revision: '07fab35357f8b718f1eb07c0a5ce4b35',
//         },
//         {
//           url: '/icons/stripe-pay.svg',
//           revision: '6069f22067b84531c568d634937ac310',
//         },
//         {
//           url: '/icons/success.svg',
//           revision: '1acb31ec0fe7be75a7197c4afc815dd2',
//         },
//         {
//           url: '/icons/windows11/LargeTile.scale-100.png',
//           revision: 'b5fe1cc6aff8cacd920560a62e201423',
//         },
//         {
//           url: '/icons/windows11/LargeTile.scale-125.png',
//           revision: 'be689cfdfe1677d8e811a7a6fff1d846',
//         },
//         {
//           url: '/icons/windows11/LargeTile.scale-150.png',
//           revision: '3ea1dca87cd2fecbaff585a65fd9682f',
//         },
//         {
//           url: '/icons/windows11/LargeTile.scale-200.png',
//           revision: '7e9bf9f1fda929a1f3fc03d6cfe26353',
//         },
//         {
//           url: '/icons/windows11/LargeTile.scale-400.png',
//           revision: '17e9bfd7e3a526b27bf1e7e2ec88617b',
//         },
//         {
//           url: '/icons/windows11/SmallTile.scale-100.png',
//           revision: 'cfef043c8756f11c65f44dd0aa793cee',
//         },
//         {
//           url: '/icons/windows11/SmallTile.scale-125.png',
//           revision: '8048ef606f37c5c5ebaa8050b972bdff',
//         },
//         {
//           url: '/icons/windows11/SmallTile.scale-150.png',
//           revision: '976c2da6eab5e37a131d455cd24b8f10',
//         },
//         {
//           url: '/icons/windows11/SmallTile.scale-200.png',
//           revision: '8f44c8f5eb2ebc96822d7334e438a10e',
//         },
//         {
//           url: '/icons/windows11/SmallTile.scale-400.png',
//           revision: '57f0f8e40df8a452e3a3fe4a0a0f4acb',
//         },
//         {
//           url: '/icons/windows11/SplashScreen.scale-100.png',
//           revision: '062c1ac8137e8549164b5fd15bce0cdd',
//         },
//         {
//           url: '/icons/windows11/SplashScreen.scale-125.png',
//           revision: '040d21d85d06d410ab836aed812b93c6',
//         },
//         {
//           url: '/icons/windows11/SplashScreen.scale-150.png',
//           revision: '376332b214103aa8c682ada545017d53',
//         },
//         {
//           url: '/icons/windows11/SplashScreen.scale-200.png',
//           revision: '23f05f1c09268ee35c8f9976a073a33e',
//         },
//         {
//           url: '/icons/windows11/SplashScreen.scale-400.png',
//           revision: 'd60b0f735d186b52fab43cca1d558743',
//         },
//         {
//           url: '/icons/windows11/Square150x150Logo.scale-100.png',
//           revision: '76e069f2bb93d5061a66203d9bf7b92a',
//         },
//         {
//           url: '/icons/windows11/Square150x150Logo.scale-125.png',
//           revision: 'fa6f967e325edc2421df8c44750bdb84',
//         },
//         {
//           url: '/icons/windows11/Square150x150Logo.scale-150.png',
//           revision: '582a42b09a7c758d7145d2ebeacab1d5',
//         },
//         {
//           url: '/icons/windows11/Square150x150Logo.scale-200.png',
//           revision: '9915136b0d0217aee9da7d6d6f424879',
//         },
//         {
//           url: '/icons/windows11/Square150x150Logo.scale-400.png',
//           revision: '09c7f0d8727e428b887fe1de36ebdec9',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-16.png',
//           revision: '05fb3e3e601a6f78c95be1d8582e328f',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-20.png',
//           revision: '44708c160aca24fce9a9233f2902f08a',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-24.png',
//           revision: 'a30fc11d9c55092b632a43e4095a7953',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-256.png',
//           revision: 'c2281e768039147bdac69b87c3ac7d0e',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-30.png',
//           revision: 'c273b116a2efb3b9306f1931f4dc3aad',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-32.png',
//           revision: 'bdf598490dfcea1af7d227c2bb122569',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-36.png',
//           revision: 'ce40ee23e48558d569ccea644db64e9d',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-40.png',
//           revision: 'dfa9dc260b788784540f75c3322917fa',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-44.png',
//           revision: '40349ef340d03a20259847b21319f073',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-48.png',
//           revision: '994001cad9d7c4c1953b613e1ebfca6e',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-60.png',
//           revision: '348b6b5f05537bfa78311ba944407bd4',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-64.png',
//           revision: '6d6e32b6efbc13424b16af608dbcb1d6',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-72.png',
//           revision: '9749a695c2153cdd7f33606dded40a5e',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-80.png',
//           revision: '2e023950ebce3ebbbb7bfff16e8703df',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-96.png',
//           revision: '93c9d254e48de6dc6288764e549f4580',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.altform-unplated_targetsize-16.png',
//           revision: '05fb3e3e601a6f78c95be1d8582e328f',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.altform-unplated_targetsize-20.png',
//           revision: '44708c160aca24fce9a9233f2902f08a',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.altform-unplated_targetsize-24.png',
//           revision: 'a30fc11d9c55092b632a43e4095a7953',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.altform-unplated_targetsize-256.png',
//           revision: 'c2281e768039147bdac69b87c3ac7d0e',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.altform-unplated_targetsize-30.png',
//           revision: 'c273b116a2efb3b9306f1931f4dc3aad',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.altform-unplated_targetsize-32.png',
//           revision: 'bdf598490dfcea1af7d227c2bb122569',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.altform-unplated_targetsize-36.png',
//           revision: 'ce40ee23e48558d569ccea644db64e9d',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.altform-unplated_targetsize-40.png',
//           revision: 'dfa9dc260b788784540f75c3322917fa',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.altform-unplated_targetsize-44.png',
//           revision: '40349ef340d03a20259847b21319f073',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.altform-unplated_targetsize-48.png',
//           revision: '994001cad9d7c4c1953b613e1ebfca6e',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.altform-unplated_targetsize-60.png',
//           revision: '348b6b5f05537bfa78311ba944407bd4',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.altform-unplated_targetsize-64.png',
//           revision: '6d6e32b6efbc13424b16af608dbcb1d6',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.altform-unplated_targetsize-72.png',
//           revision: '9749a695c2153cdd7f33606dded40a5e',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.altform-unplated_targetsize-80.png',
//           revision: '2e023950ebce3ebbbb7bfff16e8703df',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.altform-unplated_targetsize-96.png',
//           revision: '93c9d254e48de6dc6288764e549f4580',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.scale-100.png',
//           revision: '40349ef340d03a20259847b21319f073',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.scale-125.png',
//           revision: '8b7aa0264945f801a68050e2bb35a2d1',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.scale-150.png',
//           revision: '71884c24d9c36cd82b6ecff869c778af',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.scale-200.png',
//           revision: '3bd08b541cd71b0e8ef5f51734dc8560',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.scale-400.png',
//           revision: 'aeb2401524e6a094aae89717bdbc61c8',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.targetsize-16.png',
//           revision: '05fb3e3e601a6f78c95be1d8582e328f',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.targetsize-20.png',
//           revision: '44708c160aca24fce9a9233f2902f08a',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.targetsize-24.png',
//           revision: 'a30fc11d9c55092b632a43e4095a7953',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.targetsize-256.png',
//           revision: 'c2281e768039147bdac69b87c3ac7d0e',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.targetsize-30.png',
//           revision: 'c273b116a2efb3b9306f1931f4dc3aad',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.targetsize-32.png',
//           revision: 'bdf598490dfcea1af7d227c2bb122569',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.targetsize-36.png',
//           revision: 'ce40ee23e48558d569ccea644db64e9d',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.targetsize-40.png',
//           revision: 'dfa9dc260b788784540f75c3322917fa',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.targetsize-44.png',
//           revision: '40349ef340d03a20259847b21319f073',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.targetsize-48.png',
//           revision: '994001cad9d7c4c1953b613e1ebfca6e',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.targetsize-60.png',
//           revision: '348b6b5f05537bfa78311ba944407bd4',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.targetsize-64.png',
//           revision: '6d6e32b6efbc13424b16af608dbcb1d6',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.targetsize-72.png',
//           revision: '9749a695c2153cdd7f33606dded40a5e',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.targetsize-80.png',
//           revision: '2e023950ebce3ebbbb7bfff16e8703df',
//         },
//         {
//           url: '/icons/windows11/Square44x44Logo.targetsize-96.png',
//           revision: '93c9d254e48de6dc6288764e549f4580',
//         },
//         {
//           url: '/icons/windows11/StoreLogo.scale-100.png',
//           revision: '07c6bf94c144710e4786dfcc4ce2a222',
//         },
//         {
//           url: '/icons/windows11/StoreLogo.scale-125.png',
//           revision: '2f183cca5ac1e5e002ac7fa222051107',
//         },
//         {
//           url: '/icons/windows11/StoreLogo.scale-150.png',
//           revision: 'e3bc469b0dcc12cec607c44e0c90ee05',
//         },
//         {
//           url: '/icons/windows11/StoreLogo.scale-200.png',
//           revision: 'cbd3d7df1c1d234b5a1b0b25dbadebbc',
//         },
//         {
//           url: '/icons/windows11/StoreLogo.scale-400.png',
//           revision: '0fdb71f20bf6c778a95f660e8a4504a1',
//         },
//         {
//           url: '/icons/windows11/Wide310x150Logo.scale-100.png',
//           revision: 'bdfdb2b4d306d24a44e6aafa08e3f230',
//         },
//         {
//           url: '/icons/windows11/Wide310x150Logo.scale-125.png',
//           revision: 'dce0f5ed575db98d7535e54c3297aecd',
//         },
//         {
//           url: '/icons/windows11/Wide310x150Logo.scale-150.png',
//           revision: 'b8258cf693d8608c36267c4f5f311870',
//         },
//         {
//           url: '/icons/windows11/Wide310x150Logo.scale-200.png',
//           revision: '062c1ac8137e8549164b5fd15bce0cdd',
//         },
//         {
//           url: '/icons/windows11/Wide310x150Logo.scale-400.png',
//           revision: '23f05f1c09268ee35c8f9976a073a33e',
//         },
//         {
//           url: '/image/Button.svg',
//           revision: 'da23e3b029d7db9ae24f6c2b84aebfaf',
//         },
//         {
//           url: '/image/bankLetterImages.tsx',
//           revision: '5404ab0ab5dde1ffd08df38f1b7ca2ab',
//         },
//         {
//           url: '/image/cvUpload.png',
//           revision: 'cc029c1dab6374227fa094d9edd8cb3d',
//         },
//         { url: '/image/ie.png', revision: '3144fe0276e36e258002b78cecc2db2f' },
//         {
//           url: '/image/successResult.png',
//           revision: 'b8f37c4b64ffbb8f5e755ae200933514',
//         },
//         {
//           url: '/image/undraw_empty_re_opql 1.png',
//           revision: '6cdf36e091f248c6ff98949aed7ae7a2',
//         },
//         {
//           url: '/image/undraw_empty_re_opql 1.svg',
//           revision: 'e691b669f7bce176b3b386126a4d5351',
//         },
//         {
//           url: '/login-background.png',
//           revision: '715addd23ceff9820a0eb97d8d40bb6f',
//         },
//         { url: '/manifest.json', revision: 'cb46d8808cfd1dc1bffac89aeb2fbcf2' },
//         { url: '/next.svg', revision: '8e061864f388b47f33a1c3780831193e' },
//         { url: '/offline', revision: 'rCFRjZSlGWTIHj3ontVOE' },
//         { url: '/userIcon.png', revision: '21290e54f2e18a286c44fe19846ab1fc' },
//         { url: '/vercel.svg', revision: '61c6b19abff40ea7acd577be818f3976' },
//       ],
//       { ignoreURLParametersMatching: [] },
//     ),
//     e.cleanupOutdatedCaches(),
//     e.registerRoute(
//       '/',
//       new e.NetworkFirst({
//         cacheName: 'start-url',
//         plugins: [
//           {
//             cacheWillUpdate: async ({
//               request: e,
//               response: n,
//               event: t,
//               state: i,
//             }) =>
//               n && 'opaqueredirect' === n.type
//                 ? new Response(n.body, {
//                     status: 200,
//                     statusText: 'OK',
//                     headers: n.headers,
//                   })
//                 : n,
//           },
//           { handlerDidError: async ({ request: e }) => self.fallback(e) },
//         ],
//       }),
//       'GET',
//     ),
//     e.registerRoute(
//       /^https:\/\/fonts\.googleapis\.com\/.*/i,
//       new e.CacheFirst({
//         cacheName: 'google-fonts',
//         plugins: [
//           new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
//           { handlerDidError: async ({ request: e }) => self.fallback(e) },
//         ],
//       }),
//       'GET',
//     ),
//     e.registerRoute(
//       /^https:\/\/fonts\.gstatic\.com\/.*/i,
//       new e.CacheFirst({
//         cacheName: 'google-fonts-static',
//         plugins: [
//           new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
//           { handlerDidError: async ({ request: e }) => self.fallback(e) },
//         ],
//       }),
//       'GET',
//     ),
//     e.registerRoute(
//       /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
//       new e.StaleWhileRevalidate({
//         cacheName: 'static-image-assets',
//         plugins: [
//           new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
//           { handlerDidError: async ({ request: e }) => self.fallback(e) },
//         ],
//       }),
//       'GET',
//     ),
//     e.registerRoute(
//       /\.(?:js|css)$/i,
//       new e.StaleWhileRevalidate({
//         cacheName: 'static-js-css-assets',
//         plugins: [
//           new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
//           { handlerDidError: async ({ request: e }) => self.fallback(e) },
//         ],
//       }),
//       'GET',
//     ),
//     e.registerRoute(
//       /^\/api\/.*/i,
//       new e.NetworkFirst({
//         cacheName: 'api-cache',
//         networkTimeoutSeconds: 10,
//         plugins: [
//           new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
//           { handlerDidError: async ({ request: e }) => self.fallback(e) },
//         ],
//       }),
//       'GET',
//     ));
// });
