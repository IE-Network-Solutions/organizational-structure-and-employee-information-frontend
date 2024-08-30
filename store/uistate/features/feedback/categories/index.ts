import { create } from 'zustand';

interface CustomField {
  name: string;
  selected: boolean;
}
export interface CategoriesUseState {
  expanded: boolean;
  open: boolean;
  isAddOpen: boolean;
  current: number;
  pageSize: number;
  totalPages: number;
  selectedGroups: string[];
  customFields: CustomField[];
  setIsAddOpen: (isAddOpen: boolean) => void;
  toggleCustomField: (index: number) => void;
  setCustomFields: (fields: CustomField[]) => void;
  setSelectedGroups: (selectedGroups: string[]) => void;
  setPageSize: (pageSize: number) => void;
  setCurrent: (value: number) => void;
  setOpen: (value: boolean) => void;
  setExpanded: (value: boolean) => void;
}

export const CategoriesManagementStore = create<CategoriesUseState>((set) => ({
  expanded: false,
  open: false,
  isAddOpen: false,
  current: 0,
  pageSize: 3,
  totalPages: 1,
  selectedGroups: [],
  customFields: [
    { name: 'Custom Field One', selected: false },
    { name: 'Custom Field Two', selected: false },
    { name: 'Custom Field Three', selected: false },
  ],
  setIsAddOpen: (isAddOpen) => set({ isAddOpen: isAddOpen }),
  setSelectedGroups: (value) => set({ selectedGroups: value }),
  setPageSize: (pageSize) => set({ pageSize: pageSize }),
  setCurrent: (value) => set({ current: value }),
  setOpen: (open) => set({ open: open }),
  setExpanded: (value) => set({ expanded: value }),
  toggleCustomField: (index) =>
    set((state) => ({
      customFields: state.customFields.map((field, i) =>
        i === index ? { ...field, selected: !field.selected } : field,
      ),
    })),
  setCustomFields: (fields) => set({ customFields: fields }),
}));
