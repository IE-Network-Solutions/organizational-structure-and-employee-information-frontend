'use client';
import { Input, Popconfirm, MenuProps } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import PlanningAssignationModal from './_components/planning-assignation-drawer';
import PlanningAssignationPageSkeleton from './_components/planningAssignationPageSkeleton';
import AssigneeCard from './_components/assigneeCard';
import EmptyState from '@/components/empty';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { usePlanningAssignationStore } from '@/store/uistate/features/okrplanning/monitoring-evaluation/planning-assignation-drawer';
import {
  useGetAllAssignedUserGroupedByUser,
  useGetAllAssignedUsersGroupedForSearch,
  useGetAllPlanningPeriods,
} from '@/store/server/features/employees/planning/planningPeriod/queries';
import { GroupedUserWithPlanningPeriods } from '@/store/server/features/employees/planning/planningPeriod/interface';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { EmployeeData } from '@/types/dashboard/adminManagement';
import { MdDeleteForever, MdModeEditOutline } from 'react-icons/md';
import { useDeletePlanningUser } from '@/store/server/features/employees/planning/planningPeriod/mutation';
import { useOKRSettingStore } from '@/store/uistate/features/okrplanning/okrSetting';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import CustomPagination from '@/components/customPagination';
import { useMemo, useCallback } from 'react';
import { useDebounce } from '@/utils/useDebounce';

