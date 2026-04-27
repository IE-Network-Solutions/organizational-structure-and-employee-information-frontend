'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Modal, Button, InputNumber, Tooltip, Tag, Divider } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import {
  Module,
  Plan,
  PlanPeriod,
  Subscription,
  TransactionType,
} from '@/types/tenant-management';
import { useGetPlans } from '@/store/server/features/tenant-management/plans/queries';
import { useGetModules } from '@/store/server/features/tenant-management/modules/queries';
import { useGetSubscriptions } from '@/store/server/features/tenant-management/subscriptions/queries';
import { useGetEmployeeStatus } from '@/store/server/features/dashboard/employee-status/queries';
import { useCalculateSubscriptionPrice } from '@/store/server/features/tenant-management/manage-subscriptions/queries';
import {
  useCreateSubscription,
  usePrepaySubscription,
  useRenewSubscription,
  useUpgradeSubscription,
} from '@/store/server/features/tenant-management/manage-subscriptions/mutation';
import type { CalculateSubscriptionPriceDto } from '@/store/server/features/tenant-management/manage-subscriptions/interface';
import { DEFAULT_TENANT_ID } from '@/utils/constants';
import { usePaymentStore } from '@/store/uistate/features/tenant-managment/useState';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { IoCheckbox } from 'react-icons/io5';
import { useIsMobile } from '@/hooks/useIsMobile';

interface ManageSubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  onContinueToInvoice?: (invoiceId: string) => void;
}

/** Sort plan periods by billing length (shortest first) for a stable UI order. */
const sortPlanPeriods = (periods: PlanPeriod[]) =>
  [...periods].sort(
    (a, b) =>
      (a.periodType?.periodInMonths ?? 0) - (b.periodType?.periodInMonths ?? 0),
  );

const getDefaultPeriodTypeId = (plan: Plan | undefined): string | null => {
  if (!plan?.periods?.length) return null;
  const sorted = sortPlanPeriods(plan.periods);
  const fromSub = sorted.find((pp) => pp.isDefault);
  return (fromSub ?? sorted[0]).periodTypeId;
};

const getFallbackPeriodLabel = (pp: PlanPeriod) => {
  const code = pp.periodType?.code?.trim();
  if (code) return code;
  const description = pp.periodType?.description?.trim();
  if (description) return description;
  const months = pp.periodType?.periodInMonths;
  if (months != null && months > 0) {
    return `${months} month${months === 1 ? '' : 's'}`;
  }
  return 'Period';
};

const getBillingOptionLabel = (pp: PlanPeriod) => {
  const code = pp.periodType?.code?.toLowerCase() ?? '';
  const months = pp.periodType?.periodInMonths ?? 0;
  if (months === 12 || code.includes('annual') || code.includes('year'))
    return 'Annually';
  if (months === 1 || code.includes('month')) return 'Monthly';
  return getFallbackPeriodLabel(pp);
};

const getBillingHelperLabel = (pp: PlanPeriod | undefined) => {
  if (!pp) return '';
  const optionLabel = getBillingOptionLabel(pp).toLowerCase();
  return `You will be billed ${optionLabel} for the plan you have chosen`;
};

const FALLBACK_CALCULATION_ERROR =
  'We could not calculate pricing for the selected plan. Please try again.';
const FALLBACK_INVOICE_ERROR =
  'Subscription updated, but we could not open the invoice. Please check Billing and Invoice.';
const FALLBACK_PROCESSING_ERROR =
  'Failed to process subscription update. Please try again.';

const CURRENCY_FILTER_CODES = ['USD', 'ETB'] as const;
type CurrencyFilterCode = (typeof CURRENCY_FILTER_CODES)[number];

const normalizeCurrencyCode = (value: unknown): CurrencyFilterCode | null => {
  if (typeof value !== 'string') return null;
  const code = value.trim().toUpperCase();
  return CURRENCY_FILTER_CODES.includes(code as CurrencyFilterCode)
    ? (code as CurrencyFilterCode)
    : null;
};

const getPlanCurrencyCode = (plan: Plan): CurrencyFilterCode | null =>
  normalizeCurrencyCode(plan.currency?.code);

const UUID_LIKE_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const getPriceUnitLabel = (pp: PlanPeriod | undefined) => {
  const code = pp?.periodType?.code?.toLowerCase() ?? '';
  const months = pp?.periodType?.periodInMonths ?? 0;
  if (months === 12 || code.includes('annual') || code.includes('year'))
    return 'Year';
  if (months === 1 || code.includes('month')) return 'Month';
  return pp ? getFallbackPeriodLabel(pp) : 'Period';
};

const isCustomPlan = (plan: Plan | undefined) => {
  if (!plan) return false;
  const name = plan.name?.trim() ?? '';
  const description = plan.description?.trim().toLowerCase() ?? '';
  return (
    name.toLowerCase().includes('custom') ||
    description.includes('customize your experience') ||
    name === plan.id ||
    UUID_LIKE_REGEX.test(name)
  );
};

const getPlanDisplayName = (plan: Plan) => {
  if (isCustomPlan(plan)) return 'Custom';
  return plan.name;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const e = error as any;
  const backendMessage =
    e?.response?.data?.message ??
    e?.response?.data?.error ??
    e?.data?.message ??
    null;
  if (typeof backendMessage === 'string' && backendMessage.trim()) {
    return backendMessage.trim();
  }
  if (error instanceof Error && error.message?.trim()) {
    return error.message.trim();
  }
  return fallback;
};

