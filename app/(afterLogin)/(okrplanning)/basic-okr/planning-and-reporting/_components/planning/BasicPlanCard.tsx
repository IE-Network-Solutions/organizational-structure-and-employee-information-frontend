import React from 'react';
import { Button, Avatar, Dropdown, MenuProps } from 'antd';
import { IoEllipsisVertical, IoCheckmarkSharp } from "react-icons/io5";
import { BsThreeDots } from "react-icons/bs";
import CommentsSection from '@/app/(afterLogin)/(planningAndReporting)/planning-and-reporting/_components/comments/CommentsSection';
// import StatPill from '@/app/(afterLogin)/(planningAndReporting)/planning-and-reporting/_components/StatPill';
import { CommentsData } from '@/types/okr';
import TaskRow from './TaskRow';

// Mock data types same as TaskRow
interface TaskProps {
    id: string;
    title: string;
    priority: 'High' | 'Medium' | 'Low';
    status?: 'completed' | 'pending' | 'failed';
    weight?: number;
    target?: number;
}

interface BasicPlanCardProps {
    id: string; // Add id to props
    title: string;
    date: string;
    reportedDate?: string;
    isReported?: boolean; // New prop
    tasks: TaskProps[];
    isExpanded?: boolean;
    showReportButton?: boolean;
    onReport?: () => void;
    owner?: {
        name: string;
        team: string;
        avatar?: string;
        initials?: string;
    };
    planStatus?: {
        label: string;
        date: string;
        status: 'pending' | 'success';
    };
    commentCount?: number;
    commentAvatars?: string[];
    comments?: CommentsData[];
    reportId?: string; // When isReported, use for report comments
    onEdit?: () => void;
    onDelete?: () => void;
    onTaskStatusChange?: (taskId: string, newStatus: string) => void;
    onApprove?: () => void;
    onOpen?: () => void;
    canApprove?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
}

export default function BasicPlanCard({
    id,
    title,
    date,
    reportedDate,
    isReported = false,
    tasks,
    isExpanded = true,
    showReportButton = true,
    onReport,
    owner,
    planStatus,
    commentCount = 0,
    commentAvatars = [],
    comments = [],
    reportId,
    onEdit,
    onDelete,
    onTaskStatusChange,
    onApprove,
    // onOpen,
    canApprove = false,
    canEdit = false,
    canDelete = false
}: BasicPlanCardProps) {
    const statusMenuItems: MenuProps['items'] = [];

    if (canApprove) {
        if (planStatus?.label !== 'Closed') {
            statusMenuItems.push({
                key: 'approve',
                label: <span className="text-green-600 font-semibold">Approve</span>,
                onClick: onApprove,
                icon: <IoCheckmarkSharp className="text-green-600" />
            });
        }
    }

    if (canEdit && !isReported && planStatus?.label !== 'Closed') {
        statusMenuItems.push(
            {
                key: 'edit',
                label: 'Edit',
                onClick: onEdit
            }
        );
    }

    if (canDelete && !isReported && planStatus?.label !== 'Closed') {
        statusMenuItems.push(
            {
                key: 'delete',
                label: 'Delete',
                onClick: onDelete
            }
        );
    }

    if (!isExpanded) {
        return (
            <div className="bg-white rounded-xl p-5 border border-gray-200 flex items-center justify-between cursor-pointer hover:shadow-md transition-all">
                <h3 className="text-blue-600 font-semibold text-lg">{title}</h3>
            </div>
        );
    }

    // const totalWeight = tasks.reduce((sum, t) => sum + (t.weight || 0), 0);
    const achievedWeight = tasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.weight || 0), 0);
    // const progressPercent = totalWeight > 0 ? Math.round((achievedWeight / totalWeight) * 100) : 0;

    return (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-blue-600 font-bold text-lg">{title}</h3>
                {showReportButton && !isReported && (
                    <Button
                        type="primary"
                        className="rounded-lg px-6 h-9 bg-blue-600 hover:bg-blue-700"
                        onClick={onReport}
                    >
                        Report
                    </Button>
                )}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
                <div className="flex flex-col gap-2 w-full md:w-auto">
                    {/* Planned / Reported: vertical on small screens, horizontal on md+ */}
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-[11px]">
                        <div className="flex items-center gap-1.5">
                            <span className="text-gray-400 font-normal">Planned</span>
                            <span className="font-bold text-[#161A2C]">{date}</span>
                        </div>
                        {isReported && reportedDate && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-gray-400 font-normal">Reported</span>
                                <span className="font-bold text-[#161A2C]">{reportedDate}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Owner and Status Section - single line on small screen with truncated name */}
            {(owner || planStatus) && (
                <div className="flex flex-row justify-between items-center gap-2 md:gap-4 mb-4 pt-0 min-w-0">
                    {owner && (
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Avatar size={40} className="flex-shrink-0" src={owner.avatar} icon={!owner.avatar && (owner.initials || owner.name?.[0])} />
                            <div className="min-w-0 flex-1">
                                <h4 className="text-gray-900 font-bold text-sm truncate" title={owner.name}>{owner.name}</h4>
                                <p className="text-gray-400 text-xs truncate hidden md:block" title={owner.team}>{owner.team}</p>
                            </div>
                        </div>
                    )}

                    {planStatus && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="flex items-center gap-3 bg-white">
                                <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0 ${planStatus.status === 'success' ? 'bg-[#00BA88]' : 'bg-[#FFA500]'}`}
                                >
                                    {planStatus.status === 'success' ? <IoCheckmarkSharp className="text-xl" /> : <BsThreeDots className="text-xl" />}
                                </div>
                                {/* Label and date hidden on small screen; only icon shown */}
                                <div className="hidden md:flex flex-col min-w-0">
                                    <p className="text-[#161A2C] font-bold text-[15px] leading-tight">
                                        {planStatus.label}
                                    </p>
                                    <p className="text-[#718096] text-xs mt-0.5">{planStatus.date}</p>
                                </div>
                            </div>
                            {(statusMenuItems.length > 0) && (
                                <Dropdown menu={{ items: statusMenuItems }} trigger={['click']} placement="bottomRight">
                                    <Button
                                        type="text"
                                        icon={<IoEllipsisVertical className="text-gray-400 text-lg" />}
                                    />
                                </Dropdown>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Tasks List */}
            <div className="space-y-3 mb-6">
                {tasks.map(task => (
                    <TaskRow
                        key={task.id}
                        task={task}
                        onStatusChange={(newStatus) => onTaskStatusChange?.(task.id, newStatus)}
                        showStatus={true} // Keep visible as per user's previous request
                        isReported={isReported}
                    />
                ))}
            </div>

            {/* Footer - Comments section (same as /planning-and-reporting: commenter profile, add/edit/delete) */}
            <div className="mt-4">
                <CommentsSection
                    planId={isReported && reportId ? reportId : id}
                    commentCount={commentCount}
                    commentAvatars={commentAvatars}
                    comments={comments}
                    isPlanCard={!isReported}
                    achieved={achievedWeight}
                />
            </div>
        </div>
    );
}
