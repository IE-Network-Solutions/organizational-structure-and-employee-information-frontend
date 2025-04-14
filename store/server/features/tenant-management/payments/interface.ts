import { PaymentMethod, PaymentStatus } from '@/types/tenant-management';

export interface PaymentRequestBody {
  filter: {
    id?: string[];
    invoiceId?: string[];
    status?: PaymentStatus;
    method?: PaymentMethod;
    paymentProvider?: string;
    externalPaymentId?: string;
    paymentAt?: {
      from?: string;
      to?: string;
    };
  };
}
