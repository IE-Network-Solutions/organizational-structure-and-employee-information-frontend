'use client';
import { Button, Card, Input, Spin, Tooltip } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import React, { useEffect, useState } from 'react';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { useGetAllPensionRule } from '@/store/server/features/payroll/payroll/queries';
import { useUpdatePensionRule } from '@/store/server/features/payroll/payroll/mutation';
import { FaPlus } from 'react-icons/fa';
import Drawer from './_components/drawer';
import useDrawerStore from '@/store/uistate/features/payroll/settings/pensionRules/pensionRulesStore';

// type PensionRule = {
//   id: string;
//   createdAt: string; // ISO date string
//   updatedAt: string; // ISO date string
//   deletedAt: string | null; // Can be null if not deleted
//   name: string; // Rule name
//   description: string; // Rule description
//   employer: string; // Employer identifier
//   employee: string; // Employee identifier
//   tenantId: string; // Tenant identifier
// };

// interface ColumnType {
//   title: string;
//   dataIndex: string;
//   key: string;
//   sorter?: (a: PensionRule, b: PensionRule) => number;
//   render?: (notused: any, record: PensionRule) => React.ReactNode;
// }

const pillStyle: React.CSSProperties = {
  display: 'inline-flex',
  flexDirection: 'row',
  alignItems: 'center',
  height: 22,
  padding: '1px 8px',
  borderRadius: 4,
  border: '1px solid #D9D9D9',
  background: '#fff',
  fontSize: 12,
  lineHeight: '18px',
  fontWeight: 400,
  color: '#595959',
  userSelect: 'none',
  whiteSpace: 'nowrap',
};

const editButtonStyle: React.CSSProperties = {
  height: 24,
  width: 24,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 4,
  border: '1px solid #D9D9D9',
  background: '#fff',
};

