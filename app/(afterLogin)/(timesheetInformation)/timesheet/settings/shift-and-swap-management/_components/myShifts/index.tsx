'use client';

import { useMemo } from 'react';
import {
  Button,
  Calendar,
  Card,
  Col,
  Empty,
  Flex,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Typography,
  Upload,
} from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import CustomLabel from '@/components/form/customLabel/customLabel';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import {
  getActorName,
  useShiftSwapStore,
} from '@/store/uistate/features/timesheet/shiftSwap';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  SHIFT_SWAP_STATUS_LABEL,
  ShiftAssignment,
} from '@/types/timesheet/shiftSwap';
import {
  DirectoryPerson,
  formatShiftTime,
  swapStatusTheme,
} from '../shared/utils';
import SectionHeader from '../shared/SectionHeader';

type MyShiftsPanelProps = {
  people: DirectoryPerson[];
};

const MyShiftsPanel = ({ people }: MyShiftsPanelProps) => {
  const [form] = Form.useForm();
  const { userId, userData } = useAuthenticationStore();
  const {
    templates,
    assignments,
    swapRequests,
    isSwapModalOpen,
    selectedAssignmentId,
    setIsSwapModalOpen,
    requestSwap,
  } = useShiftSwapStore();

  const currentUserId =
    userId && assignments.some((item) => item.employeeId === userId)
      ? userId
      : assignments[0]?.employeeId || people[0]?.id;

  const myAssignments = useMemo(
    () =>
      assignments
        .filter((item) => item.employeeId === currentUserId)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [assignments, currentUserId],
  );

  const today = dayjs().format('YYYY-MM-DD');
  const todaysShift = myAssignments.find((item) => item.date === today);
  const upcoming = myAssignments
    .filter((item) => item.date > today)
    .slice(0, 5);
  const history = myAssignments.filter((item) => item.date < today).slice(-5);

  const templateMap = Object.fromEntries(
    templates.map((item) => [item.id, item]),
  );
  const selectedAssignment = assignments.find(
    (item) => item.id === selectedAssignmentId,
  );

  const eligibleCounterparts = assignments.filter((item) => {
    if (!selectedAssignment) return false;
    if (item.employeeId === selectedAssignment.employeeId) return false;
    if (item.id === selectedAssignment.id) return false;
    return (
      item.date !== selectedAssignment.date ||
      item.shiftTemplateId !== selectedAssignment.shiftTemplateId
    );
  });

  const mySwaps = swapRequests.filter(
    (item) =>
      item.requesterId === currentUserId ||
      item.counterpartId === currentUserId,
  );

  const renderShiftCard = (assignment: ShiftAssignment, showSwap = false) => {
    const template = templateMap[assignment.shiftTemplateId];
    return (
      <Card key={assignment.id} size="small" className="border-[#D9D9D9]">
        <Flex justify="space-between" align="start" gap={8}>
          <Flex vertical>
            <Typography.Text className="text-sm font-semibold text-[#4d4d4d]">
              {dayjs(assignment.date).format('ddd, MMM D')}
            </Typography.Text>
            <Typography.Text className="text-sm text-gray-700">
              {template?.name}
            </Typography.Text>
            <Typography.Text className="text-xs text-gray-500">
              {formatShiftTime(template)}
            </Typography.Text>
          </Flex>
          {showSwap && (
            <AccessGuard permissions={[Permissions.SubmitShiftSwapRequest]}>
              <Button
                size="small"
                onClick={() => setIsSwapModalOpen(true, assignment.id)}
              >
                Request Swap
              </Button>
            </AccessGuard>
          )}
        </Flex>
      </Card>
    );
  };

  return (
    <div
      id="time-attendance-settings-shift-swap-my-shifts"
      data-cy="time-attendance-settings-shift-swap-my-shifts"
    >
      <SectionHeader
        title="My Shifts"
        description="Review today, upcoming shifts, history, and submit a swap with an eligible colleague."
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={13}>
          <Card className="border-[#D9D9D9] bg-white">
            <Calendar
              fullscreen={false}
              cellRender={(current, info) => {
                if (info.type !== 'date') return info.originNode;
                const assignment = myAssignments.find(
                  (item) => item.date === current.format('YYYY-MM-DD'),
                );
                if (!assignment) return info.originNode;
                const template = templateMap[assignment.shiftTemplateId];
                return (
                  <Flex vertical>
                    {info.originNode}
                    <Flex
                      className="h-1.5 w-full rounded-full mt-1"
                      style={{
                        backgroundColor: template?.color || '#3636F0',
                      }}
                    />
                  </Flex>
                );
              }}
            />
          </Card>
        </Col>
        <Col xs={24} xl={11}>
          <Flex vertical gap={16}>
            <Card className="border-[#D9D9D9]">
              <Typography.Text className="text-sm font-semibold text-[#4d4d4d] mb-2 block">
                Today&apos;s schedule
              </Typography.Text>
              {todaysShift ? (
                renderShiftCard(todaysShift, true)
              ) : (
                <Empty
                  description="No shift today"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
            <Card className="border-[#D9D9D9]">
              <Typography.Text className="text-sm font-semibold text-[#4d4d4d] mb-2 block">
                Upcoming
              </Typography.Text>
              <Flex vertical gap={8}>
                {upcoming.length ? (
                  upcoming.map((item) => renderShiftCard(item, true))
                ) : (
                  <Empty
                    description="No upcoming shifts"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </Flex>
            </Card>
          </Flex>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} lg={12}>
          <Card className="border-[#D9D9D9]">
            <Typography.Text className="text-sm font-semibold text-[#4d4d4d] mb-2 block">
              Shift history
            </Typography.Text>
            <Flex vertical gap={8}>
              {history.length ? (
                history.map((item) => renderShiftCard(item))
              ) : (
                <Empty
                  description="No history yet"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Flex>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="border-[#D9D9D9]">
            <Typography.Text className="text-sm font-semibold text-[#4d4d4d] mb-2 block">
              My swap requests
            </Typography.Text>
            <Flex vertical gap={8}>
              {mySwaps.length ? (
                mySwaps.map((item) => (
                  <Card key={item.id} size="small" className="border-[#F0F0F0]">
                    <Flex justify="space-between" align="center" gap={8}>
                      <Flex vertical>
                        <Typography.Text className="text-sm font-medium text-[#4d4d4d]">
                          {item.requesterName} ↔ {item.counterpartName}
                        </Typography.Text>
                        <Typography.Text className="text-xs text-gray-500">
                          {dayjs(item.createdAt).format('MMM D, YYYY')}
                        </Typography.Text>
                      </Flex>
                      <StatusBadge theme={swapStatusTheme(item.status)}>
                        {SHIFT_SWAP_STATUS_LABEL[item.status]}
                      </StatusBadge>
                    </Flex>
                  </Card>
                ))
              ) : (
                <Empty
                  description="No swap requests"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Flex>
          </Card>
        </Col>
      </Row>

      <Modal
        open={isSwapModalOpen}
        onCancel={() => setIsSwapModalOpen(false)}
        title={
          <Typography.Text className="text-lg font-semibold text-[#4d4d4d]">
            Request Shift Swap
          </Typography.Text>
        }
        footer={
          <Flex justify="end" gap={8}>
            <Button onClick={() => setIsSwapModalOpen(false)}>Cancel</Button>
            <Button type="primary" onClick={() => form.submit()}>
              Submit request
            </Button>
          </Flex>
        }
        centered
        width={640}
      >
        {selectedAssignment && (
          <Row gutter={[12, 12]} className="mb-4">
            <Col xs={24} md={12}>
              <Card size="small" className="border-[#D9D9D9]">
                <Typography.Text className="text-xs text-gray-500 mb-1 block">
                  Your shift
                </Typography.Text>
                <Typography.Text className="text-sm font-semibold text-[#4d4d4d] block">
                  {selectedAssignment.employeeName}
                </Typography.Text>
                <Typography.Text className="text-sm block">
                  {templateMap[selectedAssignment.shiftTemplateId]?.name}
                </Typography.Text>
                <Typography.Text className="text-xs text-gray-500">
                  {dayjs(selectedAssignment.date).format('ddd, MMM D')} ·{' '}
                  {formatShiftTime(
                    templateMap[selectedAssignment.shiftTemplateId],
                  )}
                </Typography.Text>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card size="small" className="border-dashed border-[#D9D9D9]">
                <Typography.Text className="text-sm text-gray-500">
                  Select a colleague shift to compare both sides before
                  submitting.
                </Typography.Text>
              </Card>
            </Col>
          </Row>
        )}
        <Form
          form={form}
          layout="vertical"
          requiredMark={CustomLabel}
          onFinish={(values) => {
            if (!selectedAssignment) return;
            requestSwap({
              requesterAssignmentId: selectedAssignment.id,
              counterpartAssignmentId: values.counterpartAssignmentId,
              reason: values.reason,
              attachmentName: values.attachment?.[0]?.name,
              actorName: getActorName(userData),
            });
            NotificationMessage.success({
              message: 'Swap request submitted',
              description: 'Approvers were notified in-app.',
            });
            form.resetFields();
          }}
        >
          <Form.Item
            name="counterpartAssignmentId"
            label="Colleague shift"
            rules={[{ required: true, message: 'Choose a colleague shift' }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              options={eligibleCounterparts.map((item) => ({
                value: item.id,
                label: `${item.employeeName} · ${dayjs(item.date).format('MMM D')} · ${templateMap[item.shiftTemplateId]?.name}`,
              }))}
            />
          </Form.Item>
          <Form.Item name="reason" label="Reason (optional)">
            <Input.TextArea rows={3} placeholder="Why do you need this swap?" />
          </Form.Item>
          <Form.Item
            name="attachment"
            label="Attachment (optional)"
            valuePropName="fileList"
            getValueFromEvent={(event) => event?.fileList}
          >
            <Upload.Dragger beforeUpload={() => false} maxCount={1}>
              <Typography.Paragraph className="ant-upload-drag-icon">
                <InboxOutlined />
              </Typography.Paragraph>
              <Typography.Paragraph className="ant-upload-text">
                Drop a supporting file
              </Typography.Paragraph>
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MyShiftsPanel;
