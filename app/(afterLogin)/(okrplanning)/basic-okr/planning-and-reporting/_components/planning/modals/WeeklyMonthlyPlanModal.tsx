'use client';
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, InputNumber, Tooltip } from 'antd';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { BsChevronDown } from 'react-icons/bs';

const { Option } = Select;

interface WeeklyMonthlyPlanModalProps {
  open: boolean;
  onCancel: () => void;
  onAdd: (values: any) => void;
  objectives: any[];
  isLoading?: boolean;
  isEdit?: boolean;
  initialValues?: any;
  type: 'weekly' | 'monthly';
}

export default function WeeklyMonthlyPlanModal({
  open,
  onCancel,
  onAdd,
  objectives,
  isLoading,
  isEdit,
  initialValues,
}: WeeklyMonthlyPlanModalProps) {
  const [form] = Form.useForm();
  const [weightTotal, setWeightTotal] = useState(0);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (open) {
      if (isEdit && initialValues) {
        form.setFieldsValue(initialValues);
        const tasks = initialValues.tasks || [];
        const total = tasks.reduce(
          (sum: number, task: any) => sum + (Number(task?.weight) || 0),
          0,
        );
        setWeightTotal(total);
        setLastSavedAt(new Date());
      } else {
        form.resetFields();
        setWeightTotal(0);
        setLastSavedAt(null);
      }
    }
  }, [open, isEdit, initialValues, form]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- only allValues is used
  const handleValuesChange = (changedValues: any, allValues: any) => {
    const tasks = allValues.tasks || [];
    const total = tasks.reduce(
      (sum: number, task: any) => sum + (Number(task?.weight) || 0),
      0,
    );
    setWeightTotal(total);
    setLastSavedAt(new Date());
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        onAdd(values);
        form.resetFields();
        setWeightTotal(0);
        setLastSavedAt(null);
      })
      .catch(() => {
        // Validation failed - form will show field errors
      });
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={860}
      className="weekly-plan-modal"
      closeIcon={null}
    >
      <div className="p-0" data-cy="weekly-monthly-plan-modal-content">
        <div
          className="px-4 pb-3 pt-4 sm:px-6"
          data-cy="weekly-monthly-plan-modal-header"
        >
          <h2
            className="text-base font-bold text-[#111827]"
            data-cy="weekly-monthly-plan-modal-title"
          >
            {isEdit ? 'Edit' : 'Create'} {type === 'weekly' ? 'Weekly' : 'Monthly'} Plan
          </h2>
        </div>

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onValuesChange={handleValuesChange}
          initialValues={{ tasks: [{}] }}
        >
          <Form.List name="tasks">
            {(fields, { add, remove }) => (
              <div
                className="px-4 pb-4 sm:px-6"
                data-cy="tasks-list-container"
              >
                {fields.map(({ key, name, ...restField }) => (
                  <div
                    key={key}
                    className="mb-4 rounded-lg border bg-white p-3"
                    style={{ borderColor: '#D9D9D9' }}
                    data-cy={`task-item-${name}`}
                  >
                    <div
                      className="flex items-center justify-between gap-3 pb-2"
                      data-cy={`task-item-header-${name}`}
                      style={{ borderBottom: '1px solid #D9D9D9' }}
                    >
                      <div
                        className="min-w-0 flex-1 truncate text-sm font-medium text-[#111827]"
                        data-cy={`task-item-header-title-${name}`}
                        title={form.getFieldValue(['tasks', name, 'title']) || ''}
                      >
                        {form.getFieldValue(['tasks', name, 'title']) ||
                          'New Plan'}
                      </div>
                      <div
                        className="flex items-center gap-2"
                        data-cy={`task-item-header-actions-${name}`}
                      >
                        {!isEdit ? (
                          <Button
                            type="default"
                            size="small"
                            onClick={() => add()}
                            className="!h-7 !w-10 !rounded-lg !border-[#D9D9D9] !px-0"
                            icon={<FaPlus className="text-[12px]" />}
                            data-cy={`task-item-add-button-${name}`}
                          />
                        ) : null}
                        <Button
                          type="default"
                          size="small"
                          className="!h-7 !w-10 !rounded-lg !border-[#D9D9D9] !px-0"
                          icon={<BsChevronDown className="text-[14px] text-[#374151]" />}
                          data-cy={`task-item-dropdown-button-${name}`}
                        />
                        {fields.length > 1 ? (
                          <Button
                            danger
                            type="default"
                            size="small"
                            onClick={() => remove(name)}
                            className="!h-8 !w-10 !rounded-lg !px-0"
                            data-cy={`remove-task-button-${name}`}
                            icon={<FaTrash className="text-[12px]" data-cy={`remove-task-icon-${name}`} />}
                          />
                        ) : null}
                      </div>
                    </div>

                    <div
                      className="grid grid-cols-2 gap-3 pt-3"
                      data-cy={`task-objective-keyresult-grid-${name}`}
                    >
                      <Form.Item
                        {...restField}
                        label={
                          <span
                            className="text-sm font-normal text-[#030712]"
                            data-cy={`objective-label-${name}`}
                          >
                            Associated Objective{' '}
                            <span
                              className="text-red-500"
                              data-cy={`objective-required-${name}`}
                            >
                              *
                            </span>
                          </span>
                        }
                        name={[name, 'objectiveId']}
                        rules={[{ required: true, message: 'Required' }]}
                      >
                        <Select
                          placeholder="Set Objective"
                          className="w-full"
                          suffixIcon={
                            <BsChevronDown
                              className="text-gray-400"
                              data-cy={`objective-chevron-${name}`}
                            />
                          }
                          data-cy={`objective-select-${name}`}
                        >
                          {objectives.map((obj) => (
                            <Option
                              key={obj.id}
                              value={obj.id}
                              data-cy={`objective-option-${obj.id}`}
                            >
                              {obj.title}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        noStyle
                        shouldUpdate={(prev, curr) =>
                          prev.tasks?.[name]?.objectiveId !==
                          curr.tasks?.[name]?.objectiveId
                        }
                      >
                        {({ getFieldValue }) => {
                          const objectiveId = getFieldValue([
                            'tasks',
                            name,
                            'objectiveId',
                          ]);
                          const selectedObj = objectives.find(
                            (o) => o.id === objectiveId,
                          );
                          const keyResults = selectedObj?.keyResults || [];

                          return (
                            <Form.Item
                              {...restField}
                              label={
                                <span
                                  className="text-sm font-normal text-[#030712]"
                                  data-cy={`keyresult-label-${name}`}
                                >
                                  Associated Key Result{' '}
                                  <span
                                    className="text-red-500"
                                    data-cy={`keyresult-required-${name}`}
                                  >
                                    *
                                  </span>
                                </span>
                              }
                              name={[name, 'keyResultId']}
                              rules={[{ required: true, message: 'Required' }]}
                            >
                              <Select
                                placeholder="Set key result"
                                className="w-full"
                                disabled={!objectiveId}
                                suffixIcon={
                                  <BsChevronDown
                                    className="text-gray-400"
                                    data-cy={`keyresult-chevron-${name}`}
                                  />
                                }
                                data-cy={`keyresult-select-${name}`}
                              >
                                {keyResults.map((kr: any) => (
                                  <Option
                                    key={kr.id}
                                    value={kr.id}
                                    data-cy={`keyresult-option-${kr.id}`}
                                  >
                                    {kr.title}
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>
                          );
                        }}
                      </Form.Item>
                    </div>

                    <div
                      className="grid grid-cols-12 gap-3 pt-2"
                      data-cy={`task-details-grid-${name}`}
                    >
                      <div
                        className="col-span-12 md:col-span-8"
                        data-cy={`plan-title-container-${name}`}
                      >
                        <Form.Item
                          {...restField}
                          label={
                            <span
                              className="text-sm font-normal text-[#030712]"
                              data-cy={`plan-title-label-${name}`}
                            >
                              Plan Title{' '}
                              <span
                                className="text-red-500"
                                data-cy={`plan-title-required-${name}`}
                              >
                                *
                              </span>
                            </span>
                          }
                          name={[name, 'title']}
                          rules={[{ required: true, message: 'Required' }]}
                        >
                          <Input
                            placeholder="set title"
                            className="h-8 rounded-md"
                            data-cy={`plan-title-input-${name}`}
                          />
                        </Form.Item>
                      </div>
                      <div
                        className="col-span-6 md:col-span-2"
                        data-cy={`priority-container-${name}`}
                      >
                        <Form.Item
                          {...restField}
                          label={
                            <span
                              className="text-sm font-normal text-[#030712]"
                              data-cy={`priority-label-${name}`}
                            >
                              Priority{' '}
                              <span
                                className="text-red-500"
                                data-cy={`priority-required-${name}`}
                              >
                                *
                              </span>
                            </span>
                          }
                          name={[name, 'priority']}
                          rules={[{ required: true, message: 'Required' }]}
                        >
                          <Select
                            placeholder="priority"
                            className="w-full"
                            suffixIcon={
                              <BsChevronDown
                                className="text-gray-400"
                                data-cy={`priority-chevron-${name}`}
                              />
                            }
                            data-cy={`priority-select-${name}`}
                          >
                            <Option value="high" data-cy="priority-option-high">
                              High
                            </Option>
                            <Option
                              value="medium"
                              data-cy="priority-option-medium"
                            >
                              Medium
                            </Option>
                            <Option value="low" data-cy="priority-option-low">
                              Low
                            </Option>
                          </Select>
                        </Form.Item>
                      </div>
                      <div
                        className="col-span-6 md:col-span-2"
                        data-cy={`weight-container-${name}`}
                      >
                        <Form.Item
                          {...restField}
                          label={
                            <span
                              className="text-sm font-normal text-[#030712]"
                              data-cy={`weight-label-${name}`}
                            >
                              Weight{' '}
                              <span
                                className="text-red-500"
                                data-cy={`weight-required-${name}`}
                              >
                                *
                              </span>
                            </span>
                          }
                          name={[name, 'weight']}
                          rules={[{ required: true, message: 'Required' }]}
                        >
                          <InputNumber
                            placeholder="weight"
                            className="w-full"
                            min={0}
                            max={100}
                            data-cy={`weight-input-${name}`}
                          />
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Footer bar (matches SVG layout) */}
                <div
                  className="mt-2 flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between"
                  style={{ borderColor: '#D9D9D9' }}
                  data-cy="weekly-plan-footer-bar"
                >
                  <div
                    className="flex items-center gap-3"
                    data-cy="weekly-plan-footer-left"
                  >
                    <div
                      className="rounded-md border px-3 py-2 text-sm font-medium text-[#1D4ED8]"
                      style={{ borderColor: '#91CAFF', background: '#E6F4FF' }}
                      data-cy="weekly-plan-total-weight"
                    >
                      Total Weight:{' '}
                      <span className="font-bold" data-cy="weekly-plan-total-weight-value">
                        {weightTotal}
                      </span>
                    </div>
                  </div>

                  <div
                    className="text-sm text-[#111827] sm:text-center"
                    data-cy="weekly-plan-last-saved"
                  >
                    <span className="text-[#6B7280]">Last Saved</span>{' '}
                    {lastSavedAt
                      ? lastSavedAt.toLocaleTimeString([], {
                          hour: 'numeric',
                          minute: '2-digit',
                        })
                      : '--'}
                  </div>

                  <div
                    className="flex items-center justify-end gap-3"
                    data-cy="weekly-plan-footer-actions"
                  >
                    <Button
                      onClick={onCancel}
                      className="!h-10 !rounded-lg !border-[#D9D9D9] !px-8 font-medium text-[#111827]"
                      data-cy="cancel-button"
                    >
                      Cancel
                    </Button>

                    <Tooltip
                      title={
                        weightTotal !== 100
                          ? "Summation of all task's weights must be equal to 100!"
                          : isEdit
                            ? 'Update Plan'
                            : 'Create Plan'
                      }
                      data-cy="submit-button-tooltip"
                    >
                      <Button
                        type="primary"
                        loading={isLoading}
                        onClick={handleSubmit}
                        disabled={weightTotal !== 100}
                        className="!h-10 !rounded-lg !border-0 !px-10 font-semibold !text-white"
                        style={{
                          backgroundColor: '#1E3A8A',
                          color: 'white',
                        }}
                        data-cy="submit-button"
                      >
                        {isEdit ? 'Update' : 'Create'}
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            )}
          </Form.List>
        </Form>
      </div>

      <style jsx global data-cy="weekly-monthly-plan-modal-styles">{`
        .weekly-plan-modal .ant-modal-content {
          border-radius: 8px;
          padding: 0;
          overflow: hidden;
        }
        .weekly-plan-modal .ant-form-item {
          margin-bottom: 12px;
        }
        .weekly-plan-modal .ant-form-item-label {
          padding-bottom: 6px;
        }
        .weekly-plan-modal .ant-form-item-label label {
          height: auto !important;
        }
        .weekly-plan-modal .ant-select-selector,
        .weekly-plan-modal .ant-input,
        .weekly-plan-modal .ant-input-number {
          border-color: #d9d9d9 !important;
          border-radius: 6px !important;
          min-height: 32px !important;
          height: 32px !important;
        }
        .weekly-plan-modal .ant-select-selector {
          display: flex !important;
          align-items: center !important;
          padding: 0 11px !important;
        }
        .weekly-plan-modal .ant-input {
          padding: 4px 11px !important;
        }
        .weekly-plan-modal .ant-input-number {
          display: flex !important;
          align-items: center !important;
          padding: 0 11px !important;
        }
        .weekly-plan-modal .ant-input-number-input {
          height: 30px !important;
        }
      `}</style>
    </Modal>
  );
}
