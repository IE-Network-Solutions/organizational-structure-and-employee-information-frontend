export interface DrawerState {
  isFiscalYearOpen: boolean;
  workingHour: string | number;
  toggleFiscalYearDrawer: () => void;
  closeFiscalYearDrawer: () => void;
  openDrawer: () => void;
  setWorkingHour: (hours: string | number) => void;
}
