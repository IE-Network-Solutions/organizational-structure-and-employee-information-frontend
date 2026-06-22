'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, Modal, Skeleton, Typography } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useGetSimpleEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import {
  useGetVpDeductionDetails,
  VpDeductionDetailItem,
} from '@/store/server/features/okrplanning/okr/vp-deduction/queries';
import { useBulkDeleteVpDeductions } from '@/store/server/features/okrplanning/okr/vp-deduction/mutations';
import { getEmployeeDisplayName } from '@/store/server/features/okrplanning/okr/vp-deduction/utils';

const { Text, Title } = Typography;

type VpDeductionDetailModalProps = {
  open: boolean;
  userId: string;
  monthId?: string;
  sessionId?: string;
  onClose: () => void;
};

export default function VpDeductionDetailModal({
  open,
  userId,
  monthId,
  sessionId,
  onClose,
}: VpDeductionDetailModalProps) {
  const { data: employee, isLoading: isEmployeeLoading } =
    useGetSimpleEmployee(userId);
  const { data: detailsResponse, isLoading: isDetailsLoading } =
    useGetVpDeductionDetails({
      userId,
      monthId,
      sessionId,
      enabled: open,
    });
  const { mutate: bulkDelete, isLoading: isSaving } =
    useBulkDeleteVpDeductions();

  const items: VpDeductionDetailItem[] = detailsResponse?.items ?? [];
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const itemIdsKey = items.map((item) => item.id).join(',');

  useEffect(() => {
    if (open && itemIdsKey) {
      setCheckedIds(itemIdsKey.split(','));
    }
    if (!open) {
      setCheckedIds([]);
    }
  }, [open, itemIdsKey]);

  const employeeName = getEmployeeDisplayName(employee, userId);
  const isLoading = isEmployeeLoading || isDetailsLoading;

  const removedIds = useMemo(
    () => items.map((item) => item.id).filter((id) => !checkedIds.includes(id)),
    [items, checkedIds],
  );

  const handleCancel = () => {
    onClose();
    setCheckedIds([]);
  };

  const handleSave = () => {
    if (removedIds.length === 0) {
      handleCancel();
      return;
    }

    bulkDelete(removedIds, {
      onSuccess: () => {
        handleCancel();
      },
    });
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      closable={false}
      width={520}
      styles={{
        body: { padding: 0 },
        content: { borderRadius: 12, padding: 0, overflow: 'hidden' },
      }}
      centered
      data-cy="variable-pay-vp-deduction-detail-modal"
    >
      <div
        className="flex items-start justify-between px-6 pt-5"
        data-cy="variable-pay-vp-deduction-detail-modal-header"
      >
        <div data-cy="variable-pay-vp-deduction-detail-modal-header-text">
          {isLoading ? (
            <Skeleton.Input
              active
              size="small"
              style={{ width: 180 }}
              data-cy="variable-pay-vp-deduction-detail-modal-title-skeleton"
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
                data-cy="variable-pay-vp-deduction-detail-modal-employee-name"
              >
                {employeeName}
              </Title>
              <Text
                type="secondary"
                style={{ fontSize: 13 }}
                data-cy="variable-pay-vp-deduction-detail-modal-subtitle"
              >
                Attendance Rule Violation Details
              </Text>
            </>
          )}
        </div>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={handleCancel}
          size="small"
          style={{ color: 'rgba(0,0,0,0.45)', marginTop: 2 }}
          data-cy="variable-pay-vp-deduction-detail-modal-close"
        />
      </div>

      <div
        className="mx-6 mt-4 rounded-lg bg-blue-50 px-4 py-3"
        data-cy="variable-pay-vp-deduction-detail-modal-note"
      >
        <Text
          style={{ fontSize: 13, color: '#1d4ed8' }}
          data-cy="variable-pay-vp-deduction-detail-modal-note-text"
        >
          Note that deselecting an item means removing the VP deduction action
          for that Rule Violation.
        </Text>
      </div>

      <div
        className="flex max-h-[360px] flex-col gap-3 overflow-y-auto px-6 py-5"
        data-cy="variable-pay-vp-deduction-detail-modal-body"
      >
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton.Input
              key={`vp-deduction-detail-skeleton-${index}`}
              active
              block
              style={{ height: 72, borderRadius: 8 }}
              data-cy={`variable-pay-vp-deduction-detail-skeleton-${index}`}
            />
          ))
        ) : items.length === 0 ? (
          <Text
            type="secondary"
            style={{ fontSize: 13 }}
            data-cy="variable-pay-vp-deduction-detail-modal-empty"
          >
            No VP deductions found for this period.
          </Text>
        ) : (
          <Checkbox.Group
            value={checkedIds}
            onChange={(values) => setCheckedIds(values as string[])}
            className="flex w-full flex-col gap-3"
            data-cy="variable-pay-vp-deduction-detail-checkbox-group"
          >
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start rounded-lg bg-[#f5f5f5] px-4 py-3"
                data-cy={`variable-pay-vp-deduction-detail-item-${item.id}`}
              >
                <Checkbox
                  value={item.id}
                  className="mt-0.5"
                  data-cy={`variable-pay-vp-deduction-detail-checkbox-${item.id}`}
                >
                  <div className="flex flex-col">
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: 'rgba(0,0,0,0.85)',
                      }}
                      data-cy={`variable-pay-vp-deduction-detail-item-rule-${item.id}`}
                    >
                      {item.attendanceRuleName || 'Attendance rule violation'}
                    </Text>
                    <Text
                      type="secondary"
                      style={{ fontSize: 13 }}
                      data-cy={`variable-pay-vp-deduction-detail-item-amount-${item.id}`}
                    >
                      {item.deductedAmount} VP deduction
                    </Text>
                  </div>
                </Checkbox>
              </div>
            ))}
          </Checkbox.Group>
        )}
      </div>

      <div
        className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4"
        data-cy="variable-pay-vp-deduction-detail-modal-footer"
      >
        <Button
          onClick={handleCancel}
          data-cy="variable-pay-vp-deduction-detail-cancel"
        >
          Cancel
        </Button>
        <Button
          type="primary"
          onClick={handleSave}
          loading={isSaving}
          disabled={isLoading || items.length === 0}
          className="bg-[#1e40af] hover:!bg-[#1d4ed8]"
          data-cy="variable-pay-vp-deduction-detail-save"
        >
          Save
        </Button>
      </div>
    </Modal>
  );
}
