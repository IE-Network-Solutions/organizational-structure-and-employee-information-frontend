'use client';
import {
  Input,
  Popconfirm,
  Avatar,
  Dropdown,
  MenuProps,
  Spin,
  Tag,
} from 'antd';
import { SearchOutlined, EllipsisOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import PlanningAssignationModal from './_components/planning-assignation-drawer';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { usePlanningAssignationStore } from '@/store/uistate/features/okrplanning/monitoring-evaluation/planning-assignation-drawer';
import {
  useGetAllAssignedUserGroupedByUser,
  useGetAllPlanningPeriods,
} from '@/store/server/features/employees/planning/planningPeriod/queries';
import { GroupedUserWithPlanningPeriods } from '@/store/server/features/employees/planning/planningPeriod/interface';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { EmployeeData } from '@/types/dashboard/adminManagement';
import { MdOutlineEdit, MdDeleteOutline } from 'react-icons/md';
import { useDeletePlanningUser } from '@/store/server/features/employees/planning/planningPeriod/mutation';
import { useOKRSettingStore } from '@/store/uistate/features/okrplanning/okrSetting';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import CustomPagination from '@/components/customPagination';
import { useState, useMemo } from 'react';

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
    data: allUserWithPlanningPeriodGroupedByUser,
    isLoading: allUserPlanningPeriodGroupedByUserLoading,
  } = useGetAllAssignedUserGroupedByUser(page, pageSize, userId || '');

  const { data: employeeData } = useGetAllUsers();
  const { data: allPlanningPeriods } = useGetAllPlanningPeriods();
  const { isMobile, isTablet } = useIsMobile();
  const [searchTerm, setSearchTerm] = useState<string>('');

  const userToPlanning: GroupedUserWithPlanningPeriods[] =
    allUserWithPlanningPeriodGroupedByUser?.items || [];

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

  const getPlanningPeriodType = useMemo(() => {
    return (planningPeriodId: string) => {
      const planningPeriod = allPlanningPeriods?.items?.find(
        (period: any) => period.id === planningPeriodId,
      );
      return planningPeriod?.intervalType || 'Daily';
    };
  }, [allPlanningPeriods]);

  const handleEdit = (item: any) => {
    setSelectedPlanningUser(item);
    showDrawer();
  };
  const handleDelete = (item: any) => {
    deletePlanningAssign(item?.userId);
  };

  const { open, setOpen, openDeleteModal, setOpenDeleteModal, deletedId } =
    usePlanningAssignationStore();

  const showDrawer = () => {
    setOpen(true);
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
        if (searchTerm) {
          const employeeName = getEmployeeData(item?.userId).toLowerCase();
          return isActive && employeeName.includes(searchTerm.toLowerCase());
        }
        return isActive;
      })
      ?.map((item: GroupedUserWithPlanningPeriods) => {
        const firstPlanningPeriod = item?.planningPeriod?.[0];
        const planningPeriodType = firstPlanningPeriod?.planningPeriodId
          ? getPlanningPeriodType(firstPlanningPeriod.planningPeriodId)
          : 'daily';
        return {
          ...item,
          employeeName: getEmployeeData(item?.userId),
          planningPeriodType:
            planningPeriodType.toLowerCase() === 'day'
              ? 'Daily'
              : planningPeriodType.charAt(0).toUpperCase() +
                planningPeriodType.slice(1),
          updatedAt: item?.lastUpdated,
        };
      });
  }, [
    userToPlanning,
    employeeData,
    searchTerm,
    allPlanningPeriods,
    getEmployeeData,
    getPlanningPeriodType,
  ]);

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
              <MdOutlineEdit className="text-[#595959] text-xl" />
              <span
                className="text-[15px] text-[#262626]"
                data-cy={`okr-planning-assignation-card-edit-text-${item?.userId}`}
              >
                Edit OKR
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
                <MdDeleteOutline className="text-xl" />
                <span
                  className="text-[15px]"
                  data-cy={`okr-planning-assignation-card-delete-text-${item?.userId}`}
                >
                  Delete OKR
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
        className="border border-[#f0f0f0] rounded-xl pt-5 px-8 pb-8 bg-white h-[calc(100vh-320px)] flex flex-col"
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
            onChange={(e) => setSearchTerm(e.target.value)}
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
          {allUserPlanningPeriodGroupedByUserLoading ? (
            <div
              className="flex justify-center items-center py-20"
              data-cy="okr-planning-assignation-loading"
            >
              <Spin size="large" />
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              id="okr-planning-assignation-cards-grid"
              data-cy="okr-planning-assignation-cards-grid"
            >
              {filteredData.map((item: any) => {
                const initials = item.employeeName
                  .split(' ')
                  .map((name: string) => name[0]?.toUpperCase())
                  .join('')
                  .slice(0, 2);

                return (
                  <div
                    key={item.userId}
                    className="bg-white border border-[#d9d9d9] rounded-[8px] py-2 px-4 min-h-[80px] hover:shadow-sm transition-shadow relative"
                    id={`okr-planning-assignation-card-${item.userId}`}
                    data-cy={`okr-planning-assignation-card-${item.userId}`}
                  >
                    <div
                      className="flex items-center gap-4"
                      data-cy={`okr-planning-assignation-card-content-${item.userId}`}
                    >
                      {/* Avatar */}
                      <div
                        className="flex-shrink-0"
                        id={`okr-planning-assignation-card-avatar-wrapper-${item.userId}`}
                        data-cy={`okr-planning-assignation-card-avatar-wrapper-${item.userId}`}
                      >
                        {item?.profileImage ? (
                          <Avatar
                            size={24}
                            src={item?.profileImage}
                            data-cy={`okr-planning-assignation-card-avatar-${item.userId}`}
                          />
                        ) : (
                          <Avatar
                            size={24}
                            className="bg-[#f0f0f0] text-[#8c8c8c]"
                            data-cy={`okr-planning-assignation-card-avatar-initials-${item.userId}`}
                          >
                            {initials}
                          </Avatar>
                        )}
                      </div>

                      {/* Content block */}
                      <div
                        className="flex-1 min-w-0 flex flex-col justify-center"
                        data-cy={`okr-planning-assignation-card-content-block-${item.userId}`}
                      >
                        {/* Tag */}
                        <div
                          className="mb-0"
                          data-cy={`okr-planning-assignation-card-tag-wrapper-${item.userId}`}
                        >
                          <Tag
                            className="px-2 py-0.5 text-[12px] font-medium text-[#595959] border-[#d9d9d9] bg-[#fafafa] rounded-[4px]"
                            id={`okr-planning-assignation-card-tag-${item.userId}`}
                            data-cy={`okr-planning-assignation-card-tag-${item.userId}`}
                          >
                            {item.planningPeriodType}
                          </Tag>
                        </div>

                        {/* Name */}
                        <p
                          className="text-[14px] font-semibold text-[rgba(0,0,0,0.7)] mb-0.5 truncate"
                          id={`okr-planning-assignation-card-name-${item.userId}`}
                          data-cy={`okr-planning-assignation-card-name-${item.userId}`}
                        >
                          {item.employeeName}
                        </p>

                        {/* Date */}
                        <div
                          className="text-[13px] text-[#8c8c8c]"
                          data-cy={`okr-planning-assignation-card-date-${item.userId}`}
                        >
                          {item.updatedAt
                            ? dayjs(item.updatedAt).format('DD MMM YYYY')
                            : '-'}
                        </div>
                      </div>

                      {/* Menu button */}
                      <div
                        className="flex-shrink-0"
                        id={`okr-planning-assignation-card-menu-wrapper-${item.userId}`}
                        data-cy={`okr-planning-assignation-card-menu-wrapper-${item.userId}`}
                      >
                        <Dropdown
                          menu={{ items: getMenuItems(item) }}
                          trigger={['click']}
                          placement="bottomRight"
                          overlayClassName="custom-menu-dropdown"
                          data-cy={`okr-planning-assignation-card-dropdown-${item.userId}`}
                        >
                          <button
                            className="w-6 h-6 flex items-center justify-center border border-[#d9d9d9] rounded-[6px] text-[#374151] transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            data-cy={`okr-planning-assignation-card-menu-button-${item.userId}`}
                          >
                            <svg width="14" height="4" viewBox="0 0 14 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="2.5" cy="2" r="1.5" fill="currentColor"/>
                              <circle cx="7" cy="2" r="1.5" fill="currentColor"/>
                              <circle cx="11.5" cy="2" r="1.5" fill="currentColor"/>
                            </svg>
                          </button>
                        </Dropdown>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination Container inside main box */}
        {!allUserPlanningPeriodGroupedByUserLoading && (
          <div
            className="custom-pagination-container"
            data-cy="okr-planning-assignation-pagination-container"
          >
            {isMobile || isTablet ? (
              <CustomMobilePagination
                totalResults={
                  allUserWithPlanningPeriodGroupedByUser?.meta?.totalItems ?? 0
                }
                pageSize={pageSize}
                onChange={onPageChange}
                onShowSizeChange={onPageChange}
                data-cy="okr-planning-assignation-mobile-pagination"
              />
            ) : (
              <CustomPagination
                current={page}
                total={
                  allUserWithPlanningPeriodGroupedByUser?.meta?.totalItems ?? 0
                }
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
