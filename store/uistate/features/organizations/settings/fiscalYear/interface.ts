export interface DrawerState {
  isFiscalYearOpen: boolean;
  workingHour: string | number;
  selectedFiscalYear: any;
  isEditMode: boolean;
  isDeleteMode: boolean;
  setDeleteMode: (isDelete: boolean) => void;
  toggleFiscalYearDrawer: () => void;
  closeFiscalYearDrawer: () => void;
  openDrawer: () => void;
  setWorkingHour: (hours: string | number) => void;
  setSelectedFiscalYear: (fiscalYear: any) => void;
  setEditMode: (isEdit: boolean) => void; // Toggle edit mode
}
