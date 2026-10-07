/**
 * The installed @ant-design/icons package is missing lib/index.d.ts
 * (package.json "typings" points at a file that is not present).
 * This ambient module keeps `import { … } from '@ant-design/icons'` valid under strict TS.
 */
declare module '@ant-design/icons';
