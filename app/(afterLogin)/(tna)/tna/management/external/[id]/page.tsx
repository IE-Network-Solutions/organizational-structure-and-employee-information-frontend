'use client';
import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Popconfirm, Skeleton, Space, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { LuExternalLink } from 'react-icons/lu';
import CustomBreadcrumb from '@/components/common/breadCramp';
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import EmptyState from '@/components/empty';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { DATE_FORMAT } from '@/utils/constants';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetTrainingRequestById } from '@/store/server/features/tna/externalTraining/queries';
import {
  useConfirmTrainingRequest,
  useSetTrainingRequestDecision,
  useSetTrainingRequestPayment,
} from '@/store/server/features/tna/externalTraining/mutation';
import { useCurrency } from '@/store/server/features/tna/review/queries';
import {
  TrainingRequestApprovalStatus,
  TrainingRequestApprovalStatusBadgeTheme,
  TrainingRequestApprovalStatusLabel,
  TrainingRequestStageBadgeTheme,
  TrainingRequestStageLabel,
  getTrainingRequestStage,
  isTrainingRequestConfirmable,
} from '@/types/tna/externalTna';
import CommitmentProgressBar from '@/app/(afterLogin)/(tna)/tna/_components/commitmentProgressBar';
import EmployeeName from '@/app/(afterLogin)/(tna)/tna/_components/employeeName';
import CloseOutcomeModal from '@/app/(afterLogin)/(tna)/tna/_components/closeOutcomeModal';

const DetailRow = ({
  label,
  children,
  dataCy,
}: {
  label: string;
  children: React.ReactNode;
  dataCy: string;
}) => (
  <div className="flex flex-col gap-0.5" data-cy={dataCy}>
    <span
      data-cy="tna-external-detail-row-label"
      className="text-[11px] uppercase leading-4 tracking-wide text-black/45"
    >
      {label}
    </span>
    <span
      data-cy="tna-external-detail-row-value"
      className="text-sm leading-[22px] text-black/70"
    >
      {children}
    </span>
  </div>
);

const ExternalTnaDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id ?? '');

  const { userId } = useAuthenticationStore();
  const { data: request, isLoading } = useGetTrainingRequestById(id);
  const { data: currencies } = useCurrency();

  const { mutate: decide, isLoading: isDeciding } =
    useSetTrainingRequestDecision();
  const { mutate: setPayment, isLoading: isSettingPayment } =
    useSetTrainingRequestPayment();
  const { mutate: confirmRequest, isLoading: isConfirming } =
    useConfirmTrainingRequest();

  const [closeOutcome, setCloseOutcome] = useState<'complete' | 'fail' | null>(
    null,
  );

  const currencyCode = useMemo(() => {
    const list = Array.isArray(currencies)
      ? currencies
      : (currencies?.items ?? []);
    return (
      list.find((currency: any) => currency?.id === request?.currencyId)
        ?.code ?? ''
    );
  }, [currencies, request?.currencyId]);

  const formatMoney = (value?: number | null) =>
    value === null || value === undefined
      ? '-'
      : `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}${
          currencyCode ? ` ${currencyCode}` : ''
        }`;

  const stage = useMemo(() => getTrainingRequestStage(request), [request]);
  const isOwner = request?.userId === userId;
  const isApproved =
    request?.approvalStatus === TrainingRequestApprovalStatus.APPROVED;

  const canRecordPayment =
    isApproved &&
    !request?.isConfirmed &&
    AccessGuard.checkAccess({
      permissions: [Permissions.ConfirmTnaCommitment],
    });

  const canClose = isApproved && !request?.isConfirmed && Boolean(request);
  const canConfirm =
    isTrainingRequestConfirmable(request) &&
    AccessGuard.checkAccess({
      permissions: [Permissions.ConfirmTnaCommitment],
    });

  if (isLoading) {
    return (
      <div className="page-wrap" data-cy="tna-external-detail-loading">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="page-wrap" data-cy="tna-external-detail-not-found">
        <EmptyState
          title="Request not found"
          description="This training request no longer exists."
          actionText="Back to Learning Management"
          onAction={() => router.push('/tna/management')}
        />
      </div>
    );
  }

  return (
    <div
      className="page-wrap flex flex-col gap-4"
      id="tnaExternalDetailPageId"
      data-cy="tna-external-detail-page"
    >
      <CustomBreadcrumb
        title={
          <span data-cy="tna-external-detail-title">
            {request.courseName || 'External training'}
          </span>
        }
        subtitle={
          <nav
            className="flex flex-row flex-wrap items-center text-sm leading-[22px]"
            aria-label="Breadcrumb"
            data-cy="tna-external-detail-breadcrumb"
          >
            <span
              data-cy="tna-external-detail-breadcrumb-root"
              className="text-black/45"
            >
              Learning and Growth
            </span>
            <span
              data-cy="tna-external-detail-breadcrumb-separator-one"
              className="px-2 text-black/45"
            >
              /
            </span>
            <span
              data-cy="tna-external-detail-breadcrumb-parent"
              className="text-black/45"
            >
              Learning Management
            </span>
            <span
              data-cy="tna-external-detail-breadcrumb-separator-two"
              className="px-2 text-black/45"
            >
              /
            </span>
            <span
              data-cy="tna-external-detail-breadcrumb-current"
              className="text-black/70"
            >
              External TNA
            </span>
          </nav>
        }
        href="/tna/management"
        titleExtra={
          <Space wrap data-cy="tna-external-detail-actions">
            {canClose ? (
              <>
                <Button
                  className="h-10 rounded-md border-[#D9D9D9] px-4"
                  onClick={() => setCloseOutcome('complete')}
                  data-cy="tna-external-detail-mark-complete"
                >
                  {request.hasCompleted
                    ? 'Replace certificate'
                    : 'Mark completed'}
                </Button>
                <Button
                  className="h-10 rounded-md border-[#D9D9D9] px-4"
                  onClick={() => setCloseOutcome('fail')}
                  data-cy="tna-external-detail-mark-failed"
                >
                  {request.hasFailed ? 'Replace failure proof' : 'Mark failed'}
                </Button>
              </>
            ) : null}

            {canRecordPayment && !request.isPaid ? (
              <Button
                className="h-10 rounded-md border-[#D9D9D9] px-4"
                loading={isSettingPayment}
                onClick={() => setPayment({ id: request.id, isPaid: true })}
                data-cy="tna-external-detail-record-payment"
              >
                Record payment
              </Button>
            ) : null}

            {canConfirm ? (
              <Popconfirm
                title="Confirm this request?"
                description="This starts the employee's commitment period."
                okText="Confirm"
                cancelText="Cancel"
                onConfirm={() => confirmRequest(request.id)}
              >
                <Button
                  type="primary"
                  className="h-10 rounded-lg border-[#1E40AF] bg-[#1E40AF] px-4"
                  loading={isConfirming}
                  data-cy="tna-external-detail-confirm"
                >
                  Confirm &amp; start commitment
                </Button>
              </Popconfirm>
            ) : null}

            {isOwner &&
            request.approvalStatus === TrainingRequestApprovalStatus.PENDING ? (
              <Button
                className="h-10 rounded-md border-[#D9D9D9] px-4"
                loading={isDeciding}
                onClick={() =>
                  decide({
                    id: request.id,
                    approvalStatus: TrainingRequestApprovalStatus.CANCELLED,
                  })
                }
                data-cy="tna-external-detail-cancel"
              >
                Cancel request
              </Button>
            ) : null}
          </Space>
        }
      />

      <div
        className="grid grid-cols-1 gap-4 lg:grid-cols-3"
        data-cy="tna-external-detail-grid"
      >
        <section
          className="col-span-1 flex flex-col gap-4 lg:col-span-2"
          data-cy="tna-external-detail-main"
        >
          <div
            className="box-border flex flex-col gap-4 rounded-[8px] border border-[#D9D9D9] bg-white p-4"
            data-cy="tna-external-detail-summary"
          >
            <div
              data-cy="tna-external-detail-badges"
              className="flex flex-wrap items-center gap-2"
            >
              <span
                className="inline-flex h-[22px] items-center rounded-[4px] border border-[#1E40AF] bg-[rgba(30,64,175,0.06)] px-2 text-xs font-bold leading-5 text-[#1E40AF]"
                data-cy="tna-external-detail-pill"
              >
                External
              </span>
              <StatusBadge theme={TrainingRequestStageBadgeTheme[stage]}>
                {TrainingRequestStageLabel[stage]}
              </StatusBadge>
              <StatusBadge
                theme={
                  TrainingRequestApprovalStatusBadgeTheme[
                    request.approvalStatus
                  ]
                }
              >
                {TrainingRequestApprovalStatusLabel[request.approvalStatus] ??
                  request.approvalStatus}
              </StatusBadge>
              {request.hasCompleted ? (
                <span
                  className="rounded-[4px] border border-[#B7EB8F] bg-[#F6FFED] px-2 py-px text-xs leading-5 text-[#389E0D]"
                  data-cy="tna-external-detail-passed-pill"
                >
                  Passed
                </span>
              ) : null}
              {request.hasFailed ? (
                <span
                  className="rounded-[4px] border border-[#FFA39E] bg-[#FFF1F0] px-2 py-px text-xs leading-5 text-[#CF1322]"
                  data-cy="tna-external-detail-failed-pill"
                >
                  Failed
                </span>
              ) : null}
            </div>

            <div
              className="grid grid-cols-2 gap-4 md:grid-cols-3"
              data-cy="tna-external-detail-fields"
            >
              <DetailRow label="Employee" dataCy="tna-external-detail-employee">
                <EmployeeName userId={request.userId} />
              </DetailRow>
              <DetailRow label="Cost" dataCy="tna-external-detail-amount">
                {formatMoney(request.amount)}
              </DetailRow>
              <DetailRow label="Provider" dataCy="tna-external-detail-source">
                {request.source || '-'}
              </DetailRow>
              <DetailRow
                label="Requested on"
                dataCy="tna-external-detail-created"
              >
                {dayjs(request.createdAt).format(DATE_FORMAT)}
              </DetailRow>
              <DetailRow label="Start date" dataCy="tna-external-detail-start">
                {request.startDate
                  ? dayjs(request.startDate).format(DATE_FORMAT)
                  : '-'}
              </DetailRow>
              <DetailRow
                label={request.hasFailed ? 'Failure date' : 'Completion date'}
                dataCy="tna-external-detail-end"
              >
                {request.endDate
                  ? dayjs(request.endDate).format(DATE_FORMAT)
                  : '-'}
              </DetailRow>
            </div>

            <div data-cy="tna-external-detail-description">
              <span
                data-cy="tna-external-detail-description-label"
                className="text-[11px] uppercase leading-4 tracking-wide text-black/45"
              >
                Description
              </span>
              <p
                data-cy="tna-external-detail-description-text"
                className="m-0 mt-1 text-sm leading-[22px] text-black/70"
              >
                {request.description || 'No description provided.'}
              </p>
            </div>

            {request.reason ? (
              <div data-cy="tna-external-detail-reason">
                <span
                  data-cy="tna-external-detail-reason-label"
                  className="text-[11px] uppercase leading-4 tracking-wide text-black/45"
                >
                  Reason
                </span>
                <p
                  data-cy="tna-external-detail-reason-text"
                  className="m-0 mt-1 text-sm leading-[22px] text-black/70"
                >
                  {request.reason}
                </p>
              </div>
            ) : null}
          </div>

          {request.commitment ? (
            <CommitmentProgressBar commitment={request.commitment} />
          ) : (
            <div
              className="box-border rounded-[8px] border border-[#D9D9D9] bg-white p-4"
              data-cy="tna-external-detail-no-commitment"
            >
              <EmptyState
                compact
                title="No commitment yet"
                description="A commitment starts once the request is approved, closed out with proof, paid for and confirmed."
              />
            </div>
          )}
        </section>

        <aside
          className="col-span-1 flex flex-col gap-4"
          data-cy="tna-external-detail-side"
        >
          <div
            className="box-border flex flex-col gap-3 rounded-[8px] border border-[#D9D9D9] bg-white p-4"
            data-cy="tna-external-detail-checklist"
          >
            <h2
              data-cy="tna-external-detail-checklist-title"
              className="m-0 text-sm font-bold leading-[22px] text-black"
            >
              Confirmation Checklist
            </h2>
            <DetailRow
              label="Approved"
              dataCy="tna-external-detail-check-approved"
            >
              {isApproved ? 'Yes' : 'Not yet'}
            </DetailRow>
            <DetailRow
              label="End date recorded"
              dataCy="tna-external-detail-check-end"
            >
              {request.endDate
                ? dayjs(request.endDate).format(DATE_FORMAT)
                : 'Not yet'}
            </DetailRow>
            <DetailRow
              label="Proof attached"
              dataCy="tna-external-detail-check-proof"
            >
              {request.certificatePath ? (
                <Tooltip title="Open certificate">
                  <a
                    href={request.certificatePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#1E40AF]"
                    data-cy="tna-external-detail-certificate-link"
                  >
                    Certificate <LuExternalLink size={12} />
                  </a>
                </Tooltip>
              ) : request.failureFilePath ? (
                <Tooltip title="Open failure proof">
                  <a
                    href={request.failureFilePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#CF1322]"
                    data-cy="tna-external-detail-failure-link"
                  >
                    Failure proof <LuExternalLink size={12} />
                  </a>
                </Tooltip>
              ) : (
                'Not yet'
              )}
            </DetailRow>
            <DetailRow
              label="Payment"
              dataCy="tna-external-detail-check-payment"
            >
              {request.isPaid ? 'Completed' : 'Not yet'}
            </DetailRow>
            <DetailRow
              label="Confirmed"
              dataCy="tna-external-detail-check-confirmed"
            >
              {request.isConfirmed ? 'Yes' : 'Not yet'}
            </DetailRow>
          </div>
        </aside>
      </div>

      <CloseOutcomeModal
        open={closeOutcome !== null}
        outcome={closeOutcome ?? 'complete'}
        request={request}
        onClose={() => setCloseOutcome(null)}
      />
    </div>
  );
};

export default ExternalTnaDetailPage;
