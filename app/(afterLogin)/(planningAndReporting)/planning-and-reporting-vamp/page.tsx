'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Button, Segmented, Select, Tabs, Tag, Spin, Tooltip } from 'antd';
import type { TabsProps } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { BsKey } from 'react-icons/bs';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import PlanCard from './_components/PlanCard';
import PlanCardSkeleton from './_components/PlanCardSkeleton';
import { PlanSummary, Cadence, ViewMode } from './_components/types';
import AddDailyPlanDrawer from './_components/AddDailyPlanDrawer';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
    getSectionTitle,
    getButtonText,
    getCadenceTagText,
} from './_components/utils';
import {
    useGetPlanning,
    useGetReporting,
    useDefaultPlanningPeriods,
    AllPlanningPeriods,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { groupPlanTasksByKeyResultAndMilestone } from '../planning-and-reporting/_components/dataTransformer/plan';
import { groupTasksByKeyResultAndMilestone } from '../planning-and-reporting/_components/dataTransformer/report';
import dayjs from 'dayjs';
import { useGetPlanningPeriodsHierarchy, useGetUserPlanning } from '@/store/server/features/okrPlanningAndReporting/queries';
import { useFetchObjectives } from '@/store/server/features/employees/planning/queries';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import { PlanningType } from '@/types/enumTypes';

const cadenceTabs: TabsProps['items'] = [
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
];

const filterOptions = {
    employees: [
        { label: 'All employees', value: 'all' },
    ],
    planTypes: [
        { label: 'All plans', value: 'all' },
        { label: 'Milestone', value: 'milestone' },
        { label: 'Key result', value: 'keyResult' },
    ],
    departments: [
        { label: 'Department', value: 'dept' },
    ],
};

// Helper function to map cadence to planning period name
const getCadencePlanningPeriodName = (cadence: Cadence): string => {
    const mapping: Record<Cadence, string> = {
        daily: 'Daily',
        weekly: 'Weekly',
        monthly: 'Monthly',
    };
    return mapping[cadence];
};

// Helper function to normalize priority values from backend
const normalizePriority = (priority: any): 'Low' | 'Medium' | 'High' | 'Priority' => {
    if (!priority) return 'Low';

    const priorityStr = String(priority).toLowerCase();

    if (priorityStr.includes('high')) return 'High';
    if (priorityStr.includes('medium')) return 'Medium';
    if (priorityStr.includes('priority')) return 'Priority';

    return 'Low';
};

// Helper function to transform backend data to PlanSummary format
const transformBackendDataToPlanSummary = (
    backendData: any[],
    employeeData: any,
    viewMode: ViewMode,
): PlanSummary[] => {
    if (!backendData || backendData.length === 0) return [];

    return backendData.map((item: any) => {
        console.log('Processing item:', item.id);
        console.log('Item keyResults:', item.keyResults);

        const employee = employeeData?.items?.find(
            (emp: any) => emp.id === item.userId,
        );
        const firstName = employee?.firstName || '';
        const middleName = employee?.middleName || '';
        const lastName = employee?.lastName || '';
        const fullName = `${firstName} ${middleName}`.trim() || 'Unknown';
        const initials = `${firstName.charAt(0)}${middleName.charAt(0)}`.toUpperCase();
        const department =
            employee?.employeeJobInformation?.[0]?.department?.name || 'N/A';

        // Extract all tasks from key results
        const allTasks: any[] = [];
        item.keyResults?.forEach((keyResult: any) => {
            console.log('Processing keyResult:', keyResult.id, 'tasks:', keyResult.tasks);
            // Add tasks directly under key result
            if (keyResult.tasks) {
                allTasks.push(...keyResult.tasks);
            }
            // Add tasks from milestones
            keyResult.milestones?.forEach((milestone: any) => {
                if (milestone.tasks) {
                    allTasks.push(...milestone.tasks);
                }
                // Add tasks from parent tasks within milestones
                milestone.parentTask?.forEach((parent: any) => {
                    if (parent.tasks) {
                        allTasks.push(...parent.tasks);
                    }
                });
            });
            // Add tasks from parent tasks
            keyResult.parentTask?.forEach((parent: any) => {
                if (parent.tasks) {
                    allTasks.push(...parent.tasks);
                }
            });
        });

        console.log('All tasks extracted:', allTasks);

        // Calculate progress from tasks
        const totalTasks = allTasks.length;
        const completedTasks = allTasks.filter((t: any) => t.status === 'completed').length;
        const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        // Helper to determine status
        const getTaskStatus = (task: any) => {
            if (task.isAchieved === true) return 'completed';
            if (task.isAchieved === false) return 'failed';
            return task.status || 'pending';
        };

        // Transform tasks based on view mode
        const transformedTasks = allTasks.map((task: any) => {
            if (viewMode === 'reporting') {
                return {
                    id: task.id || task.taskId,
                    title: task.taskName || task.task || task.title || task.name || 'Untitled Task',
                    priority: normalizePriority(task.priority),
                    // For reporting, use weightPlan (from planTask) if available, otherwise fall back to weight
                    weight: task.weightPlan || task.planTask?.weight || task.weight || 0,
                    achieved: task.actualValue || task.achievedValue || task.achieved || 0,
                    status: getTaskStatus(task),
                };
            } else {
                return {
                    id: task.id || task.taskId,
                    title: task.taskName || task.task || task.title || task.name || 'Untitled Task',
                    priority: normalizePriority(task.priority),
                    weight: task.weight || 0,
                    target: task.targetValue || task.target || 0,
                    hasAttachment: task.hasAttachment || false,
                };
            }
        });

        console.log('Transformed tasks:', transformedTasks);

        // Get the first key result name as summary, or use objective name
        const keyResultName = item.keyResults?.[0]?.title || item.keyResults?.[0]?.name;
        const objectiveName = item.keyResults?.[0]?.objective?.name;
        const summary = keyResultName || objectiveName || 'No key result specified';

        // Transform tasks within keyResults structure
        const transformedKeyResults = item.keyResults?.map((kr: any) => {
            // Helper to check if a task is achieved
            const isTaskAchieved = (task: any) => {
                if (viewMode === 'reporting') {
                    const taskStatus = getTaskStatus(task);
                    return taskStatus === 'completed' || task.isAchieved === true;
                }
                return false;
            };

            // Transform tasks first
            const transformedTasks = kr.tasks?.map((task: any) => ({
                id: task.id || task.taskId,
                title: task.taskName || task.task || task.title || task.name || 'Untitled Task',
                priority: normalizePriority(task.priority),
                // For reporting, use weightPlan (from planTask) if available, otherwise fall back to weight
                weight: viewMode === 'reporting' 
                    ? (task.weightPlan || task.planTask?.weight || task.weight || 0)
                    : (task.weight || 0),
                target: viewMode === 'planning' ? (task.targetValue || task.target || 0) : undefined,
                achieved: viewMode === 'reporting' ? (task.actualValue || task.achievedValue || task.achieved || 0) : undefined,
                hasAttachment: task.hasAttachment || false,
                status: getTaskStatus(task),
                isAchieved: isTaskAchieved(task),
            })) || [];

            // Collect all tasks from this keyResult (including milestone tasks and parent tasks)
            const allKRTasks: any[] = transformedTasks.map((t: any) => ({
                target: t.target || 0,
                weight: t.weight || 0,
                isAchieved: t.isAchieved,
            }));
            
            // Add milestone tasks
            kr.milestones?.forEach((milestone: any) => {
                milestone.tasks?.forEach((task: any) => {
                    const taskStatus = getTaskStatus(task);
                    const taskWeight = viewMode === 'reporting' 
                        ? (task.weightPlan || task.planTask?.weight || task.weight || 0)
                        : (task.weight || 0);
                    allKRTasks.push({
                        target: viewMode === 'planning' ? (task.targetValue || task.target || 0) : (task.targetValue || task.target || task.planTask?.targetValue || 0),
                        weight: taskWeight,
                        isAchieved: taskStatus === 'completed' || task.isAchieved === true,
                    });
                });
                milestone.parentTask?.forEach((parent: any) => {
                    parent.tasks?.forEach((task: any) => {
                        const taskStatus = getTaskStatus(task);
                        const taskWeight = viewMode === 'reporting' 
                            ? (task.weightPlan || task.planTask?.weight || task.weight || 0)
                            : (task.weight || 0);
                        allKRTasks.push({
                            target: viewMode === 'planning' ? (task.targetValue || task.target || 0) : (task.targetValue || task.target || task.planTask?.targetValue || 0),
                            weight: taskWeight,
                            isAchieved: taskStatus === 'completed' || task.isAchieved === true,
                        });
                    });
                });
            });
            
            // Add parent task tasks
            kr.parentTask?.forEach((parent: any) => {
                parent.tasks?.forEach((task: any) => {
                    const taskStatus = getTaskStatus(task);
                    const taskWeight = viewMode === 'reporting' 
                        ? (task.weightPlan || task.planTask?.weight || task.weight || 0)
                        : (task.weight || 0);
                    allKRTasks.push({
                        target: viewMode === 'planning' ? (task.targetValue || task.target || 0) : (task.targetValue || task.target || task.planTask?.targetValue || 0),
                        weight: taskWeight,
                        isAchieved: taskStatus === 'completed' || task.isAchieved === true,
                    });
                });
            });

            // Calculate keyResult-level target and achieved values
            const keyResultTarget = allKRTasks.reduce((sum: number, t: any) => sum + (t.target || 0), 0);
            // For reporting: achieved is the sum of weights of achieved tasks
            const keyResultAchieved = viewMode === 'reporting'
                ? allKRTasks
                    .filter((t: any) => t.isAchieved)
                    .reduce((sum: number, t: any) => sum + (t.weight || 0), 0)
                : 0;

            return {
                ...kr,
                tasks: transformedTasks,
                // Set targetValue and currentValue for the keyResult
                targetValue: kr.targetValue || keyResultTarget,
                currentValue: viewMode === 'reporting' ? (kr.currentValue || keyResultAchieved) : (kr.currentValue || 0),
                milestones: kr.milestones?.map((milestone: any) => ({
                ...milestone,
                tasks: milestone.tasks?.map((task: any) => ({
                    id: task.id || task.taskId,
                    title: task.taskName || task.task || task.title || task.name || 'Untitled Task',
                    priority: normalizePriority(task.priority),
                    // For reporting, use weightPlan (from planTask) if available, otherwise fall back to weight
                    weight: viewMode === 'reporting' 
                        ? (task.weightPlan || task.planTask?.weight || task.weight || 0)
                        : (task.weight || 0),
                    target: viewMode === 'planning' ? (task.targetValue || task.target || 0) : undefined,
                    achieved: viewMode === 'reporting' ? (task.actualValue || task.achievedValue || task.achieved || 0) : undefined,
                    hasAttachment: task.hasAttachment || false,
                    status: getTaskStatus(task),
                })) || [],
                parentTask: milestone.parentTask?.map((parent: any) => ({
                    ...parent,
                    tasks: parent.tasks?.map((task: any) => ({
                        id: task.id || task.taskId,
                        title: task.taskName || task.task || task.title || task.name || 'Untitled Task',
                        priority: normalizePriority(task.priority),
                        // For reporting, use weightPlan (from planTask) if available, otherwise fall back to weight
                        weight: viewMode === 'reporting' 
                            ? (task.weightPlan || task.planTask?.weight || task.weight || 0)
                            : (task.weight || 0),
                        target: viewMode === 'planning' ? (task.targetValue || task.target || 0) : undefined,
                        achieved: viewMode === 'reporting' ? (task.actualValue || task.achievedValue || task.achieved || 0) : undefined,
                        hasAttachment: task.hasAttachment || false,
                        status: getTaskStatus(task),
                    })) || [],
                })) || [],
            })) || [],
            parentTask: kr.parentTask?.map((parent: any) => ({
                ...parent,
                tasks: parent.tasks?.map((task: any) => ({
                    id: task.id,
                    title: task.task || task.title || task.name || 'Untitled Task',
                    priority: normalizePriority(task.priority),
                    // For reporting, use weightPlan (from planTask) if available, otherwise fall back to weight
                    weight: viewMode === 'reporting' 
                        ? (task.weightPlan || task.planTask?.weight || task.weight || 0)
                        : (task.weight || 0),
                    target: viewMode === 'planning' ? (task.targetValue || task.target || 0) : undefined,
                    achieved: viewMode === 'reporting' ? (task.actualValue || task.achievedValue || task.achieved || 0) : undefined,
                    hasAttachment: task.hasAttachment || false,
                    status: getTaskStatus(task),
                })) || [],
            })) || [],
            };
        }) || [];


        const result = {
            id: item.id,
            cadence: 'weekly' as Cadence,
            owner: {
                name: fullName,
                role: department,
                avatarInitials: initials,
                avatar: employee?.profileImage,
            },
            status: {
                label: item.isValidated ? 'Closed' : 'Open',
                updatedAt: dayjs(item.updatedAt).format('MMMM Do YYYY, h:mm:ss A'),
                tone: item.isValidated ? '#10B981' : '#F4B740',
            },
            metricLabel: 'Metric',
            milestoneLabel: 'Milestone',
            // Calculate target from all tasks (for planning mode)
            target: viewMode === 'planning' 
                ? allTasks.reduce((sum: number, t: any) => sum + (t.targetValue || t.target || 0), 0)
                : allTasks.reduce((sum: number, t: any) => sum + (t.targetValue || t.target || t.planTask?.targetValue || 0), 0),
            // Calculate achieved from all tasks (for reporting mode) - sum of weights of achieved tasks
            achieved: viewMode === 'reporting'
                ? allTasks
                    .filter((t: any) => {
                        const taskStatus = getTaskStatus(t);
                        return taskStatus === 'completed' || t.isAchieved === true;
                    })
                    .reduce((sum: number, t: any) => {
                        const taskWeight = t.weightPlan || t.planTask?.weight || t.weight || 0;
                        return sum + taskWeight;
                    }, 0)
                : 0,
            progress: Math.round(progress),
            summary: summary,
            tasks: transformedTasks,
            keyResults: transformedKeyResults,
            commentCount: item.comments?.length || 0,
            commentAvatars: item.comments?.slice(0, 3).map((c: any) => c.user?.profileImage).filter(Boolean) || [],
            notificationCount: viewMode === 'reporting' ? item.notifications?.length || 0 : undefined,
            createdAt: item.createdAt,
            reprimandCount: item.reprimands?.length || 0,
            appreciationCount: item.appreciations?.length || 0,
        };


        console.log('Final result for item:', result);
        return result;
    });
};

export default function PlanningAndReportingVampPage() {
    const { activeTab, setActiveTab, selectedUser, setSelectedUser } = PlanningAndReportingStore();
    const [activeCadence, setActiveCadence] = useState<Cadence>('daily');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const { userId } = useAuthenticationStore();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const { isMobile, isTablet } = useIsMobile();
    const [selectedDepartment, setSelectedDepartment] = useState<string | undefined>(undefined);
    const [selectedPlanType, setSelectedPlanType] = useState<string>('all');

    const viewMode: ViewMode = activeTab === 1 ? 'planning' : 'reporting';

    // Fetch planning periods and employee data
    const { data: planningPeriods } = useDefaultPlanningPeriods();
    const { data: userPlanningPeriods } = AllPlanningPeriods();
    const { data: employeeData } = useGetAllUsers();
    const { data: departmentData } = useGetDepartmentsWithUsers();
    const { data: objective } = useFetchObjectives(userId);

    // Build employee options from real data
    const employeeOptions = useMemo(() => {
        const options = [{ label: 'All employees', value: 'all' }];
        if (employeeData?.items) {
            employeeData.items.forEach((emp: any) => {
                const name = `${emp.firstName || ''} ${emp.middleName || ''} ${emp.lastName || ''}`.trim();
                if (name) {
                    options.push({ label: name, value: emp.id });
                }
            });
        }
        return options;
    }, [employeeData]);

    // Build department options from real data
    const departmentOptions = useMemo(() => {
        const options = [{ label: 'All Departments', value: 'all' }];
        if (departmentData) {
            departmentData.forEach((dept: any) => {
                if (dept.name) {
                    options.push({ label: dept.name, value: dept.id });
                }
            });
        }
        return options;
    }, [departmentData]);

    // Plan type options
    const planTypeOptions = [
        { label: 'All Plans', value: 'all' },
        { label: 'My Plans', value: 'myPlan' },
        { label: 'Subordinate Plans', value: 'subordinatePlan' },
    ];

    // Helper function to get user IDs by department
    const getUserIdsByDepartmentId = (departmentId: string) => {
        const department = departmentData?.find((dep: any) => dep.id === departmentId);
        if (department && department.users) {
            return department.users.map((user: any) => user.id);
        }
        return [];
    };

    // Handle employee filter change
    const handleEmployeeChange = (value: string) => {
        setSelectedDepartment(undefined);
        setSelectedPlanType('all');
        if (value === 'all') {
            setSelectedUser(['all']);
        } else {
            setSelectedUser([value]);
        }
    };

    // Handle plan type filter change
    const handlePlanTypeChange = (value: string) => {
        setSelectedDepartment(undefined);
        setSelectedPlanType(value);

        if (value === 'all') {
            setSelectedUser(['all']);
        } else if (value === 'myPlan') {
            setSelectedUser([userId]);
        } else if (value === 'subordinatePlan') {
            const subordinates = employeeData?.items
                ?.filter(
                    (employee: any) =>
                        (employee?.delegatedTo?.id || employee.reportingTo?.id) === userId,
                )
                .map((employee: any) => employee.id) || [];
            setSelectedUser(subordinates.length > 0 ? ['subordinate', ...subordinates] : ['subordinate']);
        }
    };

    // Handle department filter change
    const handleDepartmentChange = (value: string) => {
        setSelectedPlanType('all');
        setSelectedDepartment(value);

        if (value === 'all') {
            setSelectedUser(['all']);
        } else {
            const userIds = getUserIdsByDepartmentId(value);
            setSelectedUser(userIds.length > 0 ? userIds : []);
        }
    };

    // Find the planning period ID based on the selected cadence
    const activePlanningPeriod = useMemo(() => {
        const cadenceName = getCadencePlanningPeriodName(activeCadence);
        return planningPeriods?.items?.find(
            (period: any) => period.name === cadenceName,
        );
    }, [planningPeriods, activeCadence]);

    const planningPeriodId = activePlanningPeriod?.id || '';

    // Get user planning period ID
    const userPlanningPeriodId = userPlanningPeriods?.find(
        (item: any) => item?.planningPeriodId === planningPeriodId,
    )?.planningPeriodId;

    // Fetch planning hierarchy to check if button should be active
    const { data: planningPeriodHierarchy, isLoading: isHierarchyLoading } =
        useGetPlanningPeriodsHierarchy(
            userId,
            planningPeriodId || '',
        );

    // Check if user has unreported plans
    const { data: allUserPlanning } = useGetUserPlanning(
        planningPeriodId ?? '',
        activeTab.toString(),
    );

    // Fetch planning or reporting data based on active tab
    const { data: planningData, isLoading: isPlanningLoading } = useGetPlanning({
        userId: selectedUser.length > 0 ? selectedUser : [userId],
        planPeriodId: planningPeriodId,
        page,
        pageSize,
        sessionId: [],
    });

    const { data: reportingData, isLoading: isReportingLoading } = useGetReporting({
        userId: selectedUser.length > 0 ? selectedUser : [userId],
        planPeriodId: planningPeriodId,
        pageReporting: page,
        pageSizeReporting: pageSize,
        sessionId: [],
    });

    // Transform backend data to PlanSummary format
    const plans = useMemo(() => {
        const backendData = viewMode === 'planning'
            ? planningData?.items
            : reportingData?.items;

        console.log('Raw backend data:', backendData);

        let transformedBackendData;

        if (viewMode === 'planning') {
            // For planning, use the plan transformer which takes the array of plans
            transformedBackendData = groupPlanTasksByKeyResultAndMilestone(backendData || []);
        } else {
            // For reporting, we need to transform each report individually
            // Preserve all report properties and transform the reportTask
            transformedBackendData = backendData?.map((report: any) => {
                const reportTasks = report.reportTask || [];
                return {
                    ...report,
                    // Use the report transformer for the report tasks
                    // Only transform if there are tasks, otherwise return empty array
                    keyResults: reportTasks.length > 0
                        ? groupTasksByKeyResultAndMilestone(reportTasks)
                        : []
                };
            }) || [];
        }

        console.log('After transformation:', transformedBackendData);

        const result = transformBackendDataToPlanSummary(
            transformedBackendData || [],
            employeeData,
            viewMode,
        );

        console.log('Final PlanSummary result:', result);

        return result;
    }, [planningData, reportingData, employeeData, viewMode]);

    // Check if button should be active based on parent plan status
    const isActive = planningPeriodHierarchy?.parentPlan
        ? (planningPeriodHierarchy?.parentPlan?.plans?.length ?? 0) === 0 ||
        (planningPeriodHierarchy?.parentPlan?.plans?.filter(
            (i: any) => !i.isReported,
        ).length ?? 0) === 0
        : false;

    // Determine if add button should be disabled based on view mode
    // For Planning: disabled if there are unreported plans, parent plan not created, or no objectives
    // For Reporting: disabled if there are no plans (need a plan first to report)
    const isAddButtonDisabled = useMemo(() => {
        if (viewMode === 'planning') {
            return (
                allUserPlanning?.length > 0 ||
                isActive ||
                (objective?.items?.length ?? 0) === 0
            );
        } else {
            // For reporting: disabled if no plans exist
            return allUserPlanning && allUserPlanning.length < 1;
        }
    }, [viewMode, allUserPlanning, isActive, objective]);

    // Get tooltip message for disabled button
    const getButtonTooltip = () => {
        if (allUserPlanning?.length > 0) {
            return `Report planned tasks before you create ${activeCadence} plan`;
        }
        if (objective?.items?.length === 0) {
            return 'Create Objective before you Plan';
        }
        if (isActive) {
            return `Please create ${planningPeriodHierarchy?.parentPlan?.name} Plan before creating ${activeCadence} Plan`;
        }
        return '';
    };

    const sectionTitle = getSectionTitle(activeCadence, viewMode);
    const buttonText = getButtonText(activeCadence, viewMode);
    const cadenceTagText = getCadenceTagText(activeCadence);

    const isLoading = viewMode === 'planning' ? isPlanningLoading : isReportingLoading;
    const totalItems = viewMode === 'planning' ? planningData?.meta?.totalItems : reportingData?.meta?.totalItems;

    return (
        <div className="min-h-screen w-full bg-gray-100 px-12">
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <CustomBreadcrumb
                            title="Planning & Reporting"
                            subtitle="OKR Settings"
                        />
                    </div>
                    <Segmented
                        size="large"
                        value={activeTab}
                        onChange={(value) => setActiveTab(Number(value))}
                        options={[
                            { label: 'Planning', value: 1 },
                            { label: 'Reporting', value: 2 },
                        ]}
                        className="bg-[#F5F5F7] p-1 rounded-lg shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] border border-[#E5E7EB] [&_.ant-segmented-item]:transition-all [&_.ant-segmented-item]:rounded-md [&_.ant-segmented-item]:px-4 [&_.ant-segmented-item]:py-1.5 [&_.ant-segmented-item]:text-sm [&_.ant-segmented-item]:font-medium [&_.ant-segmented-item]:h-auto [&_.ant-segmented-item]:leading-normal [&_.ant-segmented-item-selected]:!bg-white [&_.ant-segmented-item-selected]:shadow-sm [&_.ant-segmented-item-selected]:text-[#161A2C] [&_.ant-segmented-item-label]:!text-[#161A2C] [&_.ant-segmented-item-selected_.ant-segmented-item-label]:!text-[#161A2C]"
                    />
                </div>

                <div className="pt-2 flex justify-center pb-2">
                    <Tabs
                        defaultActiveKey="weekly"
                        activeKey={activeCadence}
                        onChange={(key) => setActiveCadence(key as Cadence)}
                        items={cadenceTabs}
                        tabBarGutter={32}
                        className="[&_.ant-tabs-nav]:m-0 [&_.ant-tabs-nav-list]:flex [&_.ant-tabs-nav-list]:justify-center [&_.ant-tabs-tab]:px-0 [&_.ant-tabs-tab]:py-2 [&_.ant-tabs-tab]:text-sm [&_.ant-tabs-tab]:font-medium [&_.ant-tabs-tab]:!text-[#161A2C] [&_.ant-tabs-tab]:transition-all [&_.ant-tabs-tab]:mr-4 [&_.ant-tabs-tab:last-child]:mr-0 [&_.ant-tabs-tab-active]:text-[#161A2C] [&_.ant-tabs-tab-active]:font-semibold [&_.ant-tabs-ink-bar]:bg-[#574CFF] [&_.ant-tabs-ink-bar]:h-[3px] [&_.ant-tabs-ink-bar]:rounded-sm [&_.ant-tabs-nav::before]:border-b [&_.ant-tabs-nav::before]:border-[#F1F2F6]"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3 pb-4">
                    <Select
                        className="w-full min-w-[180px] flex-1 md:w-auto [&_.ant-select-selector]:!border-[#E5E7EB] [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!bg-[#F5F5F7] [&_.ant-select-selector]:!py-2.5 [&_.ant-select-selector]:!px-3 [&_.ant-select-selector]:!min-h-[48px] [&_.ant-select-selector]:!h-12 [&_.ant-select-selection-placeholder]:!text-[#8F94A3] [&_.ant-select-selection-placeholder]:!leading-7 [&_.ant-select-selection-placeholder]:!pt-0 [&_.ant-select-selection-item]:!text-[#161A2C] [&_.ant-select-selection-item]:!leading-7 [&_.ant-select-selection-item]:!pt-0 [&.ant-select]:!h-12 [&.ant-select-focused_.ant-select-selector]:!border-[#574CFF] [&.ant-select-focused_.ant-select-selector]:!shadow-[0_0_0_2px_rgba(87,76,255,0.1)] [&.ant-select-focused_.ant-select-selector]:!bg-[#F5F5F7] [&.ant-select-open_.ant-select-selector]:!bg-[#F5F5F7]"
                        placeholder="Select employee"
                        options={employeeOptions}
                        onChange={handleEmployeeChange}
                        defaultValue="all"
                        size="large"
                        showSearch
                        optionFilterProp="label"
                        filterOption={(input, option) =>
                            (option?.label?.toString().toLowerCase().includes(input.toLowerCase())) ?? false
                        }
                    />
                    <Select
                        className="w-full min-w-[160px] flex-1 md:w-auto [&_.ant-select-selector]:!border-[#E5E7EB] [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!bg-[#F5F5F7] [&_.ant-select-selector]:!py-2.5 [&_.ant-select-selector]:!px-3 [&_.ant-select-selector]:!min-h-[48px] [&_.ant-select-selector]:!h-12 [&_.ant-select-selection-placeholder]:!text-[#8F94A3] [&_.ant-select-selection-placeholder]:!leading-7 [&_.ant-select-selection-placeholder]:!pt-0 [&_.ant-select-selection-item]:!text-[#161A2C] [&_.ant-select-selection-item]:!leading-7 [&_.ant-select-selection-item]:!pt-0 [&.ant-select]:!h-12 [&.ant-select-focused_.ant-select-selector]:!border-[#574CFF] [&.ant-select-focused_.ant-select-selector]:!shadow-[0_0_0_2px_rgba(87,76,255,0.1)] [&.ant-select-focused_.ant-select-selector]:!bg-[#F5F5F7] [&.ant-select-open_.ant-select-selector]:!bg-[#F5F5F7]"
                        placeholder="Plan type"
                        options={planTypeOptions}
                        onChange={handlePlanTypeChange}
                        value={selectedPlanType}
                        size="large"
                    />
                    <Select
                        className="w-full min-w-[160px] flex-1 md:w-auto [&_.ant-select-selector]:!border-[#E5E7EB] [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!bg-[#F5F5F7] [&_.ant-select-selector]:!py-2.5 [&_.ant-select-selector]:!px-3 [&_.ant-select-selector]:!min-h-[48px] [&_.ant-select-selector]:!h-12 [&_.ant-select-selection-placeholder]:!text-[#8F94A3] [&_.ant-select-selection-placeholder]:!leading-7 [&_.ant-select-selection-placeholder]:!pt-0 [&_.ant-select-selection-item]:!text-[#161A2C] [&_.ant-select-selection-item]:!leading-7 [&_.ant-select-selection-item]:!pt-0 [&.ant-select]:!h-12 [&.ant-select-focused_.ant-select-selector]:!border-[#574CFF] [&.ant-select-focused_.ant-select-selector]:!shadow-[0_0_0_2px_rgba(87,76,255,0.1)] [&.ant-select-focused_.ant-select-selector]:!bg-[#F5F5F7] [&.ant-select-open_.ant-select-selector]:!bg-[#F5F5F7]"
                        placeholder="Department"
                        options={departmentOptions}
                        onChange={handleDepartmentChange}
                        value={selectedDepartment}
                        size="large"
                        showSearch
                        optionFilterProp="label"
                        filterOption={(input, option) =>
                            (option?.label?.toString().toLowerCase().includes(input.toLowerCase())) ?? false
                        }
                    />
                    <Tooltip title={getButtonTooltip()}>
                        <div style={{ display: 'inline-block' }}>
                            {userPlanningPeriodId && (
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    size="large"
                                    className="h-11 min-w-[200px] rounded-xl px-6 font-semibold text-white shadow-[0_10px_20px_rgba(87,76,255,0.25)] !bg-[#574CFF] !border-[#574CFF] hover:!bg-[#4F46EF] hover:!border-[#4F46EF]"
                                    style={{ boxShadow: '0 10px 20px rgba(87, 76, 255, 0.25)' }}
                                    onClick={() => setIsDrawerOpen(true)}
                                    disabled={isAddButtonDisabled}
                                    loading={isHierarchyLoading}
                                >
                                    {buttonText}
                                </Button>
                            )}
                        </div>
                    </Tooltip>
                </div>
            </div>

            <section className="mt-8">
                <div className="space-y-6">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => <PlanCardSkeleton key={i} />)
                    ) : plans.length > 0 ? (
                        plans.map((plan: PlanSummary) => (
                            <PlanCard key={plan.id} plan={plan} viewMode={viewMode} activeCadence={activeCadence} />
                        ))
                    ) : (
                        <div className="py-12 text-center text-[#8F94A3]">
                            No {viewMode === 'planning' ? 'plans' : 'reports'} found for this
                            period.
                        </div>
                    )}
                </div>

                <div className="mt-6 w-full">
                    {isMobile || isTablet ? (
                        <CustomMobilePagination
                            totalResults={totalItems ?? 0}
                            pageSize={pageSize}
                            onChange={(page, pageSize) => {
                                setPage(page);
                                setPageSize(pageSize);
                            }}
                            onShowSizeChange={(size) => {
                                setPageSize(size);
                                setPage(1);
                            }}
                        />
                    ) : (
                        <CustomPagination
                            current={page}
                            total={totalItems || 1}
                            pageSize={pageSize}
                            onChange={(page, pageSize) => {
                                setPage(page);
                                setPageSize(pageSize);
                            }}
                            onShowSizeChange={(size) => {
                                setPageSize(size);
                                setPage(1);
                            }}
                        />
                    )}
                </div>
            </section>

            <AddDailyPlanDrawer
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                viewMode={viewMode}
                planningPeriodId={planningPeriodId}
                activeCadence={activeCadence}
            />
        </div>
    );
}
