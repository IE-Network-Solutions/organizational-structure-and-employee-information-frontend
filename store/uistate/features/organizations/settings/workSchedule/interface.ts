export interface DrawerState {
  isOpen: boolean;
  workingHour: string | number;
  toggleDrawer: () => void;
  closeDrawer: () => void;
  openDrawer: () => void;
  setWorkingHour: (hours: string | number) => void;
}
