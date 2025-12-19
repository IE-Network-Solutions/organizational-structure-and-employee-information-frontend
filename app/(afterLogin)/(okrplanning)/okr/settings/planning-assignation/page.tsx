'use client';
import {
  Table,
  Button,
  Popconfirm,
  Form,
  Select,
  Spin,
  Tooltip,
  Avatar,
} from 'antd';
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
        className="flex justify-between mb-4"
        id="okr-planning-assignation-header-display-div"
        data-cy="okr-planning-assignation-header-display-div"
      >
        <h2
          className="text-lg font-semibold"
          id="okr-planning-assignation-title-display-h2"
          data-cy="okr-planning-assignation-title-display-h2"
        >
          Plan Assignation
        </h2>
      </div>
      <div
        className="flex justify-between"
        id="okr-planning-assignation-filters-display-div"
        data-cy="okr-planning-assignation-filters-display-div"
      >
        <Form.Item
          id="filterByLeaveRequestUserIds"
          data-cy="filterByLeaveRequestUserIds"
          name="userIds"
        >
          <Select
            placeholder="Select a person"
            showSearch
            className="mb-4 w-60 sm:w-80 h-10"
            allowClear
            optionFilterProp="label"
            onChange={onChange}
            options={employeeData?.items?.map((list: any) => ({
              value: list?.id,
              label: `${list?.firstName ? list?.firstName : ''} ${list?.middleName ? list?.middleName : ''} ${list?.lastName ? list?.lastName : ''}`,
            }))}
            loading={employeeDataLoading}
            id="okr-planning-assignation-user-select-display-select"
            data-cy="okr-planning-assignation-user-select-display-select"
          />
        </Form.Item>
        <AccessGuard
          data-cy="okr-planning-assignation-assign-button-access-guard-display-guard"
          permissions={[Permissions.AssignPlanningPeriod]}
        >
          <Button
            icon={
              <FaPlus data-cy="okr-planning-assignation-assign-button-icon-display-button" />
            }
            onClick={showDrawer}
            className="bg-blue-500 hover:bg-blue-600 focus:bg-blue-600 h-10"
            type="primary"
            id="okr-planning-assignation-assign-button-display-button"
            data-cy="okr-planning-assignation-assign-button-display-button"
          >
            <span
              className="hidden lg:block"
              id="okr-planning-assignation-assign-button-text-display-span"
              data-cy="okr-planning-assignation-assign-button-text-display-span"
            >
              Assign
            </span>
          </Button>
        </AccessGuard>
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
