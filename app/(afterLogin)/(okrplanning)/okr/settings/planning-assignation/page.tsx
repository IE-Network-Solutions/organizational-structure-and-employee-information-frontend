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
import { SearchOutlined, MoreOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { ColumnsType } from 'antd/es/table';
import PlanningAssignationDrawer from './_components/planning-assignation-drawer';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { usePlanningAssignationStore } from '@/store/uistate/features/okrplanning/monitoring-evaluation/planning-assignation-drawer';
import {
  useGetAllAssignedUserGroupedByUser,
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
import { FaPlus } from 'react-icons/fa';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import CustomPagination from '@/components/customPagination';

// Define columns with correct type

const PlanAssignment: React.FC = () => {
  const {
    userId,
    setUserId,
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

  const { data: employeeData, isLoading: employeeDataLoading } =
    useGetAllUsers();
  const { data: allPlanningPeriods } = useGetAllPlanningPeriods();
  const { isMobile, isTablet } = useIsMobile();

  // Use the grouped data directly since it's already in the correct format
  const userToPlanning: GroupedUserWithPlanningPeriods[] =
    allUserWithPlanningPeriodGroupedByUser?.items || [];

  const getEmployeeData = (userId: string) => {
    const employee = employeeData?.items?.find(
      (user: EmployeeData) => user.id === userId,
    );

    // Destructure firstName and lastName with fallback
    const firstName = employee?.firstName || '-';
    const middleName = employee?.middleName || '';
    const lastName = employee?.lastName || '';

    return `${firstName} ${middleName} ${lastName}`;
  };

  const getPlanningPeriodName = (planningPeriodId: string) => {
    const planningPeriod = allPlanningPeriods?.items?.find(
      (period: any) => period.id === planningPeriodId,
    );
    return planningPeriod?.name;
  };

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
  const onChange = (value: string | undefined) => {
    const id = value ? value : null;
    setUserId(id);
  };
  const dataSources = userToPlanning
    ?.filter((item: GroupedUserWithPlanningPeriods) => {
      if (!employeeData?.items) return true;

      // Find the employee in the active employees list
      const employee = employeeData.items.find(
        (user: EmployeeData) => user.id === item.userId,
      );

      // Check if employee exists and is active
      const isActive =
        employee &&
        (employee.deletedAt === null || employee.deletedAt === undefined) &&
        employee.employee_status !== 'inactive' &&
        employee.employee_status !== 'terminated';

      return isActive;
    })
    ?.map((item: GroupedUserWithPlanningPeriods, index: number) => {
      const planNames = item?.planningPeriod
        ?.map((plan: any) => {
          // Use the planningPeriodId to get the planning period name
          const planName = plan?.planningPeriodId
            ? getPlanningPeriodName(plan.planningPeriodId)
            : null;
          return planName;
        })
        .filter(Boolean);

      return {
        id: index + 1,
        name: (
          <Tooltip
            title={getEmployeeData(item?.userId)}
            id={`okr-planning-assignation-table-employee-tooltip-${item?.userId}`}
            data-cy={`okr-planning-assignation-table-employee-tooltip-${item?.userId}`}
          >
            <div
              className="flex items-center flex-wrap sm:flex-row justify-start gap-2"
              id={`okr-planning-assignation-table-employee-wrapper-${item?.userId}`}
              data-cy={`okr-planning-assignation-table-employee-wrapper-${item?.userId}`}
            >
              <div
                className="flex items-center justify-start gap-2"
                id={`okr-planning-assignation-table-employee-info-${item?.userId}`}
                data-cy={`okr-planning-assignation-table-employee-info-${item?.userId}`}
              >
                <div
                  id={`okr-planning-assignation-table-employee-avatar-wrapper-${item?.userId}`}
                  data-cy={`okr-planning-assignation-table-employee-avatar-wrapper-${item?.userId}`}
                >
                  {item?.profileImage ? (
                    <Avatar
                      size={20}
                      src={item?.profileImage}
                      data-cy={`okr-planning-assignation-table-employee-avatar-${item?.userId}`}
                    />
                  ) : (
                    <Avatar
                      size={20}
                      data-cy={`okr-planning-assignation-table-employee-avatar-initials-${item?.userId}`}
                    >
                      {getEmployeeData(item?.userId)
                        .split(' ')
                        .map((name: string) => name[0]?.toUpperCase())
                        .join('')
                        .slice(0, 2)}
                    </Avatar>
                  )}
                </div>
                <span
                  id={`okr-planning-assignation-table-employee-name-text-${item?.userId}`}
                  data-cy={`okr-planning-assignation-table-employee-name-text-${item?.userId}`}
                >
                  {getEmployeeData(item?.userId)}
                </span>
              </div>
            </div>
          </Tooltip>
        ),
        nameString: getEmployeeData(item?.userId),
        plans: planNames?.join(', ') || '-',
        key: item?.userId,
        createdAt: item?.planningPeriod?.[0]?.createdAt,
        updatedAt: item?.lastUpdated, // Assign latest updatedAt
        actions: {
          edit: () => handleEdit(item),
          delete: () => handleDelete(item),
        },
      };
    });

  const onPageChange = (page: number, pageSize?: number) => {
    setPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: 'Employee Name',
      dataIndex: 'name',
      key: 'name',
      render: (notused, record) => (
        <span
          id={`okr-planning-assignation-table-employee-name-${record?.key}`}
          data-cy={`okr-planning-assignation-table-employee-name-${record?.key}`}
        >
          {employeeDataLoading ? (
            <Spin
              size="small"
              data-cy={`okr-planning-assignation-table-employee-name-loading-${record?.key}`}
            />
          ) : (
            record?.name
          )}
        </span>
      ),
      sorter: (a, b) => (a.nameString || '').localeCompare(b.nameString || ''),
    },
    {
      title: 'Plans', // Assuming you want to display plan names
      dataIndex: 'plans',
      key: 'plans',
    },
    {
      title: 'last Update', // Displaying a static date for now
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (notused, record) =>
        dayjs(record?.updatedAt).format('DD MMM YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      // eslint-disable-next-line
      render: (_: any, record: any) => (
        <div
          className="flex items-center space-x-1"
          id={`okr-planning-assignation-table-actions-${record?.key}`}
          data-cy={`okr-planning-assignation-table-actions-${record?.key}`}
        >
          <AccessGuard
            data-cy="okr-planning-assignation-table-edit-button-access-guard-display-guard"
            permissions={[Permissions.UpdateAssignedPlanningPeriod]}
          >
            <button
              className="bg-[#2F78EE] font-bold text-white rounded px-2 py-1 text-xs"
              onClick={() => record.actions.edit()}
              style={{ marginRight: 8 }}
              id={`okr-planning-assignation-table-edit-button-${record?.key}`}
              data-cy={`okr-planning-assignation-table-edit-button-${record?.key}`}
            >
              <MdModeEditOutline
                id={`okr-planning-assignation-table-edit-icon-${record?.key}`}
                data-cy={`okr-planning-assignation-table-edit-icon-${record?.key}`}
              />
            </button>
          </AccessGuard>
          <AccessGuard
            data-cy="okr-planning-assignation-table-delete-button-access-guard-display-guard"
            permissions={[Permissions.DeleteAssignedPlanningPeriod]}
          >
            <Popconfirm
              title="Are you sure you want to delete this item?"
              onConfirm={() => record.actions.delete()}
              okText="Yes"
              cancelText="No"
              id={`okr-planning-assignation-table-delete-popconfirm-${record?.key}`}
              data-cy={`okr-planning-assignation-table-delete-popconfirm-${record?.key}`}
            >
              <button
                className="bg-red-600 font-bold text-white rounded px-2 py-1 text-xs"
                id={`okr-planning-assignation-table-delete-button-${record?.key}`}
                data-cy={`okr-planning-assignation-table-delete-button-${record?.key}`}
              >
                <MdDeleteForever
                  id={`okr-planning-assignation-table-delete-icon-${record?.key}`}
                  data-cy={`okr-planning-assignation-table-delete-icon-${record?.key}`}
                />
              </button>
            </Popconfirm>
          </AccessGuard>
        </div>
      ),
    },
  ];
  return (
    <div
      className="p-5 rounded-2xl shadow-md bg-white h-full"
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
                    className="bg-white border border-[#d9d9d9] rounded-[16px] p-5 hover:shadow-sm transition-shadow relative"
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
                            size={48}
                            src={item?.profileImage}
                            data-cy={`okr-planning-assignation-card-avatar-${item.userId}`}
                          />
                        ) : (
                          <Avatar
                            size={48}
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
                          className="mb-2"
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

      <div
        className="overflow-x-auto scrollbar-none w-full"
        id="okr-planning-assignation-table-wrapper-display-div"
        data-cy="okr-planning-assignation-table-wrapper-display-div"
      >
        <Table
          loading={allUserPlanningPeriodGroupedByUserLoading}
          dataSource={dataSources}
          columns={columns}
          pagination={false}
          id="okr-planning-assignation-table-display-table"
          data-cy="okr-planning-assignation-table-display-table"
        />

        {isMobile || isTablet ? (
          <CustomMobilePagination
            totalResults={
              allUserWithPlanningPeriodGroupedByUser?.meta?.totalItems ?? 0
            }
            pageSize={pageSize}
            onChange={onPageChange}
            onShowSizeChange={onPageChange}
            data-cy="okr-planning-assignation-mobile-pagination-display-pagination"
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
            data-cy="okr-planning-assignation-pagination-display-pagination"
          />
        )}
      </div>

      <PlanningAssignationDrawer
        open={open}
        onClose={onClose}
        data-cy="okr-planning-assignation-drawer-display-drawer"
      />
      <DeleteModal
        open={openDeleteModal}
        onConfirm={() => handleDeletePlanningAssignation(deletedId)}
        onCancel={onCloseDeleteModal}
        data-cy="okr-planning-assignation-delete-modal-display-modal"
      />
    </div>
  );
};

export default PlanAssignment;
