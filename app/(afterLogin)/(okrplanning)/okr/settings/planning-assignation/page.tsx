'use client';
import { Table, Button, Input, Popconfirm } from 'antd';
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
  const { setSelectedPlanningUser, setPage, page, pageSize, setPageSize } =
    useOKRSettingStore();
  const { mutate: deletePlanningAssign } = useDeletePlanningUser();
  const { data: allUserWithPlanningPeriod } = useGetAllAssignedUser(
    page,
    pageSize,
  );
  const { data: getAllPlanningPeriod } = useGetAllPlanningPeriods();
  const { data: employeeData } = useGetAllUsers();
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
    const lastName = employee?.lastName || '';

    return `${firstName} ${lastName}`;
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

  const dataSources = userToPlanning?.map((item: any, index: number) => ({
    id: index + 1, // Assigning a unique id based on the index
    name: getEmployeeData(item?.userId), // Assuming getEmployeeData returns an object with a name property
    plans: item?.items
      ?.map((plan: any) => getPlanningPeriod(plan.planningPeriodId)) // Get each plan name
      .join(', '), // Combine plan names into a single string
    key: item?.userId, // Using userId as the key to ensure uniqueness
    actions: {
      // Adding actions property
      edit: () => handleEdit(item),
      delete: () => handleDelete(item),
    },
  }));

  const columns: ColumnsType<any> = [
    {
      title: 'Employee Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Plans', // Assuming you want to display plan names
      dataIndex: 'plans',
      key: 'plans',
    },
    {
      title: 'Date', // Displaying a static date for now
      dataIndex: 'date',
      key: 'date',
      render: () => dayjs('2023-09-12').format('DD MMM YYYY'),
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

      <Input.Search
        placeholder="Search Rule"
        className="mb-4"
        style={{ width: 300 }}
      />

      <Table
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
