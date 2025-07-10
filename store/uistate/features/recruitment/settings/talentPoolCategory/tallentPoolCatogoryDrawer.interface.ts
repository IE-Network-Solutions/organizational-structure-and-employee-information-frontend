export interface TalentPoolSettingsDrawerState {
  isOpen: boolean;
  selectedTalentPool: any | null;
  isEditMode: boolean;
  isDeleteMode: boolean;
  talentPoolName: string;
  pageSize: number;
  currentPage: number;

  setPage: (pageSize: number) => void;
  toggleDrawer: () => void;
  closeDrawer: () => void;
  openDrawer: () => void;
  setSelectedTalentPool: (talentPool: any) => void;
  setEditMode: (isEdit: boolean) => void;
  setDeleteMode: (isDelete: boolean) => void;
  setCurrentPage: (currentPage: number) => void;
}
