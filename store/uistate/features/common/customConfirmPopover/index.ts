import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface PopoverState {
  open: boolean;
  popoverWidth: number | undefined;
}

interface CustomConfirmPopoverState {
  popoverStates: Record<string, PopoverState>;
  setPopoverOpen: (id: string, open: boolean) => void;
  setPopoverWidth: (id: string, width: number | undefined) => void;
  getPopoverState: (id: string) => PopoverState;
  resetPopoverState: (id: string) => void;
}

const defaultState: PopoverState = {
  open: false,
  popoverWidth: undefined,
};

export const useCustomConfirmPopoverStore = create<CustomConfirmPopoverState>()(
  devtools(
    (set, get) => ({
      popoverStates: {},
      setPopoverOpen: (id: string, open: boolean) => {
        set((state) => ({
          popoverStates: {
            ...state.popoverStates,
            [id]: {
              ...(state.popoverStates[id] || defaultState),
              open,
            },
          },
        }));
      },
      setPopoverWidth: (id: string, width: number | undefined) => {
        set((state) => ({
          popoverStates: {
            ...state.popoverStates,
            [id]: {
              ...(state.popoverStates[id] || defaultState),
              popoverWidth: width,
            },
          },
        }));
      },
      getPopoverState: (id: string) => {
        return get().popoverStates[id] || defaultState;
      },
      resetPopoverState: (id: string) => {
        set((state) => {
          const newStates = { ...state.popoverStates };
          delete newStates[id];
          return { popoverStates: newStates };
        });
      },
    }),
    { name: 'CustomConfirmPopoverStore' },
  ),
);
