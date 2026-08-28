'use client';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { Skeleton } from 'antd';
import { Permissions } from '@/types/commons/permissionEnum';
import { useFiscalYearRedirect } from '@/hooks/useFiscalYearRedirect';
import AccessGuard from '@/utils/permissionGuard';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';

import DashboardSubscriptionSkeleton from './_components/DashboardSubscriptionSkeleton';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGetSubscriptionByTenant } from '@/store/server/features/tenant-management/manage-subscriptions/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import type { ApiResponse } from '@/types/commons/responseTypes';
import type { Subscription } from '@/types/tenant-management';
import AddWidgetModal from './_components/customize/AddWidgetModal';
import DashboardGrid from './_components/customize/DashboardGrid';
import EditToolbar from './_components/customize/EditToolbar';
import { useDashboardLayout } from './_components/customize/useDashboardLayout';
import { toDashboardPlanKey } from './_components/customize/widgetRegistry';
import type { DashboardPlanView } from './_components/customize/types';

function dashboardPlanFromSubscription(
  data: ApiResponse<Subscription> | undefined,
): DashboardPlanView | undefined {
  const name = data?.plan?.name;
  if (name === 'Performance Plan') return 'Performance Plan';
  if (name === 'Essential Plan ') return 'Essential Plan ';
  if (name === 'Enterprise Plan') return 'Enterprise Plan';
  return undefined;
}

export default function Home() {
  useFiscalYearRedirect(); // 👈 Activate fiscal year redirect logic

  const { data: activeCalender, isLoading: isResponseLoading } =
    useGetActiveFiscalYears({
      refetchInterval: 30000, // Keep polling for banner display
    });
  const { tenantId, userId } = useAuthenticationStore();
  const { data: subscriptionData, isLoading: isSubscriptionLoading } =
    useGetSubscriptionByTenant(tenantId, !!tenantId);
  const hasEndedFiscalYear =
    activeCalender?.isActive &&
    activeCalender?.endDate &&
    new Date(activeCalender?.endDate) < new Date();
  const [selectedTenatType, setSelectedTenatType] = useState<DashboardPlanView>(
    dashboardPlanFromSubscription(subscriptionData) ?? 'Performance Plan',
  );

  useEffect(() => {
    const plan = dashboardPlanFromSubscription(subscriptionData);
    if (plan) setSelectedTenatType(plan);
  }, [subscriptionData]);

  const planKey = useMemo(
    () => toDashboardPlanKey(selectedTenatType),
    [selectedTenatType],
  );

  const {
    layout,
    commitLayout,
    isReady,
    isEditing,
    setIsEditing,
    hiddenWidgetIds,
    hideWidget,
    addWidget,
    resetLayout,
    isSaving,
  } = useDashboardLayout(userId, planKey);

  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  const handleAddWidget = useCallback(
    (id: string) => {
      addWidget(id);
      setIsCatalogOpen(false);
    },
    [addWidget],
  );

  const mainLayout = (
    <div className="min-h-screen" data-cy="dashboard-main-layout">
      <div
        className="my-5 flex justify-between items-center "
        data-cy="dashboard-header"
      >
        <h1
          className="text-2xl font-bold text-gray-900"
          data-cy="dashboard-header-title"
        >
          Dashboard
        </h1>
        {/* Dashboard customization controls */}
        <div
          className="flex gap-2 items-center"
          data-cy="dashboard-tenant-type-control"
        >
          <EditToolbar
            isEditing={isEditing}
            isSaving={isSaving}
            onStartEditing={() => setIsEditing(true)}
            onOpenCatalog={() => setIsCatalogOpen(true)}
            onReset={resetLayout}
            onDone={() => setIsEditing(false)}
          />
        </div>
      </div>

      <div data-cy="dashboard-content">
        {isReady && (
          <DashboardGrid
            layout={layout}
            plan={selectedTenatType}
            isEditing={isEditing}
            onLayoutChange={commitLayout}
            onHideWidget={hideWidget}
          />
        )}
      </div>

      <AddWidgetModal
        open={isCatalogOpen}
        plan={selectedTenatType}
        hiddenWidgetIds={hiddenWidgetIds}
        onAdd={handleAddWidget}
        onClose={() => setIsCatalogOpen(false)}
      />
    </div>
  );

  return (
    <div data-cy="dashboard-page-container">
      {isResponseLoading && <Skeleton active paragraph={{ rows: 0 }} />}
      {hasEndedFiscalYear && (
        <AccessGuard permissions={[Permissions.CreateCalendar]}>
          <div
            className="bg-[#323B49] p-2 rounded-lg h-12 flex items-center justify-start text-md gap-2 cursor-pointer hover:bg-[#3a4354] transition"
            onClick={() => {
              window.location.href =
                '/organization/settings/fiscalYear/fiscalYearCard';
            }}
            title="Go to Fiscal Year Settings"
            data-cy="dashboard-fiscal-year-banner-clickable"
          >
            <span
              className="text-[#FFDE65] px-2"
              data-cy="dashboard-fiscal-year-banner-title"
            >
              Your fiscal year has ended
            </span>
            <span
              className="text-white"
              data-cy="dashboard-fiscal-year-banner-message"
            >
              Please contact your system admin for more information
            </span>
          </div>
        </AccessGuard>
      )}
      {/* If user does not have permission, show non-clickable banner */}
      {hasEndedFiscalYear && (
        <AccessGuard permissions={[]}>
          <div
            className="bg-[#323B49] p-2 rounded-lg h-12 flex items-center justify-start text-md gap-2"
            data-cy="dashboard-fiscal-year-banner-non-clickable"
          >
            <span
              className="text-[#FFDE65] px-2"
              data-cy="dashboard-fiscal-year-banner-title-non-clickable"
            >
              Your fiscal year has ended
            </span>
            <span
              className="text-white"
              data-cy="dashboard-fiscal-year-banner-message-non-clickable"
            >
              Please contact your system admin for more information
            </span>
          </div>
        </AccessGuard>
      )}
      {isSubscriptionLoading ? <DashboardSubscriptionSkeleton /> : mainLayout}
    </div>
  );
}
