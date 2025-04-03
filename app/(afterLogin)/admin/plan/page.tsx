'use client';

import CustomBreadcrumb from '@/components/common/breadCramp';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, InputNumber, Select, Skeleton, notification } from 'antd';
import { ExclamationCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { Plan, PeriodType, Subscription, Invoice } from '@/types/tenant-management';
import { useGetSubscriptions } from '@/store/server/features/tenant-management/subscriptions/queries';
import { useGetPlans } from '@/store/server/features/tenant-management/plans/queries';
import { useGetPeriodTypes } from '@/store/server/features/tenant-management/period-types/queries';
import { DEFAULT_TENANT_ID, TENANT_BASE_URL } from '@/utils/constants';
import { useCreateSubscription, useUpgradeSubscription } from '@/store/server/features/tenant-management/manage-subscriptions/mutation';
import { useInitiatePayment } from '@/store/server/features/tenant-management/payments/queries';
import dayjs from 'dayjs';


const PlanPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStep = parseInt(searchParams.get('step') || '0');
  const updateSource = searchParams.get('source') || 'default'; // 'quota' or 'period'
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [updatedQuota, setUpdatedQuota] = useState<number | null>(null);
  const [updatedPeriod, setUpdatedPeriod] = useState<string | null>(null);
  const [selectedPeriodType, setSelectedPeriodType] = useState<PeriodType | null>(null);
  const [availablePeriods, setAvailablePeriods] = useState<PeriodType[]>([]);
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'chapa' | 'stripe' | null>(null);
  const [isCreatingSubscription, setIsCreatingSubscription] = useState(false);
  const [updatedSubscription, setUpdatedSubscription] = useState<Subscription | null>(null);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // State for API data
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null);
  const [periodTypes, setPeriodTypes] = useState<PeriodType[]>([]);
  const [currentPeriodType, setCurrentPeriodType] = useState<PeriodType | null>(null);
  
  // Fetch subscriptions
  const { data: subscriptionsData, isLoading: isSubscriptionsLoading, refetch: refetchSubscriptions } = useGetSubscriptions(
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

  // Mutations for creating/updating subscriptions
  const createSubscriptionMutation = useCreateSubscription();
  const upgradeSubscriptionMutation = useUpgradeSubscription();

  // Initialize payment mutation
  const initiatePaymentMutation = useInitiatePayment();

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
        } else {
          // If plan not found, use first available plan
          setCurrentPlan(plans[0]);
        }
      } else if (activeSubscription) {
        // If no planId but we have active subscription, use its plan
        const plan = plans.find(p => p.id === activeSubscription.planId);
        if (plan) {
          setCurrentPlan(plan);
        }
      } else {
        // Default to first plan
        setCurrentPlan(plans[0]);
      }
    }
  }, [initialStep, plans, currentPlan, searchParams, activeSubscription]);

  // Process subscription data
  useEffect(() => {
    if (subscriptionsData?.items && subscriptionsData.items.length > 0) {
      // Find active subscription
      const active = subscriptionsData.items.find(sub => sub.isActive === true);
      if (active) {
        setActiveSubscription(active);
        // Initialize updatedQuota with current quota from active subscription
        if (active.slotTotal) {
          setUpdatedQuota(active.slotTotal);
        }
      }
    }
  }, [subscriptionsData]);

  // Process plans data
  useEffect(() => {
    if (plansData?.items && plansData.items.length > 0) {
      setPlans(plansData.items);
      
      // If we have an active subscription, find its plan
      if (activeSubscription) {
        const plan = plansData.items.find(p => p.id === activeSubscription.planId);
        if (plan) {
          setCurrentPlan(plan);
        }
      } else if (searchParams.get('planId')) {
        // If no active subscription but planId is in URL params, use that plan
        const planId = searchParams.get('planId');
        const plan = plansData.items.find(p => p.id === planId);
        if (plan) {
          setCurrentPlan(plan);
        }
      } else if (plansData.items.length > 0 && !currentPlan) {
        // If no active subscription and no planId in URL, use the first available plan
        setCurrentPlan(plansData.items[0]);
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
    }
    setCurrentStep((prev) => prev + 1);
  };
  
  const handlePreviousStep = () => setCurrentStep((prev) => prev - 1);
  const handleQuotaChange = (value: number | null) => {
    // Always update the value, even if null
    setUpdatedQuota(value);
    
    // Show error if value is less than current quota
    if (value !== null && activeSubscription?.slotTotal && value < activeSubscription.slotTotal) {
      setQuotaError('Your quota is below total number of user quota');
    } else {
      setQuotaError(null);
    }
  };
  
  // Check if quota has been changed and is valid
  const isQuotaChanged = () => {
    // If value is null or empty, it's not valid
    if (updatedQuota === null) return false;
    
    // If value equals current quota, it's not changed
    if (updatedQuota === activeSubscription?.slotTotal) return false;
    
    // If value is less than current quota, it's not valid
    if (activeSubscription?.slotTotal && updatedQuota < activeSubscription.slotTotal) return false;
    
    // Otherwise it's valid and changed
    return true;
  };
  
  // Check if period has been changed and is valid
  const isPeriodChanged = () => {
    // If no period selected, it's not valid
    if (!updatedPeriod) return false;
    
    // Get current period from active subscription
    const currentPeriodCode = currentPeriodType?.code;
    
    // If same as current period, it's not changed
    if (updatedPeriod === currentPeriodCode) return false;
    
    // Otherwise it's valid and changed
    return true;
  };
  
  const handlePeriodChange = (value: string) => {
    setUpdatedPeriod(value);
    const period = periodTypes.find(p => p.code === value);
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
    const planPeriod = currentPlan.periods?.find(pp => pp.periodTypeId === selectedPeriodType.id);
    
    // Get slot price (either period-specific or from the plan)
    const slotPrice = planPeriod?.periodSlotPrice || currentPlan.slotPrice;
    
    // Simple calculation: quota * price
    return updatedQuota * slotPrice;
  };

  const totalAmount = calculateTotalAmount();
  const isLoading = isSubscriptionsLoading || isPlansLoading || isPeriodTypesLoading;

  // Handle payment method selection
  const handlePaymentMethodSelect = (method: 'chapa' | 'stripe') => {
    if (selectedPaymentMethod === method) {
      setSelectedPaymentMethod(null);
    } else {
      setSelectedPaymentMethod(method);
    }
  };

  // Handle payment
  const handlePayment = async () => {
    if (!selectedPaymentMethod || !currentInvoice?.id) {
      notification.error({
        message: 'Payment Error',
        description: 'Please select a payment method and ensure you have a valid invoice.',
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
        returnUrl
      };

      // Call the payment API
      const response = await initiatePaymentMutation.mutateAsync({
        invoiceId: currentInvoice.id as string,
        data: paymentData
      });

      // Handle successful response
      const apiResponse = response as any;
      
      if (apiResponse && apiResponse.data && apiResponse.data.redirectUrl) {
        notification.success({
          message: 'Payment Initiated',
          description: 'You will be redirected to the payment page.'
        });

        // Redirect to payment provider page
        window.location.href = apiResponse.data.redirectUrl;
      } else if (apiResponse && apiResponse.redirectUrl) {
        // Handle case where redirectUrl is at the root level
        notification.success({
          message: 'Payment Initiated',
          description: 'You will be redirected to the payment page.'
        });

        // Redirect to payment provider page
        window.location.href = apiResponse.redirectUrl;
      } else {
        // If no redirect URL received, go to dashboard
        notification.success({
          message: 'Payment Initiated',
          description: 'Redirecting to dashboard.'
        });
        
        // Use Next.js router to navigate to dashboard
        router.push('/admin/dashboard');
      }
    } catch (error) {
      notification.error({
        message: 'Payment Failed',
        description: error instanceof Error ? error.message : 'There was an error initiating payment. Please try again later.'
      });
      setIsProcessingPayment(false);
    }
  };

  // Check if this is an update of the same plan
  const isSamePlanUpdate = activeSubscription && currentPlan && activeSubscription.planId === currentPlan.id;

  // Check if quota field should be disabled
  const isQuotaDisabled = Boolean(isSamePlanUpdate && updateSource === 'period');

  // Check if period field should be disabled
  const isPeriodDisabled = Boolean(isSamePlanUpdate && updateSource === 'quota');

  // After the subscription is created/updated, refetch the list to get the latest data
  const handleRefetchSubscriptions = async () => {
    // if (!updatedSubscriptionId) return;
    
    try {
      // Refetch all subscriptions to get the latest data
      const result = await refetchSubscriptions();
      
      if (result.data?.items && result.data.items.length > 0) {
        // Find the subscription we just created/updated
        const updatedSubscription = result.data?.items[0] as Subscription;

        setUpdatedSubscription(updatedSubscription);
        setCurrentInvoice(updatedSubscription.invoices[0]);
      }
    } catch (error) {
      notification.error({
        message: 'Error refetching subscriptions',
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  };

  const handleConfirmation = async () => {
    if (!currentPlan || !selectedPeriodType || !updatedQuota) {
      notification.error({
        message: 'Missing data',
        description: 'Required data for subscription is missing. Please try again.',
      });
      return;
    }

    setIsCreatingSubscription(true);

    try {
      const selectedPlanPeriod = currentPlan.periods?.find(
        pp => pp.periodTypeId === selectedPeriodType.id
      );

      if (!selectedPlanPeriod) {
        throw new Error('Selected period not found in plan');
      }

      // Common subscription data
      const subscriptionData = {
        planId: currentPlan.id,
        planPeriodId: selectedPlanPeriod.id,
        slots: updatedQuota,
        tenantId: DEFAULT_TENANT_ID,
      };

      let response;

      // Determine if it's a new subscription or upgrade
      if (!activeSubscription) {
        // Create new subscription
        response = await createSubscriptionMutation.mutateAsync(subscriptionData);
      } else {
        // Upgrade existing subscription
        const upgradeData = {
          ...subscriptionData,
          subscriptionId: activeSubscription.id,
        };
        response = await upgradeSubscriptionMutation.mutateAsync(upgradeData);
      }
      
      // Save the subscription ID for fetching details
      if (response && (response.id || response.data?.id)) {
        // Refetch the subscriptions to get the invoice
        await handleRefetchSubscriptions();
      }

      // Move to payment step
      setCurrentStep(3);
      
      notification.success({
        message: !activeSubscription ? 'Subscription Created' : 'Subscription Updated',
        description: 'Please proceed to payment to complete the process.',
      });
    } catch (error) {
      notification.error({
        message: 'Operation Failed',
        description: error instanceof Error ? error.message : 'Failed to process your subscription. Please try again later.',
      });
    } finally {
      setIsCreatingSubscription(false);
    }
  };

  // PDF download handler
  const handleDownloadPdf = async () => {
    // Check if we have an invoice ID
    if (!currentInvoice?.id) {
      notification.warning({
        message: 'No Invoice Available',
        description: 'Please complete the subscription process first to generate an invoice.'
      });
      return;
    }

    setIsDownloading(true);

    try {
      // Шаг 1: Получить ссылку на PDF
      const invoiceDetailResponse = await fetch(`${TENANT_BASE_URL}/api/v1/subscription/rest/invoices/${currentInvoice.id}/detail?fileType=PDF`);
      
      if (!invoiceDetailResponse.ok) {
        throw new Error(`Failed to fetch PDF details: ${invoiceDetailResponse.status} ${invoiceDetailResponse.statusText}`);
      }
      
      const invoiceDetail = await invoiceDetailResponse.json();
      const filePath = invoiceDetail.path || invoiceDetail.data?.path;
      
      if (!filePath) {
        throw new Error('PDF path not found in response');
      }
      
      const pdfFileUrl = `${TENANT_BASE_URL}/${filePath}`;
      
      // Шаг 2: Скачать PDF
      const pdfResponse = await fetch(pdfFileUrl);
      
      if (!pdfResponse.ok) {
        throw new Error(`Failed to download PDF: ${pdfResponse.status} ${pdfResponse.statusText}`);
      }
      
      // Get the blob from the response
      const blob = await pdfResponse.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${currentInvoice.id}.pdf`;
      
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
        description: error instanceof Error ? error.message : 'Failed to download the invoice PDF. Please try again later.',
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
                        You can only update the subscription period at this time. To change the user quota, please use the &quot;Update User Quota&quot; button.
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
                      disabled={isPeriodDisabled}
                    >
                      {availablePeriods.map((period) => (
                        <Select.Option key={period.id} value={period.code}>
                          {period.code} - {currentPlan?.currency?.symbol || '$'}
                          {currentPlan?.periods?.find(pp => pp.periodTypeId === period.id)?.periodSlotPrice || 
                          currentPlan?.slotPrice}/user
                        </Select.Option>
                      ))}
                    </Select>
                    {isPeriodDisabled && (
                      <div className="text-gray-500 text-sm">
                        You can only update the user quota at this time. To change the subscription period, please use the &quot;Update Subscription Period&quot; button.
                      </div>
                    )}
                    {!isPeriodDisabled && !isPeriodChanged() && (
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
                disabled={isLoading || (!isPeriodDisabled && !isPeriodChanged())}
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
                  <div className="flex items-center justify-between gap-2 mb-4 text-lg font-bold">
                    <span>Total Amount</span>
                    <span>{currentPlan?.currency?.symbol || '$'}{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 mt-2">
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <ExclamationCircleOutlined />
                      <span>
                        Changes will take effect after payment is completed and processed.
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
                loading={isCreatingSubscription}
                disabled={isLoading || isCreatingSubscription}
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
                      onClick={handleDownloadPdf}
                      disabled={isDownloading || !currentInvoice?.id}
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
                        ['Invoice Number:', `#${currentInvoice?.invoiceNumber}`],
                        ['Issue Date:', currentInvoice?.createdAt],
                        ['Payment Date:', ''],
                        [
                          'Billing Period:',
                          updatedSubscription?.startAt && updatedSubscription?.endAt ?
                          `${formatDate(updatedSubscription?.startAt)} - ${formatDate(updatedSubscription?.endAt)}` : '-'
                        ],
                        ['Number of Users:', updatedSubscription?.slotTotal || 0],
                        ['Amount:', `${currentPlan?.currency?.symbol || '$'}${ currentInvoice?.totalAmount }`],
                        ['Notes:', currentInvoice?.notes || '-'],
                      ].map(([label, value], index) => (
                        <div
                          key={index}
                          className="flex items-center justify-start gap-2"
                        >
                          <span className="text-md min-w-[90px] md:min-w-[150px]">
                            {label}
                          </span>
                          <span className={`text-md ${index === 5 ? 'font-bold text-lg' : 'font-semibold'}`}>
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
                          <span>{updatedSubscription?.plan?.name || 'N/A'}</span>
                        </span>,
                      ],
                      [
                        'Status',
                        <span
                          key="status"
                          className="text-md font-bold text-orange bg-orange/10 rounded-lg px-4 py-2"
                        >
                          {currentInvoice?.status || ''}
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
                    {!selectedPaymentMethod && (
                      <div className="text-center text-gray-500 text-sm mt-4">
                        Please select a payment method to continue
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
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
                disabled={isLoading || !selectedPaymentMethod || isProcessingPayment}
                icon={isProcessingPayment ? <LoadingOutlined /> : null}
              >
                {isProcessingPayment ? 'Processing...' : 'Pay Now'}
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
