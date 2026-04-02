'use client';

import { Card, Dropdown, Popconfirm, Skeleton } from 'antd';
import React from 'react';
import MeetingTypeDrawer from './_components/meetingTypeDrawer';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import { useGetMeetingType } from '@/store/server/features/CFR/meeting/type/queries';
import { useDeleteMeetingType } from '@/store/server/features/CFR/meeting/type/mutations';
import CustomPagination from '@/components/customPagination';
import { MdOutlineDelete, MdOutlineEdit } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { BsThreeDots } from 'react-icons/bs';

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
    meetingTypeOpenDropdownId,
    setMeetingTypeOpenDropdownId,
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
      <div
        className="rounded-2xl bg-white h-full"
        data-cy="settings-define-meeting-type-page-shell"
      >
        <Skeleton active loading={isLoading} paragraph={{ rows: 6 }}>
          {meetingTypes?.items && meetingTypes.items.length > 0 ? (
            <div
              className="border-[1px] border-[#D9D9D9] rounded-lg p-4"
              data-cy="settings-define-meeting-type-list-border"
            >
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
                        className="rounded-xl border border-[#D9D9D9] shadow-none cursor-pointer hover:border-[#D9D9D9] transition-colors  "
                        styles={{ body: { padding: '0px' } }}
                        data-cy={`settings-define-meeting-type-card-${item?.id}`}
                        onClick={() => {
                          router.push(
                            `/feedback/settings/define-meeting-type/${item?.id}`,
                          );
                        }}
                      >
                        <div
                          className="flex items-center justify-between gap-3 h-12 w-full px-4"
                          data-cy={`settings-define-meeting-type-card-header-row-${item?.id}`}
                        >
                          <div
                            className="text-sm font-normal text-gray-900 truncate"
                            title={item?.name}
                            data-cy={`settings-define-meeting-type-card-title-${item?.id}`}
                          >
                            {item?.name}
                          </div>
                          <div
                            className="shrink-0"
                            data-cy={`settings-define-meeting-type-card-actions-wrap-${item?.id}`}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            <Dropdown
                              trigger={['click']}
                              placement="bottomRight"
                              arrow={false}
                              open={
                                meetingTypeOpenDropdownId === String(item?.id)
                              }
                              onOpenChange={(open) => {
                                if (open) {
                                  setMeetingTypeOpenDropdownId(
                                    String(item?.id),
                                  );
                                } else {
                                  setMeetingTypeOpenDropdownId(null);
                                }
                              }}
                              menu={{
                                onClick: ({ key, domEvent }) => {
                                  if (key === 'delete') {
                                    domEvent.preventDefault();
                                    domEvent.stopPropagation();
                                    setMeetingTypeOpenDropdownId(
                                      String(item?.id),
                                    );
                                    return;
                                  }
                                  setMeetingTypeOpenDropdownId(null);
                                },
                                items: [
                                  {
                                    key: 'edit',
                                    label: 'Edit',
                                    icon: (
                                      <MdOutlineEdit className="w-4 h-4 " />
                                    ),
                                    className: 'text-xs text-gray-600',
                                    onClick: () => {
                                      handleEditModal(item);
                                      setMeetingTypeOpenDropdownId(null);
                                    },
                                  },
                                  {
                                    key: 'delete',
                                    className: 'text-xs text-gray-600',
                                    label: (
                                      <Popconfirm
                                        title="Are you sure you want to delete this meeting type?"
                                        onConfirm={() => {
                                          handleDeleteMeetingType(item?.id);
                                          setMeetingTypeOpenDropdownId(null);
                                        }}
                                        onCancel={() => {
                                          setMeetingTypeOpenDropdownId(null);
                                        }}
                                        okText="Yes"
                                        cancelText="No"
                                        okButtonProps={{
                                          loading: deleteLoading,
                                        }}
                                        data-cy={`settings-define-meeting-type-card-delete-confirm-${item?.id}`}
                                        id={`settingsDefineMeetingTypeCardDeleteConfirm${item?.id}`}
                                      >
                                        <span
                                          className="flex items-center gap-2"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setMeetingTypeOpenDropdownId(
                                              String(item?.id),
                                            );
                                          }}
                                          data-cy={`settings-define-meeting-type-card-delete-${item?.id}`}
                                        >
                                          <MdOutlineDelete className="w-4 h-4" />
                                          Delete
                                        </span>
                                      </Popconfirm>
                                    ),
                                  },
                                ],
                              }}
                            >
                              <button
                                type="button"
                                className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-[#D9D9D9] bg-transparent p-1 font-extrabold text-2xl text-black hover:border-primary hover:text-primary"
                                data-cy={`settings-define-meeting-type-card-actions-${item?.id}`}
                                id={`settingsDefineMeetingTypeCardActions${item?.id}`}
                              >
                                <BsThreeDots
                                  data-cy={`settings-define-meeting-type-card-actions-icon-${item?.id}`}
                                  id={`settingsDefineMeetingTypeCardActionsIcon${item?.id}`}
                                />
                              </button>
                            </Dropdown>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
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
        </Skeleton>
      </div>
    </>
  );
};

export default DefineMeetingType;
