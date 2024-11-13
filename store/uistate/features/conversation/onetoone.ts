import { create } from 'zustand';

// Define the TypeScript interface for the state
interface DateRangeState {
  formData: { [key: string]: string }; // Allow dynamic keys with string values
  setFormData: (name: string, value: string) => void;
}

// Create the Zustand store
export const useOneOnOneStore = create<DateRangeState>((set) => ({
  formData: {}, // Initialize formData as an empty object
  setFormData: (name: string, value: string) =>
    set((state) => ({
      formData: {
        ...state.formData,
        [name]: value,
      },
    })),
}));
