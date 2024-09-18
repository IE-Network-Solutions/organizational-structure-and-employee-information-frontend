// useStore.ts
import create from 'zustand';
import { devtools } from 'zustand/middleware';

export interface planningAndReporting{
open:boolean,
setOpen:(open:boolean)=>void,
activeTab:number
setActiveTab:(activeTab:number)=>void,

activePlanPeriod:number,
setActivePlanPeriod:(activePlanPeriod:number)=>void,


}
export const usePlanningAndReportingStore = create<planningAndReporting>()(
  devtools((set) => ({
     open:false,
     setOpen:(open:boolean)=>set({open}),

     activeTab:1,
     setActiveTab:(activeTab:number)=>set({activeTab}),

     activePlanPeriod:1,
     setActivePlanPeriod:(activePlanPeriod:number)=>set({activePlanPeriod}),
  })));
