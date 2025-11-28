import React, { useState } from 'react';
import { Drawer, Button, Input, Select } from 'antd';
import { CloseCircleFilled, CheckOutlined, CloseOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { ViewMode } from './types';

interface AddDailyPlanDrawerProps {
    open: boolean;
    onClose: () => void;
    viewMode: ViewMode;
}

// --- Planning Types ---
interface TaskItem {
    id: string;
    description: string;
    priority: string;
    weight: number;
    target: number;
}

interface WeeklyTaskGroup {
    id: string;
    title: string;
    tasks: TaskItem[];
    collapsed?: boolean;
}

// --- Reporting Types ---
interface ReportingTask {
    id: string;
    description: string;
    value?: number;
    status: 'done' | 'not' | null;
    comment?: string;
    showValueInput?: boolean;
}

interface ReportingGroup {
    id: string;
    title: string;
    tasks: ReportingTask[];
    collapsed?: boolean;
}

export default function AddDailyPlanDrawer({ open, onClose, viewMode }: AddDailyPlanDrawerProps) {
    // --- Planning State ---
    const [planningTasks, setPlanningTasks] = useState<WeeklyTaskGroup[]>([
        {
            id: '1',
            title: 'Learning Product design course curiculum',
            collapsed: true,
            tasks: [
                { id: 't1', description: 'Achieve ISO 9001 certification.', priority: 'High', weight: 10, target: 100000000 }
            ]
        },
        {
            id: '2',
            title: 'Learning Product design course curiculum',
            collapsed: true,
            tasks: [
                { id: 't2', description: 'Achieve ISO 9001 certification.', priority: 'High', weight: 10, target: 100000000 }
            ]
        },
        {
            id: '3',
            title: 'Learning Product design course curiculum',
            collapsed: true,
            tasks: [
                { id: 't3', description: 'Achieve ISO 9001 certification.', priority: 'High', weight: 10, target: 100000000 }
            ]
        },
        {
            id: '4',
            title: 'Learning Product design course curiculum',
            collapsed: true,
            tasks: [
                { id: 't4', description: 'Achieve ISO 9001 certification.', priority: 'High', weight: 10, target: 100000000 },
                { id: 't5', description: 'Achieve ISO 9001 certification.', priority: 'High', weight: 10, target: 100000000 }
            ]
        },
        {
            id: '5',
            title: 'Learning Product design course curiculum',
            collapsed: true,
            tasks: []
        }
    ]);

    // --- Reporting State ---
    const [reportingTasks, setReportingTasks] = useState<ReportingGroup[]>([
        {
            id: 'r1',
            title: 'Learning Product design course curiculum',
            collapsed: true,
            tasks: [
                {
                    id: 'rt1',
                    description: 'Learning Product design course curriculum, Learning Product design .',
                    value: 100000,
                    status: 'done',
                    showValueInput: true
                },
                {
                    id: 'rt2',
                    description: 'Learning Product design course curriculum',
                    value: 100000,
                    status: 'not',
                    showValueInput: true
                },
                {
                    id: 'rt3',
                    description: 'I just tried this recipe and it was amazing!',
                    status: null,
                    showValueInput: false
                }
            ]
        },
        {
            id: 'r2',
            title: 'Learning Product design course curiculum',
            collapsed: true,
            tasks: [
                {
                    id: 'rt4',
                    description: 'Learning Product design course curriculum, Learning Product design .',
                    status: 'done',
                    showValueInput: false
                },
                {
                    id: 'rt5',
                    description: 'Learning Product design course curriculum, Learning Product design .',
                    status: 'done',
                    showValueInput: false
                }
            ]
        }
    ]);

    const priorityOptions = [
        { value: 'High', label: <span className="text-[#FF4D4F]">High</span> },
        { value: 'Medium', label: <span className="text-[#FAAD14]">Medium</span> },
        { value: 'Low', label: <span className="text-[#52C41A]">Low</span> },
    ];

    // --- Planning Handlers ---
    const togglePlanningGroupCollapse = (groupId: string) => {
        setPlanningTasks(prev => prev.map(group => {
            if (group.id !== groupId) return group;
            return { ...group, collapsed: !group.collapsed };
        }));
    };

    const addPlanningTask = (groupId: string) => {
        setPlanningTasks(prev => prev.map(group => {
            if (group.id !== groupId) return group;
            const newTask: TaskItem = {
                id: Math.random().toString(36).substr(2, 9),
                description: '',
                priority: 'High',
                weight: 0,
                target: 0
            };
            return { ...group, tasks: [...group.tasks, newTask] };
        }));
    };

    const removePlanningTask = (groupId: string, taskId: string) => {
        setPlanningTasks(prev => prev.map(group => {
            if (group.id !== groupId) return group;
            return { ...group, tasks: group.tasks.filter(t => t.id !== taskId) };
        }));
    };

    // --- Reporting Handlers ---
    const handleStatusChange = (groupId: string, taskId: string, newStatus: 'done' | 'not') => {
        setReportingTasks(prev => prev.map(group => {
            if (group.id !== groupId) return group;
            return {
                ...group,
                tasks: group.tasks.map(task => {
                    if (task.id !== taskId) return task;
                    return {
                        ...task,
                        status: newStatus
                    };
                })
            };
        }));
    };

    const toggleReportingGroupCollapse = (groupId: string) => {
        setReportingTasks(prev => prev.map(group => {
            if (group.id !== groupId) return group;
            return { ...group, collapsed: !group.collapsed };
        }));
    };

    const renderPlanningContent = () => (
        <div className="flex flex-col gap-6 p-2">
            {planningTasks.map((group) => (
                <div key={group.id} className="rounded-2xl border border-[#F1F2F6] bg-white p-6 shadow-sm">
                    <div
                        className="mb-4 flex items-center justify-between cursor-pointer"
                        onClick={() => togglePlanningGroupCollapse(group.id)}
                    >
                        <div>
                            <span className="font-bold text-[#161A2C]">Weekly-task : </span>
                            <span className="text-[#5A5C80]">{group.title}</span>
                        </div>
                        {group.collapsed ? <DownOutlined /> : <UpOutlined />}
                    </div>

                    {!group.collapsed && (
                        <div className="flex flex-col gap-4">
                            {group.tasks.map((task) => (
                                <div key={task.id} className="flex items-start gap-3">
                                    <Input
                                        defaultValue={task.description}
                                        className="flex-1 rounded-lg border-[#E5E7EB] py-2"
                                    />
                                    <Select
                                        defaultValue={task.priority}
                                        options={priorityOptions}
                                        className="w-[100px] [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#E5E7EB] [&_.ant-select-selector]:!h-[42px] [&_.ant-select-selector]:!items-center"
                                        popupClassName="rounded-lg"
                                    />
                                    <div className="relative w-[80px]">
                                        <Input
                                            defaultValue={task.weight}
                                            type="number"
                                            className="rounded-lg border-[#E5E7EB] py-2 pr-6"
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                                            <div className="h-0 w-0 border-x-4 border-x-transparent border-b-4 border-b-[#8F94A3]"></div>
                                            <div className="h-0 w-0 border-x-4 border-x-transparent border-t-4 border-t-[#8F94A3]"></div>
                                        </div>
                                    </div>
                                    <div className="relative w-[140px]">
                                        <Input
                                            defaultValue={task.target.toLocaleString()}
                                            className="rounded-lg border-[#E5E7EB] py-2 pr-8 text-right"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8F94A3]">$</span>
                                    </div>
                                    <Button
                                        type="text"
                                        icon={<CloseCircleFilled className="text-[#574CFF] text-xl" />}
                                        className="flex items-center justify-center mt-1 hover:bg-transparent"
                                        onClick={() => removePlanningTask(group.id, task.id)}
                                    />
                                </div>
                            ))}

                            <div className="flex justify-end mt-2">
                                <Button
                                    type="primary"
                                    className="bg-[#574CFF] hover:bg-[#4F46EF] rounded-lg font-medium px-6"
                                    onClick={() => addPlanningTask(group.id)}
                                >
                                    Add Task
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    const renderReportingContent = () => (
        <div className="flex flex-col gap-6 p-2">
            {reportingTasks.map((group) => (
                <div key={group.id} className="rounded-2xl border border-[#F1F2F6] bg-white p-6 shadow-sm">
                    <div
                        className="mb-4 flex items-center justify-between cursor-pointer"
                        onClick={() => toggleReportingGroupCollapse(group.id)}
                    >
                        <div>
                            <span className="font-bold text-[#161A2C]">Weekly-task : </span>
                            <span className="text-[#5A5C80]">{group.title}</span>
                        </div>
                        {group.collapsed ? <DownOutlined /> : <UpOutlined />}
                    </div>

                    {!group.collapsed && (
                        <div className="flex flex-col gap-6">
                            {group.tasks.map((task) => (
                                <div key={task.id} className="flex flex-col gap-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 text-[#5A5C80] text-sm pt-2">
                                            {task.description}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {task.showValueInput && (
                                                <div className="relative w-[140px]">
                                                    <Input
                                                        defaultValue={task.value?.toLocaleString()}
                                                        className="rounded-lg border-[#E5E7EB] py-1.5 pr-8 text-right"
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8F94A3]">$</span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`flex items-center gap-1.5 cursor-pointer ${task.status === 'done' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                                                    onClick={() => handleStatusChange(group.id, task.id, 'done')}
                                                >
                                                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${task.status === 'done' ? 'bg-[#00C48C] border-[#00C48C]' : 'border-[#E5E7EB] bg-white'}`}>
                                                        {task.status === 'done' && <CheckOutlined className="text-white text-xs" />}
                                                    </div>
                                                    <span className="text-sm text-[#161A2C]">Done</span>
                                                </div>

                                                <div
                                                    className={`flex items-center gap-1.5 cursor-pointer ${task.status === 'not' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                                                    onClick={() => handleStatusChange(group.id, task.id, 'not')}
                                                >
                                                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${task.status === 'not' ? 'bg-[#FF4D4F] border-[#FF4D4F]' : 'border-[#E5E7EB] bg-white'}`}>
                                                        {task.status === 'not' && <CloseOutlined className="text-white text-xs" />}
                                                    </div>
                                                    <span className="text-sm text-[#161A2C]">Not</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {task.status === 'not' && (
                                        <div className="mt-2">
                                            <Input.TextArea
                                                placeholder="Why was this not completed?"
                                                defaultValue={task.comment}
                                                rows={3}
                                                className="rounded-lg border-[#574CFF] text-sm text-[#161A2C]"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <Drawer
            title={
                <div className="text-center text-xl font-bold text-[#161A2C]">
                    {viewMode === 'planning' ? 'Daily Plan' : 'Daily Reporting'}
                </div>
            }
            placement="right"
            width={800}
            onClose={onClose}
            open={open}
            closable={false}
            className="[&_.ant-drawer-header]:border-b-0 [&_.ant-drawer-header]:pt-6 [&_.ant-drawer-header]:pb-2"
            footer={
                <div className="relative flex items-center justify-center px-4 py-2">
                    <div className="flex items-center gap-4">
                        <Button size="large" className="rounded-xl border-[#E5E7EB] font-semibold text-[#161A2C] w-32" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="primary" size="large" className="rounded-xl bg-[#574CFF] font-semibold w-32 hover:bg-[#4F46EF]" onClick={onClose}>
                            {viewMode === 'planning' ? 'Plan' : 'Report'}
                        </Button>
                    </div>

                    <div className="absolute right-4">
                        {viewMode === 'planning' ? (
                            <span className="text-sm font-medium text-[#8F94A3]">Weight Point: <span className="text-[#161A2C]">0%</span></span>
                        ) : (
                            <span className="text-sm font-medium text-[#161A2C]">Total Point: <span className="text-[#00C48C]">85%</span></span>
                        )}
                    </div>
                </div>
            }
        >
            {viewMode === 'planning' ? renderPlanningContent() : renderReportingContent()}
        </Drawer>
    );
}
