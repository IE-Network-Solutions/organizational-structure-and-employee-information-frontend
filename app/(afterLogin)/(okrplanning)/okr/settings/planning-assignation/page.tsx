'use client';
import { Table, Button, Popconfirm, Form, Select, Spin, Tooltip } from 'antd';
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
import { FaPlus } from 'react-icons/fa';
import Image from 'next/image';
import Avatar from '@/public/gender_neutral_avatar.jpg';
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
    data: allUserWithPlanningPeriod,
    isLoading: allUserPlanningPeriodLoading,
  } = useGetAllAssignedUser(page, pageSize, userId || '');
  const { data: getAllPlanningPeriod } = useGetAllPlanningPeriods();
  const { data: employeeData, isLoading: employeeDataLoading } =
    useGetAllUsers();
  const { isMobile, isTablet } = useIsMobile();
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
      // name: getEmployeeData(item?.userId),
      name: (
        <Tooltip title={getEmployeeData(item?.userId)}>
          <div className="flex items-center flex-wrap sm:flex-row justify-start gap-2">
            <div className="relative w-6 h-6 rounded-full overflow-hidden">
              <Image
                src={
                  item?.profileImage && typeof item?.profileImage === 'string'
                    ? (() => {
                        try {
                          const parsed = JSON.parse(item.profileImage);
                          return parsed.url && parsed.url.startsWith('http')
                            ? parsed.url
                            : Avatar;
                        } catch {
                          return item.profileImage.startsWith('http')
                            ? item.profileImage
                            : Avatar;
                        }
                      })()
                    : Avatar
                }
                alt="Description of image"
                layout="fill"
                className="object-cover"
              />
            </div>
            <div className="flex flex-wrap flex-col justify-center">
              <p>{getEmployeeData(item?.userId)}</p>
            </div>
          </div>
        </Tooltip>
      ),
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
          loading={allUserPlanningPeriodLoading}
          dataSource={dataSources}
          columns={columns}
          pagination={false}
        />
        {isMobile || isTablet ? (
          <CustomMobilePagination
            totalResults={allUserWithPlanningPeriod?.meta.totalItems ?? 0}
            pageSize={pageSize}
            onChange={(page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
            }}
            onShowSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        ) : (
          <CustomPagination
            current={allUserWithPlanningPeriod?.meta.currentPage || 1}
            total={allUserWithPlanningPeriod?.meta.totalItems || 1}
            pageSize={pageSize}
            onChange={(page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
            }}
            onShowSizeChange={(size) => {
              setPageSize(size);
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
