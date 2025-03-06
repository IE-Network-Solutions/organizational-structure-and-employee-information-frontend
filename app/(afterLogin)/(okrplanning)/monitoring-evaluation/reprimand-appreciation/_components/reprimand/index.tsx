import CustomButton from '@/components/common/buttons/customButton';
import EmployeeTable from '../All/employeeTable';
import { GoPlus } from 'react-icons/go';
import ReprimandDrawer from './reprimandDrawer';
import { useDeleteRepLog } from '@/store/server/features/okrplanning/monitoring-evaluation/reprimand-log/mutations';
import { useReprimandLogStore } from '@/store/uistate/features/okrplanning/monitoring-evaluation/reprimand-log';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import ReprimandEditDrawer from './reprimandEditDrawer';
import { useGetReprimandLog } from '@/store/server/features/okrplanning/monitoring-evaluation/reprimand-log/queries';
import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import { useGetReprimandType } from '@/store/server/features/okrplanning/monitoring-evaluation/reprimand-type/queries';
import { Select } from 'antd';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const Reprimand = () => {
  const {
    open,
    setOpen,
    openDeleteModal,
    setOpenDeleteModal,
    deletedId,
    setDeletedId,
    reprimandLog,
    setReprimandLog,
    setOpenEdit,
    openEdit,
    setTypeId,
    setUserId,
    userId,
    typeId,
  } = useReprimandLogStore();

  const { mutate: deleteAppLog } = useDeleteRepLog();
  const { data: allUsers } = useGetAllUsers();
  const { data: repTypes } = useGetReprimandType();
  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  const onCloseEdit = () => {
    setOpenEdit(false);
  };
  const showDeleteModal = (id: string) => {
    setOpenDeleteModal(true);
    setDeletedId(id);
  };
  const onCloseDeleteModal = () => {
    setOpenDeleteModal(false);
  };
  const handleEditModal = (value: any) => {
    setReprimandLog(value);
    setOpenEdit(true);
  };
  function handleDeleteAppLog(id: string) {
    deleteAppLog(id, {
      onSuccess: () => {
        onCloseDeleteModal();
      },
    });
  }
  const { data: repLogs, isLoading } = useGetReprimandLog(userId, typeId);

  return (
    <div className="p-4 md:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-lg md:text-xl font-bold mb-1">Reprimand</h1>
          <span className="text-xs md:text-sm text-gray-600">
            Given Upon Reprimand
          </span>
        </div>
        <AccessGuard permissions={[Permissions.CreateReprimand]}>
          <CustomButton
            title="Reprimand"
            id="reprimandButton"
            icon={<GoPlus size={20} className="mr-2" />}
            onClick={showDrawer}
            className="bg-blue-600 hover:bg-blue-700 text-sm md:text-base"
          />
        </AccessGuard>
      </div>
      <div className="flex  justify-between items-center mb-4 gap-5">
        <Select
          showSearch
          placeholder="Select a person"
          className="w-full h-14"
          allowClear
          onChange={(value) => setUserId(value || '')}
          filterOption={(input: any, option: any) =>
            (option?.label ?? '')?.toLowerCase().includes(input.toLowerCase())
          }
          options={allUsers?.items?.map((item: any) => ({
            ...item,
            value: item?.id,
            label:
              item?.firstName + ' ' + item?.middleName + ' ' + item?.lastName,
          }))}
        />
        <Select
          showSearch
          placeholder="Select a Type"
          className="w-full h-14"
          allowClear
          onChange={(value) => setTypeId(value || '')}
          filterOption={(input: any, option: any) =>
            (option?.label ?? '')?.toLowerCase().includes(input.toLowerCase())
          }
          options={repTypes?.items?.map((item: any) => ({
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
        data={repLogs?.items}
      />
      <DeleteModal
        open={openDeleteModal}
        onConfirm={() => handleDeleteAppLog(deletedId)}
        onCancel={onCloseDeleteModal}
      />
      <ReprimandDrawer open={open} onClose={onClose} />
      <ReprimandEditDrawer
        repLog={reprimandLog}
        open={openEdit}
        onClose={onCloseEdit}
      />
    </div>
  );
};

export default Reprimand;
