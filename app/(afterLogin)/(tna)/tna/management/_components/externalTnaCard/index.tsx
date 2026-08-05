import React, { FC, useMemo } from 'react';
import { Spin, Tooltip } from 'antd';
import { useRouter } from 'next/navigation';
import { LuCalendarClock, LuExternalLink } from 'react-icons/lu';
import { MdOutlineSchool } from 'react-icons/md';
import { TbCoin } from 'react-icons/tb';
import ActionButton from '@/components/common/actionButton';
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import { classNames } from '@/utils/classNames';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import {
  ExternalTrainingRequest,
  ExternalTrainingStatus,
  ExternalTrainingStatusBadgeTheme,
  ExternalTrainingStatusLabel,
  TrainingCommitmentStatus,
} from '@/types/tna/externalTna';
import { useDeleteExternalTraining } from '@/store/server/features/tna/externalTraining/mutation';
import { useCurrency } from '@/store/server/features/tna/review/queries';
import CommitmentProgressBar from '@/app/(afterLogin)/(tna)/tna/_components/commitmentProgressBar';

interface ExternalTnaCardProps {
  item: ExternalTrainingRequest;
  refetch?: () => void;
  onEdit?: (item: ExternalTrainingRequest) => void;
  className?: string;
}

/**
 * External (non-catalogue) TNA card. Shares the course card shell so the grid
 * reads as one surface; the "External" pill is what tells the two apart.
 */
