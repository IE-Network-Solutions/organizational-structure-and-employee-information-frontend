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
import { useGetAllAssignedUserGroupedByUser } from '@/store/server/features/employees/planning/planningPeriod/queries';
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
  const dataSources = userToPlanning?.map(
    (item: GroupedUserWithPlanningPeriods, index: number) => {
      return {
        id: index + 1,
        name: (
          <Tooltip title={getEmployeeData(item?.userId)}>
            <div className="flex items-center flex-wrap sm:flex-row justify-start gap-2">
              <div className="flex items-center justify-start gap-2">
                <div>
                  {item?.profileImage ? (
                    <Avatar size={20} src={item?.profileImage} />
                  ) : (
                    <Avatar size={20}>
                      {getEmployeeData(item?.userId)
                        .split(' ')
                        .map((name: string) => name[0]?.toUpperCase())
                        .join('')
                        .slice(0, 2)}
                    </Avatar>
                  )}
                </div>
                <span>{getEmployeeData(item?.userId)}</span>
              </div>
            </div>
          </Tooltip>
        ),
        nameString: getEmployeeData(item?.userId),
        plans:
          item?.planningPeriod?.map((plan: any) => plan?.name).join(', ') ||
          '-',
        key: item?.userId,
        createdAt: item?.planningPeriod?.[0]?.createdAt,
        updatedAt: item?.lastUpdated, // Assign latest updatedAt
        actions: {
          edit: () => handleEdit(item),
          delete: () => handleDelete(item),
        },
      };
    },
  );

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
        <span>
          {employeeDataLoading ? <Spin size="small" /> : record?.name}
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
        <div className="flex items-center space-x-1">
          <AccessGuard permissions={[Permissions.UpdateAssignedPlanningPeriod]}>
            <button
              className="bg-[#2F78EE] font-bold text-white rounded px-2 py-1 text-xs"
              onClick={() => record.actions.edit()}
              style={{ marginRight: 8 }}
            >
              <MdModeEditOutline />
            </button>
          </AccessGuard>
          <AccessGuard permissions={[Permissions.DeleteAssignedPlanningPeriod]}>
            <Popconfirm
              title="Are you sure you want to delete this item?"
              onConfirm={() => record.actions.delete()}
              okText="Yes"
              cancelText="No"
            >
              <button className="bg-red-600 font-bold text-white rounded px-2 py-1 text-xs">
                <MdDeleteForever />
              </button>
            </Popconfirm>
          </AccessGuard>
        </div>
      ),
    },
  ];
  return (
    <div className="p-5 rounded-2xl shadow-md bg-white h-full">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold">Plan Assignation</h2>
      </div>
      <div className="flex justify-between">
        <Form.Item id="filterByLeaveRequestUserIds" name="userIds">
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
          />
        </Form.Item>
        <AccessGuard permissions={[Permissions.AssignPlanningPeriod]}>
          <Button
            icon={<FaPlus />}
            onClick={showDrawer}
            className="bg-blue-500 hover:bg-blue-600 focus:bg-blue-600 h-10"
            type="primary"
          >
            <span className="hidden lg:block">Assign</span>
          </Button>
        </AccessGuard>
      </div>

      <div className="overflow-x-auto scrollbar-none w-full">
        <Table
          loading={allUserPlanningPeriodGroupedByUserLoading}
          dataSource={dataSources}
          columns={columns}
          pagination={false}
        />

        {isMobile || isTablet ? (
          <CustomMobilePagination
            totalResults={
              allUserWithPlanningPeriodGroupedByUser?.meta?.totalItems ?? 0
            }
            pageSize={pageSize}
            onChange={onPageChange}
            onShowSizeChange={onPageChange}
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
          />
        )}
      </div>

      <PlanningAssignationDrawer open={open} onClose={onClose} />
      <DeleteModal
        open={openDeleteModal}
        onConfirm={() => handleDeletePlanningAssignation(deletedId)}
        onCancel={onCloseDeleteModal}
      />
    </div>
  );
};

export default PlanAssignment;
