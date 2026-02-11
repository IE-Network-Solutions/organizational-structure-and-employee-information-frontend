'use client';

import React from 'react';
import { Modal, Button } from 'antd';
import { ClockCircleOutlined, CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import { KeyResult } from '@/store/uistate/features/okrplanning/okr/interface';
import { useGetPreviousMetric } from '@/store/server/features/okrplanning/okr/keyresult/queries';
import { useRestoreKeyResultMetric } from '@/store/server/features/okrplanning/okr/keyresult/mutations';

interface RecentModesTimelineModalProps {
  open: boolean;
  onClose: () => void;
  keyResult: KeyResult | null;
  onRestoreSuccess?: () => void;
}

const RecentModesTimelineModal: React.FC<RecentModesTimelineModalProps> = ({
  open,
  onClose,
  keyResult,
  onRestoreSuccess,
}) => {
  const keyResultId = keyResult?.id ?? null;
  const { data: previousMetric, isLoading: loadingPrevious } = useGetPreviousMetric(
    keyResultId,
    open && !!keyResultId,
  );
  const { mutate: restoreMetric, isLoading: restoring } = useRestoreKeyResultMetric();

  const handleRestore = () => {
    if (!keyResult?.id) return;
    restoreMetric(keyResult.id, {
      onSuccess: () => {
        onRestoreSuccess?.();
        onClose();
      },
    });
  };

  const currentMetricName = keyResult?.metricType?.name ?? 'Achieve';
  const currentTarget =
    keyResult?.metricType?.name === 'Milestone'
      ? keyResult?.milestones?.length ?? 0
      : Number(keyResult?.targetValue) ?? 0;
  const currentValue =
    keyResult?.metricType?.name === 'Milestone'
      ? keyResult?.milestones?.filter((m: any) => m.status === 'Completed')?.length ?? 0
      : keyResult?.metricType?.name === 'Achieve'
        ? keyResult?.progress ?? 0
        : Number(keyResult?.currentValue ?? 0) + Number(keyResult?.initialValue ?? 0);
  const currentStatus =
    Number(keyResult?.progress) >= 100 ? 'Done' : 'In Progress';

  return (
    <Modal
      title={
        <span className="flex items-center gap-2">
          <ClockCircleOutlined />
          Recent Modes Timeline
        </span>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      closeIcon={<CloseOutlined />}
      width={420}
      data-cy="recent-modes-timeline-modal"
      destroyOnClose
    >
      <div className="py-2">
        <div className="relative flex flex-col gap-4">
          {/* BASIC / current entry */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0 mt-1.5"
                data-cy="timeline-dot-basic"
              />
              <div className="w-0.5 flex-1 min-h-[24px] bg-gray-200" />
            </div>
            <div className="flex-1 pb-4">
              <div className="bg-gray-100 rounded-lg p-3">
                <span className="font-semibold text-green-700">
                  BASIC {currentMetricName}
                </span>
                <div className="text-sm text-gray-600 mt-1">
                  Target: {currentTarget} Current: {currentValue} Status: {currentStatus}
                </div>
              </div>
            </div>
          </div>

          {/* ADVANCED / previous entry */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0 mt-1.5"
                data-cy="timeline-dot-advanced"
              />
            </div>
            <div className="flex-1 pb-2">
              <div className="bg-gray-100 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-blue-700">
                    ADVANCED {loadingPrevious ? '...' : previousMetric?.previousMetricTypeName ?? 'Milestone'}
                  </span>
                  <div className="text-sm text-gray-600 mt-1">
                    Target: {previousMetric?.targetValue ?? '-'} Current:{' '}
                    {previousMetric?.currentValue ?? '-'} Status:{' '}
                    {(previousMetric?.progress ?? 0) >= 100 ? 'Done' : 'In Progress'}
                  </div>
                </div>
                <Button
                  type="primary"
                  size="small"
                  icon={<ReloadOutlined />}
                  loading={restoring}
                  onClick={handleRestore}
                  data-cy="recent-modes-timeline-restore-btn"
                >
                  Restore
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-4 pt-2 border-t">
          <Button onClick={onClose} data-cy="recent-modes-timeline-close-btn">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RecentModesTimelineModal;
