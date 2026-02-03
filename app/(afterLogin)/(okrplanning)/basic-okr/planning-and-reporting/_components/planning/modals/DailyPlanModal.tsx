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
    initialValues
}: DailyPlanModalProps) {
    const [form] = Form.useForm();
    const [weightTotal, setWeightTotal] = useState(0);

    useEffect(() => {
        if (open) {
            if (isEdit && initialValues) {
                form.setFieldsValue(initialValues);
                const tasks = initialValues.tasks || [];
                const total = tasks.reduce((sum: number, task: any) => sum + (Number(task?.weight) || 0), 0);
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
        const total = tasks.reduce((sum: number, task: any) => sum + (Number(task?.weight) || 0), 0);
        setWeightTotal(total);
    };

    const handleSubmit = () => {
        form.validateFields().then(values => {
            onAdd(values);
            form.resetFields();
            setWeightTotal(0);
        }).catch(() => {
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
            <div className="p-2">
                <h2 className="text-2xl font-bold text-center text-[#161A2C] mb-8">
                    {isEdit ? 'Edit Plan' : 'Create Plan'}
                </h2>

                <Form
                    form={form}
                    layout="vertical"
                    requiredMark={false}
                    onValuesChange={handleValuesChange}
                    initialValues={{ tasks: [{}] }}
                >
                    <Form.List name="tasks">
                        {(fields, { add, remove }) => (
                            <div className="space-y-4">
                                {fields.map(({ key, name, ...restField }) => (
                                    <div key={key} className="relative p-6 border border-gray-100 rounded-2xl bg-white transition-all hover:border-blue-100">
                                        {fields.length > 1 && (
                                            <button
                                                onClick={() => remove(name)}
                                                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                                            >
                                                <FaTrash size={14} />
                                            </button>
                                        )}

                                        <Form.Item
                                            {...restField}
                                            label={<span className="text-sm font-bold text-[#161A2C]">Associated Weekly Task <span className="text-red-500">*</span></span>}
                                            name={[name, 'parentTaskId']}
                                            rules={[{ required: true, message: 'Required' }]}
                                            className="mb-4"
                                        >
                                            <Select
                                                placeholder="Select Task"
                                                className="h-12"
                                                suffixIcon={<BsChevronDown className="text-gray-400" />}
                                            >
                                                {weeklyPlans.map(plan => (
                                                    <Select.OptGroup key={plan.id} label={plan.title}>
                                                        {plan.tasks.map((task: any) => (
                                                            <Option key={task.id} value={task.id}>{task.title}</Option>
                                                        ))}
                                                    </Select.OptGroup>
                                                ))}
                                            </Select>
                                        </Form.Item>

                                        <div className="grid grid-cols-12 gap-4">
                                            <div className="col-span-12 md:col-span-8">
                                                <Form.Item
                                                    {...restField}
                                                    label={<span className="text-sm font-bold text-[#161A2C]">Plan Title <span className="text-red-500">*</span></span>}
                                                    name={[name, 'title']}
                                                    rules={[{ required: true, message: 'Required' }]}
                                                >
                                                    <Input placeholder="set title" className="h-12 rounded-xl" />
                                                </Form.Item>
                                            </div>
                                            <div className="col-span-6 md:col-span-2">
                                                <Form.Item
                                                    {...restField}
                                                    label={<span className="text-sm font-bold text-[#161A2C]">Priority <span className="text-red-500">*</span></span>}
                                                    name={[name, 'priority']}
                                                    rules={[{ required: true, message: 'Required' }]}
                                                >
                                                    <Select placeholder="priority" className="h-12" suffixIcon={<BsChevronDown className="text-gray-400" />}>
                                                        <Option value="high">High</Option>
                                                        <Option value="medium">Medium</Option>
                                                        <Option value="low">Low</Option>
                                                    </Select>
                                                </Form.Item>
                                            </div>
                                            <div className="col-span-6 md:col-span-2">
                                                <Form.Item
                                                    {...restField}
                                                    label={<span className="text-sm font-bold text-[#161A2C]">Weight <span className="text-red-500">*</span></span>}
                                                    name={[name, 'weight']}
                                                    rules={[{ required: true, message: 'Required' }]}
                                                >
                                                    <InputNumber placeholder="weight" className="w-full h-12 rounded-xl flex items-center" min={0} max={100} />
                                                </Form.Item>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {!isEdit && (
                                    <div className="flex flex-col items-end pt-2">
                                        <div className="text-sm font-medium mb-4">
                                            <span className="text-gray-500">Weight Point: </span>
                                            <span className={weightTotal > 100 ? 'text-red-500' : 'text-gray-900'}>{weightTotal}%</span>
                                        </div>

                                        <div className="w-full flex justify-center">
                                            <Button
                                                type="primary"
                                                icon={<FaPlus className="text-xs" />}
                                                onClick={() => add()}
                                                className="bg-[#4F46E5] hover:bg-[#4338CA] h-12 px-8 rounded-xl font-bold flex items-center gap-2"
                                            >
                                                Add Plan
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                {isEdit && (
                                    <div className="flex flex-col items-end pt-2">
                                        <div className="text-sm font-medium mb-4">
                                            <span className="text-gray-500">Weight Point: </span>
                                            <span className={weightTotal > 100 ? 'text-red-500' : 'text-gray-900'}>{weightTotal}%</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </Form.List>

                    <div className="flex items-center justify-center gap-4 pt-10">
                        <Button
                            onClick={onCancel}
                            className="h-12 px-12 rounded-xl border-2 border-gray-300 font-bold text-[#161A2C]"
                        >
                            Cancel
                        </Button>
                        <Tooltip title={weightTotal !== 100 ? "Summation of all task's weights must be equal to 100!" : (isEdit ? 'Update Plan' : 'Add Plan')}>
                            <Button
                                type="primary"
                                loading={isLoading}
                                onClick={handleSubmit}
                                disabled={weightTotal !== 100}
                                className="bg-[#4F46E5] hover:bg-[#4338CA] h-12 px-16 rounded-xl font-bold text-white"
                                style={{ color: 'white' }}
                            >
                                {isEdit ? 'Update' : 'Add'}
                            </Button>
                        </Tooltip>
                    </div>
                </Form>
            </div>

            <style jsx global>{`
                .basic-okr-modal .ant-modal-content {
                    border-radius: 24px;
                    padding: 32px;
                }
                .basic-okr-modal .ant-select-selector {
                    border-radius: 12px !important;
                    border-color: #E5E7EB !important;
                    height: 48px !important;
                    display: flex !important;
                    align-items: center !important;
                }
                .basic-okr-modal .ant-input {
                    border-radius: 12px !important;
                    border-color: #E5E7EB !important;
                }
                .basic-okr-modal .ant-input-number {
                    border-radius: 12px !important;
                    border-color: #E5E7EB !important;
                }
            `}</style>
        </Modal>
    );
}
