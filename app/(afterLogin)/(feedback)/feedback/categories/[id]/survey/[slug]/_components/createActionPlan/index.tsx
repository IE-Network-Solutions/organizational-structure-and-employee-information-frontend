/* eslint-disable local-rules/data-cy-required, @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from 'react-query';
import { flushSync } from 'react-dom';
import {
  Avatar,
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
} from 'antd';
import type { FormInstance } from 'antd/es/form';
import {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import {
  useCreateActionPlan,
  useUpdateActionPlan,
} from '@/store/server/features/organization-development/categories/mutation';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import Image, { type StaticImageData } from 'next/image';
import {
  useGetActionPlanById,
  useGetAllActionPlan,
} from '@/store/server/features/organization-development/categories/queries';
import type { DataItem } from '@/store/server/features/organization-development/categories/interface';
import AvatarImg from '@/public/gender_neutral_avatar.jpg';

const { Option } = Select;

export type SurveyContextForActionPlan = {
  title?: string;
  description?: string;
  updatedAt?: string;
};

function safeProfileImageForNextImage(
  profileImage: unknown,
  fallback: StaticImageData,
): string | StaticImageData {
  if (typeof profileImage !== 'string') return fallback;
  const s = profileImage.trim();
  if (!s) return fallback;
  if (s.startsWith('{') || s.includes('"uid"') || s.includes('rc-upload')) {
    return fallback;
  }
  if (
    s.startsWith('http://') ||
    s.startsWith('https://') ||
    s.startsWith('/') ||
    s.startsWith('data:')
  ) {
    return s;
  }
  return fallback;
}

function employeeDisplayName(u: {
  firstName?: string;
  middleName?: string;
  lastName?: string;
}): string {
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(' ');
}

function summaryPriorityPill(priority: string | undefined) {
  if (priority == null || String(priority).trim() === '') return null;
  const base =
    'inline-flex items-center rounded-md border px-2.5 py-0.5 text-[11px] font-semibold leading-none';
  const p = String(priority).toLowerCase();
  if (p === 'high') {
    return (
      <span className={`${base} border-red-200 bg-red-50 text-red-600`}>
        High
      </span>
    );
  }
  if (p === 'medium') {
    return (
      <span
        className={`${base} border-orange-200 bg-orange-50 text-orange-800`}
      >
        Medium
      </span>
    );
  }
  if (p === 'low') {
    return (
      <span
        className={`${base} border-emerald-200 bg-emerald-50 text-emerald-700`}
      >
        Low
      </span>
    );
  }
  return (
    <span className={`${base} border-gray-200 bg-white text-gray-600`}>
      {priority}
    </span>
  );
}

function truncateIssueNameHeading(text: string, maxLen = 72): string {
  const t = text.trim().replace(/\s+/g, ' ');
  if (!t) return '';
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen).trimEnd()}…`;
}

function ActionPlanSummaryCard({
  form,
  userById,
  planIndex,
  onBeginEdit,
  showRemove,
  onRemove,
  onRemoveFromList,
}: {
  form: FormInstance;
  userById: Map<string, any>;
  planIndex: number;
  onBeginEdit: (planIndex: number) => void;
  showRemove?: boolean;
  onRemove?: () => void;
  onRemoveFromList: () => void;
}) {
  const key = String(planIndex);
  const issue = Form.useWatch([key, 'issue'], form);
  const actionToBeTaken = Form.useWatch([key, 'actionToBeTaken'], form);
  const priority = Form.useWatch([key, 'priority'], form);
  const deadline = Form.useWatch([key, 'deadline'], form);
  const responsible = Form.useWatch([key, 'responsiblePerson'], form);

  const actionSummary =
    typeof actionToBeTaken === 'string' && actionToBeTaken.trim()
      ? actionToBeTaken.trim()
      : '';

  const issueSummary =
    typeof issue === 'string' && issue.trim() ? issue.trim() : '';
  const issueNameHeading = issueSummary
    ? truncateIssueNameHeading(issueSummary)
    : 'Issue name';

  const dateLabel =
    deadline && dayjs.isDayjs(deadline) ? deadline.format('MMM D YYYY') : '';

  const avatarUsers = useMemo(() => {
    const ids = Array.isArray(responsible)
      ? responsible.filter(Boolean).map(String)
      : [];
    if (ids.length === 0) return [];
    return ids
      .slice(0, 4)
      .map((id) => userById.get(id))
      .filter(Boolean) as any[];
  }, [responsible, userById]);

  const focusIssueField = () => {
    onBeginEdit(planIndex);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document
          .querySelector<HTMLTextAreaElement>(
            `[data-cy="create-action-plan-issue-${planIndex + 1}-textarea"]`,
          )
          ?.focus();
      });
    });
  };

  return (
    <div
      className="mb-3 rounded-lg border border-gray-200 bg-white p-3 shadow-none"
      data-cy={`create-action-plan-summary-card-${planIndex + 1}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <span
            className={`min-w-0 truncate text-base font-bold leading-none ${
              issueSummary ? 'text-gray-900' : 'text-gray-400'
            }`}
            title={issueSummary || undefined}
          >
            {issueNameHeading}
          </span>
          {summaryPriorityPill(
            typeof priority === 'string' ? priority : undefined,
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {showRemove ? (
            <button
              type="button"
              className="text-xs font-medium text-red-600 hover:text-red-700"
              data-cy={`create-action-plan-summary-${planIndex + 1}-remove`}
              onClick={onRemove}
            >
              Remove
            </button>
          ) : null}
          <Button
            type="default"
            size="small"
            icon={<EditOutlined className="text-[14px] text-gray-600" />}
            className="!flex !h-8 !w-8 !min-w-[32px] !items-center !justify-center !rounded !border !border-gray-200 !bg-white !p-0 shadow-none hover:!border-gray-300 hover:!bg-gray-50"
            onClick={focusIssueField}
            aria-label="Edit issue"
          />
          <Popconfirm
            title="Remove this action plan?"
            description="It will be removed from your list."
            onConfirm={onRemoveFromList}
            okText="Remove"
            cancelText="Cancel"
            okButtonProps={{
              className:
                '!bg-[#1E40AF] hover:!bg-[#1E3A8A] !border-[#1E40AF] text-white',
            }}
          >
            <Button
              danger
              type="default"
              size="small"
              icon={<CloseOutlined className="text-[12px]" />}
              className="!flex !h-8 !w-8 !min-w-[32px] !items-center !justify-center !rounded !border !border-red-200 !bg-white !p-0 !text-red-600 shadow-none hover:!border-red-300 hover:!bg-red-50"
              aria-label="Remove action plan"
            />
          </Popconfirm>
        </div>
      </div>

      {actionSummary ? (
        <div className="mt-2 text-sm font-normal leading-snug text-gray-800 whitespace-pre-wrap">
          {actionSummary}
        </div>
      ) : null}

      <div className="mt-2 flex flex-wrap items-start gap-x-2 gap-y-1.5">
        <div className="min-w-0 flex-1 flex flex-col gap-1.5">
          {avatarUsers.length > 0 ? (
            <div className="flex items-center">
              <Avatar.Group
                maxCount={4}
                maxStyle={{
                  color: '#374151',
                  backgroundColor: '#e5e7eb',
                  fontSize: 10,
                  fontWeight: 600,
                  width: 24,
                  height: 24,
                  lineHeight: '24px',
                }}
                size={24}
              >
                {avatarUsers.map((u: any) => {
                  const name = employeeDisplayName(u);
                  const src = safeProfileImageForNextImage(
                    u?.profileImage,
                    AvatarImg,
                  );
                  const srcStr = typeof src === 'string' ? src : undefined;
                  return (
                    <Avatar key={u.id} src={srcStr} alt="">
                      {name?.trim()?.[0] ?? '?'}
                    </Avatar>
                  );
                })}
              </Avatar.Group>
            </div>
          ) : null}
        </div>
        {dateLabel ? (
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="inline-flex items-center rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-medium leading-tight text-gray-700">
              {dateLabel}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function formatDeadlineForApi(value: unknown): string | undefined {
  if (value == null || value === '') return undefined;
  if (dayjs.isDayjs(value)) return value.format('YYYY-MM-DD');
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return dayjs(value).format('YYYY-MM-DD');
  }
  if (typeof value === 'string') {
    const t = value.trim();
    if (!t) return undefined;
    const parsed = dayjs(t);
    return parsed.isValid() ? parsed.format('YYYY-MM-DD') : t;
  }
  const parsed = dayjs(value as string | number | Date);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : undefined;
}

function normalizePriorityForApi(raw: unknown): string | undefined {
  if (raw == null || raw === '') return undefined;
  if (typeof raw === 'object' && raw !== null && 'value' in raw) {
    const v = (raw as { value?: unknown }).value;
    if (v == null || v === '') return undefined;
    return String(v);
  }
  return String(raw);
}

/** Send only fields the org-dev API expects (avoid stray form keys / bad serialization). */
function toActionPlanApiPayload(
  v: Record<string, any>,
): DataItem & Record<string, any> {
  const long = String(v?.issue ?? v?.description ?? '').trim();
  const deadline = formatDeadlineForApi(v?.deadline);
  const priority = normalizePriorityForApi(v?.priority);
  const rp = v?.responsiblePerson;
  const responsiblePerson = Array.isArray(rp)
    ? rp.filter(Boolean).map(String)
    : rp != null && rp !== ''
      ? [String(rp)]
      : [];

  const payload: DataItem & Record<string, unknown> = {
    issue: long,
    description: long,
    actionToBeTaken: String(v?.actionToBeTaken ?? '').trim(),
    responsiblePerson,
    status:
      v?.status != null && String(v.status).trim() !== ''
        ? String(v.status)
        : 'pending',
    priority: priority != null && priority !== '' ? priority : '',
  };
  if (priority != null && priority !== '') {
    payload.priority = priority;
    payload.priority_level = priority;
  }
  if (deadline != null && deadline !== '') {
    payload.deadline = deadline;
    payload.due_date = deadline;
    payload.dueDate = deadline;
  }
  return payload;
}

