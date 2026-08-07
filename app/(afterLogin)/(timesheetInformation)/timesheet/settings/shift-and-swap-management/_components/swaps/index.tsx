'use client';

import { useMemo } from 'react';
import {
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import {
  getActorName,
  useShiftSwapStore,
} from '@/store/uistate/features/timesheet/shiftSwap';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  SHIFT_SWAP_STATUS_LABEL,
  ShiftSwapRequest,
} from '@/types/timesheet/shiftSwap';
import { formatShiftTime, swapStatusTheme } from '../shared/utils';
import SectionHeader from '../shared/SectionHeader';

const SwapRequestsPanel = () => {
  const [rejectForm] = Form.useForm();
  const { userData } = useAuthenticationStore();
  const {
    templates,
    assignments,
    swapRequests,
    approvalConfig,
    selectedSwapId,
    filters,
    setSelectedSwapId,
    advanceSwap,
    updateApprovalConfig,
  } = useShiftSwapStore();

  const templateMap = Object.fromEntries(
    templates.map((item) => [item.id, item]),
  );
  const assignmentMap = Object.fromEntries(
    assignments.map((item) => [item.id, item]),
  );
  const selected = swapRequests.find((item) => item.id === selectedSwapId);

  const rows = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return swapRequests.filter((item) => {
      if (!query) return true;
      return `${item.requesterName} ${item.counterpartName} ${item.reason || ''}`
        .toLowerCase()
        .includes(query);
    });
  }, [swapRequests, filters.search]);

  const renderShiftSummary = (assignmentId: string, name: string) => {
    const assignment = assignmentMap[assignmentId];
    const template = assignment
      ? templateMap[assignment.shiftTemplateId]
      : undefined;
    return (
      <Card size="small" className="border-[#D9D9D9]">
        <Typography.Text className="text-sm font-semibold text-[#4d4d4d] block">
          {name}
        </Typography.Text>
        <Typography.Text className="text-sm block">
          {template?.name || 'Shift removed'}
        </Typography.Text>
        <Typography.Text className="text-xs text-gray-500">
          {assignment
            ? `${dayjs(assignment.date).format('ddd, MMM D')} · ${formatShiftTime(template)}`
            : 'Assignment no longer on roster'}
        </Typography.Text>
      </Card>
    );
  };

  const pending = (item: ShiftSwapRequest) => item.status.startsWith('pending');

  return (
    <div
      id="time-attendance-settings-shift-swap-requests"
      data-cy="time-attendance-settings-shift-swap-requests"
    >
      <SectionHeader
        title="Swap Requests & Approvals"
        description="Colleague confirmation, manager approval, and optional HR approval with in-app alerts at every stage."
        extra={
          <AccessGuard permissions={[Permissions.ManageShiftSwap]}>
            <Card size="small" className="border-[#D9D9D9] min-w-[280px]">
              <Typography.Text className="text-sm font-semibold text-[#4d4d4d] mb-2 block">
                Approval workflow
              </Typography.Text>
              <Flex justify="space-between" align="center" className="py-1">
                <Typography.Text className="text-sm">
                  Employee confirmation
                </Typography.Text>
                <Switch
                  checked={approvalConfig.requireColleagueConfirmation}
                  onChange={(checked) =>
                    updateApprovalConfig(
                      {
                        ...approvalConfig,
                        requireColleagueConfirmation: checked,
                      },
                      getActorName(userData),
                    )
                  }
                />
              </Flex>
              <Flex justify="space-between" align="center" className="py-1">
                <Typography.Text className="text-sm">
                  Direct manager
                </Typography.Text>
                <Switch
                  checked={approvalConfig.requireManagerApproval}
                  onChange={(checked) =>
                    updateApprovalConfig(
                      { ...approvalConfig, requireManagerApproval: checked },
                      getActorName(userData),
                    )
                  }
                />
              </Flex>
              <Flex justify="space-between" align="center" className="py-1">
                <Typography.Text className="text-sm">
                  HR approval
                </Typography.Text>
                <Switch
                  checked={approvalConfig.requireHrApproval}
                  onChange={(checked) =>
                    updateApprovalConfig(
                      { ...approvalConfig, requireHrApproval: checked },
                      getActorName(userData),
                    )
                  }
                />
              </Flex>
            </Card>
          </AccessGuard>
        }
      />

      <Card
        className="border-[#D9D9D9] overflow-hidden"
        styles={{ body: { padding: 0 } }}
      >
        <Table
          rowKey="id"
          dataSource={rows}
          pagination={{ pageSize: 8 }}
          locale={{
            emptyText: <Empty description="No swap requests" />,
          }}
          columns={[
            {
              title: 'Employees',
              render: (record) => (
                <Typography.Text className="font-medium text-[#4d4d4d]">
                  {record.requesterName} ↔ {record.counterpartName}
                </Typography.Text>
              ),
            },
            {
              title: 'Submitted',
              dataIndex: 'createdAt',
              render: (value) => dayjs(value).format('MMM D, YYYY HH:mm'),
            },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (status: ShiftSwapRequest['status']) => (
                <StatusBadge theme={swapStatusTheme(status)}>
                  {SHIFT_SWAP_STATUS_LABEL[status]}
                </StatusBadge>
              ),
            },
            {
              title: 'Attachment',
              render: (record) =>
                record.attachmentName ? (
                  <Tag>{record.attachmentName}</Tag>
                ) : (
                  '—'
                ),
            },
            {
              title: '',
              width: 90,
              render: (record) => (
                <Button
                  type="link"
                  onClick={() => setSelectedSwapId(record.id)}
                >
                  Review
                </Button>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={Boolean(selected)}
        onCancel={() => setSelectedSwapId(null)}
        title={
          <Typography.Text className="text-lg font-semibold text-[#4d4d4d]">
            Swap request detail
          </Typography.Text>
        }
        footer={null}
        centered
        width={720}
      >
        {selected && (
          <Flex vertical gap={16}>
            <Row gutter={[12, 12]}>
              <Col xs={24} md={12}>
                {renderShiftSummary(
                  selected.requesterAssignmentId,
                  selected.requesterName,
                )}
              </Col>
              <Col xs={24} md={12}>
                {renderShiftSummary(
                  selected.counterpartAssignmentId,
                  selected.counterpartName,
                )}
              </Col>
            </Row>
            <Flex vertical>
              <Typography.Text className="text-xs text-gray-500 mb-1">
                Reason
              </Typography.Text>
              <Typography.Text className="text-sm text-[#4d4d4d]">
                {selected.reason || 'No reason provided'}
              </Typography.Text>
            </Flex>
            <Space wrap>
              {selected.requireColleagueConfirmation && (
                <Tag color={selected.colleagueConfirmedAt ? 'green' : 'gold'}>
                  Colleague{' '}
                  {selected.colleagueConfirmedAt ? 'confirmed' : 'pending'}
                </Tag>
              )}
              {selected.requireManagerApproval && (
                <Tag color={selected.managerApprovedAt ? 'green' : 'gold'}>
                  Manager {selected.managerApprovedAt ? 'approved' : 'pending'}
                </Tag>
              )}
              {selected.requireHrApproval && (
                <Tag color={selected.hrApprovedAt ? 'green' : 'gold'}>
                  HR {selected.hrApprovedAt ? 'approved' : 'pending'}
                </Tag>
              )}
            </Space>
            {pending(selected) && (
              <AccessGuard permissions={[Permissions.ApproveShiftSwapRequest]}>
                <Flex wrap="wrap" justify="end" gap={8}>
                  <Button
                    onClick={() => {
                      advanceSwap(
                        selected.id,
                        'cancel',
                        getActorName(userData),
                      );
                      NotificationMessage.success({
                        message: 'Request cancelled',
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    danger
                    onClick={() => {
                      Modal.confirm({
                        title: 'Reject swap request',
                        content: (
                          <Form form={rejectForm} layout="vertical">
                            <Form.Item name="reason" label="Reason">
                              <Input.TextArea rows={3} />
                            </Form.Item>
                          </Form>
                        ),
                        onOk: () => {
                          advanceSwap(
                            selected.id,
                            'reject',
                            getActorName(userData),
                            rejectForm.getFieldValue('reason'),
                          );
                          NotificationMessage.success({
                            message: 'Swap rejected',
                            description: 'The requester was notified.',
                          });
                          rejectForm.resetFields();
                        },
                      });
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      advanceSwap(
                        selected.id,
                        'approve',
                        getActorName(userData),
                      );
                      NotificationMessage.success({
                        message: 'Approval recorded',
                        description:
                          'If this was the final step, schedules were updated automatically.',
                      });
                    }}
                  >
                    Approve current step
                  </Button>
                </Flex>
              </AccessGuard>
            )}
          </Flex>
        )}
      </Modal>
    </div>
  );
};

export default SwapRequestsPanel;
