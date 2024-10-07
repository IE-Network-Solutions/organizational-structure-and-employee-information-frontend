import { useGetAppRepAll } from '@/store/server/features/okrplanning/monitoring-evaluation/appreciation-log/queries';
import DashboardHeader from './dashboardHeader';
import EmployeeTable from './employeeTable';
import { useAppreciationLogStore } from '@/store/uistate/features/okrplanning/monitoring-evaluation/appreciation-log';
import { useDeleteAppLog } from '@/store/server/features/okrplanning/monitoring-evaluation/appreciation-log/mutations';
import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import { useGetAppreciationType } from '@/store/server/features/okrplanning/monitoring-evaluation/appreciation-type/queries';
import { useGetReprimandType } from '@/store/server/features/okrplanning/monitoring-evaluation/reprimand-type/queries';
import { Select } from 'antd';
import AppreciationEditDrawer from '../appreciation/appreciationEditDrawer';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import ReprimandEditDrawer from '../reprimand/reprimandEditDrawer';
import { useDeleteRepLog } from '@/store/server/features/okrplanning/monitoring-evaluation/reprimand-log/mutations';

const All = () => {
  const {
    openEdit,
    setOpenEdit,
    openDeleteModal,
    setOpenDeleteModal,
    deletedId,
    setDeletedId,
    appreciationLog,
    setAppreciationLog,
    userIdAll,
    typeIdAll,
    setTypeIdAll,
    setUserIdAll,
  } = useAppreciationLogStore();
  const { data: allAppRep, isLoading } = useGetAppRepAll(userIdAll, typeIdAll);

  const { mutate: deleteAppLog } = useDeleteAppLog();
  const { mutate: deleteRepLog } = useDeleteRepLog();
  const { data: allUsers } = useGetAllUsers();
  const { data: appTypes } = useGetAppreciationType();
  const { data: repTypes } = useGetReprimandType();
  const allTypes = [...(repTypes?.items || []), ...(appTypes?.items || [])];
  const onCloseEdit = () => {
    setOpenEdit(false);
  };

  const showDeleteModal = (id: string, value: any) => {
    setOpenDeleteModal(true);
    setDeletedId(id);
    setAppreciationLog(value);
  };
  const onCloseDeleteModal = () => {
    setOpenDeleteModal(false);
  };
  const handleEditModal = (value?: any) => {
    setAppreciationLog(value);
    setOpenEdit(true);
  };
  function handleDeleteAppLog(id: string) {
    appreciationLog?.type?.type == 'reprimand'
      ? deleteRepLog(id, {
          onSuccess: () => {
            onCloseDeleteModal();
          },
        })
      : deleteAppLog(id, {
          onSuccess: () => {
            onCloseDeleteModal();
          },
        });
  }
  return (
    <div className="p-0">
      <h1 className="text-xl font-bold mb-4">General Insight</h1>
      <DashboardHeader />
      <div className="flex  justify-between items-center mb-4 gap-5">
        <Select
          showSearch
          placeholder="Select a person"
          className="w-full h-14"
          allowClear
          onChange={(value) => setUserIdAll(value || '')}
          filterOption={(input: any, option: any) =>
            (option?.label ?? '')?.toLowerCase().includes(input.toLowerCase())
          }
          options={allUsers?.items?.map((item: any) => ({
            ...item,
            value: item?.id,
            label: item?.firstName + ' ' + item?.lastName,
          }))}
        />
        <Select
          showSearch
          placeholder="Select a Type"
          className="w-full h-14"
          allowClear
          onChange={(value) => setTypeIdAll(value || '')}
          filterOption={(input: any, option: any) =>
            (option?.label ?? '')?.toLowerCase().includes(input.toLowerCase())
          }
          options={allTypes?.map((item: any) => ({
            ...item,
            value: item?.id,
            label: item?.name,
          }))}
        />
      </div>
      <EmployeeTable
        setDeletedId={setDeletedId}
        showDeleteModal={showDeleteModal}
        handleEditModal={handleEditModal}
        loading={isLoading}
        data={allAppRep}
      />
      <AppreciationEditDrawer
        appLog={appreciationLog}
        open={appreciationLog?.type?.type == 'appreciation' ? openEdit : false}
        onClose={onCloseEdit}
      />
      <ReprimandEditDrawer
        repLog={appreciationLog}
        open={appreciationLog?.type?.type == 'reprimand' ? openEdit : false}
        onClose={onCloseEdit}
      />
      <DeleteModal
        open={openDeleteModal}
        onConfirm={() => handleDeleteAppLog(deletedId)}
        onCancel={onCloseDeleteModal}
      />
    </div>
  );
};

export default All;