function planRowHasContent(row: Record<string, unknown> | undefined): boolean {
  if (!row || typeof row !== 'object') return false;
  if (String(row.issue ?? '').trim()) return true;
  if (String(row.actionToBeTaken ?? '').trim()) return true;
  if (Array.isArray(row.responsiblePerson) && row.responsiblePerson.length > 0)
    return true;
  if (row.priority != null && row.priority !== '') return true;
  if (row.deadline != null && row.deadline !== '') return true;
  return false;
}

function normalizeResponsibleSelection(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .map((v) => {
        if (v == null) return '';
        if (
          typeof v === 'object' &&
          'value' in (v as Record<string, unknown>)
        ) {
          const value = (v as { value?: unknown }).value;
          return value == null ? '' : String(value);
        }
        return String(v);
      })
      .filter(Boolean);
  }
  if (raw == null || raw === '') return [];
  if (typeof raw === 'object' && 'value' in (raw as Record<string, unknown>)) {
    const value = (raw as { value?: unknown }).value;
    return value == null || value === '' ? [] : [String(value)];
  }
  if (typeof raw === 'string' && raw.includes(',')) {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [String(raw)];
}

function getCreateSubmitPlanIndices(
  values: Record<string, any>,
  planCount: number,
): number[] {
  const out: number[] = [];
  for (let i = 0; i < planCount; i++) {
    const row = values[String(i)] ?? values[i];
    if (i === 0 || planRowHasContent(row)) out.push(i);
  }
  return out;
}

