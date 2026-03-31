'use client';

import { useGetAllRecognitionWithRelations } from '@/store/server/features/CFR/recognitionCriteria/queries';
import { Button, Card, Dropdown, Popconfirm, Skeleton, Tag } from 'antd';
import { EllipsisOutlined, PlusOutlined } from '@ant-design/icons';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Edit2Icon } from 'lucide-react';
import { MdDeleteOutline } from 'react-icons/md';
import { useMemo, useState } from 'react';
import { ConversationStore } from '@/store/uistate/features/conversation';
import RecognitionForm from '../../_components/recognition/createRecognition';
import { AiOutlineTrophy } from 'react-icons/ai';
import { LuSuperscript } from 'react-icons/lu';
import { IoChevronBackSharp } from 'react-icons/io5';

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
            icon={<IoChevronBackSharp />}
            className="!h-8 !w-8 !p-0 flex items-center justify-center border-[1px] border-gray-200 rounded-lg"
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
                  className="rounded-lg border border-gray-200 shadow-none"
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
                      <div className=" bg-[#E6F4FF] rounded-lg h-9 w-9 flex items-center justify-center text-lg text-primary ">
                        <AiOutlineTrophy className="" />
                      </div>
                      <div className="min-w-0">
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

                          <Tag
                            className="text-xs"
                            data-cy="recognition-detail-item-department-tag"
                          >
                            {
                              selectedRecognition?.children?.department
                                ?.createdAt
                            }
                          </Tag>

                          <Tag
                            className="text-xs"
                            data-cy="recognition-detail-item-monetized-tag"
                          >
                            {child?.isMonetized ? 'Monetized' : 'Not Monetized'}
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
                        className="px-0 text-gray-600"
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
                        Details
                      </Button>

                      <Dropdown
                        trigger={['click']}
                        menu={{
                          items: [
                            {
                              key: 'editRecognitionType',
                              label: 'Edit Recognition Type',
                              icon: <Edit2Icon className="w-4 h-4 text-xs" />,
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
                              icon: (
                                <LuSuperscript className="w-4 h-4 text-xs" />
                              ),
                              onClick: () => {
                                openEditRecognitionModal(child?.id, 'formula');
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
                          icon={<EllipsisOutlined />}
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

                  {isExpanded && (
                    <div
                      className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4"
                      data-cy={`recognition-detail-criteria-accordion-${child?.id}`}
                    >
                      <div
                        className="overflow-x-auto"
                        data-cy={`recognition-detail-criteria-table-${child?.id}`}
                      >
                        <div
                          className="min-w-[760px] rounded-md bg-white"
                          data-cy="recognition-detail-criteria-table-inner"
                        >
                          <div
                            className="grid grid-cols-12 gap-2 border-b border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700"
                            data-cy="recognition-detail-criteria-table-header"
                          >
                            <div
                              className="col-span-4"
                              data-cy="recognition-detail-criteria-col-criteria"
                            >
                              Critaria
                            </div>
                            <div
                              className="col-span-1"
                              data-cy="recognition-detail-criteria-col-weight"
                            >
                              Weight
                            </div>
                            <div
                              className="col-span-2"
                              data-cy="recognition-detail-criteria-col-operator"
                            >
                              Operator
                            </div>
                            <div
                              className="col-span-2"
                              data-cy="recognition-detail-criteria-col-condition"
                            >
                              Condition
                            </div>
                            <div
                              className="col-span-1"
                              data-cy="recognition-detail-criteria-col-status"
                            >
                              Status
                            </div>
                            <div
                              className="col-span-1"
                              data-cy="recognition-detail-criteria-col-value"
                            >
                              Value
                            </div>
                            <div
                              className="col-span-1 text-right"
                              data-cy="recognition-detail-criteria-col-action"
                            >
                              Action
                            </div>
                          </div>

                          {(child?.recognitionCriteria ?? []).map(
                            (criterion: RecognitionCriterion) => {
                              const statusLabel = criterion?.active
                                ? 'Active'
                                : 'Inactive';
                              return (
                                <div
                                  key={
                                    criterion?.id ??
                                    `${child?.id}-${criterion?.criteria?.criteriaName}`
                                  }
                                  className="grid grid-cols-12 gap-2 border-b border-gray-100 px-3 py-2 text-xs text-gray-700 last:border-b-0"
                                  data-cy={`recognition-detail-criteria-row-${criterion?.id}`}
                                >
                                  <div
                                    className="col-span-4"
                                    data-cy="recognition-detail-criteria-name"
                                  >
                                    <span className="inline-flex max-w-full truncate rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] text-gray-700">
                                      {criterion?.criteria?.criteriaName ?? '-'}
                                    </span>
                                  </div>
                                  <div
                                    className="col-span-1"
                                    data-cy="recognition-detail-criteria-weight"
                                  >
                                    {criterion?.weight ?? '-'}
                                  </div>
                                  <div
                                    className="col-span-2"
                                    data-cy="recognition-detail-criteria-operator"
                                  >
                                    {criterion?.operator ?? '-'}
                                  </div>
                                  <div
                                    className="col-span-2"
                                    data-cy="recognition-detail-criteria-condition"
                                  >
                                    {criterion?.condition ?? '-'}
                                  </div>
                                  <div
                                    className="col-span-1"
                                    data-cy="recognition-detail-criteria-status"
                                  >
                                    <span className="inline-flex rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] text-gray-600">
                                      {statusLabel}
                                    </span>
                                  </div>
                                  <div
                                    className="col-span-1"
                                    data-cy="recognition-detail-criteria-value"
                                  >
                                    {criterion?.value ?? 0}
                                  </div>
                                  <div
                                    className="col-span-1 flex justify-end"
                                    data-cy="recognition-detail-criteria-action"
                                  >
                                    <Dropdown
                                      trigger={['click']}
                                      menu={{
                                        items: [
                                          {
                                            key: 'edit',
                                            label: 'Edit Recognition Criterion',
                                            icon: (
                                              <Edit2Icon className="w-4 h-4 text-xs" />
                                            ),
                                            onClick: () => {
                                              openEditRecognitionModal(
                                                child?.id,
                                                'criteria',
                                                criterion?.id,
                                              );
                                            },
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
                                        data-cy={`recognition-detail-criteria-actions-${criterion?.id}`}
                                        id={`recognitionDetailCriteriaActions${criterion?.id}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                        }}
                                      />
                                    </Dropdown>
                                  </div>
                                </div>
                              );
                            },
                          )}

                          {!criteriaCount && (
                            <div
                              className="px-3 py-6 text-center text-xs text-gray-500"
                              data-cy={`recognition-detail-criteria-empty-${child?.id}`}
                            >
                              No criteria found.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
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
