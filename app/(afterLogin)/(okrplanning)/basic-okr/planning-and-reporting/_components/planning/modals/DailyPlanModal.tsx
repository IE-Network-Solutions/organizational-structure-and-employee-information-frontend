'use client';
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, InputNumber, Tooltip } from 'antd';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { BsChevronDown } from 'react-icons/bs';

const { Option } = Select;

interface DailyPlanModalProps {
  open: boolean;
  onCancel: () => void;
  onAdd: (values: any) => void;
  weeklyPlans: any[];
  isLoading?: boolean;
  isEdit?: boolean;
  initialValues?: any;
}

export default function DailyPlanModal({
  open,
  onCancel,
  onAdd,
  weeklyPlans,
  isLoading,
  isEdit,
  initialValues,
}: DailyPlanModalProps) {
  const [form] = Form.useForm();
  const [weightTotal, setWeightTotal] = useState(0);

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
      } else {
        form.resetFields();
        setWeightTotal(0);
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
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        onAdd(values);
        form.resetFields();
        setWeightTotal(0);
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
      width={800}
      className="basic-okr-modal"
      closeIcon={null}
    >
      <div className="p-2" data-cy="daily-plan-modal-content">
        <h2 className="text-2xl font-bold text-center text-[#161A2C] mb-8" data-cy="daily-plan-modal-title">
          {isEdit ? 'Edit Plan' : 'Create Plan'}
        </h2>

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onValuesChange={handleValuesChange}
          initialValues={{ tasks: [{}] }}
          data-cy="daily-plan-form"
        >
          <Form.List name="tasks">
            {(fields, { add, remove }) => (
              <div className="space-y-4" data-cy="tasks-list-container">
                {fields.map(({ key, name, ...restField }) => (
                  <div
                    key={key}
                    className="relative p-6 border border-gray-100 rounded-2xl bg-white transition-all hover:border-blue-100"
                    data-cy={`task-item-${name}`}
                  >
                    {fields.length > 1 && (
                      <button
                        onClick={() => remove(name)}
                        className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                        data-cy={`remove-task-button-${name}`}
                      >
                        <FaTrash size={14} data-cy={`remove-task-icon-${name}`} />
                      </button>
                    )}

                    <Form.Item
                      {...restField}
                      label={
                        <span className="text-sm font-bold text-[#161A2C]" data-cy={`weekly-task-label-${name}`}>
                          Associated Weekly Task{' '}
                          <span className="text-red-500" data-cy={`weekly-task-required-${name}`}>*</span>
                        </span>
                      }
                      name={[name, 'parentTaskId']}
                      rules={[{ required: true, message: 'Required' }]}
                      className="mb-4"
                    >
                      <Select
                        placeholder="Select Task"
                        className="h-12"
                        suffixIcon={<BsChevronDown className="text-gray-400" data-cy={`weekly-task-chevron-${name}`} />}
                        data-cy={`weekly-task-select-${name}`}
                      >
                        {weeklyPlans.map((plan) => (
                          <Select.OptGroup
                            key={plan.id}
                            label={plan.title}
                            data-cy={`weekly-plan-group-${plan.id}`}
                          >
                            {plan.tasks.map((task: any) => (
                              <Option
                                key={task.id}
                                value={task.id}
                                data-cy={`weekly-task-option-${task.id}`}
                              >
                                {task.title}
                              </Option>
                            ))}
                          </Select.OptGroup>
                        ))}
                      </Select>
                    </Form.Item>

                    <div
                      className="grid grid-cols-12 gap-4"
                      data-cy={`task-details-grid-${name}`}
                    >
                      <div
                        className="col-span-12 md:col-span-8"
                        data-cy={`plan-title-container-${name}`}
                      >
                        <Form.Item
                          {...restField}
                          label={
                            <span className="text-sm font-bold text-[#161A2C]" data-cy={`plan-title-label-${name}`}>
                              Plan Title <span className="text-red-500" data-cy={`plan-title-required-${name}`}>*</span>
                            </span>
                          }
                          name={[name, 'title']}
                          rules={[{ required: true, message: 'Required' }]}
                        >
                          <Input
                            placeholder="set title"
                            className="h-12 rounded-xl"
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
                            <span className="text-sm font-bold text-[#161A2C]" data-cy={`priority-label-${name}`}>
                              Priority <span className="text-red-500" data-cy={`priority-required-${name}`}>*</span>
                            </span>
                          }
                          name={[name, 'priority']}
                          rules={[{ required: true, message: 'Required' }]}
                        >
                          <Select
                            placeholder="priority"
                            className="h-12"
                            suffixIcon={
                              <BsChevronDown className="text-gray-400" />
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
                            <span className="text-sm font-bold text-[#161A2C]" data-cy={`weight-label-${name}`}>
                              Weight <span className="text-red-500" data-cy={`weight-required-${name}`}>*</span>
                            </span>
                          }
                          name={[name, 'weight']}
                          rules={[{ required: true, message: 'Required' }]}
                        >
                          <InputNumber
                            placeholder="weight"
                            className="w-full h-12 rounded-xl flex items-center"
                            min={0}
                            max={100}
                            data-cy={`weight-input-${name}`}
                          />
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                ))}

                {!isEdit && (
                  <div
                    className="flex flex-col items-end pt-2"
                    data-cy="add-plan-section"
                  >
                    <div
                      className="text-sm font-medium mb-4"
                      data-cy="weight-point-display"
                    >
                      <span
                        className="text-gray-500"
                        data-cy="weight-point-label"
                      >
                        Weight Point:{' '}
                      </span>
                      <span
                        className={
                          weightTotal > 100 ? 'text-red-500' : 'text-gray-900'
                        }
                        data-cy="weight-point-value"
                      >
                        {weightTotal}%
                      </span>
                    </div>

                    <div
                      className="w-full flex justify-center"
                      data-cy="add-plan-button-container"
                    >
                      <Button
                        type="primary"
                        icon={<FaPlus className="text-xs" data-cy="add-plan-icon" />}
                        onClick={() => add()}
                        className="bg-[#4F46E5] hover:bg-[#4338CA] h-12 px-8 rounded-xl font-bold flex items-center gap-2"
                        data-cy="add-plan-button"
                      >
                        Add Plan
                      </Button>
                    </div>
                  </div>
                )}
                {isEdit && (
                  <div
                    className="flex flex-col items-end pt-2"
                    data-cy="edit-plan-section"
                  >
                    <div
                      className="text-sm font-medium mb-4"
                      data-cy="weight-point-display-edit"
                    >
                      <span
                        className="text-gray-500"
                        data-cy="weight-point-label-edit"
                      >
                        Weight Point:{' '}
                      </span>
                      <span
                        className={
                          weightTotal > 100 ? 'text-red-500' : 'text-gray-900'
                        }
                        data-cy="weight-point-value-edit"
                      >
                        {weightTotal}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Form.List>

          <div
            className="flex items-center justify-center gap-4 pt-10"
            data-cy="form-actions-container"
          >
            <Button
              onClick={onCancel}
              className="h-12 px-12 rounded-xl border-2 border-gray-300 font-bold text-[#161A2C]"
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
                    : 'Add Plan'
              }
              data-cy="submit-button-tooltip"
            >
              <Button
                type="primary"
                loading={isLoading}
                onClick={handleSubmit}
                disabled={weightTotal !== 100}
                className="bg-[#4F46E5] hover:bg-[#4338CA] h-12 px-16 rounded-xl font-bold text-white"
                style={{ color: 'white' }}
                data-cy="submit-button"
              >
                {isEdit ? 'Update' : 'Add'}
              </Button>
            </Tooltip>
          </div>
        </Form>
      </div>

      <style jsx global data-cy="daily-plan-modal-styles">{`
        .basic-okr-modal .ant-modal-content {
          border-radius: 24px;
          padding: 32px;
        }
        .basic-okr-modal .ant-select-selector {
          border-radius: 12px !important;
          border-color: #e5e7eb !important;
          height: 48px !important;
          display: flex !important;
          align-items: center !important;
        }
        .basic-okr-modal .ant-input {
          border-radius: 12px !important;
          border-color: #e5e7eb !important;
        }
        .basic-okr-modal .ant-input-number {
          border-radius: 12px !important;
          border-color: #e5e7eb !important;
        }
      `}</style>
    </Modal>
  );
}
