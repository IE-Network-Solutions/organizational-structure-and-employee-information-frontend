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
} from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { useRouter } from 'next/navigation';
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
import { useCalculateSubscriptionPrice } from '@/store/server/features/tenant-management/manage-subscriptions/queries';
import {
  useCreateSubscription,
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

export const ManageSubscriptionModal: React.FC<
  ManageSubscriptionModalProps
> = ({ open, onClose, onContinueToInvoice }) => {
  const router = useRouter();
  const { setTransactionType } = usePaymentStore();
  /** Select active plan once per modal open (after data is ready). */
  const defaultSelectionAppliedRef = useRef(false);
  const periodManuallySelectedRef = useRef(false);
  const planManuallySelectedRef = useRef(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activeSubscription, setActiveSubscription] =
    useState<Subscription | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [seatCount, setSeatCount] = useState<number>(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  /** Which billing period (by period type id) is selected — must exist on the selected plan's `periods`. */
  const [selectedPeriodTypeId, setSelectedPeriodTypeId] = useState<
    string | null
  >(null);

  const { data: plansData } = useGetPlans({ filter: {} }, true, true, 'ASC');
  const { data: subscriptionsData } = useGetSubscriptions(
    { filter: { tenantId: [DEFAULT_TENANT_ID] } },
    true,
    true,
  );
  const { data: modulesData, isLoading: modulesLoading } = useGetModules(
    { filter: { isActive: true } },
    true,
    open,
  );
  const createSubscriptionMutation = useCreateSubscription();
  const upgradeSubscriptionMutation = useUpgradeSubscription();

  const allModulesSorted = useMemo(() => {
    const items = modulesData?.items;
    if (!Array.isArray(items)) return [];
    return [...items].sort(
      (a: Module, b: Module) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
    );
  }, [modulesData]);

  useEffect(() => {
    if (plansData?.items) {
      const paidPlans = plansData.items.filter((p: Plan) => !p.isFree);
      setPlans(paidPlans);
    }
  }, [plansData]);

  useEffect(() => {
    if (subscriptionsData?.items) {
      const active = subscriptionsData.items.find(
        (s: Subscription) => s.isActive === true,
      );
      setActiveSubscription(active ?? null);
      if (active?.slotTotal) setSeatCount(active.slotTotal);
    }
  }, [subscriptionsData]);

  /** Currency of the tenant's active subscription plan (only show paid plans in this currency). */
  const activePlanCurrencyId =
    activeSubscription?.plan?.currencyId ??
    activeSubscription?.currencyId ??
    null;

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

  const currentSlotTotal = activeSubscription?.slotTotal ?? 0;
  const isSeatDecreased = !!activeSubscription && seatCount < currentSlotTotal;
  const isSeatIncreased = !!activeSubscription && seatCount > currentSlotTotal;
  const isPlanChanged =
    !!activeSubscription && !!selectedPlan && selectedPlan.id !== activeSubscription.planId;
  const isPeriodChanged =
    !!activeSubscription &&
    !!selectedPlanPeriod &&
    selectedPlanPeriod.id !== activeSubscription.planPeriodId;

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
      return (a.periodType?.periodInMonths ?? 0) - (b.periodType?.periodInMonths ?? 0);
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
      transactionType: resolvedTransactionType,
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
    currentSlotTotal,
    activeSubscription,
  ]);

  const isCalculationEnabled =
    open && !!calculationDto?.planId && !!calculationDto?.planPeriodId;
  const { data: calculationData, isLoading: isCalculating } =
    useCalculateSubscriptionPrice(calculationDto, isCalculationEnabled);

  const totalAmount = calculationData?.item?.totalAmount ?? null;
  const currencySymbol = selectedPlan?.currency?.symbol ?? '$';

  const getInvoiceIdFromResponse = (payload: any): string | null => {
    return (
      payload?.invoices?.[0]?.id ??
      payload?.data?.invoices?.[0]?.id ??
      payload?.item?.invoices?.[0]?.id ??
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
    setTransactionType(resolvedTransactionType);
    try {
      let response: any;
      if (!activeSubscription) {
        response = await createSubscriptionMutation.mutateAsync({
          planId: selectedPlan.id,
          planPeriodId: selectedPlanPeriod.id,
          slotTotal: seatCount,
          tenantId: DEFAULT_TENANT_ID,
          currencyId: selectedPlan.currency?.id,
          subscriptionPrice: Number(totalAmount ?? 0),
          subscriptionStatus: 'pending' as any,
          isActive: false,
        } as any);
      } else {
        response = await upgradeSubscriptionMutation.mutateAsync({
          subscriptionId: activeSubscription.id,
          planId: selectedPlan.id,
          planPeriodId: selectedPlanPeriod.id,
          slots: seatCount,
        });
      }

      const invoiceId = getInvoiceIdFromResponse(response);
      if (!invoiceId) {
        notification.error({
          message: 'Invoice Error',
          description:
            'Subscription updated but invoice was not returned. Please refresh and open Billing.',
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
  // Height: not full-viewport by default — body scrolls so the shell stays a comfortable size.
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
    >
      <div className="flex flex-col gap-6 w-full min-w-0">
        {/* Top controls — equal 3 columns on md+; billing centered in the middle */}
        <div className="grid w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-3 md:items-center md:gap-6">
          <div className="md:justify-self-start flex w-full min-w-0 flex-wrap items-center gap-2 md:max-w-none">
            <div className="flex shrink-0 items-center gap-1">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
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
              min={activeSubscription?.slotTotal ?? 1}
              value={seatCount}
              onChange={(v) => setSeatCount(v ?? 1)}
              className="!w-[112px] max-w-[112px] shrink-0"
              controls={false}
              data-cy="manage-subscription-seats"
            />
            {isSeatDecreased ? (
              <p className="w-full text-xs text-red-500">
                Seats cannot be decreased in this flow.
              </p>
            ) : null}
          </div>
          <div className="flex min-w-0 w-full flex-col items-center text-center">
            <div className="text-sm font-medium mb-1 w-full">Billing</div>
            {billingPeriodOptions.length === 0 ? (
              <p className="text-xs text-gray-500">
                No billing periods returned for this plan.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap justify-center gap-2 font-medium">
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
                <p className="text-xs text-gray-400 mt-1 max-w-md">
                  {selectedPlanPeriod
                    ? `You will be billed ${formatPeriodLabel(selectedPlanPeriod)} for the plan you have chosen.`
                    : ''}
                </p>
              </>
            )}
          </div>
          <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-2 md:justify-self-end md:max-w-none">
            <div className="flex shrink-0 items-center gap-1">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
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
                isCalculating
                  ? ''
                  : totalAmount != null
                    ? Number(totalAmount).toLocaleString()
                    : '—'
              }
              className="w-full max-w-[160px] shrink-0 font-semibold text-base min-w-0 md:w-[160px]"
              addonAfter={
                <span className="inline-flex min-w-[40px] items-center justify-center font-semibold text-base text-gray-700">
                  {isCalculating ? (
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
        <div className="flex flex-col gap-8">
          {plansByCurrency.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">
              {activePlanCurrencyId
                ? 'No paid plans are available in your subscription currency.'
                : 'No paid plans available.'}
            </p>
          ) : null}
          {plansByCurrency.map(({ currencyId, plans: groupPlans }) => (
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
                const isSelected = planManuallySelectedRef.current
                  ? selectedPlanId === plan.id
                  : effectiveSelectedPlanId === plan.id &&
                    (!isCurrentPlan || isCurrentBillingType);
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
                    <div className="relative flex min-h-[28px] items-center">
                      <Radio checked={isSelected} />
                    </div>
                    {/* Centered plan title, price, description */}
                    <div className=" px-1 pt-2 text-center">
                      <div className="font-bold text-gray-900">{plan.name}</div>
                      <div className=" text-gray-900 font-bold text-lg">
                        {getPriceLabel(plan)}
                      </div>
                      {plan.description && (
                        <div className="text-xs text-gray-500">
                          {plan.description}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-center px-2">
                      <Divider className="!my-2 min-w-[96px] w-[65%] max-w-[200px] border-gray-200" />
                    </div>
                    <div className="mt-3 flex flex-col items-center gap-1">
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
                              key={mod.id}
                              className="flex w-full max-w-full items-center justify-start gap-2 text-sm"
                            >
                              <IoCheckbox
                                className={`size-[18px] shrink-0 ${included ? 'text-[#69B1FF]' : 'text-gray-400'}`}
                                aria-hidden
                              />
                              <span
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
                            key={`${plan.id}-detail-${i}`}
                            className="flex w-full max-w-full items-center justify-start gap-2 text-sm"
                          >
                            <IoCheckbox
                              className="size-[18px] shrink-0 text-primary"
                              aria-hidden
                            />
                            <span className="text-gray-700">{detail}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 ">
          <Button onClick={onClose} data-cy="manage-subscription-cancel">
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleContinue}
            loading={isSubmitting}
            disabled={
              !calculationDto || isSeatDecreased || isCalculating || isSubmitting
            }
            data-cy="manage-subscription-continue"
          >
            Continue
          </Button>
        </div>
      </div>
    </Modal>
  );
};
