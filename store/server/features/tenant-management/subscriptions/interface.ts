import { SubscriptionStatus } from '@/types/tenant-management';

export interface SubscriptionRequestBody {
  filter: {
    id?: string[];
    tenantId?: string[];
    planId?: string[];
    isActive?: boolean;
    isTrial?: boolean;
    subscriptionStatus?: SubscriptionStatus[];
    endAt?: {
      from?: string;
      to?: string;
    };
  };
}
