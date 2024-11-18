import create from 'zustand';
import { Dayjs } from 'dayjs';

interface FiscalYear {
  name: string;
  description: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
}

interface FiscalYearState extends FiscalYear {
  setFiscalYearName: (name: string) => void;
  setFiscalYearStartDate: (startDate: Dayjs | null | null) => void;
  setFiscalYearEndDate: (endDate: Dayjs | null) => void;
  setFiscalDescriptionName: (description: string) => void;
  getFiscalYear: () => any;
  resetFiscalYear: () => void;
}
const useFiscalYearStore = create<FiscalYearState>((set, get) => ({
  name: '',
  description: '',
  startDate: null,
  endDate: null,
  setFiscalYearName: (name) => set({ name: name }),
  setFiscalDescriptionName: (description) => set({ description: description }),

  setFiscalYearStartDate: (startDate) => set({ startDate: startDate }),
  setFiscalYearEndDate: (endDate) => set({ endDate: endDate }),
  getFiscalYear: () => {
    const state = get();
    return {
      name: state.name,
      description: state.description,
      startDate: state.startDate,
      endDate: state.endDate,
    };
  },
  resetFiscalYear: () => set({ 
    name: '',
    description: '',
    startDate: null,
    endDate: null 
  }),

}));

export default useFiscalYearStore;
