// useStore.ts
import create from 'zustand';
import { devtools } from 'zustand/middleware';

export interface planningAndReporting{
open:boolean,
setOpen:(open:boolean)=>void,


}
export const usePlanningAndReportingStore = create<planningAndReporting>()(
  devtools((set) => ({
     open:false,
     setOpen:(open:boolean)=>set({open})
  })));