const pensionCardShellStyle: React.CSSProperties = {
  width: '100%',
  minWidth: 0,
  borderRadius: 8,
  border: '1px solid #D9D9D9',
  boxShadow: 'none',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const pensionCardBodyStyle: React.CSSProperties = {
  padding: '10px 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  flex: 1,
  minHeight: 0,
  boxSizing: 'border-box',
  overflow: 'hidden',
};

const pensionCardBodyEditStyle: React.CSSProperties = {
  padding: '12px 16px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  flex: 1,
  minHeight: 0,
  boxSizing: 'border-box',
  overflow: 'auto',
};

const Pension = () => {
  const { data: pensionRule, isLoading } = useGetAllPensionRule();
  const { mutate: pensionRuleUpdate, isLoading: updatePensionRule } =
    useUpdatePensionRule();
  const { openDrawer, setPensionAddDisabled } = useDrawerStore();

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Record<string, any>>({});

  const isPensionAddDisabled = !isLoading && (pensionRule?.length ?? 0) > 0;

  useEffect(() => {
    setPensionAddDisabled(isPensionAddDisabled);
  }, [isPensionAddDisabled, setPensionAddDisabled]);

  const isEditing = (record: any) => record.key === editingKey;

  const handleEdit = (record: any) => {
    setEditingKey(record.key);
    setEditedData({ ...record });
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setEditedData({});
  };

  const handleSave = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { key, ...payload } = editedData;

    pensionRuleUpdate(payload, {
      onSuccess: () => {
        setEditingKey(null);
      },
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddRule = () => {
    openDrawer();
  };

  return (
    <BlockWrapper className="h-auto w-full bg-white px-3 pb-6 pt-3">
      <div
        id="payroll-pension-page-view-container"
        data-cy="payroll-pension-page-view-container"
        className="overflow-hidden"
      >
        {!isPensionAddDisabled && (
          <div
            id="payroll-pension-hidden-primary-action-target"
            data-cy="payroll-pension-hidden-primary-action-target"
            className="hidden"
          >
            <Button
              id="payroll-pension-add-click-button"
              data-cy="payroll-pension-add-click-button"
              type="primary"
              onClick={handleAddRule}
              icon={<FaPlus data-cy="payroll-pension-add-click-button-icon" />}
            >
              <span
                id="payroll-pension-add-click-button-text"
                data-cy="payroll-pension-add-click-button-text"
              >
                Pension Rule
              </span>
            </Button>
          </div>
        )}
        <Spin data-cy="payroll-pension-list-spinner" spinning={isLoading}>
          <div
            id="payroll-pension-list-view-container"
            data-cy="payroll-pension-list-view-container"
          >
            <div
              id="payroll-pension-list-inner-view-container"
              data-cy="payroll-pension-list-inner-view-container"
              className="mt-0 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2"
            >
              {(pensionRule ?? []).map((rule: any, idx: number) => {
                const record = {
                  ...rule,
                  key: rule?.key ?? rule?.id ?? String(idx),
                };
                const editable = isEditing(record);
                return (
                  <Card
                    key={record.id ?? record.key}
                    id={`payroll-pension-card-${record.id ?? record.key}`}
                    data-cy={`payroll-pension-card-${record.id ?? record.key}`}
                    className="relative"
                    style={pensionCardShellStyle}
                    bodyStyle={
                      editable ? pensionCardBodyEditStyle : pensionCardBodyStyle
                    }
                  >
                    <div
                      id={`payroll-pension-card-header-${record.id ?? record.key}`}
                      data-cy={`payroll-pension-card-header-${record.id ?? record.key}`}
                      className={
                        editable
                          ? 'flex w-full items-start justify-between'
                          : 'flex shrink-0 items-start justify-between'
                      }
                      style={editable ? { gap: 16 } : { gap: 8 }}
                    >
                      {editable ? (
                        <div
                          className="flex w-full items-start justify-between gap-4"
                          data-cy={`payroll-pension-card-header-edit-container-${record.id ?? record.key}`}
                        >
                          <div
                            className="min-w-0 flex-1 pr-20"
                            data-cy={`payroll-pension-name-input-container-${record.id}`}
                          >
                            <label
                              id={`payroll-pension-name-label-${record.id}`}
                              data-cy={`payroll-pension-name-label-${record.id}`}
                              className="mb-1 block text-xs font-medium text-gray-500"
                            >
                              Name
                              <span
                                className="ml-0.5 text-red-500"
                                data-cy={`payroll-pension-name-label-asterisk-${record.id}`}
                              >
                                *
                              </span>
                            </label>
                            <Input
                              id={`payroll-pension-name-input-${record.id}`}
                              data-cy={`payroll-pension-name-input-${record.id}`}
                              value={editedData.name}
                              onChange={(e) =>
                                handleInputChange('name', e.target.value)
                              }
                              className="h-10 w-full"
                            />

                            <div
                              id={`payroll-pension-edit-fields-${record.id ?? record.key}`}
                              data-cy={`payroll-pension-edit-fields-${record.id ?? record.key}`}
                              className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
                            >
                              <div
                                id={`payroll-pension-employer-input-container-${record.id ?? record.key}`}
                                data-cy={`payroll-pension-employer-input-container-${record.id ?? record.key}`}
                                className="min-w-0"
                              >
                                <label
                                  id={`payroll-pension-employer-label-${record.id ?? record.key}`}
                                  data-cy={`payroll-pension-employer-label-${record.id ?? record.key}`}
                                  className="mb-1 block text-xs font-medium text-gray-500"
                                >
                                  Employer Contribution
                                  <span
                                    className="ml-0.5 text-red-500"
                                    data-cy={`payroll-pension-employer-label-asterisk-${record.id ?? record.key}`}
                                  >
                                    *
                                  </span>
                                </label>
                                <Input
                                  id={`payroll-pension-employer-input-${record.id ?? record.key}`}
                                  data-cy={`payroll-pension-employer-input-${record.id ?? record.key}`}
                                  type="number"
                                  max={100}
                                  min={0}
                                  value={editedData.employer}
                                  onChange={(e) =>
                                    handleInputChange('employer', e.target.value)
                                  }
                                  className="h-10 w-full"
                                />
                              </div>

                              <div
                                id={`payroll-pension-employee-input-container-${record.id ?? record.key}`}
                                data-cy={`payroll-pension-employee-input-container-${record.id ?? record.key}`}
                                className="min-w-0"
                              >
                                <label
                                  id={`payroll-pension-employee-label-${record.id ?? record.key}`}
                                  data-cy={`payroll-pension-employee-label-${record.id ?? record.key}`}
                                  className="mb-1 block text-xs font-medium text-gray-500"
                                >
                                  Employee Contribution
                                  <span
                                    className="ml-0.5 text-red-500"
                                    data-cy={`payroll-pension-employee-label-asterisk-${record.id ?? record.key}`}
                                  >
                                    *
                                  </span>
                                </label>
                                <Input
                                  id={`payroll-pension-employee-input-${record.id ?? record.key}`}
                                  data-cy={`payroll-pension-employee-input-${record.id ?? record.key}`}
                                  type="number"
                                  max={100}
                                  min={0}
                                  value={editedData.employee}
                                  onChange={(e) =>
                                    handleInputChange('employee', e.target.value)
                                  }
                                  className="h-10 w-full"
                                />
                              </div>
                            </div>
                          </div>
                          <div
                            className="absolute right-3 top-3 flex gap-2"
                            data-cy={`payroll-pension-card-header-action-container-${record.id ?? record.key}`}
                          >
                            <Button
                              id={`payroll-pension-cancel-edit-click-button-${record.id}`}
                              data-cy={`payroll-pension-cancel-edit-click-button-${record.id}`}
                              type="default"
                              danger
                              className="flex !h-7 !w-7 items-center justify-center !p-0 rounded-md border border-red-200 hover:border-red-400 hover:bg-red-50"
                              onClick={handleCancelEdit}
                              icon={
                                <CloseOutlined
                                  data-cy={`payroll-pension-cancel-edit-click-button-icon-${record.id}`}
                                />
                              }
                            />
                            <Button
                              id={`payroll-pension-save-click-button-${record.id}`}
                              data-cy={`payroll-pension-save-click-button-${record.id}`}
                              type="primary"
                              className="flex !h-7 !w-7 items-center justify-center !p-0 rounded-md"
                              loading={updatePensionRule}
                              onClick={() => handleSave()}
                              icon={
                                <CheckOutlined
                                  data-cy={`payroll-pension-save-click-button-icon-${record.id}`}
                                />
                              }
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3
                            id={`payroll-pension-card-title-${record.id ?? record.key}`}
                            data-cy={`payroll-pension-card-title-${record.id ?? record.key}`}
                            className="m-0 min-w-0 flex-1 truncate text-base font-normal leading-tight"
                            style={{ color: '#000000' }}
                          >
                            {record.name}
                          </h3>
                          <Tooltip
                            title="Edit"
                            id={`payroll-pension-card-edit-tooltip-${record.id}`}
                            data-cy={`payroll-pension-card-edit-tooltip-${record.id}`}
                          >
                            <span
                              className="inline-flex shrink-0"
                              data-cy={`payroll-pension-card-edit-button-span-${record.id}`}
                            >
                              <button
                                id={`payroll-pension-edit-click-button-${record.id}`}
                                data-cy={`payroll-pension-edit-click-button-${record.id}`}
                                type="button"
                                style={editButtonStyle}
                                aria-label="Edit Rule"
                                onClick={() => handleEdit(record)}
                              >
                                <EditOutlinedIcon
                                  style={{ fontSize: 14, color: '#595959' }}
                                  data-cy={`payroll-pension-edit-click-button-icon-${record.id}`}
                                />
                              </button>
                            </span>
                          </Tooltip>
                        </>
                      )}
                    </div>

                    <div
                      id={`payroll-pension-card-badges-${record.id ?? record.key}`}
                      data-cy={`payroll-pension-card-badges-${record.id ?? record.key}`}
                      className="flex min-h-0 shrink flex-wrap items-center"
                      style={{ gap: 6 }}
                    >
                      {editable ? null : (
                        <>
                          <span
                            id={`payroll-pension-employer-badge-${record.id ?? record.key}`}
                            data-cy={`payroll-pension-employer-badge-${record.id ?? record.key}`}
                            style={pillStyle}
                          >
                            <span
                              id={`payroll-pension-employer-label-${record.id ?? record.key}`}
                              data-cy={`payroll-pension-employer-label-${record.id ?? record.key}`}
                              className="mr-1 opacity-70"
                            >
                              Employer Contribution :
                            </span>
                            <span
                              id={`payroll-pension-employer-value-${record.id ?? record.key}`}
                              data-cy={`payroll-pension-employer-value-${record.id ?? record.key}`}
                              className="font-medium"
                            >
                              {record.employer}%
                            </span>
                          </span>

                          <span
                            id={`payroll-pension-employee-badge-${record.id ?? record.key}`}
                            data-cy={`payroll-pension-employee-badge-${record.id ?? record.key}`}
                            style={pillStyle}
                          >
                            <span
                              id={`payroll-pension-employee-label-${record.id ?? record.key}`}
                              data-cy={`payroll-pension-employee-label-${record.id ?? record.key}`}
                              className="mr-1 opacity-70"
                            >
                              Employee Contribution :
                            </span>
                            <span
                              id={`payroll-pension-employee-value-${record.id ?? record.key}`}
                              data-cy={`payroll-pension-employee-value-${record.id ?? record.key}`}
                              className="font-medium"
                            >
                              {record.employee}%
                            </span>
                          </span>
                        </>
                      )}
                    </div>
                  </Card>
                );
              })}

              {!isLoading && (pensionRule ?? []).length === 0 && (
                <div
                  id="payroll-pension-empty-state"
                  data-cy="payroll-pension-empty-state"
                  className="py-10 text-center text-gray-500"
                >
                  No pension rules found.
                </div>
              )}
            </div>
          </div>
        </Spin>
        <Drawer />
      </div>
    </BlockWrapper>
  );
};

export default Pension;
