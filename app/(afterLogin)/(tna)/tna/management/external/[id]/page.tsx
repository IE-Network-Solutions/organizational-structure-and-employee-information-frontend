'use client';
import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Skeleton, Space, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { LuExternalLink } from 'react-icons/lu';
import CustomBreadcrumb from '@/components/common/breadCramp';
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import EmptyState from '@/components/empty';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { DATE_FORMAT } from '@/utils/constants';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetExternalTrainingById } from '@/store/server/features/tna/externalTraining/queries';
import { useCancelExternalTraining } from '@/store/server/features/tna/externalTraining/mutation';
import { useCurrency } from '@/store/server/features/tna/review/queries';
import { useGetIsTnaOfficer } from '@/store/server/features/tna/tnaOfficer/queries';
import {
  ExternalTrainingStatus,
  ExternalTrainingStatusBadgeTheme,
  ExternalTrainingStatusLabel,
} from '@/types/tna/externalTna';
import CommitmentProgressBar from '@/app/(afterLogin)/(tna)/tna/_components/commitmentProgressBar';
import ApprovalTimeline from '@/app/(afterLogin)/(tna)/tna/_components/approvalTimeline';
import EmployeeName from '@/app/(afterLogin)/(tna)/tna/_components/employeeName';
import ManagerDecisionModal from '@/app/(afterLogin)/(tna)/tna/_components/decisionModals/managerDecisionModal';
import TnaOfficerDecisionModal from '@/app/(afterLogin)/(tna)/tna/_components/decisionModals/tnaOfficerDecisionModal';

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
  const { data: request, isLoading } = useGetExternalTrainingById(id);
  const { data: currencies } = useCurrency();
  const { data: officerCheck } = useGetIsTnaOfficer(userId ?? '');
  const { mutate: cancelRequest, isLoading: isCancelling } =
    useCancelExternalTraining();

  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  const [isOfficerModalOpen, setIsOfficerModalOpen] = useState(false);

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

  const isRequester = request?.requestedBy === userId;
  const isAssignedManager = request?.managerId === userId;
  const isTnaOfficer = Boolean(officerCheck?.isOfficer);

  const canDecideAsManager =
    request?.status === ExternalTrainingStatus.PENDING_MANAGER &&
    (isAssignedManager ||
      AccessGuard.checkAccess({
        permissions: [Permissions.ApproveTnaAsManager],
      }));

  const canDecideAsOfficer =
    request?.status === ExternalTrainingStatus.PENDING_TNA_OFFICER &&
    (isTnaOfficer ||
      AccessGuard.checkAccess({
        permissions: [Permissions.ApproveTnaAsOfficer],
      }));

  const canCancel =
    isRequester &&
    request?.status !== ExternalTrainingStatus.APPROVED &&
    request?.status !== ExternalTrainingStatus.CANCELLED;

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
          description="This external training request no longer exists."
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
          <span data-cy="tna-external-detail-title">{request.courseName}</span>
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
          <Space data-cy="tna-external-detail-actions">
            {canDecideAsManager ? (
              <Button
                type="primary"
                className="h-10 rounded-lg border-[#1E40AF] bg-[#1E40AF] px-4"
                onClick={() => setIsManagerModalOpen(true)}
                data-cy="tna-external-detail-manager-review"
              >
                Review as Manager
              </Button>
            ) : null}
            {canDecideAsOfficer ? (
              <Button
                type="primary"
                className="h-10 rounded-lg border-[#1E40AF] bg-[#1E40AF] px-4"
                onClick={() => setIsOfficerModalOpen(true)}
                data-cy="tna-external-detail-officer-review"
              >
                Review as TNA Officer
              </Button>
            ) : null}
            {canCancel ? (
              <Button
                danger
                className="h-10 rounded-md px-4"
                loading={isCancelling}
                onClick={() => cancelRequest({ id: request.id })}
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
              <StatusBadge
                theme={ExternalTrainingStatusBadgeTheme[request.status]}
              >
                {ExternalTrainingStatusLabel[request.status] ?? request.status}
              </StatusBadge>
              {request.isPaymentConfirmed ? (
                <span
                  className="rounded-[4px] border border-[#B7EB8F] bg-[#F6FFED] px-2 py-px text-xs leading-5 text-[#389E0D]"
                  data-cy="tna-external-detail-payment-pill"
                >
                  Payment confirmed
                </span>
              ) : (
                <span
                  className="rounded-[4px] border border-[#FFE58F] bg-[#FFFBE6] px-2 py-px text-xs leading-5 text-[#AD8B00]"
                  data-cy="tna-external-detail-payment-pill"
                >
                  Payment pending
                </span>
              )}
            </div>

            <div
              className="grid grid-cols-2 gap-4 md:grid-cols-3"
              data-cy="tna-external-detail-fields"
            >
              <DetailRow
                label="Requested by"
                dataCy="tna-external-detail-requester"
              >
                <EmployeeName userId={request.requestedBy} />
              </DetailRow>
              <DetailRow label="Manager" dataCy="tna-external-detail-manager">
                <EmployeeName
                  userId={request.managerId}
                  fallback="Not assigned"
                />
              </DetailRow>
              <DetailRow label="Cost" dataCy="tna-external-detail-cost">
                {formatMoney(request.cost)}
              </DetailRow>
              <DetailRow label="Provider" dataCy="tna-external-detail-provider">
                {request.trainingProvider || '-'}
              </DetailRow>
              <DetailRow
                label="Requested on"
                dataCy="tna-external-detail-created"
              >
                {dayjs(request.createdAt).format(DATE_FORMAT)}
              </DetailRow>
              <DetailRow
                label="Training period"
                dataCy="tna-external-detail-period"
              >
                {request.trainingStartDate && request.trainingEndDate
                  ? `${dayjs(request.trainingStartDate).format(DATE_FORMAT)} → ${dayjs(
                      request.trainingEndDate,
                    ).format(DATE_FORMAT)}`
                  : '-'}
              </DetailRow>
              <DetailRow label="Course link" dataCy="tna-external-detail-link">
                {request.courseLink ? (
                  <Tooltip title={request.courseLink}>
                    <a
                      href={request.courseLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#1E40AF]"
                      data-cy="tna-external-detail-link-anchor"
                    >
                      Open course <LuExternalLink size={12} />
                    </a>
                  </Tooltip>
                ) : (
                  '-'
                )}
              </DetailRow>
            </div>

            <div data-cy="tna-external-detail-justification">
              <span
                data-cy="tna-external-detail-justification-label"
                className="text-[11px] uppercase leading-4 tracking-wide text-black/45"
              >
                Business justification
              </span>
              <p
                data-cy="tna-external-detail-justification-text"
                className="m-0 mt-1 text-sm leading-[22px] text-black/70"
              >
                {request.businessJustification ||
                  'No business justification provided.'}
              </p>
            </div>
          </div>

          {request.commitment ? (
            <CommitmentProgressBar
              commitment={request.commitment}
              data-cy="tna-external-detail-commitment"
            />
          ) : (
            <div
              className="box-border rounded-[8px] border border-[#D9D9D9] bg-white p-4"
              data-cy="tna-external-detail-no-commitment"
            >
              <EmptyState
                compact
                title="No commitment yet"
                description="A commitment is created once the TNA Officer approves this request and confirms payment."
              />
            </div>
          )}

          <div
            className="box-border rounded-[8px] border border-[#D9D9D9] bg-white p-4"
            data-cy="tna-external-detail-approvals"
          >
            <h2
              data-cy="tna-external-detail-approvals-title"
              className="m-0 mb-3 text-sm font-bold leading-[22px] text-black"
            >
              Approval History
            </h2>
            <ApprovalTimeline approvals={request.approvals} />
          </div>
        </section>

        <aside
          className="col-span-1 flex flex-col gap-4"
          data-cy="tna-external-detail-side"
        >
          <div
            className="box-border flex flex-col gap-3 rounded-[8px] border border-[#D9D9D9] bg-white p-4"
            data-cy="tna-external-detail-payment"
          >
            <h2
              data-cy="tna-external-detail-payment-title"
              className="m-0 text-sm font-bold leading-[22px] text-black"
            >
              Payment Confirmation
            </h2>
            <DetailRow
              label="Status"
              dataCy="tna-external-detail-payment-status"
            >
              {request.isPaymentConfirmed ? 'Confirmed' : 'Not confirmed'}
            </DetailRow>
            <DetailRow
              label="Reference"
              dataCy="tna-external-detail-payment-ref"
            >
              {request.paymentReference || '-'}
            </DetailRow>
            <DetailRow label="Amount paid" dataCy="tna-external-detail-paid">
              {formatMoney(request.paidAmount)}
            </DetailRow>
            <DetailRow
              label="Confirmed by"
              dataCy="tna-external-detail-payment-by"
            >
              <EmployeeName
                userId={request.paymentConfirmedBy}
                fallback="Not confirmed"
              />
            </DetailRow>
            <DetailRow
              label="Confirmed on"
              dataCy="tna-external-detail-payment-at"
            >
              {request.paymentConfirmedAt
                ? dayjs(request.paymentConfirmedAt).format(DATE_FORMAT)
                : '-'}
            </DetailRow>
          </div>

          <div
            className="box-border flex flex-col gap-3 rounded-[8px] border border-[#D9D9D9] bg-white p-4"
            data-cy="tna-external-detail-workflow"
          >
            <h2
              data-cy="tna-external-detail-workflow-title"
              className="m-0 text-sm font-bold leading-[22px] text-black"
            >
              Workflow
            </h2>
            <DetailRow
              label="Manager decision"
              dataCy="tna-external-detail-manager-decision"
            >
              {request.managerApprovedAt
                ? `${dayjs(request.managerApprovedAt).format(DATE_FORMAT)}${
                    request.managerRemark ? ` — ${request.managerRemark}` : ''
                  }`
                : 'Pending'}
            </DetailRow>
            <DetailRow
              label="TNA Officer decision"
              dataCy="tna-external-detail-officer-decision"
            >
              {request.tnaOfficerApprovedAt
                ? `${dayjs(request.tnaOfficerApprovedAt).format(DATE_FORMAT)}${
                    request.tnaOfficerRemark
                      ? ` — ${request.tnaOfficerRemark}`
                      : ''
                  }`
                : 'Pending'}
            </DetailRow>
            {request.rejectionReason ? (
              <DetailRow
                label="Rejection reason"
                dataCy="tna-external-detail-rejection"
              >
                {request.rejectionReason}
              </DetailRow>
            ) : null}
          </div>
        </aside>
      </div>

      <ManagerDecisionModal
        open={isManagerModalOpen}
        request={request}
        onClose={() => setIsManagerModalOpen(false)}
      />
      <TnaOfficerDecisionModal
        open={isOfficerModalOpen}
        request={request}
        onClose={() => setIsOfficerModalOpen(false)}
      />
    </div>
  );
};

export default ExternalTnaDetailPage;
