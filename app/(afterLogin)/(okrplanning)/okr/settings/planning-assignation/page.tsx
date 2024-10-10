'use client';
import { Table, Button, Input, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { ColumnsType } from 'antd/es/table';
import PlanningAssignationDrawer from './_components/planning-assignation-drawer';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { PlanningAssignation } from '@/store/uistate/features/okrplanning/monitoring-evaluation/planning-assignation-drawer/interface';
import { usePlanningAssignationStore } from '@/store/uistate/features/okrplanning/monitoring-evaluation/planning-assignation-drawer';
import { useDeletePlanningAssignation } from '@/store/server/features/okrplanning/monitoring-evaluation/planning-assignation/mutations';

const dataSource: PlanningAssignation[] = [
  {
    id: '1',
    name: 'Pristia Candra',
    plan: 'Daily, Weekly',
    date: dayjs('2023-09-12').format('DD MMM YYYY'),
  },
  {
    id: '2',
    name: 'Hanna Baptista',
    plan: 'Daily, Quarterly',
    date: dayjs('2023-09-27').format('DD MMM YYYY'),
  },
  {
    id: '2',
    name: 'Hanna Baptista',
    plan: 'Daily, Quarterly',
    date: dayjs('2023-09-27').format('DD MMM YYYY'),
  },
  // Add more data similarly...
];

// Define columns with correct type

const PlanAssignment: React.FC = () => {
  const { mutate: deletePlanningAssign } = useDeletePlanningAssignation();
  const {
    open,
    setOpen,
    openDeleteModal,
    setOpenDeleteModal,
    deletedId,
    setDeletedId,
    setPlanningAssignation,
  } = usePlanningAssignationStore();
  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  const showDeleteModal = (id: string) => {
    setOpenDeleteModal(true);
    setDeletedId(id);
  };
  const onCloseDeleteModal = () => {
    setOpenDeleteModal(false);
  };
  const handleEditModal = (value: PlanningAssignation) => {
    setPlanningAssignation(value);
    setOpen(true);
  };
  function handleDeletePlanningAssignation(id: string) {
    deletePlanningAssign(id, {
      onSuccess: () => {
        onCloseDeleteModal();
      },
    });
  }
  const columns: ColumnsType<PlanningAssignation> = [
    {
      title: 'Employee Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Assigned Plan',
      dataIndex: 'plan',
      key: 'plan',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (values, record) => (
        <Space size="middle">
          <Button
            onClick={() => handleEditModal(record)}
            icon={<EditOutlined />}
            className="bg-blue text-white"
          />
          <Button
            onClick={() => showDeleteModal(record?.id || '')}
            icon={<DeleteOutlined />}
            className="bg-red-500 text-white"
          />
        </Space>
      ),
    },
  ];
  return (
    <div className="p-6 rounded-lg shadow-md">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold">Plan Assignation</h2>
        <Button
          onClick={showDrawer}
          className="bg-blue text-white h-8 font-semibold w-32 border-none"
        >
          Assign
        </Button>
      </div>

      <Input.Search
        placeholder="Search Rule"
        className="mb-4"
        style={{ width: 300 }}
      />

      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={{ pageSize: 5 }}
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
