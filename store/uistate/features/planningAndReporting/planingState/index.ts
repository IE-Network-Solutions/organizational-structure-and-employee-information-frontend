import create from 'zustand';

// Define the state interface
interface ClickStatus {
  statuses: Record<string, boolean>;
  setClickStatus: (id: string, value: boolean) => void;
  resetToInitial: () => void;
}

// Initial state
const initialState = {};

// Create the store
const useClickStatus = create<ClickStatus>((set) => ({
  statuses: {}, // Stores { id: boolean }

  setClickStatus: (id: string, value: boolean) =>
    set((state) => ({
      statuses: { ...state.statuses, [id]: value },
    })),
    
  resetToInitial: () => set({ statuses: initialState }),
}));

export default useClickStatus;