function validationNamePathsForPlans(indices: number[]): (string | number)[][] {
  const fields = [
    'issue',
    'actionToBeTaken',
    'responsiblePerson',
    'priority',
    'deadline',
  ] as const;
  return indices.flatMap((i) =>
    fields.map((f) => [String(i), f] as (string | number)[]),
  );
}

type CreatePlanRowProps = {
  planIndex: number;
  numberOfActionPlan: number;
  selectedEditActionPlan: string | null;
  editingPlanIndex: number | null;
  form: FormInstance;
  userById: Map<string, any>;
  userLoading: boolean;
  employeeItems: any[] | undefined;
  beginEditPlan: (planIndex: number) => void;
  pinRowForInputEditing: (planIndex: number) => void;
  removeLastPlan: () => void;
  removePlanAt: (planIndex: number) => void;
};

/** One plan: collapsed summary only if row has content; empty rows always show the full form. */
function CreatePlanRow({
  planIndex,
  numberOfActionPlan,
  selectedEditActionPlan,
  editingPlanIndex,
  form,
  userById,
  userLoading,
  employeeItems,
  beginEditPlan,
  pinRowForInputEditing,
  removeLastPlan,
  removePlanAt,
}: CreatePlanRowProps) {
  const row = Form.useWatch([String(planIndex)], form) as
    | Record<string, unknown>
    | undefined;
  const selectedResponsibleIds = normalizeResponsibleSelection(
    row?.responsiblePerson,
  );
  const responsibleNameById = useMemo(
    () =>
      new Map<string, string>(
        (employeeItems ?? []).map((item: any) => [
          String(item.id),
          employeeDisplayName(item),
        ]),
      ),
    [employeeItems],
  );
  const hasContent = planRowHasContent(row);

  const isTableEdit = !!selectedEditActionPlan;
  const isExpanded =
    isTableEdit || editingPlanIndex === planIndex || !hasContent;

  /** Pins expanded row without inline "Update" chrome (beginEditPlan sets that; field focus should not). */
  const onAnyFieldFocus = useCallback(() => {
    if (selectedEditActionPlan) return;
    if (editingPlanIndex === planIndex) return;
    pinRowForInputEditing(planIndex);
  }, [
    selectedEditActionPlan,
    editingPlanIndex,
    planIndex,
    pinRowForInputEditing,
  ]);

  const planCardShellClass = selectedEditActionPlan
    ? ''
    : numberOfActionPlan > 1
      ? 'relative mb-4 rounded-lg border border-gray-200 p-3'
      : '';

  const labelClassRow = 'text-sm font-semibold text-gray-900';

  return (
    <div
      id={`create-action-plan-card-${planIndex + 1}`}
      data-cy={`create-action-plan-card-${planIndex + 1}`}
    >
      {!selectedEditActionPlan && !isExpanded ? (
        <ActionPlanSummaryCard
          form={form}
          userById={userById}
          planIndex={planIndex}
          onBeginEdit={beginEditPlan}
          showRemove={
            numberOfActionPlan > 1 && planIndex === numberOfActionPlan - 1
          }
          onRemove={removeLastPlan}
          onRemoveFromList={() => removePlanAt(planIndex)}
        />
      ) : null}

      <div
        className={isExpanded ? planCardShellClass : 'hidden'}
        data-cy={`create-action-plan-card-${planIndex + 1}-form-fields`}
        aria-hidden={!isExpanded}
      >
        <div>
          <Form.Item
            className="mb-3"
            name={[`${planIndex}`, 'issue']}
            label={
              <span
                className={labelClassRow}
                data-cy={`create-action-plan-label-issue-${planIndex + 1}`}
              >
                Issue
              </span>
            }
            rules={[{ required: true, message: 'Issue is required' }]}
            data-cy={`create-action-plan-form-item-issue-${planIndex + 1}`}
          >
            <Input.TextArea
              autoSize={{ minRows: 2, maxRows: 12 }}
              placeholder="Textarea"
              className="w-full rounded-md"
              data-cy={`create-action-plan-issue-${planIndex + 1}-textarea`}
              onFocus={onAnyFieldFocus}
            />
          </Form.Item>

          <Form.Item
            className="mb-3"
            name={[`${planIndex}`, 'actionToBeTaken']}
            label={
              <span
                className={labelClassRow}
                data-cy={`create-action-plan-label-action-${planIndex + 1}`}
              >
                Action to be taken
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Action to be taken is required',
              },
            ]}
            data-cy={`create-action-plan-form-item-action-${planIndex + 1}`}
          >
            <Input.TextArea
              autoSize={{ minRows: 2, maxRows: 12 }}
              placeholder="Textarea"
              className="w-full rounded-md"
              data-cy={`create-action-plan-action-to-be-taken-${planIndex + 1}-textarea`}
              onFocus={onAnyFieldFocus}
            />
          </Form.Item>

          <Form.Item
            className="mb-3"
            name={[`${planIndex}`, 'responsiblePerson']}
            label={
              <span
                className={labelClassRow}
                data-cy={`create-action-plan-label-responsible-${planIndex + 1}`}
              >
                Responsible Person
              </span>
            }
            rules={[
              {
                required: true,
                type: 'array',
                min: 1,
                message: 'Responsible Person is required',
              },
            ]}
            data-cy={`create-action-plan-form-item-responsible-${planIndex + 1}`}
          >
            <Select
              mode="multiple"
              placeholder="Select"
              loading={userLoading}
              popupClassName="action-plan-responsible-dropdown"
              className="w-full rounded-md text-[14px] [&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!min-h-10 [&_.ant-select-selector]:!rounded-md [&_.ant-select-selection-overflow]:!h-10 [&_.ant-select-selection-overflow]:!items-center [&_.ant-select-selection-item]:!hidden [&_.ant-select-selection-item-remove]:!hidden [&_.ant-select-selection-placeholder]:text-[14px] [&_.ant-select-selection-placeholder]:text-gray-500"
              value={selectedResponsibleIds}
              showSearch
              optionFilterProp="children"
              maxTagCount={0}
              maxTagPlaceholder={() => null}
              menuItemSelectedIcon={
                <CheckOutlined style={{ color: '#1E40AF' }} />
              }
              data-cy={`create-action-plan-responsible-person-${planIndex + 1}-select`}
              onFocus={onAnyFieldFocus}
              filterOption={(input, option) => {
                return (option?.children ?? '')
                  .toString()
                  .toLowerCase()
                  .includes(input.toLowerCase());
              }}
              onChange={(userIds: string[]) => {
                const next = normalizeResponsibleSelection(userIds);
                const current = form.getFieldValue(String(planIndex)) ?? {};
                form.setFieldsValue({
                  [String(planIndex)]: {
                    ...current,
                    responsiblePerson: next,
                  },
                });
                onAnyFieldFocus();
              }}
            >
              {employeeItems?.map((item: any) => (
                <Option
                  key={item.id}
                  value={String(item.id)}
                  data-cy={`create-action-plan-responsible-option-${item.id}`}
                >
                  {employeeDisplayName(item)}
                </Option>
              ))}
            </Select>
            {selectedResponsibleIds.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedResponsibleIds.map((userId) => (
                  <span
                    key={userId}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-gray-100 px-2.5 py-1 text-[14px] leading-none text-gray-700"
                  >
                    <span>{responsibleNameById.get(userId) ?? userId}</span>
                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => {
                        const next = selectedResponsibleIds.filter(
                          (id) => id !== userId,
                        );
                        const current =
                          form.getFieldValue(String(planIndex)) ?? {};
                        form.setFieldsValue({
                          [String(planIndex)]: {
                            ...current,
                            responsiblePerson: next,
                          },
                        });
                      }}
                      aria-label={`Remove ${responsibleNameById.get(userId) ?? userId}`}
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
          </Form.Item>

          <Row
            gutter={[16, 8]}
            data-cy={`create-action-plan-row-priority-deadline-${planIndex + 1}`}
          >
            <Col
              xs={24}
              sm={12}
              data-cy={`create-action-plan-col-priority-${planIndex + 1}`}
            >
              <Form.Item
                className="mb-0"
                name={[`${planIndex}`, 'priority']}
                label={
                  <span
                    className={labelClassRow}
                    data-cy={`create-action-plan-label-priority-${planIndex + 1}`}
                  >
                    Priority
                  </span>
                }
                rules={[
                  {
                    required: true,
                    message: 'Priority is required',
                  },
                ]}
                data-cy={`create-action-plan-form-item-priority-${planIndex + 1}`}
              >
                <Select
                  placeholder="Select"
                  allowClear
                  popupClassName="action-plan-priority-dropdown"
                  className="w-full rounded-md"
                  options={[
                    { value: 'high', label: 'High' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'low', label: 'Low' },
                  ]}
                  data-cy={`create-action-plan-priority-select-${planIndex + 1}`}
                  onFocus={onAnyFieldFocus}
                />
              </Form.Item>
            </Col>
            <Col
              xs={24}
              sm={12}
              data-cy={`create-action-plan-col-deadline-${planIndex + 1}`}
            >
              <Form.Item
                className="mb-0"
                name={[`${planIndex}`, 'deadline']}
                label={
                  <span
                    className={labelClassRow}
                    data-cy={`create-action-plan-label-deadline-${planIndex + 1}`}
                  >
                    Deadline
                  </span>
                }
                rules={[
                  {
                    required: true,
                    message: 'Deadline is required',
                  },
                ]}
                data-cy={`create-action-plan-form-item-deadline-${planIndex + 1}`}
              >
                <DatePicker
                  className="w-full rounded-md"
                  format="MMM D, YYYY"
                  placeholder="Select date"
                  data-cy={`create-action-plan-deadline-picker-${planIndex + 1}`}
                  onFocus={onAnyFieldFocus}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <Form.Item
          name={[`${planIndex}`, 'status']}
          initialValue="pending"
          hidden
          data-cy={`create-action-plan-form-item-status-${planIndex + 1}`}
        >
          <Select
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'solved', label: 'Solved' },
            ]}
          />
        </Form.Item>
      </div>
    </div>
  );
}

