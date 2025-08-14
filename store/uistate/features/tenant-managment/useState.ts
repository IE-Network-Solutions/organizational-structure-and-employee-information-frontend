// useStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PaymentStore {
  paymentCurrency: string;
  setPaymentCurrency: (currency: string) => void;
  transactionType: string | null;
  setTransactionType: (type: string | null) => void;
}

export const usePaymentStore = create<PaymentStore>()(
  persist(
    (set) => ({
      paymentCurrency: 'USD',
      setPaymentCurrency: (currency) => set({ paymentCurrency: currency }),
      transactionType: null,
      setTransactionType: (type) => set({ transactionType: type }),
    }),
    {
      name: 'payment-storage', // Key for localStorage
    },
  ),
);
