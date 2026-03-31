'use client';
import { Button, Card, Dropdown, Popconfirm, Skeleton } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { useGetAllRecognitionWithRelations } from '@/store/server/features/CFR/recognitionCriteria/queries';
import { Edit2Icon } from 'lucide-react';
import { MdDeleteOutline } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { useDeleteRecognitionType } from '@/store/server/features/CFR/recognition/mutation';

const Page = () => {
  const { setOpenRecognitionCategoryModal, setRecognitionCategoryEditId } =
    ConversationStore();
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
            className="grid grid-cols-12 flex-col-reverse justify-between border-[1px] border-gray-200 rounded-lg p-4"
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
                    className="rounded-xl border border-gray-200 shadow-none cursor-pointer hover:border-gray-300 transition-colors"
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
                          className="mt-2 inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-normal "
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
                          menu={{
                            items: [
                              {
                                key: 'edit',
                                label: 'Edit',
                                icon: <Edit2Icon className="w-4 h-4 text-xs" />,
                                onClick: () => {
                                  setRecognitionCategoryEditId(
                                    String(item?.id),
                                  );
                                  setOpenRecognitionCategoryModal(true);
                                },
                              },
                              {
                                key: 'delete',
                                label: (
                                  <Popconfirm
                                    title="Are you sure you want to delete?"
                                    onConfirm={() => {
                                      deleteRecognitionType(String(item?.id));
                                    }}
                                    okText="Yes"
                                    cancelText="No"
                                    okButtonProps={{ loading: isDeleting }}
                                    data-cy={`settings-recognition-card-delete-confirm-${item?.id}`}
                                    id={`settingsRecognitionCardDeleteConfirm${item?.id}`}
                                  >
                                    <span
                                      className="flex items-center gap-2"
                                      data-cy={`settings-recognition-card-delete-${item?.id}`}
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
                            aria-label="Recognition actions"
                            icon={<EllipsisOutlined />}
                            className="shrink-0 !h-7 !w-7 !p-0 border border-gray-200 rounded-md flex items-center justify-center"
                            data-cy={`settings-recognition-card-actions-${item?.id}`}
                            id={`settingsRecognitionCardActions${item?.id}`}
                          />
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
