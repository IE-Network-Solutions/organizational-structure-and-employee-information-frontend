'use client';

import { Button, Modal, Skeleton, Typography } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useGetSimpleEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useGetVpDeductionDetails } from '@/store/server/features/okrplanning/okr/vp-deduction/queries';
import { getEmployeeDisplayName } from '@/store/server/features/okrplanning/okr/vp-deduction/utils';

const { Text, Title } = Typography;

type VpViolationDetailModalProps = {
  open: boolean;
  userId: string;
  monthId?: string;
  sessionId?: string;
  onClose: () => void;
};

export default function VpViolationDetailModal({
  open,
  userId,
  monthId,
  sessionId,
  onClose,
}: VpViolationDetailModalProps) {
  const { data: employee, isLoading: isEmployeeLoading } =
    useGetSimpleEmployee(userId);
  const { data: detailsResponse, isLoading: isDetailsLoading } =
    useGetVpDeductionDetails({
      userId,
      monthId,
      sessionId,
      enabled: open,
    });

  const items = detailsResponse?.items ?? [];
  const employeeName = getEmployeeDisplayName(employee, userId);
  const isLoading = isEmployeeLoading || isDetailsLoading;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={520}
      styles={{
        body: { padding: 0 },
        content: { borderRadius: 12, padding: 0, overflow: 'hidden' },
      }}
      centered
      data-cy="vp-dashboard-violation-detail-modal"
    >
      <div
        className="flex items-start justify-between px-6 pt-5"
        data-cy="vp-dashboard-violation-detail-modal-header"
      >
        <div data-cy="vp-dashboard-violation-detail-modal-header-text">
          {isLoading ? (
            <Skeleton.Input
              active
              size="small"
              style={{ width: 180 }}
              data-cy="vp-dashboard-violation-detail-modal-title-skeleton"
            />
          ) : (
            <>
              <Title
                level={5}
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'rgba(0,0,0,0.88)',
                }}
                data-cy="vp-dashboard-violation-detail-modal-employee-name"
              >
                {employeeName}
              </Title>
              <Text
                type="secondary"
                style={{ fontSize: 13 }}
                data-cy="vp-dashboard-violation-detail-modal-subtitle"
              >
                Attendance Rule Violation Details
              </Text>
            </>
          )}
        </div>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={onClose}
          size="small"
          style={{ color: 'rgba(0,0,0,0.45)', marginTop: 2 }}
          data-cy="vp-dashboard-violation-detail-modal-close"
        />
      </div>

      <div
        className="flex max-h-[420px] flex-col gap-3 overflow-y-auto px-6 py-5"
        data-cy="vp-dashboard-violation-detail-modal-body"
      >
        {isLoading ? (
          [0, 1, 2].map((skeletonIndex) => (
            <Skeleton.Input
              key={`vp-violation-detail-skeleton-${skeletonIndex}`}
              active
              block
              style={{ height: 72, borderRadius: 8 }}
              data-cy={`vp-dashboard-violation-detail-skeleton-${skeletonIndex}`}
            />
          ))
        ) : items.length === 0 ? (
          <Text
            type="secondary"
            style={{ fontSize: 13 }}
            data-cy="vp-dashboard-violation-detail-modal-empty"
          >
            No VP deductions found for this period.
          </Text>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-lg bg-[#f5f5f5] px-4 py-3"
              data-cy={`vp-dashboard-violation-detail-item-${item.id}`}
            >
              <Text
                style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'rgba(0,0,0,0.88)',
                }}
                data-cy={`vp-dashboard-violation-detail-item-amount-${item.id}`}
              >
                {item.deductedAmount} VP Deduction
              </Text>
              <Text
                type="secondary"
                style={{ display: 'block', fontSize: 13, marginTop: 4 }}
                data-cy={`vp-dashboard-violation-detail-item-rule-${item.id}`}
              >
                {item.attendanceRuleName || 'Attendance rule violation'}
              </Text>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}
