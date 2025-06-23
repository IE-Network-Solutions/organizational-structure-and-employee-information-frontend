'use client';

import CustomBreadcrumb from '@/components/common/breadCramp';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, InputNumber, Select, Skeleton, notification } from 'antd';
import { ExclamationCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { Plan, PeriodType, Subscription } from '@/types/tenant-management';
import { useGetSubscriptions } from '@/store/server/features/tenant-management/subscriptions/queries';
import { useGetPlans } from '@/store/server/features/tenant-management/plans/queries';
import { useGetPeriodTypes } from '@/store/server/features/tenant-management/period-types/queries';
import { DEFAULT_TENANT_ID, TENANT_BASE_URL } from '@/utils/constants';
import {
  useCreateSubscription,
  useUpgradeSubscription,
} from '@/store/server/features/tenant-management/manage-subscriptions/mutation';
import { useInitiatePayment } from '@/store/server/features/tenant-management/payments/queries';
import dayjs from 'dayjs';
import { useCalculateSubscriptionPrice } from '@/store/server/features/tenant-management/manage-subscriptions/queries';
import {
  CalculateSubscriptionPriceDto,
  CalculateSubscriptionPriceResponse,
} from '@/store/server/features/tenant-management/manage-subscriptions/interface';

const PlanPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStep = parseInt(searchParams.get('step') || '0');
  const updateSource = searchParams.get('source') || 'default'; // 'quota' or 'period'
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [updatedQuota, setUpdatedQuota] = useState<number | null>(null);
  const [updatedPeriod, setUpdatedPeriod] = useState<string | null>(null);
  const [selectedPeriodType, setSelectedPeriodType] =
    useState<PeriodType | null>(null);
  const [availablePeriods, setAvailablePeriods] = useState<PeriodType[]>([]);
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // State for API data
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [activeSubscription, setActiveSubscription] =
    useState<Subscription | null>(null);
  const [periodTypes, setPeriodTypes] = useState<PeriodType[]>([]);
  const [currentPeriodType, setCurrentPeriodType] = useState<PeriodType | null>(
    null,
  );

  // Fetch subscriptions
  const {
    data: subscriptionsData,
    isLoading: isSubscriptionsLoading,
    refetch: refetchSubscriptions,
  } = useGetSubscriptions(
    { filter: { tenantId: [DEFAULT_TENANT_ID] } },
    true,
    true,
  );

  // Fetch plans
  const { data: plansData, isLoading: isPlansLoading } = useGetPlans(
    { filter: {} },
    true,
    true,
    'ASC',
  );

  // Fetch period types
  const { data: periodTypesData, isLoading: isPeriodTypesLoading } =
    useGetPeriodTypes({ filter: {} }, true, true);

  // Mutations for creating/updating subscriptions
  const createSubscriptionMutation = useCreateSubscription();
  const upgradeSubscriptionMutation = useUpgradeSubscription();

  // Initialize payment mutation
  const initiatePaymentMutation = useInitiatePayment();

  // New state for calculation
  const [calculationDto, setCalculationDto] =
    useState<CalculateSubscriptionPriceDto | null>(null);
  const [isCalculationEnabled, setIsCalculationEnabled] = useState(false);
  const [calculationResult, setCalculationResult] =
    useState<CalculateSubscriptionPriceResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Add the calculation hook
  const { data: calculationData, error: calculationError } =
    useCalculateSubscriptionPrice(calculationDto, isCalculationEnabled);

  // Leave this useEffect, which loads plans
  useEffect(() => {
    if (plansData?.items && plansData.items.length > 0) {
      setPlans(plansData.items);
    }
  }, [plansData]);

  // Add our new simple useEffect
  useEffect(() => {
    if (!plans.length) return;

    // 1. Priority: planId from URL parameter
    const planId = searchParams.get('planId');
    if (planId) {
      const selectedPlan = plans.find((p) => p.id === planId);
      if (selectedPlan) {
        setCurrentPlan(selectedPlan);
        return;
      }
    }

    // 2. Priority: plan from active subscription
    if (activeSubscription?.planId) {
      const subscriptionPlan = plans.find(
        (p) => p.id === activeSubscription.planId,
      );
      if (subscriptionPlan) {
        setCurrentPlan(subscriptionPlan);
        return;
      }
    }

    // 3. If nothing matches, use the first available plan
    if (!currentPlan && plans.length > 0) {
      setCurrentPlan(plans[0]);
    }
  }, [plans, searchParams, activeSubscription, currentPlan]);

  // Process subscription data
  useEffect(() => {
    if (subscriptionsData?.items && subscriptionsData.items.length > 0) {
      // Find active subscription
      const active = subscriptionsData.items.find(
        (sub) => sub.isActive === true,
      );
      if (active) {
        setActiveSubscription(active);
        // Initialize updatedQuota with current quota from active subscription
        if (active.slotTotal) {
          setUpdatedQuota(active.slotTotal);
        }
      }
    }
  }, [subscriptionsData]);

  // Process period types data
  useEffect(() => {
    if (periodTypesData?.items && periodTypesData.items.length > 0) {
      setPeriodTypes(periodTypesData.items);
    }
  }, [periodTypesData]);

  // Replace the complex useEffect for periods with a simpler one
  useEffect(() => {
    if (!currentPlan || !periodTypes.length) return;

    // 1. Get available periods for the selected plan
    const planPeriodTypes: PeriodType[] = [];
    if (currentPlan.periods) {
      currentPlan.periods.forEach((planPeriod) => {
        const periodType = periodTypes.find(
          (pt) => pt.id === planPeriod.periodTypeId,
        );
        if (periodType) {
          planPeriodTypes.push(periodType);
        }
      });
    }
    setAvailablePeriods(planPeriodTypes.length ? planPeriodTypes : periodTypes);

    // 2. Determine the period based on the rules:
    // - if there is an active subscription with the same plan, take its period
    // - otherwise take the period with the smallest periodInMonths
    if (
      activeSubscription &&
      activeSubscription.planId === currentPlan.id &&
      activeSubscription.planPeriodId
    ) {
      // Search for the period from the active subscription
      const currentPlanPeriod = currentPlan.periods?.find(
        (period) => period.id === activeSubscription.planPeriodId,
      );

      if (currentPlanPeriod) {
        const periodFromSubscription = periodTypes.find(
          (pt) => pt.id === currentPlanPeriod.periodTypeId,
        );
        if (periodFromSubscription) {
          setCurrentPeriodType(periodFromSubscription);
          setUpdatedPeriod(periodFromSubscription.code);
          return;
        }
      }
    }

    // If there is no corresponding subscription or period not found, take the period with the smallest periodInMonths
    if (planPeriodTypes.length > 0) {
      // Sort by ascending periodInMonths and take the first (shortest) period
      const sortedPeriods = [...planPeriodTypes].sort(
        (a, b) => (a.periodInMonths || 0) - (b.periodInMonths || 0),
      );
      setCurrentPeriodType(sortedPeriods[0]);
      setUpdatedPeriod(sortedPeriods[0].code);
    }
  }, [currentPlan, periodTypes, activeSubscription]);

  // Ensure the selected period is displayed correctly on the confirmation step
  useEffect(() => {
    if (updatedPeriod) {
      const period = periodTypes.find((p) => p.code === updatedPeriod);
      if (period) {
        setSelectedPeriodType(period);
      }
    }
  }, [updatedPeriod, periodTypes]);

  // Add an effect to handle calculation results
  useEffect(() => {
    if (isCalculationEnabled && calculationData?.item) {
      setCalculationResult(calculationData.item);
      setIsCalculationEnabled(false);
      setIsCalculating(false);
      // Go to the confirmation step
      setCurrentStep(2);
    } else if (isCalculationEnabled && calculationError) {
      notification.error({
        message: 'Calculation Error',
        description:
          calculationError instanceof Error
            ? calculationError.message
            : 'Failed to calculate the cost. Please try again.',
      });
      setIsCalculationEnabled(false);
      setIsCalculating(false);
    }
  }, [calculationData, calculationError, isCalculationEnabled]);

  const handleNextStep = () => {
    if (currentStep === 1) {
      // If we are on the period selection step and move to confirmation, start calculation
      if (!selectedPeriodType || !updatedQuota || !currentPlan) {
        notification.error({
          message: 'Missing data',
          description: 'Please fill in all required fields',
        });
        return;
      }

      // Find the ID of the selected period
      const selectedPlanPeriod = currentPlan.periods?.find(
        (pp) => pp.periodTypeId === selectedPeriodType.id,
      );

      if (!selectedPlanPeriod) {
        notification.error({
          message: 'Period selection error',
          description: 'Selected period not found in plan',
        });
        return;
      }

      // Create DTO for calculation
      const dto: CalculateSubscriptionPriceDto = {
        planId: currentPlan.id,
        planPeriodId: selectedPlanPeriod.id,
        slotTotal: updatedQuota,
        newSlot: updatedQuota - (activeSubscription?.slotTotal ?? 0), // Use updatedQuota directly
        ...(activeSubscription
          ? { subscriptionId: activeSubscription.id }
          : {}),
      };

      // Start the calculation process
      setCalculationDto(dto);
      setCalculationResult(null);
      setIsCalculationEnabled(true);
      setIsCalculating(true);

      // Don't change the step here - this will happen after receiving the result
    } else {
      // For other steps, just move forward
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePreviousStep = () => setCurrentStep((prev) => prev - 1);

  const handleQuotaChange = (value: number | null) => {
    // Always update the value, even if null
    setUpdatedQuota(value);

    // Show error if value is less than current quota
    if (
      value !== null &&
      activeSubscription?.slotTotal &&
      value < activeSubscription.slotTotal
    ) {
      setQuotaError('Your quota is below total number of user quota');
    } else if (value === null || value === undefined || value === 0) {
      setQuotaError('Please enter a valid number');
    } else {
      setQuotaError(null);
    }
  };

  // Check if quota has been changed and is valid
  const isQuotaChanged = () => {
    // If value is null or empty, it's not valid
    if (updatedQuota === null) return false;

    // If value equals current quota, it's not changed
    if (
      updatedQuota === activeSubscription?.slotTotal &&
      activeSubscription?.planId === currentPlan?.id
    )
      return false;

    // If value is less than current quota, it's not valid
    if (
      activeSubscription?.slotTotal &&
      updatedQuota < activeSubscription.slotTotal
    )
      return false;

    // Otherwise it's valid and changed
    return true;
  };

  // Check if period has been changed and is valid
  const isPeriodChanged = () => {
    // If there is no active subscription, any selected period is considered valid
    if (!activeSubscription) return true;

    // If there is no selected period, it is invalid
    if (!updatedPeriod) return false;

    // Get the current period from the active subscription
    // const currentPeriodCode = currentPeriodType?.code;

    // If it matches the current period, it is not considered changed. UPDATED

    // if (updatedPeriod === currentPeriodCode) return false;

    // Otherwise it is valid and changed
    return true;
  };

  const handlePeriodChange = (value: string) => {
    setUpdatedPeriod(value);
    const period = periodTypes.find((p) => p.code === value);
    if (period) {
      setSelectedPeriodType(period);
    }
  };

  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    return dayjs(dateString).format('MMMM D, YYYY');
  };

  // Calculate total amount based on selected options - simplified version
  const calculateTotalAmount = () => {
    if (!currentPlan || !updatedQuota || !selectedPeriodType) return 0;

    // Get current plan period
    const planPeriod = currentPlan.periods?.find(
      (pp) => pp.periodTypeId === selectedPeriodType.id,
    );

    // Get slot price (either period-specific or from the plan)
    const slotPrice = planPeriod?.periodSlotPrice || currentPlan.slotPrice;

    // Simple calculation: quota * price
    return updatedQuota * slotPrice;
  };

  const totalAmount = calculateTotalAmount();
  const isLoading =
    isSubscriptionsLoading || isPlansLoading || isPeriodTypesLoading;

  // Handle payment
  const handlePayment = async () => {
    const paymentCurrency = currentPlan?.currency?.code;

    const selectedPaymentMethod =
      paymentCurrency === 'ETB'
        ? 'chapa'
        : paymentCurrency === 'USD'
          ? 'stripe'
          : null;
    if (!selectedPaymentMethod || !updatedSubscriptionValue?.invoices[0]?.id) {
      notification.error({
        message: 'Payment Error',
        description:
          'Please select a payment method and ensure you have a valid invoice.',
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Use the dashboard URL as return URL instead of current location
      const returnUrl = `${window.location.origin}/admin/dashboard`;

      // Prepare payment data
      const paymentData = {
        paymentMethod: selectedPaymentMethod.toUpperCase(),
        paymentProvider: selectedPaymentMethod,
        returnUrl,
      };

      // Call the payment API
      const response = await initiatePaymentMutation.mutateAsync({
        invoiceId: updatedSubscriptionValue?.invoices[0]?.id as string,
        data: paymentData,
      });

      // Handle successful response
      const apiResponse = response as any;

      if (apiResponse && apiResponse.data && apiResponse.data.redirectUrl) {
        notification.success({
          message: 'Payment Initiated',
          description: 'You will be redirected to the payment page.',
        });

        // Redirect to payment provider page
        window.location.href = apiResponse.data.redirectUrl;
      } else if (apiResponse && apiResponse.redirectUrl) {
        // Handle case where redirectUrl is at the root level
        notification.success({
          message: 'Payment Initiated',
          description: 'You will be redirected to the payment page.',
        });

        // Redirect to payment provider page
        window.location.href = apiResponse.redirectUrl;
      } else {
        // If no redirect URL received, go to dashboard
        notification.success({
          message: 'Payment Initiated',
          description: 'Redirecting to dashboard.',
        });

        // Use Next.js router to navigate to dashboard
        router.push('/admin/dashboard');
      }
    } catch (error) {
      notification.error({
        message: 'Payment Failed',
        description:
          error instanceof Error
            ? error.message
            : 'There was an error initiating payment. Please try again later.',
      });
      setIsProcessingPayment(false);
    }
  };

  // Check if this is an update of the same plan
  const isSamePlanUpdate =
    activeSubscription &&
    currentPlan &&
    activeSubscription.planId === currentPlan.id;

  // Check if quota field should be disabled
  const isQuotaDisabled = Boolean(
    isSamePlanUpdate && updateSource === 'period',
  );

  // Check if period field should be disabled
  const isPeriodDisabled = Boolean(
    isSamePlanUpdate && updateSource === 'quota',
  );

  // After the subscription is created/updated, refetch the list to get the latest data
  const handleRefetchSubscriptions = async () => {
    try {
      // Просто обновляем подписки, без установки лишних переменных
      await refetchSubscriptions();
    } catch (error) {
      notification.error({
        message: 'Error refetching subscriptions',
        description:
          error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  const handleConfirmation = async () => {
    if (
      !currentPlan ||
      !selectedPeriodType ||
      !updatedQuota ||
      !calculationResult
    ) {
      notification.error({
        message: 'Missing data',
        description:
          'Required data for subscription is missing. Please try again.',
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      const selectedPlanPeriod = currentPlan.periods?.find(
        (pp) => pp.periodTypeId === selectedPeriodType.id,
      );

      if (!selectedPlanPeriod) {
        throw new Error('Selected period not found in plan');
      }
      let response;

      if (!activeSubscription) {
        const createData = {
          planId: currentPlan.id,
          planPeriodId: selectedPlanPeriod.id,
          slotTotal: updatedQuota,
          tenantId: DEFAULT_TENANT_ID,
          currencyId: currentPlan.currency?.id,
          subscriptionPrice: calculationResult.totalAmount,
          subscriptionStatus: 'pending' as any,
          isActive: false,
        };
        response = await createSubscriptionMutation.mutateAsync(createData);
      } else {
        const upgradeData = {
          subscriptionId: activeSubscription.id,
          planId: currentPlan.id,
          planPeriodId: selectedPlanPeriod.id,
          slotTotal: updatedQuota,
          tenantId: DEFAULT_TENANT_ID,
        };

        response = await upgradeSubscriptionMutation.mutateAsync(upgradeData);
      }

      if (response && (response.id || response.data?.id)) {
        await handleRefetchSubscriptions();
      }

      setCurrentStep(3);

      notification.success({
        message: !activeSubscription
          ? 'Subscription Created'
          : 'Subscription Updated',
        description: 'Please proceed to payment to complete the process.',
      });
    } catch (error) {
      notification.error({
        message: 'Operation Failed',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to process your subscription. Please try again later.',
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const updatedSubscriptionValue = subscriptionsData?.items[0];

  // PDF download handler
  const handleDownloadPdf = async () => {
    // Check if we have an invoice ID
    if (!updatedSubscriptionValue?.invoices[0]?.id) {
      notification.warning({
        message: 'No Invoice Available',
        description:
          'Please complete the subscription process first to generate an invoice.',
      });
      return;
    }

    setIsDownloading(true);

    try {
      // Step 1: Get the PDF link
      const invoiceDetailResponse = await fetch(
        `${TENANT_BASE_URL}/api/v1/subscription/rest/invoices/${updatedSubscriptionValue?.invoices[0]?.id}/detail?fileType=PDF`,
      );

      if (!invoiceDetailResponse.ok) {
        throw new Error(
          `Failed to fetch PDF details: ${invoiceDetailResponse.status} ${invoiceDetailResponse.statusText}`,
        );
      }

      const invoiceDetail = await invoiceDetailResponse.json();
      const filePath = invoiceDetail.path || invoiceDetail.data?.path;

      if (!filePath) {
        throw new Error('PDF path not found in response');
      }

      const pdfFileUrl = `${TENANT_BASE_URL}/${filePath}`;

      // Step 2: Download PDF
      const pdfResponse = await fetch(pdfFileUrl);

      if (!pdfResponse.ok) {
        throw new Error(
          `Failed to download PDF: ${pdfResponse.status} ${pdfResponse.statusText}`,
        );
      }

      // Get the blob from the response
      const blob = await pdfResponse.blob();

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${updatedSubscriptionValue?.invoices[0]?.id}.pdf`;

      // Append the link to the document
      document.body.appendChild(link);

      // Click the link to download the file
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      notification.success({
        message: 'Download Started',
        description: 'Your invoice PDF is being downloaded.',
      });
    } catch (error) {
      notification.error({
        message: 'Download Failed',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to download the invoice PDF. Please try again later.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const renderStepContent = () => {
    const steps = [
      { title: 'Number of User Quota' },
      { title: 'Subscription Period' },
      { title: 'Confirmation' },
      { title: 'Payment' },
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
                    <span className="text-2xl font-bold">
                      Current User Quota
                    </span>
                    {activeSubscription &&
                      currentPlan &&
                      activeSubscription.plan.id === currentPlan.id && (
                        <span
                          className="text-md font-bold px-3 py-1 border border-gray-400"
                          style={{ borderRadius: '10px' }}
                        >
                          {activeSubscription?.slotTotal || 0}
                        </span>
                      )}
                  </div>
                  <div className="flex flex-col gap-2 mt-6 mb-2">
                    <span className="font-bold">
                      Update Number of user quota
                    </span>
                    <InputNumber
                      min={0}
                      type="number"
                      value={updatedQuota}
                      className="w-full max-w-[300px] py-2"
                      onChange={handleQuotaChange}
                      status={quotaError ? 'error' : ''}
                      controls={false}
                      disabled={isQuotaDisabled}
                    />
                    {quotaError && (
                      <div className="text-red-500 text-sm">{quotaError}</div>
                    )}
                    {isQuotaDisabled && (
                      <div className="text-gray-500 text-sm">
                        You can only update the subscription period at this
                        time. To change the user quota, please use the
                        &quot;Update User Quota&quot; button.
                      </div>
                    )}
                    {!isQuotaDisabled && !isQuotaChanged() && (
                      <div className="text-gray-500 text-sm">
                        Please change the quota value to continue
                      </div>
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
                disabled={isLoading || (!isQuotaDisabled && !isQuotaChanged())}
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
                    {activeSubscription &&
                      currentPlan &&
                      activeSubscription.plan.id === currentPlan.id && (
                        <span
                          className="text-md font-bold px-3 py-1 border border-gray-400"
                          style={{
                            borderRadius: '10px',
                          }}
                        >
                          {updatedPeriod || currentPeriodType?.code}
                        </span>
                      )}
                  </div>
                  <div className="flex flex-col gap-2 mt-6 mb-2">
                    <span className="font-bold">
                      Update Subscription Period
                    </span>
                    <span className="font-bold">
                      {currentPeriodType?.code || 'jest'}
                    </span>
                    <Select
                      value={updatedPeriod || currentPeriodType?.code}
                      className="w-full max-w-[300px] min-h-[48px]"
                      onChange={handlePeriodChange}
                      disabled={isPeriodDisabled}
                    >
                      {availablePeriods
                        .sort(
                          (a, b) =>
                            (a.periodInMonths || 0) - (b.periodInMonths || 0),
                        )
                        .map((period) => (
                          <Select.Option key={period.id} value={period.code}>
                            {period.code} -{' '}
                            {currentPlan?.currency?.symbol || '$'}
                            {currentPlan?.periods?.find(
                              (pp) => pp.periodTypeId === period.id,
                            )?.periodSlotPrice || currentPlan?.slotPrice}
                            /user
                          </Select.Option>
                        ))}
                    </Select>
                    {isPeriodDisabled && (
                      <div className="text-gray-500 text-sm">
                        You can only update the user quota at this time. To
                        change the subscription period, please use the
                        &quot;Update Subscription Period&quot; button.
                      </div>
                    )}
                    {!isPeriodDisabled &&
                      !isPeriodChanged() &&
                      activeSubscription && (
                        <div className="text-gray-500 text-sm">
                          Please change the period value to continue
                        </div>
                      )}
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
                loading={isCalculating}
                disabled={
                  isLoading ||
                  (!isPeriodDisabled && !isPeriodChanged()) ||
                  isCalculating
                }
              >
                {isCalculating ? 'Calculating...' : 'Continue'}
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
                    <span>{updatedPeriod || currentPeriodType?.code}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mb-2 text-md font-bold">
                    <span>Number of User Quota</span>
                    <span>
                      {updatedQuota || activeSubscription?.slotTotal || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mb-4 text-lg font-bold">
                    <span>Total Amount</span>
                    <span>
                      {calculationResult
                        ? `${currentPlan?.currency?.symbol || '$'}${calculationResult.totalAmount.toFixed(2)}`
                        : `${currentPlan?.currency?.symbol || '$'}${totalAmount.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 mt-2">
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <ExclamationCircleOutlined />
                      <span>
                        Changes will take effect after payment is completed and
                        processed.
                      </span>
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
                onClick={handleConfirmation}
                className="text-center flex justify-center items-center"
                type="primary"
                loading={isProcessingPayment}
                disabled={isLoading || isProcessingPayment}
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
                        : 'Invoice for New Subscription'}
                      :{' '}
                      <span className="text-primary">
                        {new Date().toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </span>
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={handleDownloadPdf}
                      disabled={
                        isDownloading ||
                        !updatedSubscriptionValue?.invoices[0]?.id
                      }
                    >
                      {isDownloading ? (
                        <LoadingOutlined style={{ fontSize: 25 }} spin />
                      ) : (
                        <Image
                          src="/icons/file-download.svg"
                          alt="Download"
                          width={25}
                          height={25}
                          style={{
                            minWidth: '25px',
                          }}
                        />
                      )}
                    </button>
                  </div>

                  <div className="flex flex-col gap-2 border-b border-gray-200 mt-6 mb-2 pb-6 px-8">
                    <div className="text-2xl font-bold mb-4">
                      Invoice Payment Information
                    </div>
                    <div className="flex flex-col gap-2">
                      {[
                        [
                          'Invoice Number:',
                          `#${updatedSubscriptionValue?.invoices[0]?.invoiceNumber}`,
                        ],
                        [
                          'Issue Date:',
                          formatDate(
                            updatedSubscriptionValue?.invoices[0]?.createdAt,
                          ),
                        ],
                        ['Payment Date:', ''],
                        [
                          'Billing Period:',
                          updatedSubscriptionValue?.startAt &&
                          updatedSubscriptionValue?.endAt
                            ? `${formatDate(updatedSubscriptionValue?.startAt)} - ${formatDate(updatedSubscriptionValue?.endAt)}`
                            : '-',
                        ],
                        [
                          'Number of Users:',
                          updatedSubscriptionValue?.slotTotal || 0,
                        ],
                        [
                          'Amount:',
                          `${currentPlan?.currency?.symbol || '$'}${updatedSubscriptionValue?.invoices[0]?.totalAmount}`,
                        ],
                        [
                          'Notes:',
                          updatedSubscriptionValue?.invoices[0]?.notes || '-',
                        ],
                      ].map(([label, value], index) => (
                        <div
                          key={index}
                          className="flex items-center justify-start gap-2"
                        >
                          <span className="text-md min-w-[90px] md:min-w-[150px]">
                            {label}
                          </span>
                          <span
                            className={`text-md ${index === 5 ? 'font-bold text-lg' : 'font-semibold'}`}
                          >
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
                          <span>
                            {updatedSubscriptionValue?.invoices[0]
                              ?.paymentMetadata?.targetState?.plan?.name ||
                              'N/A'}
                          </span>
                        </span>,
                      ],
                      [
                        'Status',
                        <span
                          key="status"
                          className="text-md font-bold text-orange bg-orange/10 rounded-lg px-4 py-2"
                        >
                          {updatedSubscriptionValue?.invoices[0]?.status || ''}
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
                    <span className="text-2xl font-bold">Pay</span>
                    <div className="flex justify-center gap-4 mt-8">
                      <Button
                        onClick={() => router.push('/admin/dashboard')}
                        className="text-center flex justify-center items-center"
                        type="default"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handlePayment}
                        className="text-center flex justify-center items-center"
                        type="primary"
                        disabled={isLoading || isProcessingPayment}
                        icon={isProcessingPayment ? <LoadingOutlined /> : null}
                      >
                        {isProcessingPayment ? 'Processing...' : 'Pay Now'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };
  console.log(activeSubscription,"activeSubscription")
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
