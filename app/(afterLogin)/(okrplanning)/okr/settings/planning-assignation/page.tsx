'use client';
import { Table, Button, Input, Space, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { ColumnsType } from 'antd/es/table';
import PlanningAssignationDrawer from './_components/planning-assignation-drawer';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { PlanningAssignation } from '@/store/uistate/features/okrplanning/monitoring-evaluation/planning-assignation-drawer/interface';
import { usePlanningAssignationStore } from '@/store/uistate/features/okrplanning/monitoring-evaluation/planning-assignation-drawer';
import { useDeletePlanningAssignation } from '@/store/server/features/okrplanning/monitoring-evaluation/planning-assignation/mutations';
import { useGetAllAssignedUser, useGetAllPlanningPeriods } from '@/store/server/features/employees/planning/planningPeriod/queries';
import { GroupedUser, PlanningPeriodUser } from '@/store/server/features/employees/planning/planningPeriod/interface';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { User } from '@/store/uistate/features/okrplanning/okr/interface';
import { EmployeeData, UserData } from '@/types/dashboard/adminManagement';
import { MdDeleteForever, MdModeEditOutline } from 'react-icons/md';
import { useDeletePlanningUser } from '@/store/server/features/employees/planning/planningPeriod/mutation';
import { useOKRSettingStore } from '@/store/uistate/features/okrplanning/okrSetting';

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
  const { mutate: deletePlanningAssign } = useDeletePlanningUser();
  const {data:allUserWithPlanningPeriod}=useGetAllAssignedUser();
  const {data:getAllPlanningPeriod}=useGetAllPlanningPeriods();
  const { data: employeeData, isLoading: userLoading } = useGetAllUsers();
  const {setSelectedPlanningUser,setPage}=useOKRSettingStore();

  const userToPlanning=allUserWithPlanningPeriod?.items.reduce((acc:GroupedUser[],item:PlanningPeriodUser)=>{
        let group=acc.find(group=>group.userId===item.userId);
        if(!group){
          group={userId:item.userId,items:[]};
          acc.push(group);
        }
          group.items.push(item);
           return acc;
      },[] as GroupedUser[])

    const getEmployeeData=(userId:string)=>{
      return employeeData?.items?.find((user:EmployeeData)=>user.id===userId)?.lastName || "unknown"
    }
    const getPlanningPeriod = (planningPeriodId: string) => {
      const planningPeriod= getAllPlanningPeriod?.items?.find((planning: any) => planning.id === planningPeriodId);
      return  planningPeriod?.name;
    };
    
const handleEdit=(item:any)=>{
  setSelectedPlanningUser(item);
  showDrawer();
}
const handleDelete=(item:any)=>{
  deletePlanningAssign(item?.userId); 
}

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


  const dataSources = userToPlanning?.map((item: any, index: number) => ({
    id: index + 1, // Assigning a unique id based on the index
    name: getEmployeeData(item?.userId), // Assuming getEmployeeData returns an object with a name property
    plans: item?.items
      ?.map((plan: any) => getPlanningPeriod(plan.planningPeriodId)) // Get each plan name
      .join(', '), // Combine plan names into a single string
    key: item?.userId, // Using userId as the key to ensure uniqueness
    actions: { // Adding actions property
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
      render: (_: any, record: any) => (
        <div>
          <button className='bg-green-700 font-bold text-white rounded px-2 py-1 text-xs' 
              onClick={() => record.actions.edit()} style={{ marginRight: 8 }}><MdModeEditOutline />
          </button>
            <Popconfirm
              title="Are you sure you want to delete this item?"
              onConfirm={() => record.actions.delete()}
              okText="Yes"
              cancelText="No"
            >
              <button
                className='bg-red-600 font-bold text-white rounded px-2 py-1 text-xs'
              >
                <MdDeleteForever />
              </button>
            </Popconfirm>
        </div>
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
        dataSource={dataSources}
        columns={columns}
        pagination={{
          pageSize: allUserWithPlanningPeriod?.meta.itemsPerPage, // Set the page size from your meta data
          current: allUserWithPlanningPeriod?.meta.currentPage, // Current page number
          total: allUserWithPlanningPeriod?.meta.totalItems, // Total number of items
          showSizeChanger: false, // Optional: Allow users to change page size
          onChange: (page, pageSize) => {
            setPage(page)
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
