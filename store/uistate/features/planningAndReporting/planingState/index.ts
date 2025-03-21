import create from 'zustand';

// Define the state interface
interface ClickStatus {
  statuses: Record<string, boolean>;
  setClickStatus: (id: string, value: boolean) => void;
}

// Create the store
const useClickStatus = create<ClickStatus>((set) => ({
  statuses: {}, // Stores { id: boolean }

  setClickStatus: (id: string, value: boolean) =>
    set((state) => ({
      statuses: { ...state.statuses, [id]: value },
    })),
}));

export default useClickStatus;