type CreateActionPlanProps = {
  id: string;
  onClose?: () => void;
  surveyContext?: SurveyContextForActionPlan;
};

const CreateActionPlan = (props: CreateActionPlanProps) => {
  const [form] = Form.useForm();
  /** Which plan row shows the full form; null = all collapsed (summary only). */
  const [editingPlanIndex, setEditingPlanIndex] = useState<number | null>(0);
  /** True when user opened the form from a collapsed summary (Update flow). */
  const [inlineEditMode, setInlineEditMode] = useState(false);
  const {
    numberOfActionPlan,
    setNumberOfActionPlan,
    selectedEditActionPlan,
    setSelectedEditActionPlan,
    open,
    setOpen,
  } = useOrganizationalDevelopment();
  const { mutate: createActionPlanData, isLoading: createActionPlanLoading } =
    useCreateActionPlan();
  const { mutate: updateActionPlanData, isLoading: updateActionPlanLoading } =
    useUpdateActionPlan();
  const { data: singleActionPlanData } = useGetActionPlanById(
    selectedEditActionPlan || '',
  );
  const { data: employeeData, isLoading: userLoading } = useGetAllUsers();
  const { refetch: refetchActionPlan } = useGetAllActionPlan(props?.id);
  const queryClient = useQueryClient();

  const userById = useMemo(() => {
    const m = new Map<string, any>();
    for (const u of employeeData?.items ?? []) {
      if (u?.id != null) m.set(String(u.id), u);
    }
    return m;
  }, [employeeData?.items]);

  const closeModal = useCallback(() => {
    form.resetFields();
    setSelectedEditActionPlan(null);
    setNumberOfActionPlan(1);
    setEditingPlanIndex(0);
    setInlineEditMode(false);
    setOpen(false);
    props?.onClose?.();
  }, [form, props, setOpen, setSelectedEditActionPlan, setNumberOfActionPlan]);

  /** Create flow: confirm only when there is draft data (filled row and/or multiple plans). */
  const needsDiscardConfirmation = useCallback((): boolean => {
    if (selectedEditActionPlan) return true;
    if (numberOfActionPlan > 1) return true;
    const values = form.getFieldsValue(true);
    for (let i = 0; i < numberOfActionPlan; i++) {
      const row = values[String(i)] ?? values[i];
      if (planRowHasContent(row as Record<string, unknown> | undefined)) {
        return true;
      }
    }
    return false;
  }, [selectedEditActionPlan, numberOfActionPlan, form]);

  const handleAttemptClose = useCallback(() => {
    if (!needsDiscardConfirmation()) {
      closeModal();
      return;
    }
    Modal.confirm({
      title: 'Discard changes?',
      content: 'This will reset all fields you filled in.',
      okText: 'Yes',
      cancelText: 'No',
      centered: true,
      zIndex: 1100,
      okButtonProps: {
        className:
          '!bg-[#1E40AF] hover:!bg-[#1E3A8A] !border-[#1E40AF] text-white',
      },
      onOk: () => {
        closeModal();
      },
    });
  }, [needsDiscardConfirmation, closeModal]);

  useEffect(() => {
    if (open && !selectedEditActionPlan) {
      setEditingPlanIndex(0);
      setInlineEditMode(false);
    }
  }, [open, selectedEditActionPlan]);

  /** Edit mode always edits a single plan at field prefix `0`; reset multi-row draft state from create flow. */
  useEffect(() => {
    if (!selectedEditActionPlan) return;
    setNumberOfActionPlan(1);
    setEditingPlanIndex(0);
    setInlineEditMode(false);
    form.resetFields();
  }, [selectedEditActionPlan, form, setNumberOfActionPlan]);

  const removePlanAt = useCallback(
    (removeIdx: number) => {
      if (numberOfActionPlan <= 1) {
        form.resetFields([
          ['0', 'issue'],
          ['0', 'actionToBeTaken'],
          ['0', 'responsiblePerson'],
          ['0', 'priority'],
          ['0', 'deadline'],
          ['0', 'status'],
        ]);
        form.setFieldsValue({ '0': { status: 'pending' } });
        setEditingPlanIndex(0);
        setInlineEditMode(false);
        return;
      }
      const values = form.getFieldsValue(true);
      const n = numberOfActionPlan;
      const newN = n - 1;
      const merged: Record<string, unknown> = {};
      let dest = 0;
      for (let i = 0; i < n; i++) {
        if (i === removeIdx) continue;
        const row = values[String(i)] ?? values[i];
        merged[String(dest)] =
          row && typeof row === 'object'
            ? { ...(row as Record<string, unknown>) }
            : { status: 'pending' };
        dest += 1;
      }
      setNumberOfActionPlan(newN);
      form.resetFields();
      form.setFieldsValue(merged);
      setEditingPlanIndex((cur) => {
        if (cur === null) return cur;
        if (cur === removeIdx) return null;
        if (cur > removeIdx) return cur - 1;
        return cur;
      });
      if (newN <= 1) {
        setInlineEditMode(false);
      }
    },
    [numberOfActionPlan, form, setNumberOfActionPlan],
  );

  const removeLastPlan = useCallback(() => {
    if (numberOfActionPlan <= 1) return;
    removePlanAt(numberOfActionPlan - 1);
  }, [numberOfActionPlan, removePlanAt]);

  const plusOnClickHandler = async () => {
    const existingIndices = [...Array(numberOfActionPlan).keys()];
    try {
      await form.validateFields(validationNamePathsForPlans(existingIndices));
    } catch {
      message.error(
        'Fill in all required fields for each action plan before adding another.',
      );
      return;
    }
    const newIdx = numberOfActionPlan;
    setNumberOfActionPlan(newIdx + 1);
    setInlineEditMode(false);
    setEditingPlanIndex(newIdx);
    form.setFieldsValue({
      [String(newIdx)]: { status: 'pending' },
    });
  };

  const handleCreateSubmit = async () => {
    const values = form.getFieldsValue(true);
    const indices = getCreateSubmitPlanIndices(values, numberOfActionPlan);
    const paths = validationNamePathsForPlans(indices);
    try {
      await form.validateFields(paths);
    } catch {
      message.error(
        'Fill in all required fields for each action plan you are saving.',
      );
      return;
    }
    const arrayOfObjects = indices.map((i) =>
      toActionPlanApiPayload(values[String(i)] ?? values[i]),
    );
    createActionPlanData(
      { formId: props?.id, values: arrayOfObjects },
      {
        onSuccess: () => {
          form.resetFields();
          setSelectedEditActionPlan(null);
          setNumberOfActionPlan(1);
          setEditingPlanIndex(0);
          setInlineEditMode(false);
          setOpen(false);
          props?.onClose?.();
          if (props?.id) {
            void queryClient.refetchQueries(['actionPlans', props.id]);
          }
          void refetchActionPlan();
        },
      },
    );
  };

  useEffect(() => {
    if (selectedEditActionPlan && singleActionPlanData) {
      form.setFieldsValue({
        0: {
          issue:
            singleActionPlanData?.issue ??
            singleActionPlanData?.description ??
            singleActionPlanData?.name ??
            '',
          actionToBeTaken: singleActionPlanData?.actionToBeTaken || '',
          responsiblePerson: normalizeResponsibleSelection(
            singleActionPlanData?.responsiblePerson,
          ),
          status: singleActionPlanData?.status || '',
          priority: singleActionPlanData?.priority || undefined,
          deadline: singleActionPlanData?.deadline
            ? dayjs(singleActionPlanData.deadline)
            : undefined,
        },
      });
    }
  }, [selectedEditActionPlan, singleActionPlanData, form]);

  const handleOnUpdateActionPlan = (values: any) => {
    updateActionPlanData(
      {
        actionPlanId: selectedEditActionPlan,
        values: toActionPlanApiPayload(values[0]),
      },
      {
        onSuccess: () => {
          form.resetFields();
          setSelectedEditActionPlan(null);
          setNumberOfActionPlan(1);
          setEditingPlanIndex(0);
          setInlineEditMode(false);
          setOpen(false);
          props?.onClose?.();
          if (props?.id) {
            void queryClient.refetchQueries(['actionPlans', props.id]);
          }
          void refetchActionPlan();
        },
      },
    );
  };

  const handleOnFinish = (values: any) => {
    if (selectedEditActionPlan) {
      handleOnUpdateActionPlan(values);
    }
  };

  const beginEditPlan = useCallback(
    (planIndex: number) => {
      const row = form.getFieldValue(String(planIndex));
      if (row != null && typeof row === 'object') {
        form.setFieldsValue({
          [String(planIndex)]: {
            ...row,
            status: row.status ?? 'pending',
          },
        });
      }
      setInlineEditMode(true);
      setEditingPlanIndex(planIndex);
    },
    [form],
  );

  /** Same row sync as beginEditPlan but no inlineEditMode — keeps full create UI when focusing fields after Update. */
  const pinRowForInputEditing = useCallback(
    (idx: number) => {
      flushSync(() => {
        const row = form.getFieldValue(String(idx));
        if (row != null && typeof row === 'object') {
          form.setFieldsValue({
            [String(idx)]: {
              ...row,
              status: row.status ?? 'pending',
            },
          });
        }
        setEditingPlanIndex(idx);
      });
    },
    [form],
  );

  const handleUpdateExpandedPlan = useCallback(async () => {
    if (editingPlanIndex === null) return;
    try {
      await form.validateFields(
        validationNamePathsForPlans([editingPlanIndex]),
      );
    } catch {
      message.error(
        'Fill in all required fields for this action plan before updating.',
      );
      return;
    }
    setInlineEditMode(false);
    setEditingPlanIndex(null);
  }, [form, editingPlanIndex]);

  const isUpdateChrome =
    !selectedEditActionPlan && inlineEditMode && editingPlanIndex !== null;

  const hideAddPlanButton = !selectedEditActionPlan && inlineEditMode;

  /** Table edit: one row at `0`. Inline update: only the row being edited (hide trailing empty rows). */
  const planIndicesToRender = useMemo(() => {
    if (selectedEditActionPlan) return [0];
    if (isUpdateChrome && editingPlanIndex !== null) {
      return [editingPlanIndex];
    }
    return [...Array(numberOfActionPlan).keys()];
  }, [
    selectedEditActionPlan,
    isUpdateChrome,
    editingPlanIndex,
    numberOfActionPlan,
  ]);

  const numberOfActionPlanForRow =
    selectedEditActionPlan || isUpdateChrome ? 1 : numberOfActionPlan;

  return (
    <Modal
      data-cy="create-action-plan-modal"
      open={open}
      onCancel={handleAttemptClose}
      footer={null}
      closable
      closeIcon={
        <span
          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          data-cy="create-action-plan-close"
        >
          <CloseOutlined className="text-base" />
        </span>
      }
      title={
        <h2
          className="m-0 pr-2 text-[16px] font-bold leading-tight"
          style={{
            color: 'var(--Components-Modal-Component-titleColor, #000000B2)',
          }}
        >
          {selectedEditActionPlan
            ? 'Edit action plan'
            : isUpdateChrome
              ? 'Update action plan'
              : 'Action Plan'}
        </h2>
      }
      centered
      width={780}
      maskClosable={false}
      keyboard
      destroyOnClose
      zIndex={1000}
      className="action-plan-create-modal [&_.ant-modal-close]:!top-[18px] [&_.ant-modal-close]:!end-6 [&_.ant-modal-content]:max-w-[calc(100vw-24px)] [&_.ant-modal-content]:overflow-hidden [&_.ant-modal-content]:p-0 [&_.ant-modal-content]:shadow-[0_12px_48px_rgba(0,0,0,0.14)]"
      styles={{
        mask: { backgroundColor: 'rgba(55, 65, 80, 0.45)', opacity: 1 },
        header: {
          marginBottom: 0,
          padding: '16px 32px 8px',
          borderBottom: 'none',
        },
        content: {
          padding: 0,
          borderRadius: 8,
          height: 'auto',
          maxHeight: 'none',
          display: 'block',
          overflow: 'visible',
        },
        body: {
          overflowY: 'visible',
          padding: 0,
        },
      }}
    >
      <div className="bg-white">
        <div className="px-8 pb-4">
          <Form
            id="create-action-plan-form"
            data-cy={
              selectedEditActionPlan
                ? 'create-action-plan-form-edit'
                : isUpdateChrome
                  ? 'create-action-plan-form-update-issue'
                  : 'create-action-plan-form'
            }
            form={form}
            name="dependencies"
            autoComplete="off"
            layout="vertical"
            colon={false}
            requiredMark
            className="action-plan-create-form [&_.ant-form-item-label]:pb-0"
            onFinish={handleOnFinish}
          >
            {planIndicesToRender.map((planIndex) => (
              <CreatePlanRow
                key={planIndex}
                planIndex={planIndex}
                numberOfActionPlan={numberOfActionPlanForRow}
                selectedEditActionPlan={selectedEditActionPlan}
                editingPlanIndex={editingPlanIndex}
                form={form}
                userById={userById}
                userLoading={userLoading}
                employeeItems={employeeData?.items}
                beginEditPlan={beginEditPlan}
                pinRowForInputEditing={pinRowForInputEditing}
                removeLastPlan={removeLastPlan}
                removePlanAt={removePlanAt}
              />
            ))}

            {!selectedEditActionPlan && !hideAddPlanButton ? (
              <div
                className="mb-1 mt-3 flex justify-center"
                data-cy="create-action-plan-add-row"
              >
                <Button
                  type="primary"
                  className="!inline-flex !h-8 min-h-8 max-h-8 w-fit shrink-0 items-center justify-center gap-1.5 rounded-md border-0 !bg-[#1E40AF] px-4 py-0 text-sm font-semibold leading-none text-white shadow-none hover:!bg-[#1E3A8A]"
                  onClick={plusOnClickHandler}
                  data-cy="create-action-plan-add-button"
                >
                  <PlusOutlined className="text-[13px]" />
                  Action Plan
                </Button>
              </div>
            ) : null}

            <div
              className="mt-3 flex justify-end gap-3 pt-3"
              data-cy="create-action-plan-footer"
            >
              <Button
                className="min-w-[96px] rounded-md border-gray-300 bg-white text-gray-700 shadow-sm hover:!border-gray-400 hover:!text-gray-900"
                onClick={handleAttemptClose}
                data-cy="create-action-plan-cancel-button"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType={selectedEditActionPlan ? 'submit' : 'button'}
                loading={createActionPlanLoading || updateActionPlanLoading}
                className="min-w-[96px] rounded-md border-0 !bg-[#1E40AF] font-semibold text-white shadow-none hover:!bg-[#1E3A8A]"
                data-cy={
                  isUpdateChrome
                    ? 'create-action-plan-update-issue-button'
                    : 'create-action-plan-submit-button'
                }
                onClick={
                  selectedEditActionPlan
                    ? undefined
                    : isUpdateChrome
                      ? () => {
                          void handleUpdateExpandedPlan();
                        }
                      : () => {
                          void handleCreateSubmit();
                        }
                }
              >
                {selectedEditActionPlan
                  ? 'Edit'
                  : isUpdateChrome
                    ? 'Update'
                    : 'Create'}
              </Button>
            </div>
          </Form>
        </div>
      </div>
      <style jsx global>{`
        .action-plan-priority-dropdown .ant-select-item-option-selected {
          background-color: #e6f4ff !important;
        }
        .action-plan-responsible-dropdown .ant-select-item-option {
          margin: 0 4px 6px 4px !important;
          border-radius: 6px !important;
          min-height: 40px !important;
          padding-top: 10px !important;
          padding-bottom: 10px !important;
        }
        .action-plan-responsible-dropdown .ant-select-item-option:last-child {
          margin-bottom: 0 !important;
        }
        .action-plan-responsible-dropdown .ant-select-item-option-selected {
          background-color: #e6f4ff !important;
        }
        .action-plan-responsible-dropdown .ant-select-item-option-state {
          display: inline-flex !important;
          color: #1e40af !important;
        }
        .action-plan-responsible-dropdown .rc-virtual-list-holder {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .action-plan-responsible-dropdown
          .rc-virtual-list-holder::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </Modal>
  );
};

export default CreateActionPlan;
