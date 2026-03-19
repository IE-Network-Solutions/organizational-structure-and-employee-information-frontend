'use client';

import { Button, Card, Dropdown, List, Popconfirm, Spin } from 'antd';
import React from 'react';
import { EllipsisOutlined } from '@ant-design/icons';
import MeetingTypeDrawer from './_components/meetingTypeDrawer';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import { useGetMeetingType } from '@/store/server/features/CFR/meeting/type/queries';
import { useDeleteMeetingType } from '@/store/server/features/CFR/meeting/type/mutations';
import CustomPagination from '@/components/customPagination';
import { Edit2Icon } from 'lucide-react';
import { MdDeleteOutline } from 'react-icons/md';
import { useRouter } from 'next/navigation';

const DefineMeetingType = () => {
  const {
    open,
    setOpen,
    meetingType,
    setMeetingType,
    pageSizeType,
    setPagesizeType,
    currentType,
    setCurrentType,
  } = useMeetingStore();
  const router = useRouter();

  const onClose = () => {
    setOpen(false);
  };
  const handleEditModal = (value: any) => {
    setMeetingType(value);
    setOpen(true);
  };
  type MeetingType = {
    id: string;
    name: string;
    // add other properties if needed
  };

  const { data: meetingTypes, isLoading } = useGetMeetingType(
    pageSizeType,
    currentType,
  ) as {
    data: { items: MeetingType[]; meta: { totalItems: number } };
    isLoading: boolean;
  };
  const { mutate: deleteMeetingType, isLoading: deleteLoading } =
    useDeleteMeetingType();

  function handleDeleteMeetingType(id: string) {
    deleteMeetingType(id);
  }
  return (
    <>
      <div className="p-5 rounded-2xl bg-white h-full">
        <Spin spinning={isLoading}>
          {meetingTypes?.items && meetingTypes.items.length > 0 ? (
            <div
              className="grid grid-cols-12 flex-col-reverse justify-between"
              data-cy="settings-define-meeting-type-content"
              id="settingsDefineMeetingTypeContent"
            >
              <div
                className="col-span-12 "
                data-cy="settings-define-meeting-type-tabs-container"
                id="settingsDefineMeetingTypeTabsContainer"
              >
                <div
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                  data-cy="settings-define-meeting-type-grid"
                >
                  {meetingTypes.items.map((item: any) => (
                    <Card
                      key={item?.id}
                      className="rounded-xl border border-gray-200 shadow-none cursor-pointer hover:border-gray-300 transition-colors"
                      styles={{ body: { padding: 16 } }}
                      data-cy={`settings-define-meeting-type-card-${item?.id}`}
                      onClick={() => {
                        router.push(
                          `/feedback/settings/define-meeting-type/${item?.id}`,
                        );
                      }}
                    >
                      <div
                        className="flex items-start justify-between gap-3"
                        data-cy={`settings-define-meeting-type-card-header-${item?.id}`}
                      >
                        <div
                          className="min-w-0"
                          data-cy={`settings-define-meeting-type-card-title-section-${item?.id}`}
                        >
                          <div
                            className="text-sm font-semibold text-gray-900 truncate"
                            title={item?.name}
                            data-cy={`settings-define-meeting-type-card-title-${item?.id}`}
                          >
                            {item?.name}
                          </div>
                        </div>

                        <div
                          className="shrink-0"
                          data-cy={`settings-define-meeting-type-card-actions-wrap-${item?.id}`}
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <Dropdown
                            trigger={['click']}
                            menu={{
                              items: [
                                {
                                  key: 'edit',
                                  label: 'Edit',
                                  icon: (
                                    <Edit2Icon className="w-4 h-4 text-xs" />
                                  ),
                                  onClick: () => {
                                    handleEditModal(item);
                                  },
                                },
                                {
                                  key: 'delete',
                                  label: (
                                    <Popconfirm
                                      title="Are you sure you want to delete this meeting type?"
                                      onConfirm={() => {
                                        handleDeleteMeetingType(item?.id);
                                      }}
                                      okText="Yes"
                                      cancelText="No"
                                      okButtonProps={{ loading: deleteLoading }}
                                      data-cy={`settings-define-meeting-type-card-delete-confirm-${item?.id}`}
                                      id={`settingsDefineMeetingTypeCardDeleteConfirm${item?.id}`}
                                    >
                                      <span
                                        className="flex items-center gap-2"
                                        data-cy={`settings-define-meeting-type-card-delete-${item?.id}`}
                                      >
                                        <MdDeleteOutline className="w-4 h-4" />
                                        Delete
                                      </span>
                                    </Popconfirm>
                                  ),
                                },
                              ],
                            }}
                          >
                            <Button
                              type="text"
                              size="small"
                              aria-label="DefineMeetingType actions"
                              icon={<EllipsisOutlined />}
                              className="shrink-0 !h-7 !w-7 !p-0 border border-gray-200 rounded-md flex items-center justify-center"
                              data-cy={`settings-define-meeting-type-card-actions-${item?.id}`}
                              id={`settingsDefineMeetingTypeCardActions${item?.id}`}
                            />
                          </Dropdown>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
              {meetingTypes.meta && meetingTypes.items.length > 0 && (
                <CustomPagination
                  current={currentType}
                  total={meetingTypes.meta.totalItems}
                  pageSize={pageSizeType}
                  onChange={(page, size) => {
                    setCurrentType(page);
                    setPagesizeType(size);
                  }}
                  onShowSizeChange={(newSize: number) => {
                    setPagesizeType(newSize);
                    setCurrentType(1);
                  }}
                  data-cy="settings-define-meeting-type-pagination"
                />
              )}
            </div>
          ) : (
            !isLoading && (
              <div
                className="flex items-center justify-center py-10 text-gray-500"
                data-cy="settings-define-meeting-type-empty-state"
                id="settingsDefineMeetingTypeEmptyState"
              >
                No meeting types found.
              </div>
            )
          )}

          <MeetingTypeDrawer
            meetType={meetingType}
            open={open}
            onClose={onClose}
            data-cy="settings-define-meeting-type-drawer"
          />
        </Spin>
      </div>
    </>
  );
};

export default DefineMeetingType;
