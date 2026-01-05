'use client';

import { Tag, Dropdown, MenuProps } from 'antd';
import { IoIosArrowDown } from 'react-icons/io';
import { useUpdateActionPlan } from '@/store/server/features/organization-development/categories/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useActionPlanStatusStore } from '@/store/uistate/features/feedback/actionPlanStatus';
import NotificationMessage from '@/components/common/notification/notificationMessage';

interface StatusDropdownProps {
  actionPlanId: string;
  currentStatus: string;
  responsiblePerson: string[];
  recordKey: string;
}

const statusColors: Record<string, string> = {
  pending: 'gold',
  solved: 'green',
  Pending: 'gold',
  Solved: 'green',
};

// Status highlight colors (lighter versions for border/background)
const statusHighlightColors: Record<string, string> = {
  pending: '#fffbe6', // Light gold/yellow background
  solved: '#f6ffed', // Light green background
  Pending: '#fffbe6',
  Solved: '#f6ffed',
};

// Status border colors

const capitalizeFirstLetter = (value: string) => {
  if (!value) return value;
  const str = String(value).trim();
  if (!str) return value;
  const normalized = str.replace(/_/g, ' ').toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const normalizeStatus = (status: string): 'pending' | 'solved' => {
  const normalized = status.toLowerCase().trim();
  if (
    normalized === 'solved' ||
    normalized === 'resolved' ||
    normalized === 'completed'
  ) {
    return 'solved';
  }
  return 'pending';
};

export default function StatusDropdown({
  actionPlanId,
  currentStatus,
  responsiblePerson,
  recordKey,
}: StatusDropdownProps) {
  const { mutate: updateActionPlan } = useUpdateActionPlan();
  const { userId, userData } = useAuthenticationStore();

  // Use selectors to get state and actions
  const loading = useActionPlanStatusStore((state) =>
    state.getLoading(actionPlanId),
  );
  const optimisticStatus = useActionPlanStatusStore((state) =>
    state.getOptimisticStatus(actionPlanId),
  );
  const setLoading = useActionPlanStatusStore((state) => state.setLoading);
  const setOptimisticStatus = useActionPlanStatusStore(
    (state) => state.setOptimisticStatus,
  );
  const clearOptimisticStatus = useActionPlanStatusStore(
    (state) => state.clearOptimisticStatus,
  );

  // Use optimistic status if available, otherwise use current status
  const statusToDisplay = optimisticStatus || currentStatus;
  const normalizedStatus = normalizeStatus(statusToDisplay);
  const displayStatus = capitalizeFirstLetter(normalizedStatus);

  // Check if user can update status (assigned user or admin)
  const isAssigned = responsiblePerson?.includes(userId) || false;
  const userRole = userData?.role?.slug?.toLowerCase() || '';
  const isAdmin =
    userRole === 'admin' ||
    userRole === 'administrator' ||
    userRole === 'owner' ||
    userRole === 'super admin' ||
    userRole === 'superadmin';
  const canUpdate = isAssigned || isAdmin;

  const handleStatusChange = (newStatus: 'pending' | 'solved') => {
    if (loading || normalizedStatus === newStatus) return;

    // Optimistically update the UI immediately
    setOptimisticStatus(actionPlanId, newStatus);
    setLoading(actionPlanId, true);

    updateActionPlan(
      {
        actionPlanId,
        values: { status: newStatus },
      },
      {
        onSuccess: () => {
          setLoading(actionPlanId, false);
          // Clear optimistic status after successful update - the query will refetch with real data
          setTimeout(() => {
            clearOptimisticStatus(actionPlanId);
          }, 100);
        },
        onError: (error: any) => {
          setLoading(actionPlanId, false);
          // Revert optimistic update on error
          clearOptimisticStatus(actionPlanId);

          // Handle specific error cases
          const status = error?.response?.status;
          const errorMessage =
            error?.response?.data?.message || 'An error occurred';

          if (status === 403) {
            NotificationMessage.error({
              message: 'Permission Denied',
              description:
                "You don't have permission to update the status. Only assigned users or administrators can change the status.",
            });
          } else if (status === 401) {
            NotificationMessage.error({
              message: 'Authentication Required',
              description: 'Please log in to continue',
            });
          } else if (status === 404) {
            NotificationMessage.error({
              message: 'Not Found',
              description: 'Action plan not found',
            });
          } else if (status === 400) {
            NotificationMessage.error({
              message: 'Invalid Request',
              description:
                errorMessage || 'Invalid status value. Please try again.',
            });
          } else {
            NotificationMessage.error({
              message: 'Update Failed',
              description:
                errorMessage || 'Failed to update status. Please try again.',
            });
          }
        },
      },
    );
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'pending',
      label: 'Pending',
      onClick: () => {
        if (normalizedStatus !== 'pending') {
          handleStatusChange('pending');
        }
      },
      disabled: normalizedStatus === 'pending' || loading,
    },
    {
      key: 'solved',
      label: 'Solved',
      onClick: () => {
        if (normalizedStatus !== 'solved') {
          handleStatusChange('solved');
        }
      },
      disabled: normalizedStatus === 'solved' || loading,
    },
  ];

  const menuProps: MenuProps = {
    items: menuItems,
  };

  const highlightColor =
    statusHighlightColors[normalizedStatus] ||
    statusHighlightColors[currentStatus] ||
    '#f0f0f0';

  return (
    <Dropdown
      menu={menuProps}
      trigger={['click']}
      disabled={!canUpdate || loading}
      placement="bottomLeft"
    >
      <div
        className={`inline-flex items-center gap-1.5 ${
          canUpdate && !loading
            ? 'cursor-pointer'
            : 'cursor-not-allowed opacity-60'
        } ${loading ? 'opacity-50' : ''}`}
        data-cy={`feedback-action-plan-table-cell-status-${recordKey}`}
        id={`feedback-action-plan-table-cell-status-${recordKey}`}
      >
        <div
          className="inline-flex items-center rounded-full px-2 py-0.5"
          style={{
            backgroundColor: highlightColor,
          }}
        >
          <Tag
            className="font-bold border-none min-w-16 text-center capitalize text-[10px] m-0"
            color={
              statusColors[normalizedStatus] ||
              statusColors[currentStatus] ||
              'default'
            }
          >
            {loading ? 'Updating...' : displayStatus}
          </Tag>
        </div>
        {canUpdate && (
          <IoIosArrowDown
            className="text-gray-700"
            size={12}
            style={{
              display: 'inline-block',
            }}
          />
        )}
      </div>
    </Dropdown>
  );
}
