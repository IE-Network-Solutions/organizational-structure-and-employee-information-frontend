'use client';
import { Card, Avatar, Button, Tag, Divider } from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { useGetAppreciationLogById } from '@/store/server/features/okrplanning/monitoring-evaluation/appreciation-log/queries';
import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import dayjs from 'dayjs';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import AppreciationEditDrawer from '../../_components/appreciation/appreciationEditDrawer';
import { useAppreciationLogStore } from '@/store/uistate/features/okrplanning/monitoring-evaluation/appreciation-log';
import { useDeleteAppLog } from '@/store/server/features/okrplanning/monitoring-evaluation/appreciation-log/mutations';
import { useRouter } from 'next/navigation';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

interface Params {
  id: string;
}
interface AppreciationDetailProps {
  params: Params;
}
function DetailPage({ params: { id } }: AppreciationDetailProps) {
  const { data: appDetail, isLoading } = useGetAppreciationLogById(
    id as string,
  );
  const { data: allUsers } = useGetAllUsers();

  function employeeInfo(id: string) {
    return allUsers?.items?.find((user: any) => user.id === id) || {};
  }
  const router = useRouter();

  const {
    openEdit,
    setOpenEdit,
    openDeleteModal,
    setOpenDeleteModal,
    deletedId,
    setDeletedId,
  } = useAppreciationLogStore();
  const { mutate: deleteAppLog } = useDeleteAppLog();
  const showDeleteModal = (id: string) => {
    setOpenDeleteModal(true);
    setDeletedId(id);
  };
  const onCloseEdit = () => {
    setOpenEdit(false);
  };
  const onCloseDeleteModal = () => {
    setOpenDeleteModal(false);
  };
  function handleDeleteAppLog(id: string) {
    deleteAppLog(id, {
      onSuccess: () => {
        onCloseDeleteModal();
        router.push('/monitoring-evaluation/reprimand-appreciation');
      },
    });
  }
  const handleEditModal = () => {
    setOpenEdit(true);
  };
  return (
    <div className="p-4 md:p-6">
      {/* Back button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-3 md:space-y-0">
        <Button
          href="/monitoring-evaluation/reprimand-appreciation"
          className="mb-4 text-lg font-semibold"
          type="text"
        >
          ← Detail
        </Button>
        <div className="flex space-x-2">
          <AccessGuard permissions={[Permissions.EditAppreciationAndReprimand]}>
            <Button
              className="bg-blue text-white border-none"
              icon={<EditOutlined />}
              onClick={() => handleEditModal()}
            />
          </AccessGuard>
          <AccessGuard
            permissions={[Permissions.DeleteAppreciationAndReprimand]}
          >
            <Button
              onClick={() => showDeleteModal(appDetail?.id || '')} // Pass key to delete handler
              className="bg-red-500 text-white border-none"
              icon={<DeleteOutlined />}
            />
          </AccessGuard>
        </div>
      </div>

      {/* Main Card */}
      <Card loading={isLoading} className="rounded-md">
        <Divider />
        {/* Content Section */}
        <div className="mt-4">
          {/* Given To Section */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-12 items-center gap-y-4 md:gap-0">
            <h4 className="text-gray-500 text-sm col-span-3">Given To</h4>
            <div className="flex items-center space-x-3 w-full col-span-9">
              {employeeInfo(appDetail?.recipientId || '')?.profileImage ? (
                <Avatar
                  size={40}
                  src={employeeInfo(appDetail?.recipientId || '')?.profileImage}
                />
              ) : (
                <Avatar
                  size={40}
                  className="capitalize"
                  icon={<UserOutlined />}
                />
              )}
              <div>
                <p className="text-lg font-semibold">
                  {employeeInfo(appDetail?.recipientId || '')?.firstName ||
                    'N/A'}
                </p>
                <p className="text-gray-500">
                  Joined on:{' '}
                  {dayjs(
                    employeeInfo(appDetail?.recipientId || '')?.createdAt,
                  ).format('ddd - MMM - YYYY') || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Last Updated Section */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-12 items-center gap-y-4 md:gap-0">
            <h4 className="text-gray-500 text-sm col-span-3">Last Updated</h4>
            <p className="col-span-9">
              {dayjs(appDetail?.updatedAt).format('ddd - MMM - YYYY') || 'N/A'}
            </p>
          </div>

          {/* Given By Section */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-12 items-center gap-y-4 md:gap-0">
            <h4 className="text-gray-500 text-sm col-span-3">Given By</h4>
            <div className="flex items-center space-x-3 w-full col-span-9">
              {employeeInfo(appDetail?.issuerId || '')?.profileImage ? (
                <Avatar
                  size={40}
                  src={employeeInfo(appDetail?.issuerId || '')?.profileImage}
                />
              ) : (
                <Avatar
                  size={40}
                  className="capitalize"
                  icon={<UserOutlined />}
                />
              )}
              <div>
                <p className="text-lg font-semibold">
                  {employeeInfo(appDetail?.issuerId || '')?.firstName || 'N/A'}
                </p>
                <p className="text-gray-500">
                  Joined on:{' '}
                  {dayjs(
                    employeeInfo(appDetail?.issuerId || '')?.createdAt,
                  ).format('ddd - MMM - YYYY') || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Total No of Appreciations and Reprimands */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-12 items-center gap-y-4 md:gap-0">
            <h4 className="text-gray-500 text-sm col-span-3">
              Total No of Appreciations
            </h4>
            <Tag className="col-span-9 w-fit" color="green">
              {appDetail?.totalNumberOfAppreciation || 0}
            </Tag>
          </div>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-12 items-center gap-y-4 md:gap-0">
            <h4 className="text-gray-500 text-sm col-span-3">
              Total No of Reprimands
            </h4>
            <Tag className="col-span-9 w-fit" color="red">
              {appDetail?.totalNumberOfRepremand || 0}
            </Tag>
          </div>

          {/* Reason Section */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-12 items-start gap-y-4 md:gap-0">
            <h4 className="text-gray-500 text-sm col-span-3">Reason</h4>
            <p className="text-gray-700 col-span-9">
              {appDetail?.action || 'No reason provided.'}
            </p>
          </div>
        </div>
      </Card>
      <AppreciationEditDrawer
        appLog={appDetail}
        open={appDetail?.type?.type == 'appreciation' ? openEdit : false}
        onClose={onCloseEdit}
      />
      <DeleteModal
        open={openDeleteModal}
        onConfirm={() => handleDeleteAppLog(deletedId)}
        onCancel={onCloseDeleteModal}
      />
    </div>
  );
}

export default DetailPage;
