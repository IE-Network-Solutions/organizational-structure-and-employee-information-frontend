'use client';

import CustomBreadcrumb from '@/components/common/breadCramp';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, InputNumber, Select, Skeleton } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { Plan, PeriodType, PlanPeriod, Currency, Subscription } from '@/types/tenant-management';
import { useGetSubscriptions } from '@/store/server/features/tenant-management/subscriptions/queries';
import { useGetPlans } from '@/store/server/features/tenant-management/plans/queries';
import { useGetPeriodTypes } from '@/store/server/features/tenant-management/period-types/queries';
import { DEFAULT_TENANT_ID } from '@/utils/constants';

const PlanPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStep = parseInt(searchParams.get('step') || '0');
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [updatedQuota, setUpdatedQuota] = useState<number | null>(null);
  const [updatedPeriod, setUpdatedPeriod] = useState<string | null>(null);
  const [selectedPeriodType, setSelectedPeriodType] = useState<PeriodType | null>(null);
  const [availablePeriods, setAvailablePeriods] = useState<PeriodType[]>([]);
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'chapa' | 'stripe' | null>(null);

  // State for API data
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null);
  const [periodTypes, setPeriodTypes] = useState<PeriodType[]>([]);
  const [currentPeriodType, setCurrentPeriodType] = useState<PeriodType | null>(null);
  
  // Fetch subscriptions
  const { data: subscriptionsData, isLoading: isSubscriptionsLoading } = useGetSubscriptions(
    { filter: { tenantId: [DEFAULT_TENANT_ID] } },
    true,
    true
  );

  // Fetch plans
  const { data: plansData, isLoading: isPlansLoading } = useGetPlans(
    { filter: {} },
    true,
    true,
    'ASC'
  );

  // Fetch period types
  const { data: periodTypesData, isLoading: isPeriodTypesLoading } = useGetPeriodTypes(
    { filter: {} },
    true,
    true
  );

  // Initial setup based on URL parameters
  useEffect(() => {
    // If directly going to subscription period step, ensure we have a plan
    if (initialStep === 1 && plans.length > 0 && !currentPlan) {
      // Check if planId is in URL
      const planId = searchParams.get('planId');
      if (planId) {
        const plan = plans.find(p => p.id === planId);
        if (plan) {
          setCurrentPlan(plan);
          console.log("Setting plan from URL params on direct navigation:", plan.name);
        } else {
          // If plan not found, use first available plan
          setCurrentPlan(plans[0]);
          console.log("Plan ID not found, using first plan:", plans[0].name);
        }
      } else if (activeSubscription) {
        // If no planId but we have active subscription, use its plan
        const plan = plans.find(p => p.id === activeSubscription.planId);
        if (plan) {
          setCurrentPlan(plan);
          console.log("Using plan from active subscription on direct navigation:", plan.name);
        }
      } else {
        // Default to first plan
        setCurrentPlan(plans[0]);
        console.log("No plan info in URL or subscription, using first plan:", plans[0].name);
      }
    }
  }, [initialStep, plans, currentPlan, searchParams, activeSubscription]);

  // Process subscription data
  useEffect(() => {
    if (subscriptionsData?.items && subscriptionsData.items.length > 0) {
      setSubscriptions(subscriptionsData.items);
      
      // Find active subscription
      const active = subscriptionsData.items.find(sub => sub.isActive === true);
      if (active) {
        setActiveSubscription(active);
        
        // Initialize updatedQuota with current quota from active subscription
        if (!updatedQuota && active.slotTotal) {
          setUpdatedQuota(active.slotTotal);
        }
      }
    }
  }, [subscriptionsData, updatedQuota]);

  // Process plans data
  useEffect(() => {
    if (plansData?.items && plansData.items.length > 0) {
      setPlans(plansData.items);
      
      // If we have an active subscription, find its plan
      if (activeSubscription) {
        const plan = plansData.items.find(p => p.id === activeSubscription.planId);
        if (plan) {
          setCurrentPlan(plan);
          console.log("Setting current plan from active subscription:", plan.name);
        }
      } else if (searchParams.get('planId')) {
        // If no active subscription but planId is in URL params, use that plan
        const planId = searchParams.get('planId');
        const plan = plansData.items.find(p => p.id === planId);
        if (plan) {
          setCurrentPlan(plan);
          console.log("Setting current plan from URL parameter:", plan.name);
        }
      } else if (plansData.items.length > 0 && !currentPlan) {
        // If no active subscription and no planId in URL, use the first available plan
        setCurrentPlan(plansData.items[0]);
        console.log("Setting current plan to first available plan:", plansData.items[0].name);
      }
    }
  }, [plansData, activeSubscription, searchParams, currentPlan]);

  // Process period types data
  useEffect(() => {
    if (periodTypesData?.items && periodTypesData.items.length > 0) {
      setPeriodTypes(periodTypesData.items);
    }
  }, [periodTypesData]);

  // Set available periods based on current plan
  useEffect(() => {
    // For the case when we have a current plan with periods and period types are loaded
    if (currentPlan && currentPlan.periods && periodTypes.length > 0) {
      // Extract period types from plan periods
      const planPeriodTypes: PeriodType[] = [];
      
      // For each plan period, find the corresponding period type
      currentPlan.periods.forEach(planPeriod => {
        const periodType = periodTypes.find(pt => pt.id === planPeriod.periodTypeId);
        if (periodType) {
          planPeriodTypes.push(periodType);
        }
      });
      
      setAvailablePeriods(planPeriodTypes);
      
      // Set current period type from the active subscription
      if (activeSubscription && activeSubscription.planPeriodId) {
        // Find the plan period in the current plan that matches the active subscription's planPeriodId
        const currentPlanPeriod = currentPlan.periods.find(
          period => period.id === activeSubscription.planPeriodId
        );
        
        if (currentPlanPeriod) {
          // Find the period type using the periodTypeId from the found plan period
          const currentPT = periodTypes.find(pt => pt.id === currentPlanPeriod.periodTypeId);
          if (currentPT) {
            setCurrentPeriodType(currentPT);
            if (!updatedPeriod) {
              setUpdatedPeriod(currentPT.code);
            }
          }
        }
      } else if (planPeriodTypes.length > 0) {
        // If no active subscription or no planPeriodId, set default period from plan
        const defaultPeriod = planPeriodTypes[0];
        setCurrentPeriodType(defaultPeriod);
        if (!updatedPeriod) {
          setUpdatedPeriod(defaultPeriod.code);
        }
      }
    } else if (periodTypes.length > 0) {
      // If no current plan (first subscription), show all possible periods
      setAvailablePeriods(periodTypes);
      
      // Set default period (first in the list)
      if (!currentPeriodType) {
        const defaultPeriod = periodTypes[0];
        setCurrentPeriodType(defaultPeriod);
        if (!updatedPeriod) {
          setUpdatedPeriod(defaultPeriod.code);
        }
      }
    }
  }, [currentPlan, periodTypes, activeSubscription, updatedPeriod, currentPeriodType]);

  // Убедимся, что выбранный период отображается правильно на шаге подтверждения
  useEffect(() => {
    if (updatedPeriod) {
      const period = periodTypes.find(p => p.code === updatedPeriod);
      if (period) {
        setSelectedPeriodType(period);
      }
    }
  }, [updatedPeriod, periodTypes]);

  const handleNextStep = () => {
    // Если мы переходим к шагу подтверждения, убедимся, что у нас есть план
    if (currentStep === 1 && !currentPlan && plans.length > 0) {
      setCurrentPlan(plans[0]);
      console.log("Setting current plan before confirmation step:", plans[0].name);
    }
    setCurrentStep((prev) => prev + 1);
  };
  
  const handlePreviousStep = () => setCurrentStep((prev) => prev - 1);
  const handleQuotaChange = (value: number | null) => {
    if (value !== null && activeSubscription?.slotTotal && value < activeSubscription.slotTotal) {
      setQuotaError('Your quota is below total number of user quota');
    } else {
      setQuotaError(null);
    }
    setUpdatedQuota(value);
  };
  
  const handlePeriodChange = (value: string) => {
    setUpdatedPeriod(value);
    const period = periodTypes.find(p => p.code === value);
    if (period) {
      setSelectedPeriodType(period);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate total amount based on selected options
  const calculateTotalAmount = () => {
    if (!currentPlan || !updatedQuota) return 0;
    
    let effectiveSlotPrice;
    let periodMultiplier = 1;
    
    // Get current plan period
    const planPeriod = currentPlan.periods?.find(pp => pp.periodTypeId === selectedPeriodType?.id);
    
    // Get period multiplier from selected period type
    if (selectedPeriodType) {
      periodMultiplier = selectedPeriodType.periodInMonths || 1;
    }
    
    // Determine effective slot price according to subscription-management-scenarios.md
    if (planPeriod?.periodSlotPrice !== null && planPeriod?.periodSlotPrice !== undefined) {
      // Use period-specific price if defined
      if (planPeriod.periodSlotDiscountPrice !== null && planPeriod.periodSlotDiscountPrice !== undefined) {
        effectiveSlotPrice = planPeriod.periodSlotDiscountPrice;
      } else if (planPeriod.discountPercentage !== null && planPeriod.discountPercentage !== undefined) {
        effectiveSlotPrice = planPeriod.periodSlotPrice * (1 - planPeriod.discountPercentage / 100);
      } else {
        effectiveSlotPrice = planPeriod.periodSlotPrice;
      }
    } else {
      // Fall back to plan-level pricing
      if (currentPlan.slotDiscountPrice !== null && currentPlan.slotDiscountPrice !== undefined) {
        effectiveSlotPrice = currentPlan.slotDiscountPrice;
      } else {
        effectiveSlotPrice = currentPlan.slotPrice;
      }
      
      // Apply period discount if defined
      if (planPeriod?.discountPercentage !== null && planPeriod?.discountPercentage !== undefined) {
        effectiveSlotPrice = effectiveSlotPrice * (1 - planPeriod.discountPercentage / 100);
      }
    }
    
    // Calculate total price
    const totalPrice = effectiveSlotPrice * updatedQuota * periodMultiplier;
    
    return totalPrice;
  };

  const totalAmount = calculateTotalAmount();
  const isLoading = isSubscriptionsLoading || isPlansLoading || isPeriodTypesLoading;

  // Функция для расчета даты окончания периода
  const calculateEndDate = () => {
    const startDate = new Date();
    if (!selectedPeriodType) return startDate;
    
    const periodInMonths = selectedPeriodType.periodInMonths || 1;
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + periodInMonths);
    
    return endDate;
  };

  // Helper function to extract the effective slot price for debugging
  const calculateEffectiveSlotPrice = () => {
    if (!currentPlan) return 0;
    
    // Get current plan period
    const planPeriod = currentPlan.periods?.find(pp => pp.periodTypeId === selectedPeriodType?.id);
    
    // Determine effective slot price using the same logic as in calculateTotalAmount
    if (planPeriod?.periodSlotPrice !== null && planPeriod?.periodSlotPrice !== undefined) {
      // Use period-specific price if defined
      if (planPeriod.periodSlotDiscountPrice !== null && planPeriod.periodSlotDiscountPrice !== undefined) {
        return planPeriod.periodSlotDiscountPrice;
      } else if (planPeriod.discountPercentage !== null && planPeriod.discountPercentage !== undefined) {
        return planPeriod.periodSlotPrice * (1 - planPeriod.discountPercentage / 100);
      } else {
        return planPeriod.periodSlotPrice;
      }
    } else {
      // Fall back to plan-level pricing
      if (currentPlan.slotDiscountPrice !== null && currentPlan.slotDiscountPrice !== undefined) {
        let price = currentPlan.slotDiscountPrice;
        // Apply period discount if defined
        if (planPeriod?.discountPercentage !== null && planPeriod?.discountPercentage !== undefined) {
          price = price * (1 - planPeriod.discountPercentage / 100);
        }
        return price;
      } else {
        let price = currentPlan.slotPrice;
        // Apply period discount if defined
        if (planPeriod?.discountPercentage !== null && planPeriod?.discountPercentage !== undefined) {
          price = price * (1 - planPeriod.discountPercentage / 100);
        }
        return price;
      }
    }
  };

  // Handle payment method selection
  const handlePaymentMethodSelect = (method: 'chapa' | 'stripe') => {
    if (selectedPaymentMethod === method) {
      setSelectedPaymentMethod(null);
    } else {
      setSelectedPaymentMethod(method);
    }
  };

  // Handle payment
  const handlePayment = () => {
    console.log(`Selected payment method: ${selectedPaymentMethod}`);
    // Additional payment logic would go here
  };

  const renderStepContent = () => {
    const steps = [
      { title: 'Number of User Quota' },
      { title: 'Subscription Period' },
      { title: 'Confirmation' },
      { title: 'Payment Method' },
    ];

    const renderHeader = () => (
      <div className="w-full mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 w-full text-center ${
                index === currentStep
                  ? 'text-black'
                  : 'text-gray-400 opacity-50'
              }`}
            >
              <span
                className={`text-lg font-bold ${
                  index === currentStep ? 'text-primary' : 'text-gray-400'
                }`}
              >
                {index + 1}
              </span>
              <span className="text-lg font-bold whitespace-nowrap">
                {step.title}
              </span>
            </div>
          ))}
        </div>
        <div className="w-full h-[10px] bg-gray-200 rounded-full mt-4">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${(currentStep + 1) * 25}%` }}
          ></div>
        </div>
      </div>
    );

    switch (currentStep) {
      case 0:
        return (
          <div className="w-full p-8 bg-white rounded-lg">
            {renderHeader()}
            {isLoading ? (
              <div className="mt-8">
                <Skeleton active paragraph={{ rows: 6 }} />
              </div>
            ) : (
              <div className="mt-8">
                <div className="flex flex-col rounded-lg border border-gray-200 pt-8 pb-10 px-8 max-w-[700px] min-h-[280px] mx-auto">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-2xl font-bold">Current User Quota</span>
                    <span
                      className="text-md font-bold px-3 py-1 border border-gray-400"
                      style={{ borderRadius: '10px' }}
                    >
                      {activeSubscription?.slotTotal || 0}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 mt-6 mb-2">
                    <span className="font-bold">Update Number of user quota</span>
                    <InputNumber
                      min={0}
                      max={1000}
                      defaultValue={activeSubscription?.slotTotal || 0}
                      className="w-full max-w-[300px] py-2"
                      onChange={handleQuotaChange}
                      status={quotaError ? 'error' : ''}
                    />
                    {quotaError && (
                      <div className="text-red-500 text-sm">{quotaError}</div>
                    )}
                  </div>
                  <div className="text-sm flex items-center gap-2">
                    <ExclamationCircleOutlined />
                    <span>
                      Changes will take effect after the next billing period.
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-center gap-4 mt-8">
              <Button
                onClick={() => router.back()}
                className="text-center flex justify-center items-center"
                type="default"
              >
                Cancel
              </Button>
              <Button
                onClick={handleNextStep}
                className="text-center flex justify-center items-center"
                type="primary"
                disabled={isLoading || !!quotaError}
              >
                Continue
              </Button>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="w-full p-8 bg-white rounded-lg">
            {renderHeader()}
            {isLoading ? (
              <div className="mt-8">
                <Skeleton active paragraph={{ rows: 6 }} />
              </div>
            ) : (
              <div className="mt-8">
                <div className="flex flex-col rounded-lg border border-gray-200 pt-8 pb-10 px-8 max-w-[700px] min-h-[280px] mx-auto">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-2xl font-bold">
                      Current Subscription Period
                    </span>
                    <span
                      className="text-md font-bold px-3 py-1 border border-gray-400"
                      style={{
                        borderRadius: '10px',
                      }}
                    >
                      {updatedPeriod || currentPeriodType?.code}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 mt-6 mb-2">
                    <span className="font-bold">Update Subscription Period</span>
                    <Select
                      value={updatedPeriod || currentPeriodType?.code}
                      className="w-full max-w-[300px] min-h-[48px]"
                      onChange={handlePeriodChange}
                    >
                      {availablePeriods.map((period) => (
                        <Select.Option key={period.id} value={period.code}>
                          {period.code} - {currentPlan?.currency?.symbol || '$'}
                          {currentPlan?.periods?.find(pp => pp.periodTypeId === period.id)?.periodSlotPrice || 
                          currentPlan?.slotPrice}/user
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-center gap-4 mt-8">
              <Button
                onClick={handlePreviousStep}
                className="text-center flex justify-center items-center"
                type="default"
              >
                Cancel
              </Button>
              <Button
                onClick={handleNextStep}
                className="text-center flex justify-center items-center"
                type="primary"
                disabled={isLoading}
              >
                Continue
              </Button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="w-full p-8 bg-white rounded-lg">
            {renderHeader()}
            {isLoading ? (
              <div className="mt-8">
                <Skeleton active paragraph={{ rows: 6 }} />
              </div>
            ) : (
              <div className="mt-8">
                <div className="flex flex-col rounded-lg border border-gray-200 pt-8 pb-10 px-8 max-w-[700px] min-h-[280px] mx-auto">
                  <div className="flex items-center justify-between gap-2 mb-2 text-md font-bold">
                    <span>Subscription Plan</span>
                    <span>{currentPlan?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mb-2 text-md font-bold">
                    <span>Subscription Period</span>
                    <span>
                      {updatedPeriod || currentPeriodType?.code}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mb-2 text-md font-bold">
                    <span>Number of User Quota</span>
                    <span>{updatedQuota || activeSubscription?.slotTotal || 0}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mb-2 text-md font-bold">
                    <span>Total Amount</span>
                    <span>{currentPlan?.currency?.symbol || '$'}{totalAmount}</span>
                  </div>
                  {process.env.NODE_ENV === 'development' && (
                    <div className="flex flex-col gap-1 mb-3 text-sm text-gray-500 border-t pt-2 border-dashed border-gray-300">
                      <div className="flex justify-between">
                        <span>Debug: Current Plan</span>
                        <span>{currentPlan ? currentPlan.name : 'No plan'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Debug: Plan ID</span>
                        <span>{currentPlan ? currentPlan.id.slice(0, 8) + '...' : 'None'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Debug: Period</span>
                        <span>{selectedPeriodType ? selectedPeriodType.code : 'No period selected'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Debug: Months in Period</span>
                        <span>{selectedPeriodType ? selectedPeriodType.periodInMonths : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Debug: Base Slot Price</span>
                        <span>{currentPlan?.slotPrice || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Debug: Discount Slot Price</span>
                        <span>{currentPlan?.slotDiscountPrice || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Debug: Period Slot Price</span>
                        <span>
                          {selectedPeriodType && currentPlan?.periods 
                            ? (currentPlan.periods.find(pp => pp.periodTypeId === selectedPeriodType.id)?.periodSlotPrice || 'Using base price')
                            : 'N/A'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Debug: Period Slot Discount Price</span>
                        <span>
                          {selectedPeriodType && currentPlan?.periods 
                            ? (currentPlan.periods.find(pp => pp.periodTypeId === selectedPeriodType.id)?.periodSlotDiscountPrice || 'Not set')
                            : 'N/A'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Debug: Period Discount %</span>
                        <span>
                          {selectedPeriodType && currentPlan?.periods 
                            ? (currentPlan.periods.find(pp => pp.periodTypeId === selectedPeriodType.id)?.discountPercentage 
                              ? currentPlan.periods.find(pp => pp.periodTypeId === selectedPeriodType.id)?.discountPercentage + '%'
                              : 'Not set')
                            : 'N/A'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between font-bold border-t border-dashed border-gray-300 mt-1 pt-1">
                        <span>Debug: Final Price Calculation</span>
                        <span>
                          {`${calculateEffectiveSlotPrice()} × ${updatedQuota} × ${selectedPeriodType?.periodInMonths || 1} = ${totalAmount}`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="flex justify-center gap-4 mt-8">
              <Button
                onClick={handlePreviousStep}
                className="text-center flex justify-center items-center"
                type="default"
              >
                Cancel
              </Button>
              <Button
                onClick={handleNextStep}
                className="text-center flex justify-center items-center"
                type="primary"
                disabled={isLoading}
              >
                Confirm and Pay
              </Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="w-full p-8 bg-white rounded-lg">
            {renderHeader()}
            {isLoading ? (
              <div className="mt-8">
                <Skeleton active paragraph={{ rows: 10 }} />
              </div>
            ) : (
              <div className="mt-8">
                <div className="flex flex-col rounded-lg border border-gray-200 pt-4 pb-10 max-w-[700px] min-h-[280px] mx-auto">
                  <div className="flex items-center justify-between gap-2 border-b border-gray-200 pb-4 px-8">
                    <span className="text-2xl font-bold">
                      {activeSubscription 
                        ? 'Invoice for Subscription Update' 
                        : 'Invoice for New Subscription'
                      }:{' '}
                      <span className="text-primary">
                        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                    </span>
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => {}}
                    >
                      <Image
                        src="/icons/file-download.svg"
                        alt="Download"
                        width={25}
                        height={25}
                        style={{
                          minWidth: '25px',
                        }}
                      />
                    </button>
                  </div>

                  <div className="flex flex-col gap-2 border-b border-gray-200 mt-6 mb-2 pb-6 px-8">
                    <div className="text-2xl font-bold mb-4">
                      Invoice Payment Information
                    </div>
                    <div className="flex flex-col gap-2">
                      {/* TODO change Invoice Number to real invoice number */}
                      {[
                        ['Invoice Number:', `INV-${new Date().getFullYear()}${new Date().getMonth() + 1}${new Date().getDate()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`],
                        ['Issue Date:', currentDate],
                        ['Payment Date:', ''],
                        [
                          'Billing Period:',
                          `${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - 
                          ${calculateEndDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                        ],
                        ['Number of Users:', updatedQuota || activeSubscription?.slotTotal || 0],
                        ['Amount:', `${currentPlan?.currency?.symbol || '$'}${totalAmount}`],
                        ['Credit note:', '-'],
                      ].map(([label, value], index) => (
                        <div
                          key={index}
                          className="flex items-center justify-start gap-2"
                        >
                          <span className="text-md min-w-[90px] md:min-w-[150px]">
                            {label}
                          </span>
                          <span className={`text-md ${index === 10 ? 'font-bold text-lg' : 'font-semibold'}`}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between w-full gap-2 border-b border-gray-200 mt-6 mb-2 pb-6 px-8">
                    <div className="text-2xl font-bold mb-4">
                      Operation Details
                    </div>
                    {[
                      [
                        'Plan Type',
                        <span
                          key="plan"
                          className="flex items-center justify-center text-md font-bold border border-success rounded-lg px-2 gap-2"
                        >
                          <span className="flex min-w-[10px] w-[10px] h-[10px] bg-success rounded-full"></span>
                          <span>{currentPlan?.name || 'N/A'}</span>
                        </span>,
                      ],
                      [
                        'Status',
                        <span
                          key="status"
                          className="text-md font-bold text-orange bg-orange/10 rounded-lg px-4 py-2"
                        >
                          {activeSubscription?.invoices?.[0]?.status}
                        </span>,
                      ],
                      ['Paid By', '-'],
                    ].map(([label, value], index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between w-full gap-2 mb-2"
                      >
                        <span className="text-md font-bold">{label}</span>
                        <span className="min-w-[150px] flex items-center justify-center">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-2 mt-6 mb-2 pb-6 px-8">
                    <span className="text-2xl font-bold">Pay with</span>
                    <div className="flex justify-around gap-2 mt-4">
                      <div className="flex flex-col gap-2">
                        <div
                          className={`flex items-center justify-center px-3 py-2 border rounded-lg md:max-h-none max-h-[40px] cursor-pointer transition-all duration-300 ${
                            selectedPaymentMethod === 'chapa' 
                              ? 'border-primary bg-blue-50 shadow-[0_2px_6px_0_#4e4ef1]' 
                              : 'border-gray-200 hover:shadow-[0_2px_4px_0_#4e4ef1]'
                          }`}
                          onClick={() => handlePaymentMethodSelect('chapa')}
                        >
                          <Image
                            src="/icons/chapa-pay.svg"
                            alt="Chapa Payment"
                            width={108}
                            height={40}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div
                          className={`flex items-center justify-center px-3 py-2 border rounded-lg md:max-h-none max-h-[40px] cursor-pointer transition-all duration-300 ${
                            selectedPaymentMethod === 'stripe' 
                              ? 'border-primary bg-blue-50 shadow-[0_2px_6px_0_#4e4ef1]' 
                              : 'border-gray-200 hover:shadow-[0_2px_4px_0_#4e4ef1]'
                          }`}
                          onClick={() => handlePaymentMethodSelect('stripe')}
                        >
                          <Image
                            src="/icons/stripe-pay.svg"
                            alt="Stripe Payment"
                            width={108}
                            height={40}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-center gap-4 mt-8">
              <Button
                onClick={handlePreviousStep}
                className="text-center flex justify-center items-center"
                type="default"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                className="text-center flex justify-center items-center"
                type="primary"
                disabled={isLoading || !selectedPaymentMethod}
              >
                Pay Now
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-auto w-auto px-6 py-6">
      <CustomBreadcrumb
        title="Plan Management"
        subtitle="Manage your subscription plan"
      />
      {renderStepContent()}
    </div>
  );
};

export default PlanPage;
