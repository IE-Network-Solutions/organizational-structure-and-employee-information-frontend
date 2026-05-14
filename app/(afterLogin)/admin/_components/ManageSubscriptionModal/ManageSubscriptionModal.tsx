'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Modal,
  Button,
  Input,
  InputNumber,
  Radio,
  Tooltip,
  Tag,
  Divider,
  notification,
  Checkbox,
} from 'antd';
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
  useBuyAdditionalSlots,
  useCreateSubscription,
  useGetAllPlans,
  usePrepaySubscription,
  useRenewSubscription,
  useUpgradeSubscription,
} from '@/store/server/features/tenant-management/manage-subscriptions/mutation';
import type { CalculateSubscriptionPriceDto } from '@/store/server/features/tenant-management/manage-subscriptions/interface';
import { DEFAULT_TENANT_ID } from '@/utils/constants';
import { usePaymentStore } from '@/store/uistate/features/tenant-managment/useState';
import { IoCheckbox } from 'react-icons/io5';

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

const getModulePrice = (mod: any): number => {
  const candidates = [
    mod?.price,
    mod?.modulePrice,
    mod?.amount,
    mod?.monthlyPrice,
    mod?.slotPrice,
    mod?.cost,
    mod?.pricing?.price,
    mod?.pricing?.amount,
  ];

  for (const value of candidates) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }
  return 0;
};

export const ManageSubscriptionModal: React.FC<
  ManageSubscriptionModalProps
