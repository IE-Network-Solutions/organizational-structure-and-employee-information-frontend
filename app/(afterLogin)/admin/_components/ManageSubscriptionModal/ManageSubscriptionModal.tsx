'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, InputNumber, Radio, Checkbox, Tooltip } from 'antd';
import { InfoCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { Plan, PlanPeriod, Subscription } from '@/types/tenant-management';
import { useGetPlans } from '@/store/server/features/tenant-management/plans/queries';
import { useGetSubscriptions } from '@/store/server/features/tenant-management/subscriptions/queries';
import { useCalculateSubscriptionPrice } from '@/store/server/features/tenant-management/manage-subscriptions/queries';
import type { CalculateSubscriptionPriceDto } from '@/store/server/features/tenant-management/manage-subscriptions/interface';
import { DEFAULT_TENANT_ID } from '@/utils/constants';
import { usePaymentStore } from '@/store/uistate/features/tenant-managment/useState';

interface ManageSubscriptionModalProps {
  open: boolean;
  onClose: () => void;
}

type BillingCycle = 'annually' | 'monthly';

const PLAN_BADGE_CURRENT = 'Current';
const PLAN_BADGE_POPULAR = 'Popular';

export const ManageSubscriptionModal: React.FC<ManageSubscriptionModalProps> = ({
  open,
  onClose,
}) => {
  const router = useRouter();
  const { setTransactionType } = usePaymentStore();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activeSubscription, setActiveSubscription] =
    useState<Subscription | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [seatCount, setSeatCount] = useState<number>(10);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  const { data: plansData } = useGetPlans({ filter: {} }, true, true, 'ASC');
  const { data: subscriptionsData } = useGetSubscriptions(
    { filter: { tenantId: [DEFAULT_TENANT_ID] } },
    true,
    true
  );

  useEffect(() => {
    if (plansData?.items) {
      const paidPlans = plansData.items.filter((p: Plan) => !p.isFree);
      setPlans(paidPlans);
      if (paidPlans.length && !selectedPlanId) {
        setSelectedPlanId(paidPlans[0].id);
      }
    }
  }, [plansData]);

  useEffect(() => {
    if (subscriptionsData?.items) {
      const active = subscriptionsData.items.find(
        (s: Subscription) => s.isActive === true
      );
      setActiveSubscription(active ?? null);
      if (active?.slotTotal) setSeatCount(active.slotTotal);
    }
  }, [subscriptionsData]);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);
  const currentPlanId = activeSubscription?.planId;

  /** Resolve plan period that matches the selected billing cycle (monthly vs annually). */
  const getPlanPeriodForBillingCycle = (
    plan: Plan,
    cycle: BillingCycle
  ): PlanPeriod | undefined => {
    const periods = plan.periods ?? [];
    if (!periods.length) return undefined;
    const isAnnual = cycle === 'annually';
    const match = periods.find((pp) => {
      const code = pp.periodType?.code?.toLowerCase() ?? '';
      const months = pp.periodType?.periodInMonths ?? 0;
      if (isAnnual) return months >= 12 || code.includes('year');
      return months <= 1 || code.includes('month');
    });
    return match ?? periods[0];
  };

  const getPlanBadge = (plan: Plan) => {
    if (plan.id === currentPlanId) return PLAN_BADGE_CURRENT;
    const index = plans.findIndex((p) => p.id === plan.id);
    if (index === 1 && plans.length >= 2) return PLAN_BADGE_POPULAR;
    return null;
  };

  const getPriceLabel = (plan: Plan) => {
    const currency = plan.currency?.symbol ?? '$';
    const period = getPlanPeriodForBillingCycle(plan, billingCycle);
    const price =
      period?.periodSlotPrice ?? plan.slotPrice ?? Number(plan.slotPrice) ?? 0;
    const periodLabel =
      period?.periodType?.periodInMonths === 12 ||
      period?.periodType?.code?.toLowerCase()?.includes('year')
        ? 'Year'
        : 'Month';
    return `${currency}${Number(price).toFixed(0)} / User / ${periodLabel}`;
  };

  const selectedPlanPeriod = selectedPlan
    ? getPlanPeriodForBillingCycle(selectedPlan, billingCycle)
    : undefined;

  const calculationDto: CalculateSubscriptionPriceDto | null = useMemo(() => {
    if (
      !selectedPlanId ||
      !selectedPlan ||
      !selectedPlanPeriod ||
      seatCount < 1
    )
      return null;
    return {
      planId: selectedPlan.id,
      planPeriodId: selectedPlanPeriod.id,
      slotTotal: seatCount,
      transactionType: 'purchase_subscription',
      ...(activeSubscription ? { subscriptionId: activeSubscription.id } : {}),
    };
  }, [
    selectedPlanId,
    selectedPlan,
    selectedPlanPeriod,
    seatCount,
    activeSubscription,
  ]);

  const isCalculationEnabled =
    open && !!calculationDto?.planId && !!calculationDto?.planPeriodId;
  const { data: calculationData, isLoading: isCalculating } =
    useCalculateSubscriptionPrice(calculationDto, isCalculationEnabled);

  const totalAmount = calculationData?.item?.totalAmount ?? null;
  const currencySymbol = selectedPlan?.currency?.symbol ?? '$';

  const handleContinue = () => {
    if (!selectedPlanId) return;
    setTransactionType('purchase_subscription');
    onClose();
    const periodTypeCode =
      selectedPlanPeriod?.periodType?.code ??
      (billingCycle === 'annually' ? 'year' : 'month');
    router.push(
      `/admin/plan?planId=${selectedPlanId}&periodTypeCode=${encodeURIComponent(periodTypeCode)}`
    );
  };

  return (
    <Modal
      title="Manage Subscription"
      open={open}
      onCancel={onClose}
      footer={null}
      width={920}
      centered
      destroyOnClose
      className="manage-subscription-modal"
      data-cy="manage-subscription-modal"
    >
      <div className="flex flex-col gap-6">
        {/* Top controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-1 mb-2">
              <span className="text-sm font-medium text-gray-700">
                Number of Seats
              </span>
              <Tooltip title="Total number of user seats for this subscription">
                <InfoCircleOutlined className="text-gray-400" />
              </Tooltip>
            </div>
            <InputNumber
              min={1}
              value={seatCount}
              onChange={(v) => setSeatCount(v ?? 1)}
              className="w-full"
              data-cy="manage-subscription-seats"
            />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">
              Billing
            </div>
            <div className="flex gap-2">
              <Button
                type={billingCycle === 'annually' ? 'primary' : 'default'}
                onClick={() => setBillingCycle('annually')}
                data-cy="billing-annually"
              >
                Annually
              </Button>
              <Button
                type={billingCycle === 'monthly' ? 'primary' : 'default'}
                onClick={() => setBillingCycle('monthly')}
                data-cy="billing-monthly"
              >
                Monthly
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              You will be billed {billingCycle} for the plan you have chosen.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-2">
              <span className="text-sm font-medium text-gray-700">
                Total Amount
              </span>
              <Tooltip title="Based on selected plan, seats, and billing cycle">
                <InfoCircleOutlined className="text-gray-400" />
              </Tooltip>
            </div>
            <div className="flex items-center gap-1 text-lg font-semibold text-gray-900">
              {isCalculating ? (
                <LoadingOutlined spin className="text-primary" />
              ) : totalAmount != null ? (
                <>
                  {currencySymbol}
                  {Number(totalAmount).toLocaleString()}
                </>
              ) : (
                `${currencySymbol} —`
              )}
            </div>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => {
            const badge = getPlanBadge(plan);
            const isSelected = selectedPlanId === plan.id;
            return (
              <div
                key={plan.id}
                data-cy={`plan-card-${plan.id}`}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {badge && (
                  <span
                    className={`absolute top-3 right-3 text-xs font-medium px-2 py-0.5 rounded ${
                      badge === PLAN_BADGE_CURRENT
                        ? 'bg-primary/10 text-primary'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {badge}
                  </span>
                )}
                <div className="flex items-start gap-3 mb-3">
                  <Radio checked={isSelected} />
                  <div>
                    <div className="font-bold text-gray-900">{plan.name}</div>
                    <div className="text-sm text-gray-600 mt-0.5">
                      {getPriceLabel(plan)}
                    </div>
                    {plan.description && (
                      <div className="text-xs text-gray-500 mt-1">
                        {plan.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  {plan.planDetails?.map((detail, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Checkbox checked disabled />
                      <span className="text-gray-700">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button onClick={onClose} data-cy="manage-subscription-cancel">
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleContinue}
            data-cy="manage-subscription-continue"
          >
            Continue
          </Button>
        </div>
      </div>
    </Modal>
  );
};
