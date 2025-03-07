import CustomButton from '@/components/common/buttons/customButton';
import EmployeeTable from '../All/employeeTable';
import { GoPlus } from 'react-icons/go';
import { Select } from 'antd';
import { useAppreciationLogStore } from '@/store/uistate/features/okrplanning/monitoring-evaluation/appreciation-log';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useGetAppreciationLog } from '@/store/server/features/okrplanning/monitoring-evaluation/appreciation-log/queries';
import { useDeleteAppLog } from '@/store/server/features/okrplanning/monitoring-evaluation/appreciation-log/mutations';
import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import AppreciationDrawer from './appreciationDrawer';
import AppreciationEditDrawer from './appreciationEditDrawer';
import { useGetAppreciationType } from '@/store/server/features/okrplanning/monitoring-evaluation/appreciation-type/queries';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
const Appreciation = () => {
  const {
    open,
    setOpen,
    openDeleteModal,
    setOpenDeleteModal,
    deletedId,
    setDeletedId,
    appreciationLog,
    setAppreciationLog,
    setOpenEdit,
    openEdit,
    setTypeId,
    setUserId,
    userId,
    typeId,
  } = useAppreciationLogStore();

  const { mutate: deleteAppLog } = useDeleteAppLog();
  const { data: allUsers } = useGetAllUsers();
  const { data: appTypes } = useGetAppreciationType();

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
    setAppreciationLog(value);
    setOpenEdit(true);
  };
  function handleDeleteAppLog(id: string) {
    deleteAppLog(id, {
      onSuccess: () => {
        onCloseDeleteModal();
      },
    });
  }
  const { data: appLogs, isLoading } = useGetAppreciationLog(userId, typeId);

  return (
    <div className="p-0">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold mb-1">Appreciation</h1>
          <span className="text-sm mb-4">Given Upon Appreciation</span>
        </div>
        <AccessGuard permissions={[Permissions.CreateAppreciation]}>
          <CustomButton
            title="Appreciate"
            id="appreciateButton"
            icon={<GoPlus size={20} className="mr-2" />}
            onClick={showDrawer}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            aria-label="Open appreciation drawer"
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
          options={appTypes?.items?.map((item: any) => ({
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
        data={appLogs?.items}
      />

      <AppreciationDrawer open={open} onClose={onClose} />
      <AppreciationEditDrawer
        appLog={appreciationLog}
        open={openEdit}
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

export default Appreciation;
