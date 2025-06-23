import {
  GetSubscriptionByTenantRequest,
  UpgradeSubscriptionRequest,
  BuyAdditionalSlotsRequest,
  RenewSubscriptionRequest,
  PrepaySubscriptionRequest,
} from '@/types/tenant-management';

// New interfaces for calculating the cost
export interface CalculateSubscriptionPriceDto {
  subscriptionId?: string;
  planId: string;
  planPeriodId: string;
  slotTotal: number;
  newSlot?: number;
}

export interface CalculateSubscriptionPriceResponse {
  periodInMonths: number;
  slotPricePerPeriod: number;
  effectiveSlotPrice: number;
  totalAmount: number;
}

export type {
  GetSubscriptionByTenantRequest,
  UpgradeSubscriptionRequest,
  BuyAdditionalSlotsRequest,
  RenewSubscriptionRequest,
  PrepaySubscriptionRequest,
};
