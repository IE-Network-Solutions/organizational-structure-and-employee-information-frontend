'use client';

import { useMemo, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Flex,
  Form,
  Input,
  Modal,
  Select,
  Segmented,
  Space,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import CustomLabel from '@/components/form/customLabel/customLabel';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import {
  getActorName,
  useShiftSwapStore,
} from '@/store/uistate/features/timesheet/shiftSwap';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { CalendarViewMode, ShiftAssignment } from '@/types/timesheet/shiftSwap';
import FilterBar from '../shared/FilterBar';
import {
  DirectoryPerson,
  datesBetween,
  formatShiftTime,
  matchesFilters,
} from '../shared/utils';
import SectionHeader from '../shared/SectionHeader';

type ScheduleCalendarProps = {
  people: DirectoryPerson[];
};

const ScheduleCalendar = ({ people }: ScheduleCalendarProps) => {
  const [assignForm] = Form.useForm();
  const [bulkForm] = Form.useForm();
  const [copyForm] = Form.useForm();
  const [dragAssignmentId, setDragAssignmentId] = useState<string | null>(null);
  const { userData } = useAuthenticationStore();
  const {
    templates,
    assignments,
    filters,
    calendarView,
    calendarDate,
    isAssignModalOpen,
    isBulkAssignModalOpen,
    isCopyModalOpen,
    deleteAssignmentId,
    setCalendarView,
    setCalendarDate,
    setIsAssignModalOpen,
    setIsBulkAssignModalOpen,
    setIsCopyModalOpen,
    setDeleteAssignmentId,
    assignShifts,
    moveAssignment,
    deleteAssignment,
    copySchedule,
  } = useShiftSwapStore();

  const templateMap = useMemo(
    () => Object.fromEntries(templates.map((item) => [item.id, item])),
    [templates],
  );

  const filteredAssignments = useMemo(
    () =>
      assignments.filter((item) =>
        matchesFilters(item, filters, templateMap[item.shiftTemplateId]),
      ),
    [assignments, filters, templateMap],
  );

  const anchor = dayjs(calendarDate);
  const weekDays = [...Array(7).keys()].map((index) =>
    anchor.startOf('week').add(index, 'day'),
  );
  const monthDays = [...Array(anchor.daysInMonth()).keys()].map((index) =>
    anchor.startOf('month').add(index, 'day'),
  );

  const rosterPeople = useMemo(() => {
    const ids = new Set(filteredAssignments.map((item) => item.employeeId));
    const fromAssignments = filteredAssignments.map((item) => ({
      id: item.employeeId,
      name: item.employeeName,
      departmentId: item.departmentId,
      departmentName: item.departmentName,
      locationId: item.locationId,
      locationName: item.locationName,
      teamId: item.teamId,
      teamName: item.teamName,
      positionId: item.positionId,
      positionName: item.positionName,
    }));
    const merged = [...people, ...fromAssignments];
    return Array.from(
      new Map(
        merged
          .filter((person) => !ids.size || ids.has(person.id) || people.length)
          .map((person) => [person.id, person]),
      ).values(),
    ).slice(0, 20);
  }, [filteredAssignments, people]);

  const assignmentsByKey = (employeeId: string, date: string) =>
    filteredAssignments.filter(
      (item) => item.employeeId === employeeId && item.date === date,
    );

  const shiftChip = (assignment: ShiftAssignment) => {
    const template = templateMap[assignment.shiftTemplateId];
    return (
      <div
        key={assignment.id}
        draggable
        onDragStart={() => setDragAssignmentId(assignment.id)}
        onDragEnd={() => setDragAssignmentId(null)}
        className="rounded-md px-2 py-1 text-[11px] text-white cursor-grab mb-1 group relative"
        style={{ backgroundColor: template?.color || '#3636F0' }}
        title={`${assignment.employeeName} · ${template?.name || 'Shift'}`}
        id={`time-attendance-settings-shift-swap-chip-${assignment.id}`}
        data-cy={`time-attendance-settings-shift-swap-chip-${assignment.id}`}
      >
        <Button
          type="text"
          className="absolute top-0.5 right-1 hidden group-hover:block !text-white/90 !min-w-0 !w-auto !h-auto !p-0"
          onClick={(event) => {
            event.stopPropagation();
            setDeleteAssignmentId(assignment.id);
          }}
          aria-label="Remove assignment"
        >
          ×
        </Button>
        <Typography.Text className="font-semibold truncate pr-3 block !text-white text-[11px]">
          {template?.name}
        </Typography.Text>
        <Typography.Text className="opacity-90 !text-white text-[11px]">
          {formatShiftTime(template)}
        </Typography.Text>
      </div>
    );
  };

  const dropOnCell = (employee: DirectoryPerson, date: string) => {
    if (!dragAssignmentId) return;
    moveAssignment(
      dragAssignmentId,
      { date, employeeId: employee.id, employeeName: employee.name },
      getActorName(userData),
    );
    NotificationMessage.success({
      message: 'Shift moved',
      description: 'The roster was updated and recorded in the audit log.',
    });
    setDragAssignmentId(null);
  };

  const handleAssign = (values: any) => {
    const selectedPeople = people.filter((person) =>
      values.employeeIds.includes(person.id),
    );
    assignShifts(
      {
        shiftTemplateId: values.shiftTemplateId,
        dates: [dayjs(values.date).format('YYYY-MM-DD')],
        people: selectedPeople.map((person) => ({
          ...person,
          employeeId: person.id,
          employeeName: person.name,
          assigneeType: 'employee' as const,
          assigneeId: person.id,
          assigneeName: person.name,
        })),
        notes: values.notes,
      },
      getActorName(userData),
    );
    NotificationMessage.success({
      message: 'Shift assigned',
      description: 'Employees will see the new schedule immediately.',
    });
    assignForm.resetFields();
  };

  const handleBulkAssign = (values: any) => {
    const selectedPeople = people.filter((person) => {
      if (values.assigneeType === 'employee') {
        return values.assigneeIds.includes(person.id);
      }
      if (values.assigneeType === 'department') {
        return values.assigneeIds.includes(person.departmentId);
      }
      if (values.assigneeType === 'team') {
        return values.assigneeIds.includes(person.teamId);
      }
      return values.assigneeIds.includes(person.positionId);
    });
    assignShifts(
      {
        shiftTemplateId: values.shiftTemplateId,
        dates: datesBetween(
          values.range[0].format('YYYY-MM-DD'),
          values.range[1].format('YYYY-MM-DD'),
        ),
        people: selectedPeople.map((person) => ({
          ...person,
          employeeId: person.id,
          employeeName: person.name,
          assigneeType: values.assigneeType,
          assigneeId: person.id,
          assigneeName: person.name,
        })),
        notes: values.notes,
      },
      getActorName(userData),
    );
    NotificationMessage.success({
      message: 'Bulk assignment complete',
      description: 'Matching working days were scheduled.',
    });
    bulkForm.resetFields();
  };

  const handleCopy = (values: any) => {
    copySchedule(
      {
        sourceFrom: values.source[0].format('YYYY-MM-DD'),
        sourceTo: values.source[1].format('YYYY-MM-DD'),
        targetFrom: values.targetFrom.format('YYYY-MM-DD'),
      },
      getActorName(userData),
    );
    NotificationMessage.success({
      message: 'Schedule copied',
      description: 'The target period now mirrors the source roster.',
    });
    copyForm.resetFields();
  };

  const assigneeOptions = (type: string) => {
    if (type === 'department') {
      return Array.from(
        new Map(
          people
            .filter((person) => person.departmentId)
            .map((person) => [
              person.departmentId,
              { value: person.departmentId, label: person.departmentName },
            ]),
        ).values(),
      );
    }
    if (type === 'team') {
      return Array.from(
        new Map(
          people
            .filter((person) => person.teamId)
            .map((person) => [
              person.teamId,
              { value: person.teamId, label: person.teamName },
            ]),
        ).values(),
      );
    }
    if (type === 'position') {
      return Array.from(
        new Map(
          people
            .filter((person) => person.positionId)
            .map((person) => [
              person.positionId,
              { value: person.positionId, label: person.positionName },
            ]),
        ).values(),
      );
    }
    return people.map((person) => ({ value: person.id, label: person.name }));
  };

  const shiftByDate = (date: string) =>
    filteredAssignments.filter((item) => item.date === date);

  return (
    <div
      id="time-attendance-settings-shift-swap-schedule"
      data-cy="time-attendance-settings-shift-swap-schedule"
    >
      <SectionHeader
        title="Schedule Calendar"
        description="Assign shifts to people, teams, departments, or positions. Drag a chip to reschedule."
        extra={
          <AccessGuard permissions={[Permissions.AssignShift]}>
            <Space wrap>
              <Button
                type="primary"
                className="h-10"
                onClick={() => setIsAssignModalOpen(true)}
              >
                Assign Shift
              </Button>
              <Button
                className="h-10"
                onClick={() => setIsBulkAssignModalOpen(true)}
              >
                Bulk Assign
              </Button>
              <Button className="h-10" onClick={() => setIsCopyModalOpen(true)}>
                Copy Schedule
              </Button>
            </Space>
          </AccessGuard>
        }
      />

      <Card className="border-[#D9D9D9] mb-4">
        <FilterBar people={people} templates={templates} />
      </Card>

      <Flex
        justify="space-between"
        align="center"
        gap={12}
        wrap
        className="mb-4"
      >
        <Flex align="center" gap={8} wrap>
          <Button
            icon={<LeftOutlined />}
            className="h-10"
            onClick={() =>
              setCalendarDate(
                anchor
                  .subtract(
                    calendarView === 'month'
                      ? 1
                      : calendarView === 'week'
                        ? 7
                        : 1,
                    'day',
                  )
                  .format('YYYY-MM-DD'),
              )
            }
          />
          <DatePicker
            className="h-10"
            value={anchor}
            onChange={(value) =>
              setCalendarDate((value || dayjs()).format('YYYY-MM-DD'))
            }
            allowClear={false}
          />
          <Button
            icon={<RightOutlined />}
            className="h-10"
            onClick={() =>
              setCalendarDate(
                anchor
                  .add(
                    calendarView === 'month'
                      ? 1
                      : calendarView === 'week'
                        ? 7
                        : 1,
                    'day',
                  )
                  .format('YYYY-MM-DD'),
              )
            }
          />
          <Typography.Text className="text-sm font-semibold text-[#4d4d4d]">
            {calendarView === 'month'
              ? anchor.format('MMMM YYYY')
              : calendarView === 'week'
                ? `${weekDays[0].format('MMM D')} – ${weekDays[6].format('MMM D, YYYY')}`
                : anchor.format('dddd, MMM D YYYY')}
          </Typography.Text>
        </Flex>
        <Segmented
          value={calendarView}
          onChange={(value) => setCalendarView(value as CalendarViewMode)}
          options={[
            { label: 'Daily', value: 'day' },
            { label: 'Weekly', value: 'week' },
            { label: 'Monthly', value: 'month' },
          ]}
        />
      </Flex>

      {calendarView === 'day' && (
        <Card
          className="border-[#D9D9D9] overflow-hidden"
          styles={{ body: { padding: 0 } }}
        >
          {rosterPeople.map((person) => (
            <Flex
              key={person.id}
              className="border-b border-[#F0F0F0] last:border-b-0 md:flex-row flex-col"
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => dropOnCell(person, anchor.format('YYYY-MM-DD'))}
            >
              <Flex
                vertical
                className="p-3 bg-[#FAFAFA] w-full md:w-[220px] shrink-0"
              >
                <Typography.Text className="text-sm font-semibold text-[#4d4d4d]">
                  {person.name}
                </Typography.Text>
                <Typography.Text className="text-xs font-normal text-gray-500">
                  {person.departmentName || 'Unassigned'}
                </Typography.Text>
              </Flex>
              <Flex vertical className="p-3 min-h-[72px] flex-1">
                {assignmentsByKey(person.id, anchor.format('YYYY-MM-DD')).map(
                  shiftChip,
                )}
              </Flex>
            </Flex>
          ))}
        </Card>
      )}

      {calendarView === 'week' && (
        <Card
          className="border-[#D9D9D9] overflow-auto"
          styles={{ body: { padding: 0 } }}
        >
          <div
            className="grid min-w-[900px]"
            style={{
              gridTemplateColumns: '180px repeat(7, minmax(110px, 1fr))',
            }}
            data-cy="time-attendance-settings-shift-swap-schedule-week-grid"
          >
            <Flex className="p-2 bg-[#FAFAFA] text-xs font-semibold text-gray-500 border-b border-[#F0F0F0]">
              Employee
            </Flex>
            {weekDays.map((day) => (
              <Flex
                key={day.format('YYYY-MM-DD')}
                className="p-2 bg-[#FAFAFA] text-xs font-semibold text-[#4d4d4d] border-b border-l border-[#F0F0F0]"
              >
                {day.format('ddd D')}
              </Flex>
            ))}
            {rosterPeople.map((person) => (
              <div
                key={person.id}
                className="contents"
                data-cy={`time-attendance-settings-shift-swap-schedule-week-row-${person.id}`}
              >
                <Flex className="p-2 text-sm font-medium text-[#4d4d4d] border-b border-[#F0F0F0]">
                  {person.name}
                </Flex>
                {weekDays.map((day) => {
                  const date = day.format('YYYY-MM-DD');
                  return (
                    <Flex
                      key={`${person.id}-${date}`}
                      vertical
                      className="p-1 min-h-[78px] border-b border-l border-[#F0F0F0]"
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => dropOnCell(person, date)}
                    >
                      {assignmentsByKey(person.id, date).map(shiftChip)}
                    </Flex>
                  );
                })}
              </div>
            ))}
          </div>
        </Card>
      )}

      {calendarView === 'month' && (
        <div
          className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2"
          data-cy="time-attendance-settings-shift-swap-schedule-month-grid"
        >
          {monthDays.map((day) => {
            const date = day.format('YYYY-MM-DD');
            const dayAssignments = shiftByDate(date);
            return (
              <Card
                key={date}
                size="small"
                className="border-[#D9D9D9] min-h-[120px]"
              >
                <Typography.Text className="text-xs font-semibold text-[#4d4d4d] mb-2 block">
                  {day.format('D ddd')}
                </Typography.Text>
                {dayAssignments.slice(0, 4).map(shiftChip)}
                {dayAssignments.length > 4 && (
                  <Typography.Text className="text-[11px] text-gray-500">
                    +{dayAssignments.length - 4} more
                  </Typography.Text>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={isAssignModalOpen}
        onCancel={() => setIsAssignModalOpen(false)}
        title={
          <Typography.Text className="text-lg font-semibold text-[#4d4d4d]">
            Assign Shift
          </Typography.Text>
        }
        footer={
          <Flex justify="end" gap={8}>
            <Button onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
            <Button type="primary" onClick={() => assignForm.submit()}>
              Assign
            </Button>
          </Flex>
        }
        centered
      >
        <Form
          form={assignForm}
          layout="vertical"
          requiredMark={CustomLabel}
          onFinish={handleAssign}
          initialValues={{ date: dayjs(calendarDate) }}
        >
          <Form.Item
            name="shiftTemplateId"
            label="Shift template"
            rules={[{ required: true }]}
          >
            <Select
              options={templates
                .filter((item) => item.isActive)
                .map((item) => ({ value: item.id, label: item.name }))}
            />
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker className="w-full h-[40px]" />
          </Form.Item>
          <Form.Item
            name="employeeIds"
            label="Employees"
            rules={[{ required: true }]}
          >
            <Select
              mode="multiple"
              options={people.map((person) => ({
                value: person.id,
                label: person.name,
              }))}
            />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={isBulkAssignModalOpen}
        onCancel={() => setIsBulkAssignModalOpen(false)}
        title={
          <Typography.Text className="text-lg font-semibold text-[#4d4d4d]">
            Bulk Assign Shifts
          </Typography.Text>
        }
        footer={
          <Flex justify="end" gap={8}>
            <Button onClick={() => setIsBulkAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="primary" onClick={() => bulkForm.submit()}>
              Assign
            </Button>
          </Flex>
        }
        centered
      >
        <Form
          form={bulkForm}
          layout="vertical"
          requiredMark={CustomLabel}
          onFinish={handleBulkAssign}
          initialValues={{ assigneeType: 'employee' }}
        >
          <Form.Item
            name="shiftTemplateId"
            label="Shift template"
            rules={[{ required: true }]}
          >
            <Select
              options={templates
                .filter((item) => item.isActive)
                .map((item) => ({ value: item.id, label: item.name }))}
            />
          </Form.Item>
          <Form.Item
            name="range"
            label="Date range"
            rules={[{ required: true }]}
          >
            <DatePicker.RangePicker className="w-full h-[40px]" />
          </Form.Item>
          <Form.Item
            name="assigneeType"
            label="Assign to"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { value: 'employee', label: 'Employees' },
                { value: 'team', label: 'Team' },
                { value: 'department', label: 'Department' },
                { value: 'position', label: 'Position' },
              ]}
            />
          </Form.Item>
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => (
              <Form.Item
                name="assigneeIds"
                label="Selection"
                rules={[{ required: true }]}
              >
                <Select
                  mode="multiple"
                  options={assigneeOptions(getFieldValue('assigneeType'))}
                />
              </Form.Item>
            )}
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={isCopyModalOpen}
        onCancel={() => setIsCopyModalOpen(false)}
        title={
          <Typography.Text className="text-lg font-semibold text-[#4d4d4d]">
            Copy Schedule
          </Typography.Text>
        }
        footer={
          <Flex justify="end" gap={8}>
            <Button onClick={() => setIsCopyModalOpen(false)}>Cancel</Button>
            <Button type="primary" onClick={() => copyForm.submit()}>
              Copy
            </Button>
          </Flex>
        }
        centered
      >
        <Form
          form={copyForm}
          layout="vertical"
          requiredMark={CustomLabel}
          onFinish={handleCopy}
        >
          <Form.Item
            name="source"
            label="Source period"
            rules={[{ required: true }]}
          >
            <DatePicker.RangePicker className="w-full h-[40px]" />
          </Form.Item>
          <Form.Item
            name="targetFrom"
            label="Copy onto starting"
            rules={[{ required: true }]}
          >
            <DatePicker className="w-full h-[40px]" />
          </Form.Item>
        </Form>
      </Modal>

      <DeleteModal
        open={Boolean(deleteAssignmentId)}
        onCancel={() => setDeleteAssignmentId(null)}
        onConfirm={() => {
          if (!deleteAssignmentId) return;
          deleteAssignment(deleteAssignmentId, getActorName(userData));
          NotificationMessage.success({
            message: 'Assignment removed',
            description: 'The change is captured in the audit log.',
          });
        }}
        customMessage="Remove this shift assignment from the roster?"
      />
    </div>
  );
};

export default ScheduleCalendar;
