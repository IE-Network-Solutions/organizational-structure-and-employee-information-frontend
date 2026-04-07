'use client';
import { Card, Avatar, Button, Tag, Divider } from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import dayjs from 'dayjs';
import { useGetReprimandLogById } from '@/store/server/features/okrplanning/monitoring-evaluation/reprimand-log/queries';
import { useRouter } from 'next/navigation';
import { useReprimandLogStore } from '@/store/uistate/features/okrplanning/monitoring-evaluation/reprimand-log';
import { useDeleteRepLog } from '@/store/server/features/okrplanning/monitoring-evaluation/reprimand-log/mutations';
import ReprimandEditDrawer from '../../_components/reprimand/reprimandEditDrawer';
import DeleteModal from '@/components/common/deleteConfirmationModal';

interface Params {
  id: string;
}
interface EmployeeDetailsProps {
  params: Params;
}
function DetailPage({ params: { id } }: EmployeeDetailsProps) {
  // Fetch reprimand log and user data
  const { data: repDetail, isLoading } = useGetReprimandLogById(id as string);
  const { data: allUsers } = useGetAllUsers();

  // Helper function to find employee info
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
  } = useReprimandLogStore();
  const { mutate: deleteRepLog } = useDeleteRepLog();
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
  function handleDeleteRepLog(id: string) {
    deleteRepLog(id, {
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
    <div className="p-4 md:p-6" data-cy="reprimand-detail-page">
      {/* Back button and actions */}
      <div
        className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-3 md:space-y-0"
        data-cy="reprimand-detail-header"
      >
        <Button
          href="/monitoring-evaluation/reprimand-appreciation"
          className="mb-4 text-lg font-semibold"
          type="text"
          data-cy="reprimand-detail-back-button"
        >
          ← Detail
        </Button>
        <div className="flex space-x-2" data-cy="reprimand-detail-actions">
          <Button
            className="bg-blue text-white border-none"
            icon={<EditOutlined />}
            onClick={() => handleEditModal()}
          />
          <Button
            onClick={() => showDeleteModal(repDetail?.id || '')} // Pass key to delete handler
            className="bg-red-500 text-white border-none"
            icon={<DeleteOutlined />}
          />
        </div>
      </div>

      {/* Main card */}
      <Card loading={isLoading} className="rounded-md">
        <Divider />

        {/* Content section */}
        <div className="mt-4" data-cy="reprimand-detail-content">
          {/* Given To Section */}
          <div
            className="mb-6 grid grid-cols-1 md:grid-cols-12 items-center gap-y-4 md:gap-0"
            data-cy="reprimand-detail-given-to-section"
          >
            <h4
              className="text-gray-500 text-sm col-span-3"
              data-cy="reprimand-detail-given-to-label"
            >
              Given To
            </h4>
            <div
              className="flex items-center space-x-3 w-full col-span-9"
              data-cy="reprimand-detail-given-to-content"
            >
              {employeeInfo(repDetail?.recipientId || '')?.profileImage ? (
                <Avatar
                  size={40}
                  src={employeeInfo(repDetail?.recipientId || '')?.profileImage}
                />
              ) : (
                <Avatar
                  size={40}
                  className="capitalize"
                  icon={<UserOutlined />}
                />
              )}
              <div data-cy="reprimand-detail-given-to-employee-info">
                <p
                  className="text-lg font-semibold"
                  data-cy="reprimand-detail-given-to-employee-name"
                >
                  {employeeInfo(repDetail?.recipientId || '')?.firstName ||
                    'N/A'}
                </p>
                <p
                  className="text-gray-500"
                  data-cy="reprimand-detail-given-to-employee-joined"
                >
                  Joined on:{' '}
                  {dayjs(
                    employeeInfo(repDetail?.recipientId || '')?.createdAt,
                  ).format('ddd - MMM - YYYY') || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Last Updated Section */}
          <div
            className="mb-6 grid grid-cols-1 md:grid-cols-12 items-center gap-y-4 md:gap-0"
            data-cy="reprimand-detail-last-updated-section"
          >
            <h4
              className="text-gray-500 text-sm col-span-3"
              data-cy="reprimand-detail-last-updated-label"
            >
              Last Updated
            </h4>
            <p
              className="col-span-9"
              data-cy="reprimand-detail-last-updated-value"
            >
              {dayjs(repDetail?.updatedAt).format('ddd - MMM - YYYY') || 'N/A'}
            </p>
          </div>

          {/* Given By Section */}
          <div
            className="mb-6 grid grid-cols-1 md:grid-cols-12 items-center gap-y-4 md:gap-0"
            data-cy="reprimand-detail-given-by-section"
          >
            <h4
              className="text-gray-500 text-sm col-span-3"
              data-cy="reprimand-detail-given-by-label"
            >
              Given By
            </h4>
            <div
              className="flex items-center space-x-3 w-full col-span-9"
              data-cy="reprimand-detail-given-by-content"
            >
              {employeeInfo(repDetail?.issuerId || '')?.profileImage ? (
                <Avatar
                  size={40}
                  src={employeeInfo(repDetail?.issuerId || '')?.profileImage}
                />
              ) : (
                <Avatar
                  size={40}
                  className="capitalize"
                  icon={<UserOutlined />}
                />
              )}
              <div data-cy="reprimand-detail-given-by-employee-info">
                <p
                  className="text-lg font-semibold"
                  data-cy="reprimand-detail-given-by-employee-name"
                >
                  {employeeInfo(repDetail?.issuerId || '')?.firstName || 'N/A'}
                </p>
                <p
                  className="text-gray-500"
                  data-cy="reprimand-detail-given-by-employee-joined"
                >
                  Joined on:{' '}
                  {dayjs(
                    employeeInfo(repDetail?.issuerId || '')?.createdAt,
                  ).format('ddd - MMM - YYYY') || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Total No of Appreciations and Reprimands */}
          <div
            className="mb-6 grid grid-cols-1 md:grid-cols-12 items-center gap-y-4 md:gap-0"
            data-cy="reprimand-detail-total-appreciations-section"
          >
            <h4
              className="text-gray-500 text-sm col-span-3"
              data-cy="reprimand-detail-total-appreciations-label"
            >
              Total No of Appreciations
            </h4>
            <Tag className="col-span-9 w-fit" color="green">
              {repDetail?.totalNumberOfAppreciation || 0}
            </Tag>
          </div>
          <div
            className="mb-6 grid grid-cols-1 md:grid-cols-12 items-center gap-y-4 md:gap-0"
            data-cy="reprimand-detail-total-reprimands-section"
          >
            <h4
              className="text-gray-500 text-sm col-span-3"
              data-cy="reprimand-detail-total-reprimands-label"
            >
              Total No of Reprimands
            </h4>
            <Tag className="col-span-9 w-fit" color="red">
              {repDetail?.totalNumberOfRepremand || 0}
            </Tag>
          </div>

          {/* Reason Section */}
          <div
            className="mb-6 grid grid-cols-1 md:grid-cols-12 items-start gap-y-4 md:gap-0"
            data-cy="reprimand-detail-reason-section"
          >
            <h4
              className="text-gray-500 text-sm col-span-3"
              data-cy="reprimand-detail-reason-label"
            >
              Reason
            </h4>
            <p
              className="text-gray-700 col-span-9"
              data-cy="reprimand-detail-reason-value"
            >
              {repDetail?.action || 'No reason provided.'}
            </p>
          </div>
        </div>
      </Card>
      <ReprimandEditDrawer
        repLog={repDetail}
        open={openEdit}
        onClose={onCloseEdit}
      />
      <DeleteModal
        open={openDeleteModal}
        onConfirm={() => handleDeleteRepLog(deletedId)}
        onCancel={onCloseDeleteModal}
      />
    </div>
  );
}

export default DetailPage;