const ExternalTnaCard: FC<ExternalTnaCardProps> = ({
  item,
  refetch,
  onEdit,
  className = '',
}) => {
  const router = useRouter();
  const { data: currencies } = useCurrency();
  const { mutate: deleteExternalTraining, isLoading } =
    useDeleteExternalTraining();

  const currencyCode = useMemo(() => {
    const list = Array.isArray(currencies)
      ? currencies
      : (currencies?.items ?? []);
    return (
      list.find((currency: any) => currency?.id === item?.currencyId)?.code ??
      ''
    );
  }, [currencies, item?.currencyId]);

  const commitment = item?.commitment ?? null;
  const isEditable =
    item?.status === ExternalTrainingStatus.PENDING_MANAGER ||
    item?.status === ExternalTrainingStatus.REJECTED;

  const formattedCost = useMemo(() => {
    const value = Number(item?.cost ?? 0);
    return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}${
      currencyCode ? ` ${currencyCode}` : ''
    }`;
  }, [item?.cost, currencyCode]);

  return (
    <Spin
      spinning={isLoading}
      data-cy={`tna-external-card-spinner-${item?.id}`}
    >
      <div
        className={classNames(
          'group relative flex h-[295px] min-w-0 w-full cursor-pointer flex-col gap-0 overflow-hidden rounded-[8px] bg-[#F9FAFB] pb-3 transition-shadow hover:shadow-md',
          {},
          [className],
        )}
        onClick={() => router.push(`/tna/management/external/${item?.id}`)}
        id={`tnaExternalCard${item?.id}Id`}
        data-cy={`tna-external-card-${item?.id}`}
      >
        {/* Banner replaces the course thumbnail — external TNAs have no artwork. */}
        <div
          className="relative flex h-[159px] w-full shrink-0 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#1E40AF] via-[#2F52C0] to-[#6D82DE] px-4 py-3"
          data-cy={`tna-external-card-banner-${item?.id}`}
        >
          <div
            className="flex items-start justify-between gap-2"
            data-cy={`tna-external-card-banner-top-${item?.id}`}
          >
            <span
              className="inline-flex h-[22px] shrink-0 items-center rounded-[4px] border border-white/40 bg-white/20 px-2 text-xs font-bold leading-5 text-white backdrop-blur-sm font-[Calibri,sans-serif]"
              id={`tnaExternalCardPill${item?.id}Id`}
              data-cy={`tna-external-card-pill-${item?.id}`}
            >
              External
            </span>
            <StatusBadge
              theme={ExternalTrainingStatusBadgeTheme[item?.status]}
              className="!bg-white/90 shrink-0"
            >
              {ExternalTrainingStatusLabel[item?.status] ?? item?.status}
            </StatusBadge>
          </div>

          <div
            className="flex items-end justify-between gap-2"
            data-cy={`tna-external-card-banner-bottom-${item?.id}`}
          >
            <MdOutlineSchool
              size={40}
              className="text-white/70"
              aria-hidden
              data-cy={`tna-external-card-banner-icon-${item?.id}`}
            />
            <div
              className="text-right"
              data-cy={`tna-external-card-cost-wrap-${item?.id}`}
            >
              <div
                className="text-[10px] font-medium uppercase leading-4 tracking-wide text-white/70"
                data-cy={`tna-external-card-cost-label-${item?.id}`}
              >
                Training cost
              </div>
              <div
                className="text-base font-bold leading-6 text-white"
                data-cy={`tna-external-card-cost-${item?.id}`}
              >
                {formattedCost}
              </div>
            </div>
          </div>
        </div>

        <div
          className="flex min-h-0 flex-1 flex-col gap-2 px-[15px] pt-2 md:gap-[8px] md:px-4 md:pt-[13px]"
          id={`tnaExternalCardContent${item?.id}Id`}
          data-cy={`tna-external-card-content-${item?.id}`}
        >
          <div
            className="flex items-center justify-between gap-2"
            data-cy={`tna-external-card-provider-row-${item?.id}`}
          >
            <span
              className="min-w-0 truncate text-xs font-bold leading-none text-black max-md:leading-5"
              data-cy={`tna-external-card-provider-${item?.id}`}
            >
              {item?.trainingProvider || 'External Training'}
            </span>
            {item?.courseLink ? (
              <Tooltip title="Open course link">
                <a
                  href={item.courseLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0 text-[#1E40AF]"
                  data-cy={`tna-external-card-link-${item?.id}`}
                >
                  <LuExternalLink size={14} />
                </a>
              </Tooltip>
            ) : null}
          </div>

          <h3
            className="m-0 line-clamp-1 text-sm font-bold leading-tight text-black max-md:leading-[22px]"
            id={`tnaExternalCardTitle${item?.id}Id`}
            data-cy={`tna-external-card-title-${item?.id}`}
          >
            {item?.courseName}
          </h3>

          {commitment ? (
            <CommitmentProgressBar commitment={commitment} compact />
          ) : (
            <p
              className="m-0 line-clamp-2 text-[13px] leading-[18px] text-[#A6A6A6] max-md:text-xs max-md:leading-5 max-md:text-black/45"
              data-cy={`tna-external-card-justification-${item?.id}`}
            >
              {item?.businessJustification ||
                'No business justification provided.'}
            </p>
          )}

          <div
            className="mt-auto flex items-center gap-4 pt-1 max-md:gap-3"
            id={`tnaExternalCardFooter${item?.id}Id`}
            data-cy={`tna-external-card-footer-${item?.id}`}
          >
            <div
              className="flex items-center gap-1.5 text-xs font-medium text-[#A6A6A6] max-md:gap-2 max-md:font-normal max-md:leading-5 max-md:text-black/45"
              data-cy={`tna-external-card-payment-stat-${item?.id}`}
            >
              <TbCoin size={14} aria-hidden />
              <span data-cy={`tna-external-card-payment-value-${item?.id}`}>
                {item?.isPaymentConfirmed
                  ? 'Payment confirmed'
                  : 'Payment pending'}
              </span>
            </div>
            <div
              className="flex items-center gap-1.5 text-xs font-medium text-[#A6A6A6] max-md:gap-2 max-md:font-normal max-md:leading-5 max-md:text-black/45"
              data-cy={`tna-external-card-commitment-stat-${item?.id}`}
            >
              <LuCalendarClock size={14} aria-hidden />
              <span data-cy={`tna-external-card-commitment-value-${item?.id}`}>
                {commitment
                  ? commitment.status === TrainingCommitmentStatus.ACTIVE
                    ? `${commitment.daysRemaining ?? 0} day(s) left`
                    : `Commitment ${commitment.status}`
                  : 'No commitment yet'}
              </span>
            </div>
          </div>
        </div>

        <div
          className="absolute right-2 top-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
          id={`tnaExternalCardActions${item?.id}Id`}
          data-cy={`tna-external-card-actions-${item?.id}`}
        >
          <AccessGuard
            permissions={[
              Permissions.UpdateExternalTna,
              Permissions.DeleteExternalTna,
            ]}
            id={`tnaExternalCardActionGuard${item?.id}Id`}
          >
            <ActionButton
              id={item?.id ?? null}
              triggerSizePx={24}
              moreMenuIconPx={14}
              onEdit={isEditable && onEdit ? () => onEdit(item) : undefined}
              onDelete={
                isEditable
                  ? () => {
                      deleteExternalTraining([item?.id], {
                        onSuccess: () => refetch?.(),
                      });
                    }
                  : undefined
              }
              onCancelDelete={() => ''}
            />
          </AccessGuard>
        </div>
      </div>
    </Spin>
  );
};

export default ExternalTnaCard;
