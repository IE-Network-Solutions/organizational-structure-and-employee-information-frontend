'use client';
import { Button, Input, Tooltip } from 'antd';
import { EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { useGetAllPensionRule } from '@/store/server/features/payroll/payroll/queries';
import { useUpdatePensionRule } from '@/store/server/features/payroll/payroll/mutation';
import { FaPlus } from 'react-icons/fa';
import Drawer from './_components/drawer';
import useDrawerStore from '@/store/uistate/features/payroll/settings/pensionRules/pensionRulesStore';

type PensionRule = {
  id: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  deletedAt: string | null; // Can be null if not deleted
  name: string; // Rule name
  description: string; // Rule description
  employer: string; // Employer identifier
  employee: string; // Employee identifier
  tenantId: string; // Tenant identifier
};

interface ColumnType {
  title: string;
  dataIndex: string;
  key: string;
  sorter?: (a: PensionRule, b: PensionRule) => number;
  render?: (notused: any, record: PensionRule) => React.ReactNode;
}

const Pension = () => {
  const { data: pensionRule, isLoading } = useGetAllPensionRule();
  const { mutate: pensionRuleUpdate, isLoading: updatePensionRule } =
    useUpdatePensionRule();
  const { openDrawer } = useDrawerStore();

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Record<string, any>>({});

  // Format the data for the table

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
    pensionRuleUpdate(editedData, {
      onSuccess: () => {
        setEditingKey(null); // Exit editing mode
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
    <div
      id="payroll-pension-page-view-container"
      data-cy="payroll-pension-page-view-container"
      className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden"
    >
      <div
        id="payroll-pension-header-view-container"
        data-cy="payroll-pension-header-view-container"
        className="flex justify-between items-center px-6 py-5"
      >
        <h1
          id="payroll-pension-title-view-text"
          data-cy="payroll-pension-title-view-text"
          className="text-lg font-semibold text-gray-900"
        >
          Pension
        </h1>
        <div
          id="payroll-pension-header-action-spacer"
          data-cy="payroll-pension-header-action-spacer"
          className="hidden sm:block"
        />
      </div>
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
          disabled={pensionRule && pensionRule.length > 0}
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
      <div
        id="payroll-pension-list-view-container"
        data-cy="payroll-pension-list-view-container"
        className="px-6 pb-5"
      >
        <div
          id="payroll-pension-list-inner-view-container"
          data-cy="payroll-pension-list-inner-view-container"
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2"
        >
          {(pensionRule ?? []).map((rule: any, idx: number) => {
            const record = { ...rule, key: rule?.key ?? rule?.id ?? String(idx) };
            const editable = isEditing(record);
            return (
              <div
                key={record.id ?? record.key}
                id={`payroll-pension-card-${record.id ?? record.key}`}
                data-cy={`payroll-pension-card-${record.id ?? record.key}`}
                className="group relative bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div
                  id={`payroll-pension-card-header-${record.id ?? record.key}`}
                  data-cy={`payroll-pension-card-header-${record.id ?? record.key}`}
                  className="flex justify-between items-start mb-4"
                >
                  {editable ? (
                    <div className="flex items-start justify-between w-full gap-4">
                      <div className="flex-1">
                        <label
                          id={`payroll-pension-name-label-${record.id}`}
                          data-cy={`payroll-pension-name-label-${record.id}`}
                          className="block text-xs font-medium text-gray-500 mb-1"
                        >
                          Name<span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <Input
                          id={`payroll-pension-name-input-${record.id}`}
                          data-cy={`payroll-pension-name-input-${record.id}`}
                          value={editedData.name}
                          onChange={(e) =>
                            handleInputChange('name', e.target.value)
                          }
                          className="w-full h-10"
                        />
                      </div>
                      <div className="flex items-start gap-2 pt-5">
                        <Button
                          id={`payroll-pension-cancel-edit-click-button-${record.id}`}
                          data-cy={`payroll-pension-cancel-edit-click-button-${record.id}`}
                          type="default"
                          danger
                          className="flex items-center justify-center !p-0 w-8 h-8 rounded-md border border-red-200 hover:border-red-400 hover:bg-red-50"
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
                          className="flex items-center justify-center !p-0 w-8 h-8 rounded-md"
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
                      <h2
                        id={`payroll-pension-card-title-${record.id ?? record.key}`}
                        data-cy={`payroll-pension-card-title-${record.id ?? record.key}`}
                        className="text-[15px] font-semibold text-gray-900"
                      >
                        {record.name}
                      </h2>
                      <Tooltip
                        title="Edit"
                        id={`payroll-pension-card-edit-tooltip-${record.id}`}
                        data-cy={`payroll-pension-card-edit-tooltip-${record.id}`}
                      >
                        <button
                          id={`payroll-pension-edit-click-button-${record.id}`}
                          data-cy={`payroll-pension-edit-click-button-${record.id}`}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 rounded-lg transition-all"
                          type="button"
                          aria-label="Edit Rule"
                          onClick={() => handleEdit(record)}
                        >
                          <EditOutlined
                            data-cy={`payroll-pension-edit-click-button-icon-${record.id}`}
                          />
                        </button>
                      </Tooltip>
                    </>
                  )}
                </div>

                <div
                  id={`payroll-pension-card-badges-${record.id ?? record.key}`}
                  data-cy={`payroll-pension-card-badges-${record.id ?? record.key}`}
                  className="flex flex-wrap gap-3"
                >
                  <div
                    id={`payroll-pension-employer-badge-${record.id ?? record.key}`}
                    data-cy={`payroll-pension-employer-badge-${record.id ?? record.key}`}
                    className="inline-flex items-center px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-md text-[13px] text-gray-600 whitespace-nowrap"
                  >
                    <span
                      id={`payroll-pension-employer-label-${record.id ?? record.key}`}
                      data-cy={`payroll-pension-employer-label-${record.id ?? record.key}`}
                      className="opacity-70 mr-1"
                    >
                      Employer Contribution :
                    </span>
                    {editable ? (
                      <Input
                        id={`payroll-pension-employer-input-${record.id}`}
                        data-cy={`payroll-pension-employer-input-${record.id}`}
                        type="number"
                        max={100}
                        min={0}
                        value={editedData.employer}
                        onChange={(e) =>
                          handleInputChange('employer', e.target.value)
                        }
                        className="w-24"
                      />
                    ) : (
                      <span
                        id={`payroll-pension-employer-value-${record.id ?? record.key}`}
                        data-cy={`payroll-pension-employer-value-${record.id ?? record.key}`}
                        className="font-medium"
                      >
                        {record.employer}%
                      </span>
                    )}
                  </div>

                  <div
                    id={`payroll-pension-employee-badge-${record.id ?? record.key}`}
                    data-cy={`payroll-pension-employee-badge-${record.id ?? record.key}`}
                    className="inline-flex items-center px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-md text-[13px] text-gray-600 whitespace-nowrap"
                  >
                    <span
                      id={`payroll-pension-employee-label-${record.id ?? record.key}`}
                      data-cy={`payroll-pension-employee-label-${record.id ?? record.key}`}
                      className="opacity-70 mr-1"
                    >
                      Employee Contribution :
                    </span>
                    {editable ? (
                      <Input
                        id={`payroll-pension-employee-input-${record.id}`}
                        data-cy={`payroll-pension-employee-input-${record.id}`}
                        type="number"
                        max={100}
                        min={0}
                        value={editedData.employee}
                        onChange={(e) =>
                          handleInputChange('employee', e.target.value)
                        }
                        className="w-24"
                      />
                    ) : (
                      <span
                        id={`payroll-pension-employee-value-${record.id ?? record.key}`}
                        data-cy={`payroll-pension-employee-value-${record.id ?? record.key}`}
                        className="font-medium"
                      >
                        {record.employee}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {!isLoading && (pensionRule ?? []).length === 0 && (
            <div
              id="payroll-pension-empty-state"
              data-cy="payroll-pension-empty-state"
              className="text-center text-gray-500 py-10"
            >
              No pension rules found.
            </div>
          )}
        </div>
      </div>
      <Drawer />
    </div>
  );
};

export default Pension;
