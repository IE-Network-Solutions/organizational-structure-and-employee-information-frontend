import { create } from 'zustand';

export interface CategoriesUseState {
  open: boolean;
  current: number;
  pageSize: number;
  totalPages: number;
  setPageSize: (pageSize: number) => void;
  setCurrent: (value: number) => void;
  setOpen: (value: boolean) => void;

  selectedDepartment:string[];
  setSelectedDepartment:(department:string[])=>void

  userId:string|null;
  setUserId:(userId:string|null)=>void

  departmentId:string|null;
  setDepartmentId:(departmentid:string|null)=>void

  setOfUser:any[];
  setSetOfUser:(setOfUser:any[])=>void
}

export const ConversationStore = create<CategoriesUseState>((set) => ({
  open: false,
  current: 0,
  pageSize: 4,
  totalPages: 1,
  selectedDepartment:[],
  setSelectedDepartment:(selectedDepartment:string[])=>set({selectedDepartment}),

  setOfUser:[],
  setSetOfUser:(setOfUser:any[])=>set({setOfUser}),
  
  userId:null,
  setUserId:(userId:string|null)=>set({userId}),

  departmentId:null,
  setDepartmentId:(departmentId:string|null)=>set({departmentId}),

  setTotalPages: (totalPages: number) => set({ totalPages }),
  setPageSize: (pageSize) => set({ pageSize }),
  setCurrent: (value) => set({ current: value }),
  setOpen: (open) => set({ open }),
}));
