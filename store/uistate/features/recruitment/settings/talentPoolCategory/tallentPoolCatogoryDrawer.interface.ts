export interface TalentPoolSettingsDrawerState {
  isOpen: boolean;
  selectedTalentPool: any | null;
  isEditMode: boolean;
  isDeleteMode: boolean;
  talentPoolName: string;

  toggleDrawer: () => void;
  closeDrawer: () => void;
  openDrawer: () => void;
  setSelectedTalentPool: (talentPool: any) => void;
  setEditMode: (isEdit: boolean) => void;
  setDeleteMode: (isDelete: boolean) => void;
}
