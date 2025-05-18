// stores/useMeetingStore.ts
import { create } from 'zustand';

interface MeetingStore {
  open: boolean;
  setOpen: (value: boolean) => void;

  openAddMeeting: boolean;
  setOpenAddMeeting: (value: boolean) => void;
  
  openDeleteModal: boolean;
  setOpenDeleteModal: (value: boolean) => void;

  deletedId: string | null;
  setDeletedId: (id: string | null) => void;

  meetingType: any; // Replace `any` with a specific type if you have one
  setMeetingType: (type: any) => void;
   meetingTypeDetailData: any; // Replace `any` with a specific type if you have one
  setMeetingTypeDetail: (rule: any) => void;

   drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;

  templates: any;
  setTemplates: (templates: any) => void;

  editingTemplate: any | null;
  setEditingTemplate: (template: any | null) => void;
}

export const useMeetingStore = create<MeetingStore>((set) => ({
  open: false,
  setOpen: (value) => set({ open: value }),
  openAddMeeting:false,
  setOpenAddMeeting: (value)=>set({openAddMeeting:value}),
  openDeleteModal: false,
  setOpenDeleteModal: (value) => set({ openDeleteModal: value }),

  deletedId: null,
  setDeletedId: (id) => set({ deletedId: id }),

  meetingType: null,
  setMeetingType: (rule) => set({ meetingType: rule }),
  meetingTypeDetailData: null,
  setMeetingTypeDetail: (rule) => set({ meetingTypeDetailData: rule }),
   drawerOpen: false,
  setDrawerOpen: (open) => set({ drawerOpen: open }),

  templates: [],
  setTemplates: (templates) => set({ templates }),

  editingTemplate: null,
  setEditingTemplate: (template) => set({ editingTemplate: template }),
}));
