'use client';
import { Table, Button, Popconfirm, Form, Select, Spin } from 'antd';
import dayjs from 'dayjs';
import { ColumnsType } from 'antd/es/table';
import PlanningAssignationDrawer from './_components/planning-assignation-drawer';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { usePlanningAssignationStore } from '@/store/uistate/features/okrplanning/monitoring-evaluation/planning-assignation-drawer';
import {
  useGetAllAssignedUser,
  useGetAllPlanningPeriods,
} from '@/store/server/features/employees/planning/planningPeriod/queries';
import {
  GroupedUser,
  PlanningPeriodUser,
} from '@/store/server/features/employees/planning/planningPeriod/interface';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { EmployeeData } from '@/types/dashboard/adminManagement';
import { MdDeleteForever, MdModeEditOutline } from 'react-icons/md';
import { useDeletePlanningUser } from '@/store/server/features/employees/planning/planningPeriod/mutation';
import { useOKRSettingStore } from '@/store/uistate/features/okrplanning/okrSetting';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

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
    data: allUserWithPlanningPeriod,
    isLoading: allUserPlanningPeriodLoading,
  } = useGetAllAssignedUser(page, pageSize, userId || '');
  const { data: getAllPlanningPeriod } = useGetAllPlanningPeriods();
  const { data: employeeData, isLoading: employeeDataLoading } =
    useGetAllUsers();
  const userToPlanning = allUserWithPlanningPeriod?.items.reduce(
    (acc: GroupedUser[], item: PlanningPeriodUser) => {
      let group = acc.find((group) => group.userId === item.userId);
      if (!group) {
        group = { userId: item.userId, items: [] };
        acc.push(group);
      }
      group.items.push(item);
      return acc;
    },
    [] as GroupedUser[],
  );

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

  const getPlanningPeriod = (planningPeriodId: string) => {
    const planningPeriod = getAllPlanningPeriod?.items?.find(
      (planning: any) => planning.id === planningPeriodId,
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

  const dataSources = userToPlanning?.map((item: any, index: number) => {
    const latestUpdatedAt = item?.items
      ? item.items.reduce((latest: any, currentItem: any) => {
          return !latest ||
            new Date(currentItem.updatedAt) > new Date(latest.updatedAt)
            ? currentItem
            : latest;
        }, null)?.updatedAt
      : null;

    return {
      id: index + 1,
      name: getEmployeeData(item?.userId),
      plans: item?.items
        ?.map((plan: any) => getPlanningPeriod(plan.planningPeriodId))
        .join(', '),
      key: item?.userId,
      createdAt: item?.items?.[0]?.createdAt,
      updatedAt: latestUpdatedAt, // Assign latest updatedAt
      actions: {
        edit: () => handleEdit(item),
        delete: () => handleDelete(item),
      },
    };
  });

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
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
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
        <div>
          <AccessGuard permissions={[Permissions.UpdateAssignedPlanningPeriod]}>
            <button
              className="bg-green-700 font-bold text-white rounded px-2 py-1 text-xs"
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
    <div className="p-6 rounded-lg shadow-md">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold">Plan Assignation</h2>
        <AccessGuard permissions={[Permissions.AssignPlanningPeriod]}>
          <Button
            onClick={showDrawer}
            className="bg-blue text-white h-8 font-semibold w-32 border-none"
          >
            Assign
          </Button>
        </AccessGuard>
      </div>

      <Form.Item id="filterByLeaveRequestUserIds" name="userIds">
        <Select
          placeholder="Select a person"
          showSearch
          style={{ width: 300 }}
          className="mb-4"
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

      <Table
        loading={allUserPlanningPeriodLoading}
        dataSource={dataSources}
        columns={columns}
        pagination={{
          pageSize: allUserWithPlanningPeriod?.meta.itemsPerPage, // Set the page size from your meta data
          current: allUserWithPlanningPeriod?.meta.currentPage, // Current page number
          total: allUserWithPlanningPeriod?.meta.totalItems, // Total number of items

          showSizeChanger: true, // Optional: Allow users to change page size
          onChange: (page, pageSize) => {
            setPage(page);
            setPageSize(pageSize);
          },
        }}
      />

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