> = ({ open, onClose, onContinueToInvoice }) => {
  const { setTransactionType } = usePaymentStore();
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustomPlanSelected, setIsCustomPlanSelected] = useState(false);
  const [customSelectedModuleIds, setCustomSelectedModuleIds] = useState<
    string[]
  >([]);
  /** Which billing period (by period type id) is selected — must exist on the selected plan's `periods`. */
  const [selectedPeriodTypeId, setSelectedPeriodTypeId] = useState<
    string | null
  >(null);

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
  const buyAdditionalSlotsMutation = useBuyAdditionalSlots();
  const renewSubscriptionMutation = useRenewSubscription();
  const prepaySubscriptionMutation = usePrepaySubscription();

  /** Currency must follow the tenant's current/most-recent subscription plan. */
  const activePlanCurrencyId =
    activeSubscription?.plan?.currencyId ??
    activeSubscription?.currencyId ??
    latestSubscription?.plan?.currencyId ??
    latestSubscription?.currencyId ??
    undefined;

  const { data: allPlansData } = useGetAllPlans(activePlanCurrencyId);
  const { data: plansData } = useGetPlans(
    { filter: {} },
    true,
    true,
    'ASC',
    activePlanCurrencyId,
  );
  const allModulesSorted = useMemo(() => {
    const items = modulesData?.items;
    if (!Array.isArray(items)) return [];
    return [...items].sort(
      (a: Module, b: Module) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
    );
  }, [modulesData]);

  const customPlanModules = useMemo(() => {
    const allPlansPayload = allPlansData as any;
    const rawModules =
      allPlansPayload?.items ??
      allPlansPayload?.item ??
      allPlansPayload?.data?.items ??
      allPlansPayload?.data?.item ??
      allPlansPayload?.data;

    if (!Array.isArray(rawModules)) return [];

    return rawModules
      .map((mod: any, index: number) => ({
        id: String(
          mod?.id ??
            mod?.moduleId ??
            mod?.code ??
            mod?.name ??
            `custom-module-${index}`,
        ),
        label:
          mod?.name?.trim() ||
          mod?.moduleName?.trim() ||
          mod?.title?.trim() ||
          mod?.code?.trim() ||
          `Module ${index + 1}`,
        orderIndex: Number(mod?.orderIndex ?? index),
        isCoreModule: mod?.isCoreModule === true,
        price: getModulePrice(mod),
      }))
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [allPlansData]);

  /** Core modules stay selected and cannot be toggled off. */
  useEffect(() => {
    const coreIds = customPlanModules
      .filter((m) => m.isCoreModule)
      .map((m) => m.id);
    const allowedIds = new Set(customPlanModules.map((m) => m.id));
    setCustomSelectedModuleIds((prev) => {
      const kept = prev.filter((id) => allowedIds.has(id));
      return Array.from(new Set([...coreIds, ...kept]));
    });
  }, [customPlanModules]);

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

  const visiblePlans = useMemo(() => {
    if (!activePlanCurrencyId) return plans;
    return plans.filter((p) => p.currencyId === activePlanCurrencyId);
  }, [plans, activePlanCurrencyId]);

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
      setIsCustomPlanSelected(false);
      setCustomSelectedModuleIds([]);
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
  }, [selectedPlanId, visiblePlans, activeSubscription]);

  const selectedPlan = visiblePlans.find((p) => p.id === selectedPlanId);
  const currentPlanId = activeSubscription?.planId;
  const currentPeriodTypeId =
    activeSubscription?.planPeriod?.periodTypeId ??
    activeSubscription?.plan?.periods?.find(
      (pp) => pp.id === activeSubscription?.planPeriodId,
    )?.periodTypeId ??
    null;
  const effectiveSelectedPeriodTypeId =
    selectedPeriodTypeId ?? currentPeriodTypeId;
  const effectiveSelectedPlanId = selectedPlanId ?? currentPlanId ?? null;

  /** Visible plans grouped by currency (typically one group after active-currency filter). */
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
    const isCurrentBillingType =
      !!effectiveSelectedPeriodTypeId &&
      !!currentPeriodTypeId &&
      effectiveSelectedPeriodTypeId === currentPeriodTypeId;
    return isCurrentPlan && isCurrentBillingType ? 'Current' : null;
  };

  const formatPeriodLabel = (pp: PlanPeriod) => {
    const pt = pp.periodType;
    const code = pt?.code?.trim();
    if (code) return code;
    const desc = pt?.description?.trim();
    if (desc) return desc;
    const m = pt?.periodInMonths;
    if (m != null && m > 0) return `${m} month${m === 1 ? '' : 's'}`;
    return 'period';
  };

  const getPriceLabel = (plan: Plan) => {
    const currency = plan.currency?.symbol ?? '$';
    const period = getPlanPeriodForSelection(plan, selectedPeriodTypeId);
    const price =
      period?.periodSlotPrice ?? plan.slotPrice ?? Number(plan.slotPrice) ?? 0;
    const periodLabel = period ? formatPeriodLabel(period) : '—';
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

  const currentPlanModuleIds = useMemo(
    () =>
      (activeSubscription?.plan?.modules ?? [])
        .map((pm) => pm.moduleId)
        .filter(Boolean),
    [activeSubscription?.plan?.modules],
  );
  const selectedPlanModuleIds = useMemo(
    () =>
      (selectedPlan?.modules ?? []).map((pm) => pm.moduleId).filter(Boolean),
    [selectedPlan?.modules],
  );
  const coreCustomModuleIds = useMemo(
    () =>
      customPlanModules
        .filter((m) => m.isCoreModule)
        .map((m) => m.id)
        .filter(Boolean),
    [customPlanModules],
  );
  const targetModuleIds = useMemo(() => {
    if (isCustomPlanSelected) {
      return Array.from(
        new Set([...coreCustomModuleIds, ...customSelectedModuleIds]),
      );
    }
    return selectedPlanModuleIds;
  }, [
    isCustomPlanSelected,
    coreCustomModuleIds,
    customSelectedModuleIds,
    selectedPlanModuleIds,
  ]);
  const isModuleSelectionUnchanged = useMemo(() => {
    if (!activeSubscription) return false;
    if (targetModuleIds.length !== currentPlanModuleIds.length) return false;
    const currentSet = new Set(currentPlanModuleIds);
    return targetModuleIds.every((id) => currentSet.has(id));
  }, [activeSubscription, targetModuleIds, currentPlanModuleIds]);
  const isSlotOnlyChange = useMemo(() => {
    if (!activeSubscription) return false;
    const isSeatOnlyChanged =
      isSeatIncreased && !isPlanChanged && !isPeriodChanged;
    return isSeatOnlyChanged && isModuleSelectionUnchanged;
  }, [
    activeSubscription,
    isSeatIncreased,
    isPlanChanged,
    isPeriodChanged,
    isModuleSelectionUnchanged,
  ]);

  const modulePriceById = useMemo(() => {
    const map = new Map<string, number>();
    for (const mod of customPlanModules) {
      map.set(mod.id, Number(mod.price ?? 0));
    }
    return map;
  }, [customPlanModules]);

  const getModuleUnitPriceTotal = (moduleIds: string[]) =>
    moduleIds.reduce(
      (acc, id) => acc + Number(modulePriceById.get(id) ?? 0),
      0,
    );

  const targetCustomModulesUnitTotal = getModuleUnitPriceTotal(targetModuleIds);
  const currentCustomModulesUnitTotal =
    getModuleUnitPriceTotal(currentPlanModuleIds);
  const targetTotalForDowngradeCheck = isCustomPlanSelected
    ? targetCustomModulesUnitTotal * seatCount
    : targetPeriodSlotPrice * seatCount;
  const currentTotalForDowngradeCheck = isCustomPlanSelected
    ? currentCustomModulesUnitTotal * currentSlotTotal
    : currentPeriodSlotPrice * currentSlotTotal;

  const isScheduledDowngradeForPrepay =
    !!activeSubscription &&
    targetTotalForDowngradeCheck < currentTotalForDowngradeCheck;

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

  const billingPeriodOptions = selectedPlan?.periods?.length
    ? sortPlanPeriods(selectedPlan.periods)
    : [];
  const displayedBillingPeriodOptions = useMemo(() => {
    if (!billingPeriodOptions.length) return [];
    const currentPeriodId = activeSubscription?.planPeriodId;
    if (!currentPeriodId) return billingPeriodOptions;
    return [...billingPeriodOptions].sort((a, b) => {
      const aCurrent = a.id === currentPeriodId ? 0 : 1;
      const bCurrent = b.id === currentPeriodId ? 0 : 1;
      if (aCurrent !== bCurrent) return aCurrent - bCurrent;
      return (
        (a.periodType?.periodInMonths ?? 0) -
        (b.periodType?.periodInMonths ?? 0)
      );
    });
  }, [billingPeriodOptions, activeSubscription?.planPeriodId]);

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
  const { data: calculationData, isLoading: isCalculating } =
    useCalculateSubscriptionPrice(calculationDto, isCalculationEnabled);

  const apiCalculatedTotalAmount = calculationData?.item?.totalAmount ?? null;
  const customModulesTotalAmount = useMemo(() => {
    if (!isCustomPlanSelected) return null;
    if (!customSelectedModuleIds.length) return 0;
    const selectedIds = new Set(customSelectedModuleIds);
    const modulesUnitTotal = customPlanModules.reduce((acc, mod) => {
      if (!selectedIds.has(mod.id)) return acc;
      return acc + Number(mod.price ?? 0);
    }, 0);
    return modulesUnitTotal * seatCount;
  }, [
    isCustomPlanSelected,
    customSelectedModuleIds,
    customPlanModules,
    seatCount,
  ]);
  const totalAmount = isCustomPlanSelected
    ? customModulesTotalAmount
    : apiCalculatedTotalAmount;
  const currencySymbol = selectedPlan?.currency?.symbol ?? '$';
  const canSubmitCustomPlan =
    isCustomPlanSelected && customSelectedModuleIds.length > 0;

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
      (!resolvedTransactionType && !isCustomPlanSelected) ||
      isSeatDecreased
    )
      return;

    setIsSubmitting(true);
    const transactionTypeForStore = isScheduledDowngradeForPrepay
      ? TransactionType.PREPAY_SUBSCRIPTION
      : (resolvedTransactionType ??
        (isCustomPlanSelected ? TransactionType.PURCHASE_SUBSCRIPTION : null));
    setTransactionType(transactionTypeForStore);

    const customModuleIdsPayload = isCustomPlanSelected
      ? {
          modules: targetModuleIds,
        }
      : {};

    try {
      let response: any;
      if (!activeSubscription) {
        // If tenant already has a previous subscription (e.g. expired), renew it.
        if (latestSubscription?.id) {
          const renewPayload = {
            subscriptionId: latestSubscription.id,
            tenantId: DEFAULT_TENANT_ID,
            planId: selectedPlan.id,
            planPeriodId: selectedPlanPeriod.id,
            slotTotal: seatCount,
            ...customModuleIdsPayload,
          };

          response = await renewSubscriptionMutation.mutateAsync(renewPayload);
        } else {
          // Brand new tenant with no subscription history.
          const createPayload = {
            planId: selectedPlan.id,
            planPeriodId: selectedPlanPeriod.id,
            slotTotal: seatCount,
            tenantId: DEFAULT_TENANT_ID,
            currencyId: selectedPlan.currency?.id,
            subscriptionPrice: Number(totalAmount ?? 0),
            subscriptionStatus: 'pending' as any,
            isActive: false,
            ...customModuleIdsPayload,
          } as any;

          response =
            await createSubscriptionMutation.mutateAsync(createPayload);
        }
      } else {
        if (
          resolvedTransactionType === TransactionType.PURCHASE_SLOTS &&
          isSlotOnlyChange
        ) {
          const buySlotsPayload = {
            // subscriptionId: activeSubscription.id,
            tenantId: DEFAULT_TENANT_ID,
            newSlotsAmount: seatCount,
          };

          response =
            await buyAdditionalSlotsMutation.mutateAsync(buySlotsPayload);
        } else if (isScheduledDowngradeForPrepay) {
          const prepayPayload = {
            subscriptionId: activeSubscription.id,
            tenantId: DEFAULT_TENANT_ID,
            ...(isCustomPlanSelected ? {} : { planId: selectedPlan.id }),
            // ...(isCustomPlanSelected ? {} : { planPeriodId: selectedPlanPeriod.id }),
            planPeriodId: selectedPlanPeriod.id,
            slotTotal: seatCount,
            ...customModuleIdsPayload,
          };

          response =
            await prepaySubscriptionMutation.mutateAsync(prepayPayload);
        } else {
          const upgradePayload = {
            subscriptionId: activeSubscription.id,
            tenantId: DEFAULT_TENANT_ID,
            ...(isCustomPlanSelected ? {} : { planId: selectedPlan.id }),
            planPeriodId: selectedPlanPeriod.id,
            slots: seatCount,
            ...customModuleIdsPayload,
          };

          response =
            await upgradeSubscriptionMutation.mutateAsync(upgradePayload);
        }
      }

      const invoiceId = getInvoiceIdFromResponse(response);
      if (!invoiceId) {
        notification.error({
          message: 'Invoice Error',
          description:
            'Operation completed but invoice id could not be read from the response. Please check Network → the response body shape (invoice.id / invoices[0].id) or open Billing.',
        });
        return;
      }

      onClose();
      onContinueToInvoice?.(invoiceId);
    } catch (error) {
      notification.error({
        message: 'Operation Failed',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to process subscription update.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Width: fluid from viewport; max ~1100px on large screens.
  // Below lg: modal body is height-capped; only the plan cards scroll so seats / billing / total stay visible.
  return (
    <Modal
      title="Manage Subscription"
      open={open}
      onCancel={onClose}
      footer={null}
      width="min(92vw, calc(100vw - 32px), 1100px)"
      centered
      destroyOnClose
      className="manage-subscription-modal"
      data-cy="manage-subscription-modal"
      classNames={{
        body: [
          'manage-subscription-modal__body',
          // Narrow viewports: column flex + height cap so only the cards region scrolls inside the modal.
          'max-lg:!flex max-lg:!flex-col max-lg:!min-h-0',
          'max-lg:!max-h-[min(86dvh,calc(100dvh-5.5rem))] max-lg:!overflow-hidden max-lg:!pb-4',
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
          className="grid w-full min-w-0 max-lg:shrink-0 grid-cols-1 gap-4 md:grid-cols-3 md:items-center md:gap-6"
        >
          <div
            data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-div-580"
            className="md:justify-self-start flex w-full min-w-0 flex-wrap items-center gap-2 md:max-w-none"
          >
            <div
              data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-div-581"
              className="flex shrink-0 items-center gap-1"
            >
              <span
                data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-span-582"
                className="text-sm font-medium text-gray-700 whitespace-nowrap"
              >
                Number of Seats
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
              className="!w-[112px] max-w-[112px] shrink-0"
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
            className="flex min-w-0 w-full flex-col items-center text-center"
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
                  className="flex flex-wrap justify-center gap-2 font-medium"
                >
                  {displayedBillingPeriodOptions.map((pp) => {
                    const label = formatPeriodLabel(pp);
                    const isActive = selectedPeriodTypeId
                      ? pp.periodTypeId === selectedPeriodTypeId
                      : activeSubscription?.planPeriodId === pp.id;
                    return (
                      <Button
                        key={pp.id}
                        type={isActive ? 'primary' : 'default'}
                        onClick={(e) => {
                          e.stopPropagation();
                          periodManuallySelectedRef.current = true;
                          setSelectedPeriodTypeId(pp.periodTypeId);
                        }}
                        data-cy={`billing-period-${pp.periodType?.code ?? pp.id}`}
                        className="font-medium"
                      >
                        {label}
                      </Button>
                    );
                  })}
                </div>
                <p
                  data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-p-642"
                  className="text-xs text-gray-400 mt-1 max-w-md"
                >
                  {selectedPlanPeriod
                    ? `You will be billed ${formatPeriodLabel(selectedPlanPeriod)} for the plan you have chosen.`
                    : ''}
                </p>
              </>
            )}
          </div>
          <div
            data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-div-650"
            className="flex w-full min-w-0 flex-wrap items-center justify-end gap-2 md:justify-self-end md:max-w-none"
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
            <Input
              readOnly
              tabIndex={-1}
              value={
                !isCustomPlanSelected && isCalculating
                  ? ''
                  : totalAmount != null
                    ? Number(totalAmount).toLocaleString()
                    : '—'
              }
              className="w-full max-w-[160px] shrink-0 font-semibold text-base min-w-0 md:w-[160px]"
              addonAfter={
                <span
                  data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-span-674"
                  className="inline-flex min-w-[40px] items-center justify-center font-semibold text-base text-gray-700"
                >
                  {!isCustomPlanSelected && isCalculating ? (
                    <LoadingOutlined spin className="text-primary" />
                  ) : (
                    currencySymbol
                  )}
                </span>
              }
              data-cy="manage-subscription-total-amount"
            />
          </div>
        </div>

        {/* Plan cards — grouped by currency (filtered to active subscription plan currency when available) */}
        <div
          data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-div-688"
          className="scrollbar-none flex flex-col gap-8 max-lg:min-h-0 max-lg:flex-1 max-lg:overflow-y-auto max-lg:overscroll-y-contain"
        >
          {plansByCurrency.length === 0 ? (
            <p
              data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-p-690"
              className="text-sm text-gray-500 text-center py-6"
            >
              {activePlanCurrencyId
                ? 'No paid plans are available in your subscription currency.'
                : 'No paid plans available.'}
            </p>
          ) : null}
          {plansByCurrency.map(
            ({ currencyId, plans: groupPlans }, groupIndex) => (
              <div
                key={currencyId}
                className="grid w-full min-w-0 gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr))]"
                data-cy={`manage-subscription-plans-currency-${currencyId}`}
              >
                {groupPlans.map((plan) => {
                  const badge = getPlanBadge(plan);
                  const isCurrentPlan = plan.id === currentPlanId;
                  const isCurrentBillingType =
                    !!effectiveSelectedPeriodTypeId &&
                    !!currentPeriodTypeId &&
                    effectiveSelectedPeriodTypeId === currentPeriodTypeId;
                  const isSelected =
                    !isCustomPlanSelected &&
                    (planManuallySelectedRef.current
                      ? selectedPlanId === plan.id
                      : effectiveSelectedPlanId === plan.id &&
                        (!isCurrentPlan || isCurrentBillingType));
                  const includedModuleIds = new Set(
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
                        setIsCustomPlanSelected(false);
                        planManuallySelectedRef.current = true;
                        setSelectedPlanId(plan.id);
                      }}
                      className={`relative border rounded-lg bg-gradient-to-b from-white to-[#E8F5FF] p-4 cursor-pointer shadow-[0_8px_24px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-200 hover:shadow-[0_16px_40px_rgba(0,0,0,0.16),0_4px_12px_rgba(0,0,0,0.08)] ${
                        isSelected
                          ? 'border-primary shadow-[0_16px_48px_rgba(30,64,175,0.22),0_8px_24px_rgba(0,0,0,0.12)] ring-2 ring-primary/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {badge && (
                        <Tag
                          bordered
                          className="absolute top-3 right-3 z-[1] m-0 border-gray-200 bg-white text-xs font-medium text-gray-700"
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
                        <Radio checked={isSelected} />
                      </div>
                      {/* Centered plan title, price, description */}
                      <div
                        data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-div-749"
                        className=" px-1 pt-2 text-center"
                      >
                        <div
                          data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-div-750"
                          className="font-bold text-gray-900"
                        >
                          {plan.name}
                        </div>
                        <div
                          data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-div-751"
                          className=" text-gray-900 font-bold text-lg"
                        >
                          {getPriceLabel(plan)}
                        </div>
                        {plan.description && (
                          <div
                            data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-div-755"
                            className="text-xs text-gray-500"
                          >
                            {plan.description}
                          </div>
                        )}
                      </div>
                      <div
                        data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-div-760"
                        className="flex justify-center px-2"
                      >
                        <Divider className="!my-2 min-w-[96px] w-[65%] max-w-[200px] border-gray-200" />
                      </div>
                      <div
                        data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-div-763"
                        className="mt-3 flex flex-col items-center gap-1"
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
                                className="flex w-full max-w-full items-center justify-start gap-2 text-sm"
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
                                    included ? 'text-gray-700' : 'text-gray-400'
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
                              className="flex w-full max-w-full items-center justify-start gap-2 text-sm"
                            >
                              <IoCheckbox
                                className="size-[18px] shrink-0 text-primary"
                                aria-hidden
                              />
                              <span
                                data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-span-804"
                                className="text-gray-700"
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
                {groupIndex === 0 ? (
                  <div
                    data-cy="plan-card-custom"
                    onClick={() => {
                      planManuallySelectedRef.current = true;
                      setIsCustomPlanSelected(true);
                    }}
                    className={`relative border rounded-lg bg-gradient-to-b from-white to-[#E8F5FF] p-4 cursor-pointer shadow-[0_8px_24px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-200 hover:shadow-[0_16px_40px_rgba(0,0,0,0.16),0_4px_12px_rgba(0,0,0,0.08)] ${
                      isCustomPlanSelected
                        ? 'border-primary shadow-[0_16px_48px_rgba(30,64,175,0.22),0_8px_24px_rgba(0,0,0,0.12)] ring-2 ring-primary/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      data-cy="plan-card-custom-radio"
                      className="relative flex min-h-[28px] items-center"
                    >
                      <Radio checked={isCustomPlanSelected} />
                    </div>
                    <div
                      data-cy="plan-card-custom-title"
                      className=" px-1 pt-2 text-center"
                    >
                      <div
                        data-cy="plan-card-custom-title-text"
                        className="font-bold text-gray-900"
                      >
                        Custom
                      </div>
                      <div
                        data-cy="plan-card-custom-title-price"
                        className=" text-gray-900 font-bold text-lg"
                      >
                        $1 / User / Month
                      </div>
                      <div
                        data-cy="plan-card-custom-title-description"
                        className="text-xs text-gray-500"
                      >
                        Customize your experience
                      </div>
                    </div>
                    <div
                      data-cy="plan-card-custom-divider"
                      className="flex justify-center px-2"
                    >
                      <Divider className="!my-2 min-w-[96px] w-[65%] max-w-[200px] border-gray-200" />
                    </div>
                    <div
                      data-cy="plan-card-custom-modules"
                      className="mt-3 flex flex-col items-center gap-1"
                    >
                      {customPlanModules.length > 0 ? (
                        customPlanModules.map((mod) => (
                          <div
                            key={mod.id}
                            className="flex w-full max-w-full items-center justify-start gap-2 text-sm"
                            onClick={(e) => e.stopPropagation()}
                            data-cy={`plan-card-custom-module-${mod.id}`}
                          >
                            <Checkbox
                              disabled={mod.isCoreModule}
                              checked={
                                mod.isCoreModule ||
                                customSelectedModuleIds.includes(mod.id)
                              }
                              onChange={(e) => {
                                if (mod.isCoreModule) return;
                                const checked = e.target.checked;
                                setCustomSelectedModuleIds((prev) =>
                                  checked
                                    ? prev.includes(mod.id)
                                      ? prev
                                      : [...prev, mod.id]
                                    : prev.filter((id) => id !== mod.id),
                                );
                              }}
                            />
                            <span
                              data-cy={`plan-card-custom-module-${mod.id}-label`}
                              className="text-gray-700"
                            >
                              {mod.label}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span
                          data-cy="plan-card-custom-modules-empty"
                          className="text-xs text-gray-400"
                        >
                          No modules available.
                        </span>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            ),
          )}
        </div>

        {/* Footer */}
        <div
          data-cy="admin-components-managesubscriptionmodal-managesubscriptionmodal-tsx-managesubscriptionmodal-div-817"
          className="flex justify-end gap-3 max-lg:shrink-0 max-lg:border-t max-lg:border-gray-100 max-lg:pt-3 lg:pt-0 lg:border-t-0"
        >
          <Button
            onClick={onClose}
            data-cy="manage-subscription-cancel"
            className="!font-normal !text-[#000000]/[0.7]"
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
                  (!canSubmitCustomPlan && !calculationDto) ||
                  isSeatDecreased ||
                  (!isCustomPlanSelected && isCalculating) ||
                  isSubmitting
                }
                data-cy="manage-subscription-continue"
                className="!font-normal"
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
