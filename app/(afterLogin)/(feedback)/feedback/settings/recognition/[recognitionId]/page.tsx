'use client';

import { useGetAllRecognitionWithRelations } from '@/store/server/features/CFR/recognitionCriteria/queries';
import { Button, Card, Dropdown, Popconfirm, Spin, Tag } from 'antd';
import {
  ArrowLeftOutlined,
  MoreOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Edit2Icon } from 'lucide-react';
import { MdDeleteOutline } from 'react-icons/md';

type RecognitionChild = {
  id?: string;
  name?: string;
  recognitionCriteria?: unknown[];
};

export default function RecognitionDetailPage() {
  const params = useParams<{ recognitionId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const recognitionId = params?.recognitionId;
  const recognitionName = searchParams?.get('name') ?? '';

  const { data: recognitionType, isLoading } =
    useGetAllRecognitionWithRelations();
  const selectedRecognition = recognitionType?.items?.find(
    (r: any) => String(r?.id) === String(recognitionId),
  );

  const children: RecognitionChild[] = selectedRecognition?.children ?? [];
  console.log('[Fast selected recognition]', selectedRecognition);
  console.log('[Fast children]', children);

  return (
    <div
      className="p-5 rounded-2xl bg-white h-full"
      data-cy="recognition-detail-page"
    >
      <div
        className="flex items-start justify-between gap-4"
        data-cy="recognition-detail-header"
      >
        <div
          className="flex items-start gap-3"
          data-cy="recognition-detail-title-area"
        >
          <Button
            type="default"
            size="small"
            icon={<ArrowLeftOutlined />}
            className="!h-8 !w-8 !p-0 flex items-center justify-center"
            onClick={() => router.back()}
            data-cy="recognition-detail-back"
            aria-label="Back"
          />
          <div className="min-w-0" data-cy="recognition-detail-titles">
            <div
              className="text-base md:text-lg font-semibold text-gray-900 truncate"
              title={recognitionName || selectedRecognition?.name}
              data-cy="recognition-detail-title"
            >
              {recognitionName || selectedRecognition?.name || 'Recognition'}
            </div>
            <div
              className="text-xs text-gray-500 mt-1"
              data-cy="recognition-detail-subtitle"
            >
              Recognition programs and criteria
            </div>
          </div>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="rounded-md"
          data-cy="recognition-detail-new"
          onClick={() => {
            // TODO: wire "New Recognition" later
          }}
        >
          New Recognition
        </Button>
      </div>

      <div className="mt-6" data-cy="recognition-detail-body">
        <Spin spinning={isLoading} data-cy="recognition-detail-loading">
          <div
            className="flex flex-col gap-4"
            data-cy="recognition-detail-list"
          >
            {children?.map((child: any) => {
              return (
                <Card
                  key={child?.id ?? child?.name}
                  className="rounded-xl border border-gray-200 shadow-none"
                  styles={{ body: { padding: 16 } }}
                  data-cy={`recognition-detail-item-${child?.id ?? child?.name ?? 'unknown'}`}
                >
                  <div
                    className="flex items-start justify-between gap-4"
                    data-cy="recognition-detail-item-row"
                  >
                    <div
                      className="min-w-0"
                      data-cy="recognition-detail-item-left"
                    >
                      <div
                        className="text-sm font-semibold text-gray-900 truncate"
                        title={child?.name}
                        data-cy="recognition-detail-item-name"
                      >
                        {child?.name || '-'}
                      </div>
                      <div
                        className="mt-2 flex flex-wrap gap-2"
                        data-cy="recognition-detail-item-tags"
                      >
                        {child?.frequency && (
                          <Tag
                            className="text-xs"
                            data-cy="recognition-detail-item-criteria-tag"
                          >
                            {child?.frequency}
                          </Tag>
                        )}

                        <Tag
                          className="text-xs"
                          data-cy="recognition-detail-item-criteria-tag"
                        >
                          {child?.isMonetized ? 'Monetized' : 'Not Monetized'}
                        </Tag>

                        <Tag
                          className="text-xs"
                          data-cy="recognition-detail-item-criteria-tag"
                        >
                          {child?.recognitionCriteria?.length} Criteria
                        </Tag>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-3 shrink-0"
                      data-cy="recognition-detail-item-actions"
                    >
                      <Button
                        type="link"
                        className="px-0 text-gray-600"
                        data-cy="recognition-detail-item-details"
                        onClick={() => {
                          // TODO: wire child details later
                        }}
                      >
                        Details
                      </Button>

                      <Dropdown
                        trigger={['click']}
                        menu={{
                          items: [
                            {
                              key: 'edit',
                              label: 'Edit',
                              icon: <Edit2Icon className="w-4 h-4 text-xs" />,
                              onClick: () => {
                                // TODO: wire edit action later
                                // setSelectedRecognitionType(item);
                                // setOpen(true);
                              },
                            },
                            {
                              key: 'delete',
                              label: (
                                <Popconfirm
                                  title="Are you sure you want to delete?"
                                  onConfirm={() => {
                                    // TODO: wire delete action later
                                    // deleteRecognitionType(item?.id);
                                  }}
                                  okText="Yes"
                                  cancelText="No"
                                  data-cy={`settings-recognition-card-delete-confirm-${child?.id}`}
                                  id={`settingsRecognitionCardDeleteConfirm${child?.id}`}
                                >
                                  <span
                                    className="flex items-center gap-2"
                                    data-cy={`settings-recognition-card-delete-${child?.id}`}
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
                          icon={<MoreOutlined />}
                          className="shrink-0 !h-7 !w-7 !p-0 border border-gray-200 rounded-md flex items-center justify-center"
                          data-cy={`settings-recognition-card-actions-${child?.id}`}
                          id={`settingsRecognitionCardActions${child?.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        />
                      </Dropdown>
                    </div>
                  </div>
                </Card>
              );
            })}

            {!isLoading && children?.length === 0 && (
              <div
                className="text-sm text-gray-500 py-10 text-center border border-dashed border-gray-200 rounded-xl"
                data-cy="recognition-detail-empty"
              >
                No recognitions found.
              </div>
            )}
          </div>
        </Spin>
      </div>
    </div>
  );
}
