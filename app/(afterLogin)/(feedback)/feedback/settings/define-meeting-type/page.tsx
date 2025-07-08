'use client';

import DeleteModal from '@/components/common/deleteConfirmationModal';
import { Button, List } from 'antd';
import React from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import { FaPlus } from 'react-icons/fa';
import MeetingTypeDrawer from './_components/meetingTypeDrawer';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import { GoPencil } from 'react-icons/go';
import MeetingTypeDetail from './_components/meetingTypeDetail';
import { useGetMeetingType } from '@/store/server/features/CFR/meeting/type/queries';
import { useDeleteMeetingType } from '@/store/server/features/CFR/meeting/type/mutations';
import CustomPagination from '@/components/customPagination';

const DefineMeetingType = () => {
  const {
    open,
    setOpen,
    openDeleteModal,
    setOpenDeleteModal,
    deletedId,
    setDeletedId,
    meetingType,
    setMeetingType,
    meetingTypeDetailData,
    setMeetingTypeDetail,
    pageSizeType,
    setPagesizeType,
    currentType,
    setCurrentType,
  } = useMeetingStore();

  // const { mutate: deleteOkrRule } = useDeleteMeetingType();
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
  const handleEditModal = (value: any) => {
    setMeetingType(value);
    setOpen(true);
  };
  const handleDetail = (item: any) => {
    setMeetingTypeDetail(item);
  };

  type MeetingType = {
    id: string;
    name: string;
    // add other properties if needed
  };

  const { data: meetingTypes = [], isLoading } = useGetMeetingType(
    pageSizeType,
    currentType,
  ) as {
    data: { items: MeetingType[] };
    isLoading: boolean;
  };
  const { mutate: deleteMeetingType, isLoading: deleteLoading } =
    useDeleteMeetingType();

  function handleDeleteMeetingType(id: string) {
    deleteMeetingType(id, {
      onSuccess: () => {
        onCloseDeleteModal();
      },
    });
  }
  return (
    <>
      {meetingTypeDetailData ? (
        <MeetingTypeDetail />
      ) : (
        <div className="p-4 rounded-2xl min-h-screen bg-white h-full ">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Meeting Types</h2>
            {/* <AccessGuard permissions={[Permissions.CreateMeetingType]}> */}
            <Button
              type="primary"
              className="bg-blue-500 hover:bg-blue-600 focus:bg-blue-600"
              icon={<FaPlus className="text-xs" />}
              onClick={showDrawer}
            >
              <span className="hidden md:block ">Add New</span>
            </Button>
            {/* </AccessGuard> */}
          </div>

          <List<MeetingType>
            dataSource={
              Array.isArray(meetingTypes) ? meetingTypes : meetingTypes?.items
            }
            bordered={false}
            loading={isLoading}
            renderItem={(item) => (
              <List.Item className="flex justify-between items-center py-4 px-4 rounded-xl my-3 border border-gray-300 ">
                <span
                  onClick={() => handleDetail(item)}
                  className="cursor-pointer"
                >
                  {item?.name || 'Unknown title'}
                </span>
                <div>
                  {/* <AccessGuard permissions={[Permissions.UpdateMeetingType]}> */}
                  <Button
                    icon={<GoPencil />}
                    className="mr-2 bg-blue text-white border-none rounded-md"
                    onClick={() => handleEditModal(item)}
                  />
                  {/* </AccessGuard> */}
                  {/* <AccessGuard permissions={[Permissions.DeleteMeetingType]}> */}
                  <Button
                    icon={<DeleteOutlined />}
                    className="mr-2 bg-red-500 text-white border-none  rounded-md"
                    onClick={() => showDeleteModal(item?.id as string)}
                  />
                  {/* </AccessGuard> */}
                </div>
              </List.Item>
            )}
          />
          <CustomPagination
            current={
              (meetingTypes as { meta?: { currentPage?: number } })?.meta
                ?.currentPage || 1
            }
            total={
              (meetingTypes as { meta?: { totalItems?: number } })?.meta
                ?.totalItems || 1
            }
            pageSize={pageSizeType}
            onChange={(page: number, pageSize: number) => {
              setCurrentType(page);
              setPagesizeType(pageSize);
            }}
            onShowSizeChange={(size: number) => {
              setPagesizeType(size);
              setCurrentType(1);
            }}
          />
          <MeetingTypeDrawer
            meetType={meetingType}
            open={open}
            onClose={onClose}
          />
          <DeleteModal
            open={openDeleteModal}
            onConfirm={() => {
              if (deletedId) handleDeleteMeetingType(deletedId);
            }}
            onCancel={onCloseDeleteModal}
            loading={deleteLoading}
          />

          <MeetingTypeDrawer
            meetType={meetingType}
            open={open}
            onClose={onClose}
          />
          <DeleteModal
            open={openDeleteModal}
            onConfirm={() => {
              if (deletedId) handleDeleteMeetingType(deletedId);
            }}
            onCancel={onCloseDeleteModal}
            loading={deleteLoading}
          />
        </div>
      )}
    </>
  );
};

export default DefineMeetingType;
