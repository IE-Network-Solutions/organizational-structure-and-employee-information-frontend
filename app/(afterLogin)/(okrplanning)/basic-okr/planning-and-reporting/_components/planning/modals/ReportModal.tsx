'use client';
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Checkbox } from 'antd';
import { IoCheckmarkCircle, IoCloseCircle } from 'react-icons/io5';

const { TextArea } = Input;

interface Task {
    id: string;
    title: string;
    status?: string;
}

interface ReportModalProps {
    open: boolean;
    onCancel: () => void;
    onReport: (values: any) => void;
    plan: {
        id: string;
        title: string;
        tasks: Task[];
        cadence?: string;
    } | null;
    isLoading?: boolean;
}

export default function ReportModal({
    open,
    onCancel,
    onReport,
    plan,
    isLoading
}: ReportModalProps) {
    const [form] = Form.useForm();
    const [taskResults, setTaskResults] = useState<{ [key: string]: 'achieve' | 'fail' | null }>({});

    useEffect(() => {
        if (open && plan) {
            form.resetFields();
            const initialResults: { [key: string]: 'achieve' | 'fail' | null } = {};
            plan.tasks.forEach(task => {
                initialResults[task.id] = null;
            });
            setTaskResults(initialResults);

            // Initialize form with tasks
            form.setFieldsValue({
                tasks: plan.tasks.map(task => ({
                    id: task.id,
                    title: task.title,
                    isAchieved: null,
                    comment: ''
                }))
            });
        }
    }, [open, plan, form]);

    const handleResultChange = (taskId: string, index: number, result: 'achieve' | 'fail') => {
        const currentResult = taskResults[taskId];
        const newResult = currentResult === result ? null : result;

        setTaskResults(prev => ({
            ...prev,
            [taskId]: newResult
        }));

        // Update form value
        const tasks = form.getFieldValue('tasks');
        tasks[index].isAchieved = newResult === 'achieve' ? true : newResult === 'fail' ? false : null;
        form.setFieldsValue({ tasks });
    };

    const handleSubmit = () => {
        form.validateFields().then(values => {
            onReport(values);
        }).catch(info => {
            console.log('Validate Failed:', info);
        });
    };

    const modalTitle = plan?.cadence
        ? `${plan.cadence.charAt(0).toUpperCase() + plan.cadence.slice(1)} Report`
        : 'Daily Report';

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            centered
            width={700}
            className="report-modal"
            closeIcon={null}
        >
            <div className="p-2">
                <h2 className="text-2xl font-bold text-center text-[#161A2C] mb-8">
                    {modalTitle}
                </h2>

                <Form
                    form={form}
                    layout="vertical"
                    requiredMark={false}
                >
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-6">
                        <Form.List name="tasks">
                            {(fields) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => {
                                        const taskId = plan?.tasks[name]?.id || '';
                                        const result = taskResults[taskId];

                                        return (
                                            <div key={key} className="space-y-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 mr-4">
                                                        <span className="text-gray-900 font-bold block">
                                                            Task: {plan?.tasks[name]?.title}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-4 shrink-0">
                                                        {/* Achieve Toggle */}
                                                        <div
                                                            onClick={() => handleResultChange(taskId, name, 'achieve')}
                                                            className="flex items-center gap-1 cursor-pointer select-none"
                                                        >
                                                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${result === 'achieve' ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300'
                                                                }`}>
                                                                {result === 'achieve' && <IoCheckmarkCircle size={14} />}
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700">Achieve</span>
                                                        </div>

                                                        {/* Fail Toggle */}
                                                        <div
                                                            onClick={() => handleResultChange(taskId, name, 'fail')}
                                                            className="flex items-center gap-1 cursor-pointer select-none"
                                                        >
                                                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${result === 'fail' ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-gray-300'
                                                                }`}>
                                                                {result === 'fail' && <IoCloseCircle size={14} />}
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700">Fail</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Hidden input for validation if needed */}
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'isAchieved']}
                                                    hidden
                                                >
                                                    <Input />
                                                </Form.Item>

                                                {/* Hidden input for ID */}
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'id']}
                                                    hidden
                                                >
                                                    <Input />
                                                </Form.Item>

                                                {/* Extra Input Field for Fail */}
                                                {result === 'fail' && (
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'comment']}
                                                        className="mb-0 animate-in fade-in slide-in-from-top-2 duration-300"
                                                    >
                                                        <TextArea
                                                            placeholder="Describe why it failed..."
                                                            autoSize={{ minRows: 3, maxRows: 6 }}
                                                            className="rounded-xl border-blue-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-blue-50/10"
                                                        />
                                                    </Form.Item>
                                                )}
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </Form.List>
                    </div>

                    <div className="flex items-center justify-center gap-4 pt-10">
                        <Button
                            onClick={onCancel}
                            className="h-12 px-12 rounded-xl border-2 border-gray-300 font-bold text-[#161A2C]"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            loading={isLoading}
                            onClick={handleSubmit}
                            className="bg-[#4F46E5] hover:bg-[#4338CA] h-12 px-16 rounded-xl font-bold border-none"
                        >
                            Report
                        </Button>
                    </div>
                </Form>
            </div>

            <style jsx global>{`
                .report-modal .ant-modal-content {
                    border-radius: 24px;
                    padding: 32px;
                }
                .report-modal .ant-input {
                    border-radius: 12px !important;
                }
            `}</style>
        </Modal>
    );
}