const normalizeUuid = (value: unknown) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

/** Full catalog rows: modules included on the plan first, then the rest; `orderIndex` within each group. */
const orderModulesForPlanCard = (catalog: Module[], plan: Plan): Module[] => {
  const includedIds = new Set((plan.modules ?? []).map((pm) => pm.moduleId));
  return [...catalog].sort((a, b) => {
    const aOnPlan = includedIds.has(a.id) ? 0 : 1;
    const bOnPlan = includedIds.has(b.id) ? 0 : 1;
    if (aOnPlan !== bOnPlan) return aOnPlan - bOnPlan;
    return (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
  });
};

export const ManageSubscriptionModal: React.FC<
  ManageSubscriptionModalProps
> = ({ open, onClose, onContinueToInvoice }) => {
  const { setTransactionType } = usePaymentStore();
  const { isMobile } = useIsMobile();
  /** Select active plan once per modal open (after data is ready). */
  const defaultSelectionAppliedRef = useRef(false);
  const periodManuallySelectedRef = useRef(false);
  const planManuallySelectedRef = useRef(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activeSubscription, setActiveSubscription] =
    useState<Subscription | null>(null);
  const [latestSubscription, setLatestSubscription] =
    useState<Subscription | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [seatCount, setSeatCount] = useState<number>(10);
  const [selectedModulesByPlan, setSelectedModulesByPlan] = useState<
    Record<string, string[]>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  /** Which billing period (by period type id) is selected — must exist on the selected plan's `periods`. */
  const [selectedPeriodTypeId, setSelectedPeriodTypeId] = useState<
    string | null
  >(null);
  const [selectedCurrencyCode, setSelectedCurrencyCode] =
    useState<CurrencyFilterCode | null>(null);

  const { data: plansData } = useGetPlans({ filter: {} }, true, true, 'ASC');
  const { data: subscriptionsData } = useGetSubscriptions(
    { filter: { tenantId: [DEFAULT_TENANT_ID] } },
    true,
    true,
  );
  const { data: employeeStatus } = useGetEmployeeStatus('');
  const { data: modulesData, isLoading: modulesLoading } = useGetModules(
    { filter: { isActive: true } },
    true,
    open,
  );
  const createSubscriptionMutation = useCreateSubscription();
  const upgradeSubscriptionMutation = useUpgradeSubscription();
  const renewSubscriptionMutation = useRenewSubscription();
  const prepaySubscriptionMutation = usePrepaySubscription();

  const allModulesSorted = useMemo(() => {
    const items = modulesData?.items;
    if (!Array.isArray(items)) return [];
    return [...items].sort(
      (a: Module, b: Module) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
    );
  }, [modulesData]);

  useEffect(() => {
    if (!plans.length) return;
    setSelectedModulesByPlan((prev) => {
      const next = { ...prev };
      for (const plan of plans) {
        if (!next[plan.id]) {
          next[plan.id] = (plan.modules ?? []).map((m) => m.moduleId);
        }
      }
      return next;
    });
  }, [plans]);

  useEffect(() => {
    if (plansData?.items) {
      const paidPlans = plansData.items.filter((p: Plan) => !p.isFree);
      setPlans(paidPlans);
    }
  }, [plansData]);

  useEffect(() => {
    if (!subscriptionsData?.items?.length) {
      setActiveSubscription(null);
      setLatestSubscription(null);
      return;
    }

    const items = subscriptionsData.items as Subscription[];
    const active = items.find((s: Subscription) => s.isActive === true) ?? null;
    const sorted = [...items].sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    );
    const latest = sorted[0] ?? null;

    setActiveSubscription(active);
    setLatestSubscription(latest);

    const baselineSubscription = active ?? latest;
    if (baselineSubscription?.slotTotal)
      setSeatCount(baselineSubscription.slotTotal);
  }, [subscriptionsData]);

  const activePlanCurrencyId =
    activeSubscription?.plan?.currencyId ??
    activeSubscription?.currencyId ??
    latestSubscription?.plan?.currencyId ??
    latestSubscription?.currencyId ??
    null;
  const activePlanCurrencyCode =
    normalizeCurrencyCode(activeSubscription?.plan?.currency?.code) ??
    normalizeCurrencyCode(latestSubscription?.plan?.currency?.code) ??
    normalizeCurrencyCode(
      plans.find((plan) => plan.currencyId === activePlanCurrencyId)?.currency
        ?.code,
    );

  const currencyOptions = useMemo(
    () =>
      CURRENCY_FILTER_CODES.map((code) => {
        const matchingPlans = plans.filter(
          (plan) => getPlanCurrencyCode(plan) === code,
        );
        const currency = matchingPlans[0]?.currency;
        return {
          code,
          label: code,
          disabled: matchingPlans.length === 0,
        };
      }),
    [plans],
  );
  const firstAvailableCurrencyCode =
    currencyOptions.find((option) => !option.disabled)?.code ?? null;

  useEffect(() => {
    if (!open) {
      setSelectedCurrencyCode(null);
      return;
    }
    setSelectedCurrencyCode((prev) => {
      if (
        prev &&
        currencyOptions.some(
          (option) => option.code === prev && !option.disabled,
        )
      ) {
        return prev;
      }
      if (
        activePlanCurrencyCode &&
        currencyOptions.some(
          (option) => option.code === activePlanCurrencyCode && !option.disabled,
        )
      ) {
        return activePlanCurrencyCode;
      }
      return firstAvailableCurrencyCode;
    });
  }, [
    open,
    currencyOptions,
    activePlanCurrencyCode,
    firstAvailableCurrencyCode,
  ]);

  const visiblePlans = useMemo(() => {
    if (!selectedCurrencyCode) return [];
    return plans.filter((p) => getPlanCurrencyCode(p) === selectedCurrencyCode);
  }, [plans, selectedCurrencyCode]);

  /** Keep selection inside the visible list; prefer the active subscription plan when fixing. */
  useEffect(() => {
    if (!visiblePlans.length) {
      setSelectedPlanId(null);
      return;
    }
    setSelectedPlanId((prev) => {
      if (prev && visiblePlans.some((p) => p.id === prev)) return prev;
      const currentId = activeSubscription?.planId;
      if (currentId && visiblePlans.some((p) => p.id === currentId))
        return currentId;
      return visiblePlans[0].id;
    });
  }, [visiblePlans, activeSubscription?.planId]);

  /** When the modal opens, default selection to the current subscription plan (if it’s in the list). */
  useEffect(() => {
    if (!open) {
      defaultSelectionAppliedRef.current = false;
      periodManuallySelectedRef.current = false;
      planManuallySelectedRef.current = false;
      return;
    }
    if (!visiblePlans.length) return;
    if (defaultSelectionAppliedRef.current) return;

    const currentId = activeSubscription?.planId;
    const nextId =
      currentId && visiblePlans.some((p) => p.id === currentId)
        ? currentId
        : visiblePlans[0].id;
    setSelectedPlanId(nextId);
    defaultSelectionAppliedRef.current = true;
  }, [open, visiblePlans, activeSubscription?.planId]);

  /** When the selected plan changes, keep the same period type if the new plan has it; otherwise default. */
  useEffect(() => {
    const plan = visiblePlans.find((p) => p.id === selectedPlanId);
    if (!plan?.periods?.length) {
      setSelectedPeriodTypeId(null);
      return;
    }

    // Always resync to the tenant's active subscription period when this is the active plan.
    if (
      !periodManuallySelectedRef.current &&
      activeSubscription?.planId === plan.id &&
      activeSubscription.planPeriodId
    ) {
      const match = plan.periods.find(
        (pp) => pp.id === activeSubscription.planPeriodId,
      );
      if (match) {
        if (selectedPeriodTypeId !== match.periodTypeId) {
          setSelectedPeriodTypeId(match.periodTypeId);
        }
        return;
      }
    }

    const stillValid = plan.periods.some(
      (pp) => pp.periodTypeId === selectedPeriodTypeId,
    );
    if (stillValid && selectedPeriodTypeId) {
      return;
    }

    setSelectedPeriodTypeId(getDefaultPeriodTypeId(plan));
  }, [selectedPlanId, visiblePlans, activeSubscription, selectedPeriodTypeId]);

  const selectedPlan = visiblePlans.find((p) => p.id === selectedPlanId);
  const currentPlanId = activeSubscription?.planId;
  const effectiveSelectedPlanId = selectedPlanId ?? currentPlanId ?? null;

  /** Visible plans grouped by the selected currency. */
  const plansByCurrency = useMemo(() => {
    const byId = new Map<string, Plan[]>();
    for (const plan of visiblePlans) {
      const key = plan.currencyId || 'unknown';
      if (!byId.has(key)) byId.set(key, []);
      byId.get(key)!.push(plan);
    }
    return Array.from(byId.entries())
      .map(([currencyId, groupPlans]) => {
        const c = groupPlans[0]?.currency;
        const label = c ? `${c.name} (${c.code})` : 'Unknown currency';
        return { currencyId, label, plans: groupPlans };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [visiblePlans]);

  /** Plan period row for this plan that matches the selected billing period type. */
  const getPlanPeriodForSelection = (
    plan: Plan,
    periodTypeId: string | null,
  ): PlanPeriod | undefined => {
    const periods = plan.periods ?? [];
    if (!periods.length) return undefined;
    if (periodTypeId) {
      const match = periods.find((pp) => pp.periodTypeId === periodTypeId);
      if (match) return match;
    }
    return sortPlanPeriods(periods)[0];
  };

  const getPlanBadge = (plan: Plan) => {
    const isCurrentPlan = plan.id === currentPlanId;
    if (isCurrentPlan) return 'Current';
    const name = plan.name?.toLowerCase().trim() ?? '';
    // API names vary ("Performance", "Performance Plan", etc.); avoid missing Popular on exact match only.
    if (name.includes('performance')) return 'Popular';
    return null;
  };

  const getPriceLabel = (plan: Plan) => {
    const period = getPlanPeriodForSelection(plan, selectedPeriodTypeId);
    const currency = plan.currency?.symbol ?? '$';
    const price =
      period?.periodSlotPrice ?? plan.slotPrice ?? Number(plan.slotPrice) ?? 0;
    const periodLabel = getPriceUnitLabel(period);
    return `${currency}${Number(price).toFixed(0)} / User / ${periodLabel}`;
  };

  const selectedPlanPeriod = selectedPlan
    ? getPlanPeriodForSelection(selectedPlan, selectedPeriodTypeId)
    : undefined;

  const hasExistingSubscription = !!activeSubscription || !!latestSubscription;
  const currentSlotTotal =
    activeSubscription?.slotTotal ?? latestSubscription?.slotTotal ?? 0;
  const seatsUsed =
    employeeStatus?.reduce((acc, s) => acc + Number(s.count), 0) ?? 0;
  const minimumSeatCount =
    seatsUsed > 0
      ? Math.max(1, seatsUsed)
      : currentSlotTotal > 0
        ? currentSlotTotal
        : 1;

  // Keep seat input valid.
  useEffect(() => {
    if (seatCount < minimumSeatCount) {
      setSeatCount(minimumSeatCount);
    }
  }, [seatCount, minimumSeatCount]);

  // On open, default seat count to the minimum valid number.
  useEffect(() => {
    if (!open) return;
    setSeatCount(minimumSeatCount);
  }, [open, minimumSeatCount]);

  const isSeatDecreased = seatCount < minimumSeatCount;
  const isSeatIncreased =
    hasExistingSubscription && seatCount > currentSlotTotal;
  const isPlanChanged =
    !!activeSubscription &&
    !!selectedPlan &&
    selectedPlan.id !== activeSubscription.planId;
  const isPeriodChanged =
    !!activeSubscription &&
    !!selectedPlanPeriod &&
    selectedPlanPeriod.id !== activeSubscription.planPeriodId;

  const currentPlanPeriod =
    activeSubscription?.planPeriod ??
    activeSubscription?.plan?.periods?.find(
      (pp) => pp.id === activeSubscription?.planPeriodId,
    ) ??
    null;
  const currentPeriodSlotPrice =
    currentPlanPeriod?.periodSlotPrice ??
    activeSubscription?.plan?.slotPrice ??
    Number(currentPlanPeriod?.periodSlotPrice) ??
    0;
  const targetPeriodSlotPrice =
    selectedPlanPeriod?.periodSlotPrice ??
    selectedPlan?.slotPrice ??
    Number(selectedPlan?.slotPrice) ??
    0;

  const currentPeriodInMonths = currentPlanPeriod?.periodType?.periodInMonths;
  const targetPeriodInMonths = selectedPlanPeriod?.periodType?.periodInMonths;

  const isScheduledDowngradeForPrepay =
    !!activeSubscription &&
    (isPlanChanged || isPeriodChanged) &&
    (targetPeriodSlotPrice < currentPeriodSlotPrice ||
      (typeof currentPeriodInMonths === 'number' &&
        typeof targetPeriodInMonths === 'number' &&
        targetPeriodInMonths < currentPeriodInMonths));

  const nextBillingDateLabel = activeSubscription?.endAt
    ? new Date(activeSubscription.endAt).toLocaleDateString()
    : null;
  const scheduledDowngradeTooltip = nextBillingDateLabel
    ? `This change is treated as a downgrade and will take effect on your next billing cycle (${nextBillingDateLabel}).`
    : 'This change is treated as a downgrade and will take effect on your next billing cycle.';

  const resolvedTransactionType: TransactionType | null = useMemo(() => {
    if (!selectedPlan || !selectedPlanPeriod || seatCount < 1) return null;
    if (!activeSubscription) return TransactionType.PURCHASE_SUBSCRIPTION;
    if (isSeatDecreased) return null;
    if (isPlanChanged) return TransactionType.PURCHASE_SUBSCRIPTION;
    if (isPeriodChanged) return TransactionType.PERIOD_UPGRADE;
    if (isSeatIncreased) return TransactionType.PURCHASE_SLOTS;
    return null;
  }, [
    selectedPlan,
    selectedPlanPeriod,
    seatCount,
    activeSubscription,
    isSeatDecreased,
    isPlanChanged,
    isPeriodChanged,
    isSeatIncreased,
  ]);

  const billingPeriodOptions = useMemo(
    () =>
      selectedPlan?.periods?.length
        ? sortPlanPeriods(selectedPlan.periods)
        : [],
    [selectedPlan],
  );
  const displayedBillingPeriodOptions = billingPeriodOptions;

  const calculationDto: CalculateSubscriptionPriceDto | null = useMemo(() => {
    if (
      !selectedPlanId ||
      !selectedPlan ||
      !selectedPlanPeriod ||
      seatCount < 1 ||
      !resolvedTransactionType
    )
      return null;
    return {
      planId: selectedPlan.id,
      planPeriodId: selectedPlanPeriod.id,
      slotTotal: seatCount,
      transactionType: isScheduledDowngradeForPrepay
        ? TransactionType.PREPAY_SUBSCRIPTION
        : resolvedTransactionType,
      ...(resolvedTransactionType === TransactionType.PURCHASE_SLOTS
        ? { newSlotTotal: seatCount - currentSlotTotal }
        : {}),
      ...(activeSubscription ? { subscriptionId: activeSubscription.id } : {}),
    };
  }, [
    selectedPlanId,
    selectedPlan,
    selectedPlanPeriod,
    seatCount,
    resolvedTransactionType,
    isScheduledDowngradeForPrepay,
    currentSlotTotal,
    activeSubscription,
  ]);

  const isCalculationEnabled =
    open && !!calculationDto?.planId && !!calculationDto?.planPeriodId;
  const {
    data: calculationData,
    isLoading: isCalculating,
    error: calculationError,
  } = useCalculateSubscriptionPrice(calculationDto, isCalculationEnabled);

  const totalAmount = calculationData?.item?.totalAmount ?? null;
  const displayAmount = useMemo(() => {
    if (!selectedPlanPeriod) return null;
    const slotPrice =
      selectedPlanPeriod.periodSlotPrice ?? selectedPlan?.slotPrice ?? 0;
    return Number(slotPrice) * Number(seatCount || 0);
  }, [selectedPlanPeriod, selectedPlan, seatCount]);

  useEffect(() => {
    if (!open) {
      setInlineError(null);
      return;
    }
    setInlineError(null);
  }, [open, selectedPlanId, selectedPeriodTypeId, seatCount]);

  useEffect(() => {
    if (calculationError) {
      setInlineError(
        getErrorMessage(calculationError, FALLBACK_CALCULATION_ERROR),
      );
    }
  }, [calculationError]);

  const getInvoiceIdFromResponse = (payload: any): string | null => {
    // Different endpoints return different shapes (upgrade vs slots vs prepay).
    // Try the most common invoice-id locations.
    return (
      // Sometimes it's a singular invoice object
      payload?.invoice?.id ??
      payload?.data?.invoice?.id ??
      payload?.item?.invoice?.id ??
      // Sometimes it's an array of invoices
      payload?.invoices?.[0]?.id ??
      payload?.data?.invoices?.[0]?.id ??
      payload?.item?.invoices?.[0]?.id ??
      // Sometimes nested under "items"
      payload?.items?.[0]?.id ??
      payload?.data?.items?.[0]?.id ??
      payload?.item?.items?.[0]?.id ??
      // Last resort: sometimes the endpoint returns the invoice directly
      // (but note: many endpoints return a subscription at the top-level `id`)
      payload?.id ??
      payload?.data?.id ??
      payload?.item?.id ??
      null
    );
  };

  const handleContinue = async () => {
    if (
      !selectedPlan ||
      !selectedPlanPeriod ||
      !resolvedTransactionType ||
      isSeatDecreased
    )
      return;

    setIsSubmitting(true);
    setTransactionType(
      isScheduledDowngradeForPrepay
        ? TransactionType.PREPAY_SUBSCRIPTION
        : resolvedTransactionType,
    );
    try {
      const tenantId =
        normalizeUuid(useAuthenticationStore.getState().tenantId) ??
        normalizeUuid(DEFAULT_TENANT_ID);
      const selectedCurrencyId = normalizeUuid(selectedPlan.currency?.id);
      if (!tenantId) {
        setInlineError(
          'Unable to process subscription update: tenant identifier is missing. Please refresh and try again.',
        );
        return;
      }

      let response: any;
      if (!activeSubscription) {
        // If tenant already has a previous subscription (e.g. expired), renew it.
        if (latestSubscription?.id) {
          response = await renewSubscriptionMutation.mutateAsync({
            subscriptionId: latestSubscription.id,
            tenantId,
            planId: selectedPlan.id,
            planPeriodId: selectedPlanPeriod.id,
            slotTotal: seatCount,
          });
        } else {
          // Brand new tenant with no subscription history.
          response = await createSubscriptionMutation.mutateAsync({
            planId: selectedPlan.id,
            planPeriodId: selectedPlanPeriod.id,
            slotTotal: seatCount,
            tenantId,
            ...(selectedCurrencyId ? { currencyId: selectedCurrencyId } : {}),
            subscriptionPrice: Number(totalAmount ?? displayAmount ?? 0),
            subscriptionStatus: 'pending' as any,
            isActive: false,
          } as any);
        }
      } else {
        if (resolvedTransactionType === TransactionType.PURCHASE_SLOTS) {
          // Keep slot-only increase routed through the legacy upgrade endpoint.
          response = await upgradeSubscriptionMutation.mutateAsync({
            subscriptionId: activeSubscription.id,
            tenantId,
            planId: selectedPlan.id,
            planPeriodId: selectedPlanPeriod.id,
            slots: seatCount,
          });
        } else if (isScheduledDowngradeForPrepay) {
          response = await prepaySubscriptionMutation.mutateAsync({
            subscriptionId: activeSubscription.id,
            tenantId,
            planId: selectedPlan.id,
            planPeriodId: selectedPlanPeriod.id,
            slotTotal: seatCount,
          });
        } else {
          response = await upgradeSubscriptionMutation.mutateAsync({
            subscriptionId: activeSubscription.id,
            tenantId,
            planId: selectedPlan.id,
            planPeriodId: selectedPlanPeriod.id,
            slots: seatCount,
          });
        }
      }

      const invoiceId = getInvoiceIdFromResponse(response);
      if (!invoiceId) {
        setInlineError(FALLBACK_INVOICE_ERROR);
        return;
      }

      onClose();
      onContinueToInvoice?.(invoiceId);
    } catch (error) {
      setInlineError(getErrorMessage(error, FALLBACK_PROCESSING_ERROR));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Wide enough for four 307px plan cards + column gaps (see plan grid gap-x-*).
  // Below lg: modal body is height-capped; only the plan cards scroll so seats / billing / total stay visible.
  return (
    <Modal
      title="Manage Subscription"
      open={open}
      onCancel={onClose}
      footer={null}
      width={1400}
      centered
      destroyOnClose
      className="manage-subscription-modal"
      data-cy="manage-subscription-modal"
      classNames={{
        body: [
          'manage-subscription-modal__body',
          '!px-5 !pb-5 !pt-4 md:!px-6 md:!pb-6',
          'max-lg:!flex max-lg:!flex-col max-lg:!min-h-0',
          'max-lg:!pb-4',
          'lg:!min-h-[703px]',
        ].join(' '),
      }}
    >
      <div
        data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-div-577"
        className="flex w-full min-w-0 flex-col gap-6 max-lg:min-h-0 max-lg:flex-1"
      >
        {/* Top controls — equal 3 columns on md+; billing centered in the middle */}
        <div
          data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-div-579"
          className="grid w-full min-w-0 max-lg:shrink-0 grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-3 md:items-center md:gap-6"
        >
          <div
            data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-div-580"
            className="flex w-full min-w-0 flex-col items-start gap-2 md:max-w-none md:flex-row md:items-center md:gap-3 md:justify-self-start"
          >
            <div
              data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-div-581"
              className="flex shrink-0 items-center gap-1"
            >
              <span
                data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-span-582"
                className="text-sm font-medium text-gray-700 whitespace-nowrap"
              >
                {isMobile ? 'Seats' : 'Number of Seats'}
              </span>
              <Tooltip title="Total number of user seats for this subscription">
                <AiOutlineQuestionCircle
                  className="inline-block shrink-0 align-middle text-sm text-gray-400"
                  aria-hidden
                />
              </Tooltip>
            </div>
            <InputNumber
              min={minimumSeatCount}
              value={seatCount}
              onChange={(v) =>
                setSeatCount(
                  Math.max(minimumSeatCount, Number(v ?? minimumSeatCount)),
                )
              }
              className="!h-8 !w-[76px] max-w-[76px] shrink-0"
              controls={false}
              data-cy="manage-subscription-seats"
            />
            {isSeatDecreased ? (
              <p
                data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-p-605"
                className="w-full text-xs text-red-500"
              >
                Seats cannot be less than your current number of users (
                {minimumSeatCount}).
              </p>
            ) : null}
          </div>
          <div
            data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-div-611"
            className="hidden min-w-0 w-full flex-col items-center text-center md:flex"
          >
            <div
              data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-div-612"
              className="text-sm font-medium mb-1 w-full"
            >
              Billing
            </div>
            {billingPeriodOptions.length === 0 ? (
              <p
                data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-p-614"
                className="text-xs text-gray-500"
              >
                No billing periods returned for this plan.
              </p>
            ) : (
              <>
                <div
                  data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-div-619"
                  className="inline-flex flex-wrap items-center justify-center gap-2.5"
                >
                  {displayedBillingPeriodOptions.map((pp) => {
                    const label = getBillingOptionLabel(pp);
                    const isActive = selectedPeriodTypeId
                      ? pp.periodTypeId === selectedPeriodTypeId
                      : activeSubscription?.planPeriodId === pp.id;
                    return (
                      <button
                        key={pp.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          periodManuallySelectedRef.current = true;
                          setSelectedPeriodTypeId(pp.periodTypeId);
                        }}
                        data-cy={`billing-period-${pp.periodType?.code ?? pp.id}`}
                        className={`min-h-9 min-w-[112px] rounded-lg px-5 py-2 text-[14px] font-medium leading-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e40af]/35 ${
                          isActive
                            ? 'border border-[#1e40af] bg-[#1e40af] text-white hover:border-[#1e3a8a] hover:bg-[#1e3a8a]'
                            : 'border border-solid border-[#D1D5DB] bg-white text-[#4B5563] hover:bg-gray-50'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <p
                  data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-p-642"
                  className="mt-2 max-w-md text-[12px] font-normal leading-4 text-[#9ca3af]"
                >
                  {getBillingHelperLabel(selectedPlanPeriod)}
                </p>
              </>
            )}
          </div>
          <div
            data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-div-650"
            className="flex w-full min-w-0 flex-col items-start gap-2 md:max-w-none md:flex-row md:flex-wrap md:items-center md:justify-end md:gap-2 md:justify-self-end"
          >
            <div
              data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-div-651"
              className="flex shrink-0 items-center gap-1"
            >
              <span
                data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-span-652"
                className="text-sm font-medium text-gray-700 whitespace-nowrap"
              >
                Total Amount
              </span>
              <Tooltip title="Based on selected plan, seats, and billing cycle">
                <AiOutlineQuestionCircle
                  className="inline-block shrink-0 align-middle text-sm text-gray-400"
                  aria-hidden
                />
              </Tooltip>
            </div>
            <div className="flex w-full min-w-0 flex-wrap items-center gap-2 md:w-auto md:justify-end">
              <div
                className="manage-subscription-total-amount-wrap flex h-8 w-full min-w-0 max-w-[128px] shrink-0 items-center rounded-lg border border-[#d1d5db] bg-white md:w-[128px]"
                data-cy="manage-subscription-total-amount"
              >
                <span
                  data-cy="manage-subscription-total-amount-value"
                  className="flex min-w-0 flex-1 items-center px-3 text-left text-[13px] font-medium tabular-nums text-[#111827]"
                >
                  {displayAmount != null
                    ? Number(displayAmount).toLocaleString()
                    : '—'}
                </span>
              </div>
              <div
                data-cy="manage-subscription-currency-filter"
                className="inline-flex h-8 shrink-0 items-stretch overflow-hidden rounded-lg border border-[#d1d5db] bg-white"
                aria-label="Filter plans by currency"
              >
                {currencyOptions.map((option) => {
                  const isActive = selectedCurrencyCode === option.code;
                  return (
                    <button
                      key={option.code}
                      type="button"
                      disabled={option.disabled}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCurrencyCode(option.code);
                      }}
                      data-cy={`manage-subscription-currency-${option.code}`}
                      className={`flex min-w-[52px] items-center justify-center px-3 text-[13px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e40af]/35 ${
                        isActive
                          ? 'bg-[#1e40af] text-white'
                          : 'bg-white text-[#4B5563] hover:bg-gray-50'
                      } ${option.disabled ? 'cursor-not-allowed opacity-45 hover:bg-white' : ''}`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {inlineError ? (
          <div
            data-cy="manage-subscription-inline-error"
            className="mt-[-4px] text-center text-[14px] font-semibold leading-5 text-[#E65F5C]"
          >
            {inlineError}
          </div>
        ) : null}

        {/* Plan cards — filtered by the selected currency */}
        <div
          data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-div-688"
          className="scrollbar-none flex flex-col gap-6 max-lg:min-h-0 max-lg:flex-1"
        >
          {plansByCurrency.length === 0 ? (
            <p
              data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-p-690"
              className="text-sm text-gray-500 text-center py-6"
            >
              {selectedCurrencyCode
                ? `No paid ${selectedCurrencyCode} plans available.`
                : 'No paid USD or ETB plans available.'}
            </p>
          ) : null}
          {plansByCurrency.map(({ currencyId, plans: groupPlans }) => {
            const orderedGroupPlans = isMobile
              ? [...groupPlans].sort((a, b) => {
                  const aSelected = effectiveSelectedPlanId === a.id ? 0 : 1;
                  const bSelected = effectiveSelectedPlanId === b.id ? 0 : 1;
                  if (aSelected !== bSelected) return aSelected - bSelected;
                  return 0;
                })
              : groupPlans;

            return (
              <div
                key={currencyId}
                className="grid w-full min-w-0 grid-cols-1 justify-items-center gap-y-4 md:grid-cols-2 md:gap-x-10 md:gap-y-6 xl:grid-cols-4 xl:gap-x-10"
                data-cy={`manage-subscription-plans-currency-${currencyId}`}
              >
                {orderedGroupPlans.map((plan) => {
                  const badge = getPlanBadge(plan);
                  const isSelected = planManuallySelectedRef.current
                    ? selectedPlanId === plan.id
                    : effectiveSelectedPlanId === plan.id;
                  const isEditableCustomPlan = isCustomPlan(plan);
                  const selectedHasError = Boolean(inlineError) && isSelected;
                  const includedModuleIds = new Set(
                    selectedModulesByPlan[plan.id] ??
                      (plan.modules ?? []).map((pm) => pm.moduleId),
                  );
                  const modulesForCard =
                    allModulesSorted.length > 0
                      ? orderModulesForPlanCard(allModulesSorted, plan)
                      : [];
                  return (
                    <div
                      key={plan.id}
                      data-cy={`plan-card-${plan.id}`}
                      onClick={() => {
                        planManuallySelectedRef.current = true;
                        setSelectedPlanId(plan.id);
                      }}
                      className={`relative h-[506px] w-[307px] shrink-0 cursor-pointer rounded-xl border bg-gradient-to-b from-white via-white to-[#eef7ff] px-4 pb-4 pt-3 shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition-all duration-200 max-lg:min-h-[366px] max-lg:h-auto max-lg:w-full max-lg:max-w-none ${
                        isSelected
                          ? selectedHasError
                            ? 'border-[#F29B9B] shadow-[0_16px_32px_rgba(230,95,92,0.14)]'
                            : 'border-primary shadow-[0_16px_32px_rgba(30,64,175,0.16)]'
                          : 'border-[#edf1f5] hover:border-[#bfd5ff]'
                      }`}
                    >
                      {badge && (
                        <Tag
                          bordered={false}
                          className={`absolute right-3 top-3 z-[1] m-0 !rounded-lg px-2 py-0.5 text-[14px] !font-bold leading-tight ${
                            badge === 'Popular'
                              ? '!border-0 !bg-[#69B1FF] !text-white'
                              : '!border !border-solid !border-[#D1D5DB] !bg-white !text-black/60'
                          }`}
                          data-cy="plan-card-current-tag"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {badge}
                        </Tag>
                      )}
                      {/* Radio row (Current tag is absolute top-right) */}
                      <div
                        data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-div-745"
                        className="relative flex min-h-[28px] items-center"
                      >
                        <span
                          data-cy={`manage-subscription-plan-${plan.id}-radio`}
                          className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                            isSelected
                              ? selectedHasError
                                ? 'border-[#E65F5C]'
                                : 'border-primary'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isSelected ? (
                            <span
                              data-cy={`manage-subscription-plan-${plan.id}-radio-selected`}
                              className={`h-2 w-2 rounded-full ${
                                selectedHasError ? 'bg-[#E65F5C]' : 'bg-primary'
                              }`}
                            />
                          ) : null}
                        </span>
                      </div>
                      {/* Centered plan title, price, description */}
                      <div
                        data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-div-749"
                        className="px-1 pt-2 text-center"
                      >
                        <div
                          data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-div-750"
                          className="text-[14px] font-bold text-black"
                        >
                          {getPlanDisplayName(plan)}
                        </div>
                        <div
                          data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-div-751"
                          className="mt-2 text-[20px] font-bold leading-tight text-black"
                        >
                          {getPriceLabel(plan)}
                        </div>
                        {plan.description && (
                          <div
                            data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-div-755"
                            className="mt-2 text-[14px] font-normal text-black/50"
                          >
                            {plan.description}
                          </div>
                        )}
                      </div>
                      <div
                        data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-div-760"
                        className="flex justify-center px-2"
                      >
                        <Divider className="!my-3 min-w-[96px] !w-[70%] max-w-[180px] border-[#edf1f5]" />
                      </div>
                      <div
                        data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-div-763"
                        className="mt-1 flex flex-col items-center gap-1"
                      >
                        {modulesLoading && allModulesSorted.length === 0 ? (
                          <LoadingOutlined
                            spin
                            className="text-primary"
                            aria-label="Loading modules"
                          />
                        ) : modulesForCard.length > 0 ? (
                          modulesForCard.map((mod) => {
                            const included = includedModuleIds.has(mod.id);
                            const label =
                              mod.name?.trim() || mod.code?.trim() || 'Module';
                            return (
                              <div
                                data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-div-776"
                                key={mod.id}
                                className={`flex w-full max-w-full items-center justify-start gap-2 text-[14px] font-normal ${
                                  isEditableCustomPlan
                                    ? 'cursor-pointer'
                                    : 'cursor-default'
                                }`}
                                onClick={(e) => {
                                  if (!isEditableCustomPlan) return;
                                  e.stopPropagation();
                                  setSelectedModulesByPlan((prev) => {
                                    const current = new Set(
                                      prev[plan.id] ??
                                        (plan.modules ?? []).map(
                                          (pm) => pm.moduleId,
                                        ),
                                    );
                                    if (current.has(mod.id)) {
                                      current.delete(mod.id);
                                    } else {
                                      current.add(mod.id);
                                    }
                                    return {
                                      ...prev,
                                      [plan.id]: Array.from(current),
                                    };
                                  });
                                }}
                              >
                                <span
                                  data-cy={`manage-subscription-plan-${plan.id}-module-${mod.id}-icon-wrap`}
                                  className="inline-flex size-[18px] shrink-0 items-center justify-center"
                                  aria-hidden
                                >
                                  {included ? (
                                    <IoCheckbox className="size-full text-[#69B1FF]" />
                                  ) : (
                                    <span
                                      data-cy={`manage-subscription-plan-${plan.id}-module-${mod.id}-icon-empty`}
                                      className="size-[15px] shrink-0 rounded-sm bg-white shadow-[inset_0_0_0_1px_#d1d5db]"
                                    />
                                  )}
                                </span>
                                <span
                                  data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-span-784"
                                  className={
                                    included ? 'text-black' : 'text-black/45'
                                  }
                                >
                                  {label}
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          (plan.planDetails ?? []).map((detail, i) => (
                            <div
                              data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-div-796"
                              key={`${plan.id}-detail-${i}`}
                              className="flex w-full max-w-full items-center justify-start gap-2 text-[14px] font-normal"
                            >
                              <IoCheckbox
                                className="size-[18px] shrink-0 text-primary"
                                aria-hidden
                              />
                              <span
                                data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-span-804"
                                className="text-black"
                              >
                                {detail}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-div-817"
          className="flex justify-end gap-3 max-lg:sticky max-lg:bottom-0 max-lg:z-[2] max-lg:shrink-0 max-lg:border-t max-lg:border-gray-100 max-lg:bg-white max-lg:pt-3 lg:pt-0 lg:border-t-0"
        >
          <Button
            onClick={onClose}
            data-cy="manage-subscription-cancel"
            className="!h-9 !rounded-md !border-gray-200 !px-4 !font-normal !text-[#000000]/[0.7]"
          >
            Cancel
          </Button>
          <Tooltip
            title={
              isScheduledDowngradeForPrepay ? scheduledDowngradeTooltip : null
            }
          >
            <span
              data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-span-826"
              className="inline-block"
            >
              <Button
                type="primary"
                onClick={handleContinue}
                loading={isSubmitting}
                disabled={
                  !calculationDto ||
                  isSeatDecreased ||
                  isCalculating ||
                  isSubmitting
                }
                data-cy="manage-subscription-continue"
                className="!h-9 !rounded-md !px-5 !font-normal"
              >
                Continue
              </Button>
            </span>
          </Tooltip>
        </div>
      </div>
    </Modal>
  );
};
