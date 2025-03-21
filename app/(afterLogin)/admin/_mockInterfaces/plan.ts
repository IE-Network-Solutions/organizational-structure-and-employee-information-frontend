import { Module } from "./modules";
import { PeriodType } from "./periodType";

export interface Plan {
    id: string;
    name: string;
    description: string;
    slotPrice: number;
    slotDiscountPrice: number;
    planDetails: string[];
    currencyId: string;
    currency: {
        id: string;
        code: string;
        name: string;
        symbol: string;
        createdAt: string;
        updatedAt: string;
        deletedAt: string;
        createdBy: string;
        updatedBy: string;
        deletedBy: string;
    },
    monthlyPrice: number;
    quarterlyPrice: number;
    yearlyPrice: number;
    customPrice: number;
    isFree: boolean;
    isPublic: boolean;
    successorPlanId: string;
    successorPlan: null;
    lateFeeAmount: number;
    lateFeeDescription: string;
    invoiceGenerationDaysBefore: number;
    gracePeriodDays: number;
    trialDurationDays: number;
    maxTrialSlots: number;
    modules: Module[];
    periodTypes: PeriodType[]
}
