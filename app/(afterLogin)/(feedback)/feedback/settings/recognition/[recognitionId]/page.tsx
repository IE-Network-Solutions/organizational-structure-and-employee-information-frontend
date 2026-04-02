'use client';

import { useGetAllRecognitionWithRelations } from '@/store/server/features/CFR/recognitionCriteria/queries';
import {
  Button,
  Card,
  Dropdown,
  Popconfirm,
  Skeleton,
  Table,
  TableColumnsType,
  Tag,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { MdDeleteOutline, MdOutlineEdit } from 'react-icons/md';
import { useMemo, useState } from 'react';
import { ConversationStore } from '@/store/uistate/features/conversation';
import RecognitionForm from '../../_components/recognition/createRecognition';
import { AiOutlineTrophy } from 'react-icons/ai';
import { LuSuperscript } from 'react-icons/lu';
import { IoChevronBackSharp } from 'react-icons/io5';
import { BsThreeDots } from 'react-icons/bs';
import { useDeleteRecognitionType } from '@/store/server/features/CFR/recognition/mutation';
export type CriteriaTableRecord = {
  id?: string;
  criteria?: { criteriaName?: string };
  weight?: number | string;
  operator?: string;
  condition?: string;
  active?: boolean;
  value?: number | string;
};
type RecognitionCriterion = {
  id?: string;
  weight?: number;
  operator?: string;
  condition?: string;
  value?: number;
  active?: boolean;
  criteria?: {
    criteriaName?: string;
  };
};

type RecognitionChild = {
  id?: string;
  name?: string;
  recognitionCriteria?: RecognitionCriterion[];
  frequency?: string;
  isMonetized?: boolean;
};

export default function RecognitionDetailPage() {
  const { setOpen } = ConversationStore();
  const params = useParams<{ recognitionId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [expandedChildId, setExpandedChildId] = useState<string | null>(null);

  const recognitionId = params?.recognitionId;
  const recognitionName = searchParams?.get('name') ?? '';
  const {
    setOpenRecognitionType,
    setParentRecognitionTypeId,
    setSelectedRecognitionType,
    setEditType,
    setEditingRecognitionCriteriaId,
  } = ConversationStore();

  const { data: recognitionType, isLoading } =
    useGetAllRecognitionWithRelations();
  const selectedRecognition = recognitionType?.items?.find(
    (r: any) => String(r?.id) === String(recognitionId),
  );
  const { mutate: deleteRecognitionType } = useDeleteRecognitionType();

  const children: RecognitionChild[] = selectedRecognition?.children ?? [];
  const selectedTitle = useMemo(
    () => recognitionName || selectedRecognition?.name || 'Recognition',
    [recognitionName, selectedRecognition?.name],
  );
  const description = selectedRecognition?.description || '';
  const openEditRecognitionModal = (
    id?: string,
    editTypeArg?: string,
    recognitionCriteriaId?: string,
  ) => {
    if (!id) return;
    setEditType(editTypeArg || '');
    setParentRecognitionTypeId('');
    setSelectedRecognitionType(String(id));
    setEditingRecognitionCriteriaId(
      recognitionCriteriaId ? String(recognitionCriteriaId) : '',
    );
    setOpenRecognitionType(true);
  };
  const handleDeleteRecognitionType = (id: string) => {
    deleteRecognitionType(id);
  };

  const columns: TableColumnsType<CriteriaTableRecord> = [
    {
      title: 'Criteria',
      width: 200,
      dataIndex: ['criteria', 'criteriaName'],
      key: 'criteriaName',
      render: (notUsedCell: unknown, record: CriteriaTableRecord) => (
        <span
          className="inline-block rounded-[4px] border border-gray-200 bg-gray-100/50 px-2 py-1 text-sm text-gray-500"
          data-cy="recognition-type-criteria-table-criteria-pill"
        >
          {record?.criteria?.criteriaName ?? '-'}
        </span>
      ),
    },
    {
      title: 'Weight',
      dataIndex: 'weight',
      key: 'weight',
      width: 90,
    },
    {
      title: 'Operator',
      dataIndex: 'operator',
      key: 'operator',
      width: 100,
    },
    {
      title: 'Condition',
      dataIndex: 'condition',
      key: 'condition',
      width: 100,
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      width: 100,
      render: (notUsedStatus: unknown, record: CriteriaTableRecord) => (
        <Tag className="m-0 border-gray-200 bg-gray-50 text-gray-700">
          {record?.active ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      width: 90,
    },
  ];

  return (
    <div
      className="p-5 rounded-2xl bg-white h-full"
      data-cy="recognition-detail-page"
    >
      <div
        className="flex items-start justify-between gap-4  border-b border-gray-200 pb-4"
        data-cy="recognition-detail-header"
      >
        <div
          className="flex items-start gap-3"
          data-cy="recognition-detail-title-area"
        >
          <Button
            type="default"
            size="small"
            icon={<IoChevronBackSharp />}
            className="!h-8 !w-8 !p-0 flex items-center justify-center border-[1px] border-[#D9D9D9] rounded-lg"
            onClick={() => router.back()}
            data-cy="recognition-detail-back"
            aria-label="Back"
          />
          <div className="min-w-0" data-cy="recognition-detail-titles">
            <div
              className="text-base md:text-lg font-semibold text-gray-900 truncate"
              title={selectedTitle}
              data-cy="recognition-detail-title"
            >
              {selectedTitle}
            </div>
            <div
              className="text-xs text-gray-500 mt-1"
              data-cy="recognition-detail-subtitle"
            >
              {description || 'Recognition programs and criteria'}
            </div>
          </div>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="rounded-md"
          data-cy="recognition-detail-new"
          onClick={() => {
            setEditType('');
            setSelectedRecognitionType('');
            setEditingRecognitionCriteriaId('');
            setParentRecognitionTypeId(String(recognitionId ?? ''));
            setOpenRecognitionType(true);
          }}
        >
          New Recognition
        </Button>
      </div>

      <div className="mt-6" data-cy="recognition-detail-body">
        <div data-cy="recognition-detail-loading">
          <Skeleton active loading={isLoading} paragraph={{ rows: 8 }}>
            <div
              className="flex flex-col gap-4"
              data-cy="recognition-detail-list"
            >
              {children?.map((child: any) => {
                const isExpanded = expandedChildId === String(child?.id);
                const criteriaCount = child?.recognitionCriteria?.length ?? 0;
                return (
                  <Card
                    key={child?.id ?? child?.name}
                    className="rounded-lg border border-[#D9D9D9] shadow-none"
                    styles={{ body: { padding: 16 } }}
                    data-cy={`recognition-detail-item-${child?.id ?? child?.name ?? 'unknown'}`}
                  >
                    <div
                      className="flex items-start justify-between gap-4"
                      data-cy="recognition-detail-item-row"
                    >
                      <div
                        className=" flex items-start justify-between gap-4"
                        data-cy="recognition-detail-item-left"
                      >
                        <div
                          className=" bg-[#E6F4FF] rounded-lg h-9 w-9 flex items-center justify-center text-lg text-primary "
                          data-cy="recognition-detail-item-icon-wrap"
                        >
                          <AiOutlineTrophy className="" />
                        </div>
                        <div
                          className="min-w-0"
                          data-cy="recognition-detail-item-text-wrap"
                        >
                          <div
                            className="text-sm font-semibold  truncate"
                            title={child?.name}
                            data-cy="recognition-detail-item-name"
                          >
                            {child?.name || '-'}
                          </div>
                          <div
                            className="text-sm font-normal text-gray-500 truncate"
                            title={child?.description}
                            data-cy="recognition-detail-item-description"
                          >
                            {child?.description || '-'}
                          </div>
                          <div
                            className="mt-2 flex flex-wrap gap-2"
                            data-cy="recognition-detail-item-tags"
                          >
                            {child?.frequency && (
                              <Tag
                                className="text-xs"
                                data-cy="recognition-detail-item-frequency-tag"
                              >
                                {child?.frequency}
                              </Tag>
                            )}
                            {child?.department && (
                              <Tag
                                className="text-xs"
                                data-cy="recognition-detail-item-department-tag"
                              >
                                {child?.department?.name}
                              </Tag>
                            )}

                            <Tag
                              className="text-xs"
                              data-cy="recognition-detail-item-monetized-tag"
                            >
                              {child?.isMonetized
                                ? 'Monetized'
                                : 'Not Monetized'}
                            </Tag>

                            <Tag
                              className="text-xs"
                              data-cy="recognition-detail-item-criteria-tag"
                            >
                              {criteriaCount} Criteria
                            </Tag>
                          </div>{' '}
                        </div>
                      </div>

                      <div
                        className="flex items-center gap-3 shrink-0"
                        data-cy="recognition-detail-item-actions"
                      >
                        <Button
                          type="link"
                          className={`px-3 py-1 ${isExpanded ? 'bg-[#D9D9D9]' : 'bg-white'} font-normal text-sm text-black rounded-md`}
                          data-cy="recognition-detail-item-details"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedChildId((prev) =>
                              prev === String(child?.id)
                                ? null
                                : String(child?.id),
                            );
                          }}
                        >
                          {isExpanded ? 'Collapse' : 'Detail'}
                        </Button>

                        <Dropdown
                          trigger={['click']}
                          placement="bottomRight"
                          arrow={false}
                          menu={{
                            items: [
                              {
                                key: 'editRecognitionType',
                                label: 'Edit Recognition Type',
                                icon: <MdOutlineEdit className="w-4 h-4 " />,
                                className: 'text-xs text-gray-600',
                                onClick: () => {
                                  openEditRecognitionModal(
                                    child?.id,
                                    'recognition',
                                  );
                                },
                              },
                              {
                                key: 'editFormula',
                                label: 'Edit Formula',
                                icon: <LuSuperscript className="w-4 h-4 " />,
                                className: 'text-xs text-gray-600',
                                onClick: () => {
                                  openEditRecognitionModal(
                                    child?.id,
                                    'formula',
                                  );
                                },
                              },
                              {
                                key: 'delete',
                                className: 'text-xs text-gray-600',

                                label: (
                                  <Popconfirm
                                    title="Are you sure you want to delete?"
                                    onConfirm={() => {
                                      handleDeleteRecognitionType(child?.id);
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
                          <button
                            type="button"
                            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-[#D9D9D9] bg-transparent p-1 font-extrabold text-2xl text-black hover:border-primary hover:text-primary"
                            data-cy={`settings-recognition-card-actions-${child?.id}`}
                            id={`settingsRecognitionCardActions${child?.id}`}
                          >
                            <BsThreeDots
                              data-cy={`settings-recognition-card-actions-icon-${child?.id}`}
                              id={`settingsRecognitionCardActionsIcon${child?.id}`}
                            />
                          </button>
                        </Dropdown>
                      </div>
                    </div>

                    {isExpanded && (
                      <div
                        className="mt-4  rounded-[8px] border bg-gray-50 p-3"
                        data-cy={`recognition-detail-criteria-table-${child?.id}`}
                      >
                        <div className="rounded-[8px]  p-3 bg-white data-cy={`recognition-detail-criteria-table-inner-${child?.id}`}">
                          <Table<CriteriaTableRecord>
                            rowKey={(r, index) =>
                              String(
                                r.id ??
                                  r.criteria?.criteriaName ??
                                  `criteria-row-${index}`,
                              )
                            }
                            size="small"
                            columns={columns}
                            dataSource={child?.recognitionCriteria ?? []}
                            pagination={false}
                            className="bg-transparent [&_.ant-table]:bg-transparent"
                            scroll={{ x: 720 }}
                          />
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}

              {!isLoading && children?.length === 0 && (
                <div
                  className="text-sm text-gray-500 py-10 text-center border border-dashed border-[#D9D9D9] rounded-xl"
                  data-cy="recognition-detail-empty"
                >
                  No recognitions found.
                </div>
              )}
            </div>
          </Skeleton>
        </div>
      </div>
      <RecognitionForm
        createCategory={false}
        onClose={() => setOpen(false)}
        data-cy="settings-recognition-form"
      />
    </div>
  );
}
