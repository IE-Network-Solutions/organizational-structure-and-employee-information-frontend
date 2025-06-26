// stores/useMeetingStore.ts
import { create } from 'zustand';

interface MeetingStore {
  open: boolean;
  setOpen: (value: boolean) => void;
  content: string;
  setContent: (value: string) => void;
  pageSize: number;
  setPagesize: (value: number) => void;
  current: number;
  setCurrent: (value: number) => void;

  openAddMeeting: boolean;
  setOpenAddMeeting: (value: boolean) => void;

  openAddAgenda: boolean;
  setOpenAddAgenda: (value: boolean) => void;

  openMeetingAgenda: boolean;
  setOpenMeetingAgenda: (value: boolean) => void;

  openAddActionPlan: boolean;
  setOpenAddActionPlan: (value: boolean) => void;

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

  actionPlanData: any | null;
  setActionPlanData: (actionPlanData: any | null) => void;

  meetingAgenda: any | null;
  setMeetingAgenda: (meetingAgenda: any | null) => void;

  meetingTypeId: string | null;
  setMeetingTypeId: (meetingTypeId: string | null) => void;

  templateId: string | null;
  setTemplateId: (templateId: string | null) => void;

  departmentId: string | null;
  setDepartmentId: (departmentId: string | null) => void;
  startAt: any; // ISO string
  endAt: any;
  title?: string;
  locationType: 'in-person' | 'virtual' | 'hybrid' | string;
  physicalLocation?: string;
  virtualLink?: string;
  setStartAt: (startAt: string) => void;
  setEndAt: (endAt: string) => void;
  setTitle: (title: string) => void;
  setLocationType: (locationType: string) => void;
  setPhysicalLocation: (physicalLocation: string) => void;
  setVirtualLink: (virtualLink: string) => void;

  pageSizeType: number;
  setPagesizeType: (value: number) => void;
  currentType: number;
  setCurrentType: (value: number) => void;

  pageSizeAction: number;
  setPagesizeAction: (value: number) => void;
  currentAction: number;
  setCurrentAction: (value: number) => void;
  showComments: boolean;
  setShowComments: (value: boolean) => void;
  comments: string;
  setComments: (value: string) => void;
  commentUpdate: string | null;
  setCommentUpdate: (value: string) => void;
}

export const useMeetingStore = create<MeetingStore>((set) => ({
  open: false,
  setOpen: (value) => set({ open: value }),
  openAddMeeting: false,
  setOpenAddMeeting: (value) => set({ openAddMeeting: value }),
  openAddAgenda: false,
  setOpenAddAgenda: (value) => set({ openAddAgenda: value }),

  openMeetingAgenda: false,
  setOpenMeetingAgenda: (value) => set({ openMeetingAgenda: value }),

  openAddActionPlan: false,
  setOpenAddActionPlan: (value) => set({ openAddActionPlan: value }),
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
  actionPlanData: null,
  setActionPlanData: (template) => set({ actionPlanData: template }),
  meetingAgenda: null,
  setMeetingAgenda: (template) => set({ meetingAgenda: template }),
  current: 1,
  pageSize: 9,
  setPagesize: (size: number) => set({ pageSize: size }),
  setCurrent: (value: number) => set({ current: value }),
  meetingTypeId: null,
  setMeetingTypeId: (meetingTypeId) => set({ meetingTypeId }),
  departmentId: null,
  setDepartmentId: (departmentId) => set({ departmentId }),
  templateId: null,
  setTemplateId: (templateId) => set({ templateId }),
  content: '',
  setContent: (content) => set({ content }),
  startAt: '',
  endAt: '',
  title: '',
  locationType: '',
  physicalLocation: '',
  virtualLink: '',
  setStartAt: (startAt) => set({ startAt }),
  setEndAt: (endAt) => set({ endAt }),
  setTitle: (title) => set({ title }),
  setLocationType: (locationType) => set({ locationType }),
  setPhysicalLocation: (physicalLocation) => set({ physicalLocation }),
  setVirtualLink: (virtualLink) => set({ virtualLink }),
  pageSizeType: 5,
  setPagesizeType: (value) => set({ pageSizeType: value }),
  currentType: 1,
  setCurrentType: (value) => set({ currentType: value }),

  pageSizeAction: 5,
  setPagesizeAction: (value) => set({ pageSizeAction: value }),
  currentAction: 1,
  setCurrentAction: (value) => set({ currentAction: value }),
  showComments: false,
  setShowComments: (value) => set({ showComments: value }),
  comments: '',
  setComments: (value) => set({ comments: value }),
  commentUpdate: null,
  setCommentUpdate: (value) => set({ commentUpdate: value }),
}));