const PlanAssignment: React.FC = () => {
  const {
    userId,
    setSelectedPlanningUser,
    setPage,
    page,
    pageSize,
    setPageSize,
  } = useOKRSettingStore();
  const { mutate: deletePlanningAssign } = useDeletePlanningUser();
  const {
    searchTerm,
    debouncedSearch,
    setSearchTerm,
    setDebouncedSearch,
    open,
    setOpen,
    openDeleteModal,
    setOpenDeleteModal,
    deletedId,
  } = usePlanningAssignationStore();
  const hasSearch = debouncedSearch.trim().length > 0;

  const applyDebouncedSearch = useDebounce((value: string) => {
    setDebouncedSearch(value);
  }, 400);

  const {
    data: allUserWithPlanningPeriodGroupedByUser,
    isLoading: allUserPlanningPeriodGroupedByUserLoading,
  } = useGetAllAssignedUserGroupedByUser(
    page,
    pageSize,
    userId || '',
    undefined,
  );

  const { data: globalSearchGroupedByUser, isLoading: globalSearchLoading } =
    useGetAllAssignedUsersGroupedForSearch(debouncedSearch);

  const { data: employeeData } = useGetAllUsers();
  const { data: allPlanningPeriods } = useGetAllPlanningPeriods();
  const { isMobile, isTablet } = useIsMobile();

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      setPage(1);
      const trimmed = value.trim();
      if (!trimmed) {
        setDebouncedSearch('');
        return;
      }
      applyDebouncedSearch(trimmed);
    },
    [applyDebouncedSearch, setPage, setSearchTerm, setDebouncedSearch],
  );

  const userToPlanning: GroupedUserWithPlanningPeriods[] = hasSearch
    ? globalSearchGroupedByUser?.items || []
    : allUserWithPlanningPeriodGroupedByUser?.items || [];

  const employeeById = useMemo(
    () =>
      new Map<string, EmployeeData>(
        (employeeData?.items ?? []).map((user: EmployeeData) => [
          user.id,
          user,
        ]),
      ),
    [employeeData],
  );

  const getEmployeeData = useMemo(() => {
    return (userId: string) => {
      const employee = employeeData?.items?.find(
        (user: EmployeeData) => user.id === userId,
      );
      const firstName = employee?.firstName || '-';
      const middleName = employee?.middleName || '';
      const lastName = employee?.lastName || '';
      return `${firstName} ${middleName} ${lastName}`;
    };
  }, [employeeData]);

  /** Every assigned plan of a user, longest interval first (matches the modal). */
  const getAssignedPlans = useMemo(() => {
    return (item: GroupedUserWithPlanningPeriods) =>
      (item?.planningPeriod ?? [])
        .map((assignment) => {
          const period =
            assignment.planningPeriod ??
            allPlanningPeriods?.items?.find(
              (p: any) => p.id === assignment.planningPeriodId,
            );
          return {
            id: assignment.planningPeriodId,
            name: period?.name ?? '-',
            intervalLength: Number(period?.intervalLength) || 0,
            drivesOkrProgress: !!assignment.drivesOkrProgress,
          };
        })
        .sort((a, b) => b.intervalLength - a.intervalLength);
  }, [allPlanningPeriods]);

  const showDrawer = () => {
    setOpen(true);
  };

  const handleEdit = (item: any) => {
    setSelectedPlanningUser(item);
    showDrawer();
  };
  const handleDelete = (item: any) => {
    deletePlanningAssign(item?.userId);
  };

  const onClose = () => {
    setOpen(false);
  };
  const onCloseDeleteModal = () => {
    setOpenDeleteModal(false);
  };
  function handleDeletePlanningAssignation(id: string) {
    deletePlanningAssign(id, {
      onSuccess: () => {
        onCloseDeleteModal();
      },
    });
  }
  const filteredData = useMemo(() => {
    const searchLower = debouncedSearch.trim().toLowerCase();

    return userToPlanning
      ?.filter((item: GroupedUserWithPlanningPeriods) => {
        if (!employeeData?.items) return true;
        const employee = employeeData.items.find(
          (user: EmployeeData) => user.id === item.userId,
        );
        const isActive =
          employee &&
          (employee.deletedAt === null || employee.deletedAt === undefined) &&
          employee.employee_status !== 'inactive' &&
          employee.employee_status !== 'terminated';
        if (!isActive) return false;
        if (!searchLower) return true;
        const employeeName = getEmployeeData(item?.userId).toLowerCase();
        return employeeName.includes(searchLower);
      })
      ?.map((item: GroupedUserWithPlanningPeriods) => {
        // Search path groups rows in the browser and has no lastUpdated.
        const lastUpdated =
          item?.lastUpdated ??
          item?.planningPeriod
            ?.map((assignment) => assignment.updatedAt)
            .filter(Boolean)
            .sort()
            .pop();
        return {
          ...item,
          employeeName: getEmployeeData(item?.userId),
          assignedPlans: getAssignedPlans(item),
          updatedAt: lastUpdated,
        };
      });
  }, [
    userToPlanning,
    employeeData,
    debouncedSearch,

    getEmployeeData,
    getAssignedPlans,
  ]);

  const paginatedData = useMemo(() => {
    if (!hasSearch) return filteredData;
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, hasSearch, page, pageSize]);

  const rawApiCount = userToPlanning.length;
  const isSearchFilteredEmpty =
    filteredData.length === 0 && hasSearch && rawApiCount > 0;
  const isInactiveFilteredEmpty =
    filteredData.length === 0 && !hasSearch && rawApiCount > 0;

  const paginationTotal = hasSearch
    ? filteredData.length
    : (allUserWithPlanningPeriodGroupedByUser?.meta?.totalItems ?? 0);

  const isListLoading = hasSearch
    ? globalSearchLoading
    : allUserPlanningPeriodGroupedByUserLoading;

  const canAssignPlanningPeriod = AccessGuard.checkAccess({
    permissions: [Permissions.AssignPlanningPeriod],
  });

  const openCreateAssignee = () => {
    setSelectedPlanningUser(null);
    setOpen(true);
  };

  const onPageChange = (page: number, pageSize?: number) => {
    setPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const getMenuItems = (
    item: GroupedUserWithPlanningPeriods,
  ): MenuProps['items'] => {
    return [
      {
        key: 'edit',
        label: (
          <AccessGuard
            permissions={[Permissions.UpdateAssignedPlanningPeriod]}
            data-cy={`okr-planning-assignation-card-edit-access-guard-${item?.userId}`}
          >
            <div
              className="flex items-center gap-3 py-1"
              onClick={() => handleEdit(item)}
              id={`okr-planning-assignation-card-edit-menu-item-${item?.userId}`}
              data-cy={`okr-planning-assignation-card-edit-menu-item-${item?.userId}`}
            >
              <MdModeEditOutline className="text-[#595959] text-xl" />
              <span
                className="text-[15px] text-[#262626]"
                data-cy={`okr-planning-assignation-card-edit-text-${item?.userId}`}
              >
                Edit
              </span>
            </div>
          </AccessGuard>
        ),
      },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        label: (
          <AccessGuard
            permissions={[Permissions.DeleteAssignedPlanningPeriod]}
            data-cy={`okr-planning-assignation-card-delete-access-guard-${item?.userId}`}
          >
            <Popconfirm
              title="Are you sure you want to delete this item?"
              onConfirm={() => handleDelete(item)}
              okText="Yes"
              cancelText="No"
              id={`okr-planning-assignation-card-delete-popconfirm-${item?.userId}`}
              data-cy={`okr-planning-assignation-card-delete-popconfirm-${item?.userId}`}
            >
              <div
                className="flex items-center gap-3 py-1 text-red-600"
                id={`okr-planning-assignation-card-delete-menu-item-${item?.userId}`}
                data-cy={`okr-planning-assignation-card-delete-menu-item-${item?.userId}`}
              >
                <MdDeleteForever className="text-xl" />
                <span
                  className="text-[15px]"
                  data-cy={`okr-planning-assignation-card-delete-text-${item?.userId}`}
                >
                  Delete
                </span>
              </div>
            </Popconfirm>
          </AccessGuard>
        ),
      },
    ];
  };

  return (
    <div
      className="w-full"
      id="okr-planning-assignation-container-display-div"
      data-cy="okr-planning-assignation-container-display-div"
    >
      <div
        className="flex flex-col"
        id="okr-planning-assignation-main-container"
        data-cy="okr-planning-assignation-main-container"
      >
        {/* Search Bar */}
        <div
          className="mb-5"
          data-cy="okr-planning-assignation-search-container"
        >
          <Input
            placeholder="Search Employee"
            addonAfter={<SearchOutlined className="text-[#8c8c8c]" />}
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            allowClear
            className="w-full max-w-md h-11 custom-search-input"
            id="okr-planning-assignation-search-input"
            data-cy="okr-planning-assignation-search-input"
          />
        </div>

        {/* Cards Grid Content - Scrollable Area */}
        <div
          className="flex-1 overflow-y-auto pr-2 custom-scrollbar"
          data-cy="okr-planning-assignation-cards-scroll-container"
        >
          {isListLoading ? (
            <PlanningAssignationPageSkeleton />
          ) : filteredData.length === 0 ? (
            <div
              className="flex min-h-[240px] items-center justify-center py-12"
              data-cy="okr-planning-assignation-empty"
              id="okrPlanningAssignationEmptyId"
            >
              <EmptyState
                title={
                  isSearchFilteredEmpty
                    ? 'No employees match your search'
                    : isInactiveFilteredEmpty
                      ? 'No active assignations to display'
                      : 'No planning assignations yet'
                }
                description={
                  isSearchFilteredEmpty
                    ? 'Try a different name or clear the search.'
                    : isInactiveFilteredEmpty
                      ? 'Assigned employees may be inactive or removed. Assign planning periods to active employees.'
                      : 'Assign employees to a planning period to get started.'
                }
                actionText={
                  canAssignPlanningPeriod && !isSearchFilteredEmpty
                    ? 'Add assignee'
                    : undefined
                }
                onAction={
                  canAssignPlanningPeriod && !isSearchFilteredEmpty
                    ? openCreateAssignee
                    : undefined
                }
              />
            </div>
          ) : (
            <div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
              id="okr-planning-assignation-cards-grid"
              data-cy="okr-planning-assignation-cards-grid"
            >
              {paginatedData.map((item: any) => (
                <AssigneeCard
                  key={item.userId}
                  userId={item.userId}
                  bulkEmployee={employeeById.get(item.userId)}
                  plans={item.assignedPlans}
                  updatedAt={item.updatedAt}
                  menuItems={getMenuItems(item)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination Container inside main box */}
        {!isListLoading && paginationTotal > 0 && (
          <div
            className="custom-pagination-container"
            data-cy="okr-planning-assignation-pagination-container"
          >
            {isMobile || isTablet ? (
              <CustomMobilePagination
                totalResults={paginationTotal}
                pageSize={pageSize}
                onChange={onPageChange}
                onShowSizeChange={onPageChange}
                data-cy="okr-planning-assignation-mobile-pagination"
              />
            ) : (
              <CustomPagination
                current={page}
                total={paginationTotal}
                pageSize={pageSize}
                onChange={onPageChange}
                onShowSizeChange={(pageSize) => {
                  setPageSize(pageSize);
                  setPage(1);
                }}
                data-cy="okr-planning-assignation-pagination"
              />
            )}
          </div>
        )}
      </div>

      <PlanningAssignationModal
        open={open}
        onClose={onClose}
        data-cy="okr-planning-assignation-drawer"
      />
      <DeleteModal
        open={openDeleteModal}
        onConfirm={() => handleDeletePlanningAssignation(deletedId)}
        onCancel={onCloseDeleteModal}
        data-cy="okr-planning-assignation-delete-modal"
      />
      <style jsx global data-cy="okr-planning-assignation-styles">{`
        /* Search Input Styling */
        .custom-search-input.ant-input-group-wrapper {
          height: 44px !important;
        }
        .custom-search-input.ant-input-group-wrapper .ant-input-wrapper {
          display: flex !important;
          align-items: center !important;
          border: 1px solid #d9d9d9 !important;
          border-radius: 8px !important;
          overflow: hidden !important;
          background-color: white !important;
          height: 44px !important;
        }
        .custom-search-input.ant-input-group-wrapper .ant-input {
          border: none !important;
          box-shadow: none !important;
          height: 44px !important;
          padding-left: 12px !important;
          font-size: 14px !important;
          color: #262626 !important;
        }
        .custom-search-input.ant-input-group-wrapper .ant-input::placeholder {
          color: #bfbfbf !important;
        }
        .custom-search-input.ant-input-group-wrapper .ant-input-group-addon {
          background-color: white !important;
          border: none !important;
          border-left: 1px solid #f0f0f0 !important;
          padding: 0 24px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          height: 44px !important;
        }
        .custom-search-input.ant-input-group-wrapper
          .ant-input-group-addon
          .anticon {
          font-size: 18px !important;
          color: #595959 !important;
        }
        .custom-search-input.ant-input-group-wrapper:hover {
          border-color: #bfbfbf !important;
        }

        /* Force white background and remove padding for mobile pagination in this specific view */
        .custom-pagination-container .bg-gray-100 {
          background-color: #ffffff !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
        }
      `}</style>
    </div>
  );
};

export default PlanAssignment;
