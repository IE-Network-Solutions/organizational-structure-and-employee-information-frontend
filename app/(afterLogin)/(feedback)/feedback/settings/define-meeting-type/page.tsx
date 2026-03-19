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
        <MeetingTypeDetail data-cy="settings-define-meeting-type-detail" />
      ) : (
        <div
          className="p-4 rounded-2xl min-h-screen bg-white h-full "
          data-cy="settings-define-meeting-type-page"
          id="settingsDefineMeetingTypePage"
        >
          <div
            className="flex justify-between items-center mb-4"
            data-cy="settings-define-meeting-type-header"
            id="settingsDefineMeetingTypeHeader"
          >
            <h2
              className="text-xl font-semibold"
              data-cy="settings-define-meeting-type-title"
              id="settingsDefineMeetingTypeTitle"
            >
              Meeting Types
            </h2>
            {/* <AccessGuard permissions={[Permissions.CreateMeetingType]}> */}
            <Button
              type="primary"
              className="bg-blue-500 hover:bg-blue-600 focus:bg-blue-600 h-10"
              icon={<FaPlus className="text-xs" />}
              onClick={showDrawer}
              data-cy="settings-define-meeting-type-add-button"
              id="settingsDefineMeetingTypeAddButton"
            >
              <span
                className="hidden md:block "
                data-cy="settings-define-meeting-type-add-label"
              >
                Add New
              </span>
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
              <List.Item
                className="flex justify-between items-center py-4 px-4 rounded-xl my-3 border border-gray-300 "
                data-cy={`settings-define-meeting-type-item-${item.id}`}
                id={`settingsDefineMeetingTypeItem${item.id}`}
              >
                <span
                  onClick={() => handleDetail(item)}
                  className="cursor-pointer"
                  data-cy={`settings-define-meeting-type-item-name-${item.id}`}
                  id={`settingsDefineMeetingTypeItemName${item.id}`}
                >
                  {item?.name || 'Unknown title'}
                </span>
                <div
                  data-cy={`settings-define-meeting-type-item-actions-${item.id}`}
                  id={`settingsDefineMeetingTypeItemActions${item.id}`}
                >
                  {/* <AccessGuard permissions={[Permissions.UpdateMeetingType]}> */}
                  <Button
                    icon={<GoPencil />}
                    className="mr-2 bg-blue text-white border-none rounded-md h-8"
                    onClick={() => handleEditModal(item)}
                    data-cy={`settings-define-meeting-type-item-edit-button-${item.id}`}
                    id={`settingsDefineMeetingTypeItemEditButton${item.id}`}
                  />
                  {/* </AccessGuard> */}
                  {/* <AccessGuard permissions={[Permissions.DeleteMeetingType]}> */}
                  <Button
                    icon={<DeleteOutlined />}
                    className="mr-2 bg-red-500 text-white border-none rounded-md h-8"
                    onClick={() => showDeleteModal(item?.id as string)}
                    data-cy={`settings-define-meeting-type-item-delete-button-${item.id}`}
                    id={`settingsDefineMeetingTypeItemDeleteButton${item.id}`}
                  />
                  {/* </AccessGuard> */}
                </div>
              </List.Item>
            )}
            data-cy="settings-define-meeting-type-list"
            id="settingsDefineMeetingTypeList"
          />
          {Array.isArray(meetingTypes)
            ? meetingTypes.length > 0
            : meetingTypes?.items?.length > 0 && (
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
                  data-cy="settings-define-meeting-type-pagination"
                />
              )}

          <MeetingTypeDrawer
            meetType={meetingType}
            open={open}
            onClose={onClose}
            data-cy="settings-define-meeting-type-drawer"
          />
          <DeleteModal
            open={openDeleteModal}
            onConfirm={() => {
              if (deletedId) handleDeleteMeetingType(deletedId);
            }}
            onCancel={onCloseDeleteModal}
            loading={deleteLoading}
            data-cy="settings-define-meeting-type-delete-modal"
          />
        </div>
      )}
    </>
  );
};

export default DefineMeetingType;
