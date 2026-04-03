'use client';
/* eslint-disable local-rules/data-cy-required, @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars */
import React, { useEffect, useMemo, useState } from 'react';
import { Card, Dropdown, Modal, Divider } from 'antd';
import { ListChecks, CheckCheck, Copy, Share2 } from 'lucide-react';
import { MdMoreHoriz } from 'react-icons/md';
import { MdEvent } from 'react-icons/md';
import dayjs from 'dayjs';
import Link from 'next/link';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useGetFormsByCategoryID } from '@/store/server/features/feedback/form/queries';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDynamicFormStore } from '@/store/uistate/features/feedback/dynamicForm';
import CustomPagination from '@/components/customPagination';
import EditFormsModal from './editFormCard';
import { useDeleteForm } from '@/store/server/features/feedback/form/mutation';
import {
  inferSubmissionTotalFromResponseRows,
  lastNDaysSubmissionCounts,
  normalizeSummaryResultPayload,
  pickInvitedTotal,
} from '@/app/(afterLogin)/(feedback)/feedback/categories/[id]/survey/[slug]/_components/surveyInsights/surveyInsightsData';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';

function pickResponseTotalFromForm(form: any): number {
  const n = Number(
    form?.responseCount ??
      form?.response_count ??
      form?.submissionCount ??
      form?.submission_count ??
      form?.totalResponses ??
      form?.total_responses,
  );
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/** Newest first; supports common API field names. */
function sortFormsByCreatedAtDesc(forms: any[]): any[] {
  return [...forms].sort((a, b) => {
    const rawA = a?.createdAt ?? a?.created_at ?? a?.createdDate ?? 0;
    const rawB = b?.createdAt ?? b?.created_at ?? b?.createdDate ?? 0;
    const ta = dayjs(rawA).valueOf();
    const tb = dayjs(rawB).valueOf();
    const na = Number.isFinite(ta) ? ta : 0;
    const nb = Number.isFinite(tb) ? tb : 0;
    return nb - na;
  });
}

function getFormFilledPercent(form: any): number {
  const explicit = Number(
    form?.completionPercent ??
      form?.completion_percent ??
      form?.filledPercent ??
      form?.filled_percent,
  );
  if (Number.isFinite(explicit) && explicit >= 0) {
    return Math.min(100, Math.round(explicit));
  }
  const invited = pickInvitedTotal(form);
  const responses = pickResponseTotalFromForm(form);
  if (invited != null && invited > 0) {
    return Math.min(100, Math.round((responses / invited) * 100));
  }
  return 0;
}

function pickResponseTrendLast7Days(form: any): number | null {
  const n = Number(
    form?.responseTrend7d ??
      form?.responseTrendLast7Days ??
      form?.last7DaysDelta ??
      form?.responsesLast7DaysDelta ??
      form?.weekOverWeekResponseDelta,
  );
  if (!Number.isFinite(n)) return null;
  return Math.round(n);
}

/** Page size for this grid only (pagination hidden until more than this many forms). */
const FORMS_LIST_PAGE_SIZE = 9;

function FormCardsLoadingSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-4 bg-white px-3 py-2 sm:grid-cols-2 sm:px-4 sm:pb-4 sm:pt-1 lg:grid-cols-3"
      data-cy="form-cards-loading"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading surveys"
    >
      {Array.from({ length: FORMS_LIST_PAGE_SIZE }).map((_, i) => (
        <div
          key={i}
          className="flex h-full min-h-[200px] min-w-0 flex-col rounded-[10px] border border-gray-200 bg-white p-5"
        >
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="h-6 min-w-0 flex-1 max-w-[min(100%,220px)] animate-pulse rounded-md bg-gray-100" />
            <div className="h-8 w-8 shrink-0 animate-pulse rounded-md border border-gray-100 bg-gray-50" />
          </div>
          <div className="mb-2 h-4 w-14 animate-pulse rounded bg-gray-100" />
          <div className="mb-2 flex min-w-0 items-center gap-3">
            <div className="h-2.5 min-w-0 flex-1 animate-pulse rounded-full bg-gray-100" />
            <div className="h-4 w-9 shrink-0 animate-pulse rounded bg-gray-100" />
          </div>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-5">
            <div className="h-4 w-[9.5rem] max-w-[55%] animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-24 shrink-0 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

const FormCard: React.FC<{ id: string }> = ({ id }) => {
  const [formsListPage, setFormsListPage] = useState(1);
  const requestedFormIdsRef = React.useRef<Set<string>>(new Set());
  const {
    selectedFormId,
    searchFormParams,
    searchFormDraft,
    setIsEditModalVisible,
    setSelectedFormId,
    categoryFormsListBump,
  } = CategoriesManagementStore();

  const {
    deletedItem,
    setDeletedItem,
    deleteFormModal,
    setDeleteFormModal,
    isCopyURLModalOpen,
    setIsCopyModalOpen,
    generatedUrl,
    setGeneratedUrl,
    isChecked,
    setIsChecked,
  } = useDynamicFormStore();

  const {
    data: formsByCategoryId,
    isLoading: isFormCardsLoading,
    isFetching: isFormCardsFetching,
    isPreviousData: isFormCardsPreviousData,
  } = useGetFormsByCategoryID(
    id,
    searchFormParams?.form_name || '',
    searchFormParams?.form_description || '',
    searchFormParams?.createdBy || '',
    FORMS_LIST_PAGE_SIZE,
    formsListPage,
  );
  const [responseRowsByFormId, setResponseRowsByFormId] = useState<
    Record<string, any[]>
  >({});
  const [responseRowsLoadingByFormId, setResponseRowsLoadingByFormId] =
    useState<Record<string, boolean>>({});

  const searchDraftPending =
    String(searchFormDraft ?? '').trim() !==
    String(searchFormParams?.form_name ?? '').trim();

  /** Skeleton: initial load, debounced search not yet applied to query, or fetch in flight with stale rows. */
  const showFormCardsSkeleton =
    isFormCardsLoading ||
    searchDraftPending ||
    (isFormCardsFetching && isFormCardsPreviousData);

  const totalFormItems = formsByCategoryId?.meta?.totalItems ?? 0;
  const formTotalPages = Math.max(
    1,
    Math.ceil(totalFormItems / FORMS_LIST_PAGE_SIZE),
  );
  const showFormPagination = totalFormItems > FORMS_LIST_PAGE_SIZE;

  useEffect(() => {
    setFormsListPage(1);
  }, [
    id,
    searchFormParams?.form_name,
    searchFormParams?.form_description,
    searchFormParams?.createdBy,
  ]);

  useEffect(() => {
    if (categoryFormsListBump > 0) {
      setFormsListPage(1);
    }
  }, [categoryFormsListBump]);

  useEffect(() => {
    if (formsListPage > formTotalPages) {
      setFormsListPage(formTotalPages);
    }
  }, [formsListPage, formTotalPages]);

  const formItemsSorted = useMemo(() => {
    const items = formsByCategoryId?.items;
    if (!Array.isArray(items) || items.length === 0) return [];
    return sortFormsByCreatedAtDesc(items);
  }, [formsByCategoryId?.items]);

  useEffect(() => {
    let unmounted = false;
    const targetFormIds = formItemsSorted
      .map((f: any) => String(f?.id ?? ''))
      .filter(Boolean);
    const pendingIds = targetFormIds.filter(
      (fid) => !requestedFormIdsRef.current.has(fid),
    );
    if (pendingIds.length === 0) return () => {};

    const loadByForm = async (formId: string) => {
      requestedFormIdsRef.current.add(formId);
      try {
        setResponseRowsLoadingByFormId((prev) => ({ ...prev, [formId]: true }));
        const token = await getCurrentToken();
        const tenantId = useAuthenticationStore.getState().tenantId;
        const payload = await crudRequest({
          url: `${ORG_DEV_URL}/responses/by-formId/${formId}`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            tenantId: tenantId,
          },
        });
        if (unmounted) return;
        setResponseRowsByFormId((prev) => ({
          ...prev,
          [formId]: normalizeSummaryResultPayload(payload),
        }));
      } catch {
        if (unmounted) return;
        setResponseRowsByFormId((prev) => ({ ...prev, [formId]: [] }));
      } finally {
        if (unmounted) return;
        setResponseRowsLoadingByFormId((prev) => ({
          ...prev,
          [formId]: false,
        }));
      }
    };

    for (const fid of pendingIds) {
      void loadByForm(fid);
    }
    return () => {
      unmounted = true;
    };
  }, [formItemsSorted]);

  const { mutate: deleteForm, isLoading: deleteFormLoading } = useDeleteForm();
  const handleFormPaginationChange = (page: number, _pageSize: number) => {
    setFormsListPage(page);
  };

  const handleFormPaginationSizeChange = () => {
    setFormsListPage(1);
  };

  const handleFormDelete = () => {
    deleteForm(deletedItem, {
      onSuccess: () => {
        setDeleteFormModal(false);
      },
    });
  };

  const handleMenuClick = (key: string, category: any) => {
    if (key === 'edit') {
      setIsEditModalVisible(true);
      setSelectedFormId(category.id);
    } else if (key === 'delete') {
      setDeletedItem(category.id);
      setDeleteFormModal(true);
    } else if (key === 'copy') {
      setSelectedFormId(category.id);
      setIsCopyModalOpen(true);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/surveys/${selectedFormId}`;
      setGeneratedUrl(url);
    }
  }, [selectedFormId, setGeneratedUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedUrl).then(() => {
      setIsChecked(true);
      setIsCopyModalOpen(true);
      setTimeout(() => {
        setIsChecked(false);
        setIsCopyModalOpen(false);
      }, 5000);
    });
  };

  if (showFormCardsSkeleton) {
    return <FormCardsLoadingSkeleton />;
  }

  return (
    <>
      <div
        className="grid grid-cols-1 gap-4 bg-white px-3 py-1 sm:grid-cols-2 sm:px-4 sm:pb-4 sm:pt-0 lg:grid-cols-3"
        data-cy="form-card-list-container"
        id="form-card-list-container"
      >
        {formItemsSorted.length > 0 ? (
          formItemsSorted.map((form: any) => {
            const surveyHref = `/feedback/categories/${id}/survey/${form.id}`;
            const qCount = Array.isArray(form?.questions)
              ? form.questions.length
              : 0;
            const formRows = responseRowsByFormId[String(form?.id)] ?? [];
            const formRowsLoading =
              responseRowsLoadingByFormId[String(form?.id)] ?? false;
            const inferredResponses =
              inferSubmissionTotalFromResponseRows(formRows);
            const responses =
              inferredResponses > 0
                ? inferredResponses
                : pickResponseTotalFromForm(form);
            const trendLast7 = lastNDaysSubmissionCounts(formRows, 7);
            const trendLast14 = lastNDaysSubmissionCounts(formRows, 14);
            const recent7Total =
              trendLast14.length >= 7
                ? trendLast14.slice(-7).reduce((a, b) => a + b, 0)
                : trendLast7.reduce((a, b) => a + b, 0);
            const prev7Total =
              trendLast14.length >= 14
                ? trendLast14.slice(0, 7).reduce((a, b) => a + b, 0)
                : 0;
            const trendDeltaComputed = recent7Total - prev7Total;
            const trendDeltaFallback = pickResponseTrendLast7Days(form);
            const trend7d =
              formRows.length > 0 || trendLast14.length >= 14
                ? trendDeltaComputed
                : trendDeltaFallback;
            const sparkMax = Math.max(...trendLast7, 1);
            const endRaw = form?.endDate ?? form?.startDate;
            const deadline = endRaw ? dayjs(endRaw) : null;
            const deadlineLabel = deadline?.isValid()
              ? deadline.format('MMM D YYYY')
              : '—';
            return (
              <div
                key={form.id}
                className="group/card relative flex h-full min-w-0"
                data-cy="form-card-wrapper"
                id="form-card-wrapper"
              >
                <Link
                  href={surveyHref}
                  className="absolute inset-0 z-0 rounded-[10px] outline-none focus-visible:ring-2 focus-visible:ring-[#1e40af] focus-visible:ring-offset-2"
                  aria-label={`Open survey ${form?.name ?? ''}`}
                  data-cy="form-card-nav-link"
                />
                <Card
                  bordered={false}
                  className="relative z-[1] flex h-full w-full min-w-0 flex-col rounded-[10px] border border-gray-200 bg-white shadow-none transition-colors group-hover/card:border-gray-300 pointer-events-none"
                  styles={{
                    body: {
                      padding: 20,
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                    },
                  }}
                  data-cy="form-card-summary-card"
                  id="form-card-summary-card"
                >
                  <div
                    className="mb-5 flex items-start justify-between gap-3"
                    data-cy="form-card-header"
                  >
                    <span
                      className="min-w-0 truncate text-base font-bold leading-snug text-gray-900"
                      data-cy="form-card-title"
                    >
                      {form?.name ?? 'Survey Name'}
                    </span>
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: 'copy',
                            label: (
                              <span className="form-card-menu-item flex items-center gap-3 text-[#374151]">
                                <Share2 className="h-5 w-5" />
                                <span>Share Survey</span>
                              </span>
                            ),
                            onClick: () => handleMenuClick('copy', form),
                          },
                          {
                            key: 'edit',
                            label: (
                              <span className="form-card-menu-item flex items-center gap-3 text-[#374151]">
                                <EditOutlinedIcon fontSize="small" />
                                <span>Edit</span>
                              </span>
                            ),
                            onClick: () => handleMenuClick('edit', form),
                          },
                          {
                            key: 'delete',
                            label: (
                              <span className="form-card-menu-item form-card-menu-item-delete flex items-center gap-3 text-red-500">
                                <DeleteOutlineOutlinedIcon fontSize="small" />
                                <span>Delete</span>
                              </span>
                            ),
                            onClick: () => handleMenuClick('delete', form),
                          },
                        ],
                      }}
                      trigger={['click']}
                      placement="bottomRight"
                      data-cy="form-card-menu"
                      overlayClassName="form-card-menu-overlay"
                    >
                      <button
                        type="button"
                        className="relative z-[2] flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white text-[#374151] transition-colors hover:border-slate-300 hover:bg-slate-50 pointer-events-auto"
                        data-cy="form-card-menu-trigger"
                        aria-label="More options"
                      >
                        <MdMoreHoriz size={14} />
                      </button>
                    </Dropdown>
                  </div>

                  <div className="min-w-0" data-cy="form-card-progress-block">
                    <div
                      className="flex min-w-0 items-center justify-between gap-3"
                      data-cy="form-card-response-count-row"
                    >
                      <span
                        className="text-base font-semibold text-gray-900"
                        data-cy="form-card-response-count-value"
                      >
                        {formRowsLoading
                          ? 'Loading...'
                          : `${responses} this week`}
                      </span>
                      <span
                        className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
                          trend7d == null
                            ? 'bg-slate-100 text-slate-500'
                            : trend7d > 0
                              ? 'bg-emerald-50 text-emerald-700'
                              : trend7d < 0
                                ? 'bg-red-50 text-red-700'
                                : 'bg-slate-100 text-slate-600'
                        }`}
                        data-cy="form-card-response-count-trend-chip"
                      >
                        {trend7d == null
                          ? 'N/A'
                          : trend7d > 0
                            ? `+${trend7d}`
                            : `${trend7d}`}
                      </span>
                    </div>
                    <div
                      className="mt-2 rounded-md bg-[#f8faff] px-2 py-1.5"
                      data-cy="form-card-response-count-trend-chart-shell"
                    >
                      <div
                        className="flex h-9 items-end gap-1"
                        data-cy="form-card-response-count-trend-sparkline"
                      >
                        {(trendLast7.length
                          ? trendLast7
                          : Array.from({ length: 7 }).map(() => 0)
                        ).map((v, i) => {
                          const barHeight = Math.max(
                            6,
                            Math.round((v / sparkMax) * 100),
                          );
                          const dayLabel = dayjs()
                            .subtract(6 - i, 'day')
                            .format('ddd');
                          return (
                            <div
                              key={`trend-${form?.id}-${i}`}
                              className="group/bar relative flex h-full flex-1 items-end"
                              title={`${dayLabel}: ${v} responses`}
                            >
                              <span
                                className="block w-full rounded-[4px] bg-[#1E40AF]/60 opacity-100 transition-all duration-200"
                                style={{ height: `${barHeight}%` }}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-1 grid grid-cols-7 gap-1 text-[10px] text-slate-500">
                        {Array.from({ length: 7 }).map((_, i) => (
                          <span
                            key={`trend-label-${form?.id}-${i}`}
                            className="text-center"
                          >
                            {dayjs()
                              .subtract(6 - i, 'day')
                              .format('dd')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div
                    className="mt-5 flex flex-wrap items-center justify-between gap-x-2 gap-y-2 text-[12px] font-normal text-slate-500"
                    data-cy="form-card-footer"
                  >
                    <span className="flex min-w-0 items-center gap-1.5">
                      <MdEvent className="shrink-0 text-[15px] text-slate-500" />
                      <span data-cy="form-card-deadline">
                        Deadline {deadlineLabel}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      <span data-cy="form-card-question-count">
                        {qCount} Questions
                      </span>
                      <ListChecks
                        className="h-4 w-4 shrink-0 text-slate-500"
                        strokeWidth={1.5}
                        data-cy="form-card-questions-icon"
                      />
                    </span>
                  </div>
                </Card>
              </div>
            );
          })
        ) : (
          <div
            className="col-span-full my-5 text-center text-slate-500"
            data-cy="form-card-empty-message"
            id="form-card-empty-message"
          >
            No forms available.
          </div>
        )}
      </div>
      {showFormPagination && (
        <CustomPagination
          current={formsListPage}
          data-cy="form-card-pagination"
          total={totalFormItems}
          pageSize={FORMS_LIST_PAGE_SIZE}
          onChange={handleFormPaginationChange}
          onShowSizeChange={handleFormPaginationSizeChange}
          goToOnRight
          showPageSizeChanger={false}
          goToInputPlaceholder="Input"
          className="shrink-0 border-t border-gray-100 bg-white px-3 sm:px-4"
        />
      )}
      <EditFormsModal id={id} data-cy="form-card-edit-modal" />
      <DeleteModal
        open={deleteFormModal}
        onConfirm={handleFormDelete}
        loading={deleteFormLoading}
        onCancel={() => setDeleteFormModal(false)}
        data-cy="form-card-delete-modal"
      />
      <Modal
        title="Share Survey"
        data-cy="form-card-copy-modal"
        open={isCopyURLModalOpen}
        onCancel={() => setIsCopyModalOpen(false)}
        footer={null}
        centered
      >
        <div
          className="flex items-center justify-center gap-3 rounded-md border p-2"
          data-cy="form-card-copy-modal-content"
          id="form-card-copy-modal-content"
        >
          <div
            className="font-semibold"
            data-cy="form-card-copy-modal-url"
            id="form-card-copy-modal-url"
          >
            {generatedUrl}
          </div>
          <Divider type="vertical" data-cy="form-card-copy-modal-divider" />
          <div
            onClick={handleCopy}
            data-cy="form-card-copy-modal-copy-button"
            id="form-card-copy-modal-copy-button"
            role="presentation"
          >
            {isChecked ? (
              <CheckCheck
                size={20}
                strokeWidth={1.5}
                className="text-green-500"
                data-cy="form-card-copy-modal-copy-icon"
                id="form-card-copy-modal-copy-icon"
              />
            ) : (
              <Copy
                size={20}
                strokeWidth={1.5}
                data-cy="form-card-copy-modal-copy-icon"
                id="form-card-copy-modal-copy-icon"
              />
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default FormCard;
