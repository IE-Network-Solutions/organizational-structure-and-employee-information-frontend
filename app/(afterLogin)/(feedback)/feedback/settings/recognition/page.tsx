'use client';
import { Card, Dropdown, Popconfirm, Skeleton } from 'antd';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { useGetAllRecognitionWithRelations } from '@/store/server/features/CFR/recognitionCriteria/queries';
import { MdOutlineDelete, MdOutlineEdit } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { useDeleteRecognitionType } from '@/store/server/features/CFR/recognition/mutation';
import { BsThreeDots } from 'react-icons/bs';

const Page = () => {
  const {
    setOpenRecognitionCategoryModal,
    setRecognitionCategoryEditId,
    recognitionOpenDropdownId,
    setRecognitionOpenDropdownId,
  } = ConversationStore();
  const router = useRouter();
  const { mutate: deleteRecognitionType, isLoading: isDeleting } =
    useDeleteRecognitionType();

  const { data: recognitionType, isLoading } =
    useGetAllRecognitionWithRelations();
  return (
    <div
      className="rounded-2xl bg-white h-full"
      data-cy="settings-recognition-page"
      id="settingsRecognitionPage"
    >
      <div data-cy="settings-recognition-spin">
        <Skeleton active loading={isLoading} paragraph={{ rows: 6 }}>
          <div
            className="grid grid-cols-12 flex-col-reverse justify-between border-[1px] border-[#D9D9D9] rounded-lg p-4"
            data-cy="settings-recognition-content"
            id="settingsRecognitionContent"
          >
            <div
              className="col-span-12 "
              data-cy="settings-recognition-tabs-container"
              id="settingsRecognitionTabsContainer"
            >
              <div
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                data-cy="settings-recognition-grid"
              >
                {recognitionType?.items?.map((item: any) => (
                  <Card
                    key={item?.id}
                    className="rounded-xl border border-[#D9D9D9] shadow-none cursor-pointer hover:border-[#D9D9D9] transition-colors"
                    styles={{ body: { padding: 16 } }}
                    data-cy={`settings-recognition-card-${item?.id}`}
                    onClick={() => {
                      router.push(
                        `/feedback/settings/recognition/${item?.id}?name=${encodeURIComponent(
                          item?.name ?? '',
                        )}`,
                      );
                    }}
                  >
                    <div
                      className="flex items-start justify-between gap-3"
                      data-cy={`settings-recognition-card-header-${item?.id}`}
                    >
                      <div
                        className="min-w-0"
                        data-cy={`settings-recognition-card-title-section-${item?.id}`}
                      >
                        <div
                          className="text-sm font-normal  truncate"
                          title={item?.name}
                          data-cy={`settings-recognition-card-title-${item?.id}`}
                        >
                          {item?.name}
                        </div>
                        <div
                          className="mt-2 inline-flex items-center rounded-md border border-[#D9D9D9] bg-gray-50 px-2 py-1 text-xs font-normal "
                          data-cy={`settings-recognition-card-count-${item?.id}`}
                        >
                          {item?.children?.length ?? 0} Recognitions
                        </div>
                      </div>

                      <div
                        className="shrink-0"
                        data-cy={`settings-recognition-card-actions-wrap-${item?.id}`}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <Dropdown
                          trigger={['click']}
                          placement="bottomRight"
                          arrow
                          open={recognitionOpenDropdownId === String(item?.id)}
                          onOpenChange={(open) => {
                            if (open) {
                              setRecognitionOpenDropdownId(String(item?.id));
                            } else {
                              setRecognitionOpenDropdownId(null);
                            }
                          }}
                          menu={{
                            onClick: ({ key, domEvent }) => {
                              if (key === 'delete') {
                                domEvent.preventDefault();
                                domEvent.stopPropagation();
                                setRecognitionOpenDropdownId(String(item?.id));
                                return;
                              }
                              setRecognitionOpenDropdownId(null);
                            },
                            items: [
                              {
                                key: 'edit',
                                label: 'Edit',
                                icon: <MdOutlineEdit className="w-4 h-4 " />,
                                className: 'text-xs text-gray-600',
                                onClick: () => {
                                  setRecognitionCategoryEditId(
                                    String(item?.id),
                                  );
                                  setOpenRecognitionCategoryModal(true);
                                  setRecognitionOpenDropdownId(null);
                                },
                              },
                              {
                                key: 'delete',
                                className: 'text-xs text-gray-600',
                                label: (
                                  <Popconfirm
                                    title="Are you sure you want to delete?"
                                    onConfirm={() => {
                                      deleteRecognitionType(String(item?.id));
                                      setRecognitionOpenDropdownId(null);
                                    }}
                                    onCancel={() => {
                                      setRecognitionOpenDropdownId(null);
                                    }}
                                    okText="Yes"
                                    cancelText="No"
                                    okButtonProps={{ loading: isDeleting }}
                                    data-cy={`settings-recognition-card-delete-confirm-${item?.id}`}
                                    id={`settingsRecognitionCardDeleteConfirm${item?.id}`}
                                  >
                                    <span
                                      className="flex items-center gap-2"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setRecognitionOpenDropdownId(
                                          String(item?.id),
                                        );
                                      }}
                                      data-cy={`settings-recognition-card-delete-${item?.id}`}
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
                            className="h-6 w-6 cursor-pointer text-gray-500 hover:text-gray-700 p-1.5 border border-[#D9D9D9] rounded-md bg-transparent flex items-center justify-center hover:border-[#D9D9D9]"
                            data-cy={`settings-recognition-card-actions-${item?.id}`}
                            id={`settingsRecognitionCardActions${item?.id}`}
                          >
                            <BsThreeDots
                              data-cy={`settings-recognition-card-actions-icon-${item?.id}`}
                              id={`settingsRecognitionCardActionsIcon${item?.id}`}
                              className="text-lg"
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
        </Skeleton>
      </div>
    </div>
  );
};

export default Page;
