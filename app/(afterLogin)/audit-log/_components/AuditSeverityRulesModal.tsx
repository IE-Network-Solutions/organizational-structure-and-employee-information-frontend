'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Form, Modal, Popconfirm, Select, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { FiTrash2 } from 'react-icons/fi';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useGetAuditSeverityFields } from '@/store/server/features/tenant-management/audit-logs/queries';
import {
  AUDIT_ACTION_OPTIONS,
  AUDIT_LOG_MODULE_OPTIONS,
  AUDIT_SEVERITIES,
  AUDIT_SEVERITY_LABELS,
  AuditSeverity,
  AuditSeverityRule,
} from './types';
import {
  AUDIT_SELECT_CLASS,
  getActionLabel,
  getModuleLabel,
  getRuleFields,
  humanizeAuditLabel,
} from './utils';

interface AuditSeverityRulesModalProps {
  open: boolean;
  rules: AuditSeverityRule[];
  onCancel: () => void;
  onSave: (rules: AuditSeverityRule[]) => void;
}

const fieldsKey = (fields: string[]) =>
  [...fields]
    .map((field) => field.trim().toLowerCase())
    .filter(Boolean)
    .sort()
    .join('|');

const AuditSeverityRulesModal = ({
  open,
  rules,
  onCancel,
  onSave,
}: AuditSeverityRulesModalProps) => {
  const [draftRules, setDraftRules] = useState<AuditSeverityRule[]>(rules);
  const [newModule, setNewModule] = useState<string | undefined>();
  const [newAction, setNewAction] = useState<string | undefined>();
  const [newFields, setNewFields] = useState<string[]>([]);
  const [newSeverity, setNewSeverity] = useState<AuditSeverity | undefined>();
  const { data: remoteFields, isFetching: loadingFields } =
    useGetAuditSeverityFields(newModule);

  const moduleFieldOptions = useMemo(() => {
    const payload = remoteFields as
      | { fields?: Array<{ value?: string; label?: string } | string> }
      | Array<{ value?: string; label?: string } | string>
      | undefined;
    const rows = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.fields)
        ? payload.fields
        : [];
    return rows
      .map((row) => {
        if (typeof row === 'string') {
          return { value: row, label: humanizeAuditLabel(row) };
        }
        const value = row?.value || '';
        return {
          value,
          label: row?.label || humanizeAuditLabel(value),
        };
      })
      .filter((row) => row.value);
  }, [remoteFields]);

  useEffect(() => {
    if (open) {
      setDraftRules(rules);
      setNewModule(undefined);
      setNewAction(undefined);
      setNewFields([]);
      setNewSeverity(undefined);
    }
  }, [open, rules]);

  const handleAddRule = () => {
    const selectedFields = newFields.filter(Boolean);
    if (
      !newModule ||
      !newAction ||
      !newSeverity ||
      selectedFields.length === 0
    ) {
      NotificationMessage.warning({
        message: 'Incomplete rule',
        description:
          'Select a module, action, fields, and severity before adding.',
      });
      return;
    }

    const nextKey = fieldsKey(selectedFields);
    const existingIndex = draftRules.findIndex(
      (rule) =>
        rule.module === newModule &&
        rule.actionVerb === newAction &&
        fieldsKey(getRuleFields(rule)) === nextKey,
    );

    const nextRule: AuditSeverityRule = {
      id:
        existingIndex >= 0
          ? draftRules[existingIndex].id
          : `rule-${newModule}-${newAction}-${nextKey || 'any'}-${Date.now()}`,
      module: newModule,
      actionVerb: newAction,
      fields: selectedFields.length ? selectedFields : undefined,
      severity: newSeverity,
    };

    if (existingIndex >= 0) {
      setDraftRules((current) =>
        current.map((rule, index) =>
          index === existingIndex ? nextRule : rule,
        ),
      );
      NotificationMessage.success({
        message: 'Rule updated',
        description: 'An existing field rule was updated.',
      });
    } else {
      setDraftRules((current) => [...current, nextRule]);
    }

    setNewModule(undefined);
    setNewAction(undefined);
    setNewFields([]);
    setNewSeverity(undefined);
  };

  const handleSeverityChange = (ruleId: string, severity: AuditSeverity) => {
    setDraftRules((current) =>
      current.map((rule) =>
        rule.id === ruleId ? { ...rule, severity } : rule,
      ),
    );
  };

  const handleDelete = (ruleId: string) => {
    setDraftRules((current) => current.filter((rule) => rule.id !== ruleId));
  };

  const columns: ColumnsType<AuditSeverityRule> = [
    {
      title: 'Module',
      dataIndex: 'module',
      key: 'module',
      render: (module: string) => getModuleLabel(module),
    },
    {
      title: 'Action',
      dataIndex: 'actionVerb',
      key: 'actionVerb',
      render: (actionVerb: string) => getActionLabel(actionVerb),
    },
    {
      title: 'Fields',
      key: 'fields',
      render: (unused, record) => {
        const fields = getRuleFields(record);
        if (fields.length === 0) {
          return (
            <Tag
              className="m-0"
              data-cy={`audit-severity-rule-any-field-${record.id}`}
            >
              Any field
            </Tag>
          );
        }
        return (
          <div
            className="flex flex-wrap gap-1"
            data-cy={`audit-severity-rule-fields-${record.id}`}
          >
            {fields.map((field) => (
              <Tag
                key={field}
                className="m-0"
                data-cy={`audit-severity-rule-field-${record.id}-${field}`}
              >
                {humanizeAuditLabel(field)}
              </Tag>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      width: 160,
      render: (severity: AuditSeverity, record) => (
        <Select
          value={severity}
          className="w-full"
          options={AUDIT_SEVERITIES.map((option) => ({
            value: option,
            label: AUDIT_SEVERITY_LABELS[option],
          }))}
          onChange={(value) => handleSeverityChange(record.id, value)}
          data-cy={`audit-severity-rule-severity-${record.id}`}
        />
      ),
    },
    {
      title: '',
      key: 'delete',
      width: 56,
      render: (unused, record) => (
        <Popconfirm
          title="Delete rule"
          description="Remove this severity rule from the list?"
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{
            danger: true,
            'data-cy': `audit-severity-rule-delete-confirm-${record.id}`,
          }}
          onConfirm={() => handleDelete(record.id)}
          data-cy={`audit-severity-rule-delete-popconfirm-${record.id}`}
        >
          <Button
            type="text"
            danger
            icon={<FiTrash2 />}
            aria-label="Delete rule"
            data-cy={`audit-severity-rule-delete-${record.id}`}
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Modal
      title={
        <span
          className="font-bold text-base text-black opacity-70"
          data-cy="audit-severity-rules-title"
        >
          Severity Rules
        </span>
      }
      open={open}
      onCancel={onCancel}
      width={760}
      centered
      destroyOnClose
      footer={
        <div
          className="flex justify-end gap-2"
          data-cy="audit-severity-rules-footer"
        >
          <Button onClick={onCancel} data-cy="audit-severity-rules-cancel">
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={() => onSave(draftRules)}
            data-cy="audit-severity-rules-save"
          >
            Save
          </Button>
        </div>
      }
      data-cy="audit-severity-rules-modal"
    >
      <p
        className="text-sm text-black opacity-70 mb-4"
        data-cy="audit-severity-rules-helper"
      >
        Create, update, and delete are classified automatically as Informative,
        Warning, and High. Sensitive fields such as salary or bank details are
        Critical. Field options are the real columns each module writes to its
        audit log — not a static list.
      </p>

      <Form layout="vertical" requiredMark={false}>
        <fieldset
          className="border border-gray-200 rounded-xl p-4 mb-4"
          data-cy="audit-severity-rules-add-fieldset"
        >
          <legend
            className="px-1 text-sm font-semibold text-[#4d4d4d]"
            data-cy="audit-severity-rules-add-legend"
          >
            Add Rule
          </legend>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            data-cy="audit-severity-rules-add-grid"
          >
            <Form.Item label="Module" className="mb-0">
              <Select
                allowClear
                showSearch
                placeholder="Select module"
                className={AUDIT_SELECT_CLASS}
                optionFilterProp="label"
                value={newModule}
                options={AUDIT_LOG_MODULE_OPTIONS}
                onChange={(value) => {
                  setNewModule(value);
                  setNewFields([]);
                }}
                data-cy="audit-severity-rule-new-module"
              />
            </Form.Item>
            <Form.Item label="Action" className="mb-0">
              <Select
                allowClear
                placeholder="Select action"
                className={AUDIT_SELECT_CLASS}
                value={newAction}
                options={AUDIT_ACTION_OPTIONS}
                onChange={(value) => setNewAction(value)}
                data-cy="audit-severity-rule-new-action"
              />
            </Form.Item>
            <Form.Item label="Fields" className="mb-0">
              <Select
                mode="multiple"
                allowClear
                showSearch
                maxTagCount="responsive"
                placeholder={
                  !newModule
                    ? 'Select a module first'
                    : loadingFields
                      ? 'Loading fields…'
                      : moduleFieldOptions.length
                        ? 'Select fields'
                        : 'No audit fields found for this module'
                }
                className={AUDIT_SELECT_CLASS}
                optionFilterProp="label"
                value={newFields}
                options={moduleFieldOptions}
                loading={loadingFields}
                disabled={!newModule || loadingFields}
                onChange={(value) => setNewFields(value || [])}
                data-cy="audit-severity-rule-new-fields"
              />
            </Form.Item>
            <Form.Item label="Severity" className="mb-0">
              <Select
                allowClear
                placeholder="Select severity"
                className={AUDIT_SELECT_CLASS}
                value={newSeverity}
                options={AUDIT_SEVERITIES.map((severity) => ({
                  value: severity,
                  label: AUDIT_SEVERITY_LABELS[severity],
                }))}
                onChange={(value) => setNewSeverity(value)}
                data-cy="audit-severity-rule-new-severity"
              />
            </Form.Item>
          </div>
          <div
            className="flex justify-end mt-4"
            data-cy="audit-severity-rules-add-actions"
          >
            <Button
              type="primary"
              onClick={handleAddRule}
              data-cy="audit-severity-rule-add"
            >
              Add Rule
            </Button>
          </div>
        </fieldset>

        <fieldset
          className="border border-gray-200 rounded-xl p-4 mb-0"
          data-cy="audit-severity-rules-configured-fieldset"
        >
          <legend
            className="px-1 text-sm font-semibold text-[#4d4d4d]"
            data-cy="audit-severity-rules-configured-legend"
          >
            Configured Rules
          </legend>
          <Table
            columns={columns}
            dataSource={draftRules}
            pagination={false}
            rowKey="id"
            size="small"
            scroll={{ y: 280 }}
            locale={{ emptyText: 'No severity rules configured' }}
            data-cy="audit-severity-rules-table"
          />
        </fieldset>
      </Form>
    </Modal>
  );
};

export default AuditSeverityRulesModal;
