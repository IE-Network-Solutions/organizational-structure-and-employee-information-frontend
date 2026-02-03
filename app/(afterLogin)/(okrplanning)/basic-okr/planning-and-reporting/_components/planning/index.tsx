'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Button, Dropdown, MenuProps, Empty, Tooltip, Modal } from 'antd';
import { FaPlus } from 'react-icons/fa';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
dayjs.extend(advancedFormat);
import { BsChevronDown } from "react-icons/bs";
import PlanFilters from './PlanFilters';
import BasicPlanCard from './BasicPlanCard';
import CustomPagination from '@/components/customPagination';
import PlanCardSkeleton from '@/app/(afterLogin)/(planningAndReporting)/planning-and-reporting/_components/cards/PlanCardSkeleton';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import {
    useGetPlanning,
    useGetReporting,
    useDefaultPlanningPeriods,
    AllPlanningPeriods,
    useGetUserPlanning,
    useGetPlanningPeriodsHierarchy
} from '@/store/server/features/okrPlanningAndReporting/queries';
import {
    useDeletePlanById,
    useCreateBasicReport,
    useApprovalPlanningPeriods,
    useUpdateStatus
} from '@/store/server/features/okrPlanningAndReporting/mutations';
import { useCreatePlanTasks, useUpdatePlanTasks } from '@/store/server/features/employees/planning/mutation';
import { useFetchObjectives } from '@/store/server/features/employees/planning/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import { groupPlanTasksByKeyResultAndMilestone } from '@/app/(afterLogin)/(planningAndReporting)/planning-and-reporting/_components/dataTransformer/plan';
import { transformToPlanSummary } from '@/app/(afterLogin)/(planningAndReporting)/planning-and-reporting/_components/dataTransformer/vamp';
import { Cadence, ViewMode } from '@/app/(afterLogin)/(planningAndReporting)/planning-and-reporting/_components/types';
import DailyPlanModal from './modals/DailyPlanModal';
import WeeklyMonthlyPlanModal from './modals/WeeklyMonthlyPlanModal';
import ReportModal from './modals/ReportModal';

export default function BasicPlanning() {
    const { userId } = useAuthenticationStore();
    const {
        activePlanPeriod,
        page,
        setPage,
        pageSize,
        setPageSize,
        activePlanPeriodId,
        selectedUser,
        setSelectedUser,
        allSessionsOfYear,
        selectedSessionIds,
        setAllSessionsOfYear,
        setActivePlanPeriodId,
        activePlanPeriodId: storeActivePlanPeriodId,
        setSelectedFiscalYearId
    } = PlanningAndReportingStore();

    const [planningPeriodType, setPlanningPeriodType] = useState<'monthly' | 'weekly' | 'daily'>('weekly');
    const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);
    const [isWeeklyMonthlyModalOpen, setIsWeeklyMonthlyModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportingPlan, setReportingPlan] = useState<any>(null);
    const [isEdit, setIsEdit] = useState(false);
    const [editingData, setEditingData] = useState<any>(null);

    // Filter states
    const [selectedDepartment, setSelectedDepartment] = useState<string | undefined>(undefined);
    const [selectedPlanType, setSelectedPlanType] = useState<string>('all');

    const { data: employeeData, isLoading: loadingEmployees } = useGetAllUsers();
    const { data: objective } = useFetchObjectives(userId);
    const { data: userPlanningPeriods } = AllPlanningPeriods();
    const { data: departmentData } = useGetDepartmentsWithUsers();
    const { data: activeFiscalYear } = useGetActiveFiscalYears();

    // mutations
    const { mutate: createPlanTasks, isLoading: isCreating } = useCreatePlanTasks();
    const { mutate: updatePlanTasks, isLoading: isUpdating } = useUpdatePlanTasks();
    const { mutate: updateTaskStatus } = useUpdateStatus();
    const { mutate: deletePlan } = useDeletePlanById();
    const { mutate: createReport, isLoading: isReporting } = useCreateBasicReport();
    const { mutate: approvePlan } = useApprovalPlanningPeriods();

    // Auto-set Fiscal Year and Sessions
    useEffect(() => {
        if (activeFiscalYear && allSessionsOfYear.length === 0) {
            setSelectedFiscalYearId(activeFiscalYear.id || null);
            const sessionIds = activeFiscalYear.sessions?.map((s: any) => s.id) || [];
            setAllSessionsOfYear(sessionIds);
        }
    }, [activeFiscalYear, allSessionsOfYear.length, setAllSessionsOfYear, setSelectedFiscalYearId]);

    // Auto-set Default Planning Period
    useEffect(() => {
        if (userPlanningPeriods && !storeActivePlanPeriodId) {
            const periodId = userPlanningPeriods[0]?.id;
            if (periodId) {
                setActivePlanPeriodId(periodId);
            }
        }
    }, [userPlanningPeriods, storeActivePlanPeriodId, setActivePlanPeriodId]);

    // Get planning periods
    const weeklyPeriod = userPlanningPeriods?.find((p: any) => p.planningPeriod?.name?.toLowerCase() === 'weekly');
    const dailyPeriod = userPlanningPeriods?.find((p: any) => p.planningPeriod?.name?.toLowerCase() === 'daily');
    const monthlyPeriod = userPlanningPeriods?.find((p: any) => p.planningPeriod?.name?.toLowerCase() === 'monthly');

    const weeklyPlanningUserId = weeklyPeriod?.id;
    const dailyPlanningUserId = dailyPeriod?.id;
    const monthlyPlanningUserId = monthlyPeriod?.id;

    // Fetch Planning Data (Filtered)
    const { data: weeklyPlanningData, isLoading: isLoadingWeekly } = useGetPlanning({
        userId: selectedUser,
        planPeriodId: weeklyPeriod?.planningPeriod?.id ?? '',
        page: 1,
        pageSize: 100,
        sessionId: selectedSessionIds.length > 0 ? selectedSessionIds : allSessionsOfYear,
    });

    const { data: dailyPlanningData, isLoading: isLoadingDaily } = useGetPlanning({
        userId: selectedUser,
        planPeriodId: dailyPeriod?.planningPeriod?.id ?? '',
        page: 1,
        pageSize: 100,
        sessionId: selectedSessionIds.length > 0 ? selectedSessionIds : allSessionsOfYear,
    });

    // Fetch Reporting Data to get achievement points
    const { data: weeklyReportingData } = useGetReporting({
        userId: selectedUser,
        planPeriodId: weeklyPeriod?.planningPeriod?.id ?? '',
        pageReporting: 1,
        pageSizeReporting: 100,
        sessionId: selectedSessionIds.length > 0 ? selectedSessionIds : allSessionsOfYear,
    });

    const { data: dailyReportingData } = useGetReporting({
        userId: selectedUser,
        planPeriodId: dailyPeriod?.planningPeriod?.id ?? '',
        pageReporting: 1,
        pageSizeReporting: 100,
        sessionId: selectedSessionIds.length > 0 ? selectedSessionIds : allSessionsOfYear,
    });

    // Disabling logic data
    const { data: userDailyPlans } = useGetUserPlanning(dailyPeriod?.planningPeriod?.id || '', '1');
    const { data: userWeeklyPlans } = useGetUserPlanning(weeklyPeriod?.planningPeriod?.id || '', '2');
    const { data: userMonthlyPlans } = useGetUserPlanning(monthlyPeriod?.planningPeriod?.id || '', '3');

    const { data: dailyHierarchy } = useGetPlanningPeriodsHierarchy(userId, dailyPeriod?.planningPeriod?.id || '');
    const { data: weeklyHierarchy } = useGetPlanningPeriodsHierarchy(userId, weeklyPeriod?.planningPeriod?.id || '');

    const isDailyDisabled = useMemo(() => {
        const hasUnreportedPlan = userDailyPlans && userDailyPlans.length > 0;
        const noParentPlan = dailyHierarchy?.parentPlan && (
            (dailyHierarchy.parentPlan.plans?.length ?? 0) === 0 ||
            (dailyHierarchy.parentPlan.plans?.filter((p: any) => !p.isReported).length ?? 0) === 0
        );
        return hasUnreportedPlan || noParentPlan || (objective?.items?.length ?? 0) === 0;
    }, [userDailyPlans, dailyHierarchy, objective]);

    const isWeeklyDisabled = useMemo(() => {
        const hasUnreportedPlan = userWeeklyPlans && userWeeklyPlans.length > 0;
        const noParentPlan = weeklyHierarchy?.parentPlan && (
            (weeklyHierarchy.parentPlan.plans?.length ?? 0) === 0 ||
            (weeklyHierarchy.parentPlan.plans?.filter((p: any) => !p.isReported).length ?? 0) === 0
        );
        return hasUnreportedPlan || noParentPlan || (objective?.items?.length ?? 0) === 0;
    }, [userWeeklyPlans, weeklyHierarchy, objective]);

    const isMonthlyDisabled = useMemo(() => {
        const hasUnreportedPlan = userMonthlyPlans && userMonthlyPlans.length > 0;
        return hasUnreportedPlan || (objective?.items?.length ?? 0) === 0;
    }, [userMonthlyPlans, objective]);

    const isLoadingLoad = isLoadingWeekly || isLoadingDaily;

    const getEmployeeData = (id: string) => {
        return employeeData?.items?.find((emp: any) => emp?.id === id) || {};
    };

    // Check if data belongs to an active session
    const isDataFromActiveSession = (createdAt: string): boolean => {
        if (!activeFiscalYear?.sessions) return true;
        const dataDate = dayjs(createdAt);
        const activeSession = activeFiscalYear.sessions.find((session: any) => {
            const sessionStart = dayjs(session.startDate);
            const sessionEnd = dayjs(session.endDate);
            return session.active &&
                (dataDate.isAfter(sessionStart) || dataDate.isSame(sessionStart)) &&
                (dataDate.isBefore(sessionEnd) || dataDate.isSame(sessionEnd));
        });
        return !!activeSession;
    };

    const getDateLabel = (createdAt: string, cadence: string): string => {
        const planDate = dayjs(createdAt);
        const today = dayjs();
        const type = 'Plan';
        const cadenceType = cadence.charAt(0).toUpperCase() + cadence.slice(1);

        if (planDate.isSame(today, 'day')) return `Today's ${cadenceType} ${type}`;
        const yesterday = dayjs().subtract(1, 'day');
        if (planDate.isSame(yesterday, 'day')) return `Yesterday's ${cadenceType} ${type}`;
        return `${planDate.format('MMM D')} ${cadenceType} ${type}`;
    };

    // Filter Helper functions from main planning
    const getUserIdsByDepartmentId = (departmentId: string) => {
        const department = departmentData?.find((dep: any) => dep.id === departmentId);
        if (department && department.users) {
            return department.users.map((user: any) => user.id);
        }
        return [];
    };

    const employeeOptions = useMemo(() => {
        const options = [{ label: 'All employees', value: 'all' }];
        if (employeeData?.items) {
            let employeesToShow = employeeData.items;
            if (selectedDepartment && selectedDepartment !== 'all') {
                const departmentUserIds = getUserIdsByDepartmentId(selectedDepartment);
                employeesToShow = employeeData.items.filter((emp: any) => departmentUserIds.includes(emp.id));
            }
            employeesToShow.forEach((emp: any) => {
                const name = `${emp.firstName || ''} ${emp.middleName || ''} ${emp.lastName || ''}`.trim();
                if (name) options.push({ label: name, value: emp.id });
            });
        }
        return options;
    }, [employeeData, selectedDepartment, departmentData]);

    const departmentOptions = useMemo(() => {
        const options = [{ label: 'All Departments', value: 'all' }];
        if (departmentData) {
            departmentData.forEach((dept: any) => {
                if (dept.name) options.push({ label: dept.name, value: dept.id });
            });
        }
        return options;
    }, [departmentData]);

    const planTypeOptions = [
        { label: 'All Plans', value: 'all' },
        { label: 'My Plans', value: 'myPlan' },
        { label: 'Subordinate Plans', value: 'subordinatePlan' },
    ];

    const handleEmployeeChange = (value: string) => {
        setSelectedDepartment(undefined);
        setSelectedPlanType('all');
        setSelectedUser(value === 'all' ? ['all'] : [value]);
        setPage(1);
    };

    const handlePlanTypeChange = (value: string) => {
        setSelectedDepartment(undefined);
        setSelectedPlanType(value);
        if (value === 'all') {
            setSelectedUser(['all']);
        } else if (value === 'myPlan') {
            setSelectedUser([userId]);
        } else if (value === 'subordinatePlan') {
            const subordinates = employeeData?.items?.filter((e: any) => (e.delegatedTo?.id || e.reportingTo?.id) === userId).map((e: any) => e.id) || [];
            setSelectedUser(subordinates.length > 0 ? ['subordinate', ...subordinates] : ['subordinate']);
        }
        setPage(1);
    };

    const handleDepartmentChange = (value: string) => {
        setSelectedDepartment(value);
        if (value === 'all') {
            if (selectedPlanType === 'all') setSelectedUser(['all']);
            else if (selectedPlanType === 'myPlan') setSelectedUser([userId]);
            else handlePlanTypeChange('subordinatePlan');
        } else {
            const departmentUserIds = getUserIdsByDepartmentId(value);
            if (selectedPlanType === 'all') {
                setSelectedUser(departmentUserIds.length > 0 ? departmentUserIds : []);
            } else if (selectedPlanType === 'myPlan') {
                setSelectedUser(departmentUserIds.includes(userId) ? [userId] : []);
            } else {
                const subordinates = employeeData?.items?.filter((e: any) => (e.delegatedTo?.id || e.reportingTo?.id) === userId && departmentUserIds.includes(e.id)).map((e: any) => e.id) || [];
                setSelectedUser(subordinates.length > 0 ? ['subordinate', ...subordinates] : ['subordinate']);
            }
        }
        setPage(1);
    };

    const combinedPlanningData = useMemo(() => {
        const weeklyItems = weeklyPlanningData?.items?.map((item: any) => ({ ...item, isWeekly: true })) ?? [];
        const dailyItems = dailyPlanningData?.items?.map((item: any) => ({ ...item, isWeekly: false })) ?? [];
        const combined = [...weeklyItems, ...dailyItems];
        return combined.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }, [weeklyPlanningData, dailyPlanningData]);

    const transformedData = groupPlanTasksByKeyResultAndMilestone(combinedPlanningData);

    const combinedReportingData = useMemo(() => {
        const weeklyItems = weeklyReportingData?.items || [];
        const dailyItems = dailyReportingData?.items || [];
        return [...weeklyItems, ...dailyItems];
    }, [weeklyReportingData, dailyReportingData]);

    const planSummaries = useMemo(() => {
        return transformedData?.map((dataItem: any) => {
            const rawItem = combinedPlanningData?.find((i: any) => i.id === dataItem.id);
            const cadence = (rawItem?.isWeekly ? 'weekly' : 'daily') as Cadence;

            const report = combinedReportingData.find((r: any) => r.planId === dataItem.id);
            const isReported = rawItem?.isReported || !!rawItem?.report || (Array.isArray(rawItem?.reports) && rawItem.reports.length > 0) || !!report;

            const summary = transformToPlanSummary(
                { ...dataItem, isValidated: rawItem?.isValidated },
                'planning' as ViewMode,
                cadence,
                employeeData
            );

            // Enrich tasks with status (backend: pre_pending | pre_failed | pre_achieved | completed | in-progress)
            if (summary.tasks && rawItem?.tasks) {
                summary.tasks = summary.tasks.map((t: any) => {
                    const rawTask = rawItem.tasks.find((rt: any) => rt.id === t.id);
                    const rawStatus = rawTask?.status;
                    // Map backend enum to frontend: pre_achieved/completed → completed, pre_failed → failed, else → pending
                    const toFrontend = (s: string) => {
                        if (!s) return 'pending';
                        const x = String(s).toLowerCase();
                        if (x === 'pre_achieved' || x === 'completed') return 'completed';
                        if (x === 'pre_failed') return 'failed';
                        return 'pending';
                    };
                    const status = rawStatus !== undefined && rawStatus !== null && rawStatus !== ''
                        ? toFrontend(rawStatus)
                        : (rawTask?.isAchieved === true ? 'completed' : rawTask?.isAchieved === false ? 'failed' : t.status || 'pending');
                    return { ...t, status };
                });
            }

            // For reported cards, show report comments (not plan comments) so add/display match
            const comments = isReported && report ? (report.comments || []) : (summary.comments || []);
            const commentCount = isReported && report ? (report.comments?.length ?? 0) : (summary.commentCount ?? 0);

            return {
                ...summary,
                isReported,
                reportId: report?.id || rawItem?.report?.id,
                reportedDate: rawItem?.reportedDate || rawItem?.report?.createdAt || report?.createdAt,
                comments,
                commentCount,
            };
        }) || [];
    }, [transformedData, employeeData, combinedPlanningData, combinedReportingData]);

    const handleTaskStatusChange = (taskId: string, newStatus: string) => {
        const plan = combinedPlanningData.find(p => p.tasks?.some((t: any) => t.id === taskId));
        if (!plan) return;
        // Backend PlanTaskStatus enum: pre_pending | pre_failed | pre_achieved | (deprecated: in-progress | completed)
        const backendStatus = newStatus === 'completed' ? 'pre_achieved' : newStatus === 'failed' ? 'pre_failed' : 'pre_pending';
        updateTaskStatus({
            id: taskId,
            status: backendStatus,
            planningPeriodId: plan.planningPeriod?.id || plan.planPeriod?.id
        });
    };

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: (
                <div className="text-[#101828] text-lg font-medium pt-2">
                    Are you sure you want to delete this plan
                </div>
            ),
            icon: null,
            okText: 'Delete',
            cancelText: 'Cancel',
            centered: true,
            okButtonProps: {
                style: {
                    backgroundColor: '#D92D20',
                    borderColor: '#D92D20',
                    color: 'white',
                    borderRadius: '8px',
                    height: '44px',
                    fontWeight: '600',
                    padding: '0 20px',
                }
            },
            cancelButtonProps: {
                style: {
                    borderRadius: '8px',
                    height: '44px',
                    fontWeight: '600',
                    padding: '0 20px',
                    color: '#344054',
                    borderColor: '#D0D5DD',
                }
            },
            onOk() {
                deletePlan(id);
            },
        });
    };

    const handleEdit = (planSummary: any) => {
        const rawPlan = combinedPlanningData.find((p: any) => p.id === planSummary.id);
        if (!rawPlan) return;
        setIsEdit(true);
        const cadence = (rawPlan.isWeekly ? 'weekly' : 'daily') as 'weekly' | 'daily' | 'monthly';
        setPlanningPeriodType(cadence);
        const formattedTasks = rawPlan.tasks.map((t: any) => ({
            id: t.id,
            title: t.task || t.title,
            priority: t.priority,
            weight: t.weight,
            parentTaskId: t.parentTaskId,
            objectiveId: t.keyResult?.objectiveId || t.objectiveId,
            keyResultId: t.keyResultId || t.keyResult?.id
        }));
        setEditingData({ id: rawPlan.id, tasks: formattedTasks });
        if (cadence === 'daily') setIsDailyModalOpen(true);
        else setIsWeeklyMonthlyModalOpen(true);
    };

    const handleAddDailyPlan = (values: any) => {
        const allWeeklyTasks = weeklyPlanningData?.items?.flatMap((p: any) => p.tasks || []) || [];

        const findParentPlan = (parentId: string) => {
            return weeklyPlanningData?.items?.find((p: any) => p.tasks?.some((t: any) => t.id === parentId));
        };

        if (isEdit) {
            const updatedTasks = values.tasks.map((task: any) => {
                const parentTask = allWeeklyTasks.find((t: any) => t.id === task.parentTaskId);
                const parentPlan = findParentPlan(task.parentTaskId);
                return {
                    id: String(task.id),
                    title: task.title,
                    task: task.title,
                    priority: task.priority?.toLowerCase() || 'medium',
                    weight: Number(task.weight),
                    planningPeriodId: String(dailyPeriod?.planningPeriod?.id || ''),
                    planningUserId: String(dailyPlanningUserId || ''),
                    userId: String(userId || ''),
                    parentTaskId: task.parentTaskId ? String(task.parentTaskId) : null,
                    parentPlanId: parentPlan?.id ? String(parentPlan.id) : null,
                    keyResultId: parentTask?.keyResultId || parentTask?.keyResult?.id ? String(parentTask.keyResultId || parentTask.keyResult.id) : null,
                    milestoneId: parentTask?.milestoneId || parentTask?.milestone?.id ? String(parentTask.milestoneId || parentTask.milestone.id) : null,
                    planId: String(editingData?.id || '')
                };
            });
            updatePlanTasks({ tasks: updatedTasks });
            setIsDailyModalOpen(false); setIsEdit(false); setEditingData(null);
        } else {
            createPlanTasks({
                tasks: values.tasks.map((task: any) => {
                    const parentTask = allWeeklyTasks.find((t: any) => t.id === task.parentTaskId);
                    const parentPlan = findParentPlan(task.parentTaskId);
                    return {
                        ...task,
                        task: task.title,
                        priority: task.priority?.toLowerCase() || 'medium',
                        userId,
                        planningPeriodId: dailyPeriod?.planningPeriod?.id,
                        planningUserId: dailyPlanningUserId,
                        parentTaskId: task.parentTaskId || null,
                        parentPlanId: parentPlan?.id || null,
                        keyResultId: parentTask?.keyResultId || parentTask?.keyResult?.id || null,
                        milestoneId: parentTask?.milestoneId || parentTask?.milestone?.id || null
                    };
                })
            }, { onSuccess: () => setIsDailyModalOpen(false) });
        }
    };

    const handleAddWeeklyMonthlyPlan = (values: any) => {
        const periodId = planningPeriodType === 'weekly' ? weeklyPeriod?.planningPeriod?.id : monthlyPeriod?.planningPeriod?.id;
        const planningUserId = planningPeriodType === 'weekly' ? weeklyPlanningUserId : monthlyPlanningUserId;

        if (isEdit) {
            const updatedTasks = values.tasks.map((task: any) => ({
                id: String(task.id),
                title: task.title,
                task: task.title,
                priority: task.priority?.toLowerCase() || 'medium',
                weight: Number(task.weight),
                planningPeriodId: String(periodId || ''),
                planningUserId: String(planningUserId || ''),
                userId: String(userId || ''),
                objectiveId: task.objectiveId ? String(task.objectiveId) : null,
                keyResultId: task.keyResultId ? String(task.keyResultId) : null,
                planId: String(editingData?.id || '')
            }));
            updatePlanTasks({ tasks: updatedTasks });
            setIsWeeklyMonthlyModalOpen(false); setIsEdit(false); setEditingData(null);
        } else {
            createPlanTasks({
                tasks: values.tasks.map((task: any) => ({
                    ...task,
                    task: task.title,
                    priority: task.priority?.toLowerCase() || 'medium',
                    userId,
                    planningPeriodId: periodId,
                    planningUserId: planningUserId,
                    objectiveId: task.objectiveId || null,
                    keyResultId: task.keyResultId || null
                }))
            }, { onSuccess: () => setIsWeeklyMonthlyModalOpen(false) });
        }
    };

    const planMenuItems: MenuProps['items'] = useMemo(() => {
        const items: any[] = [];

        if (monthlyPeriod) {
            items.push({
                key: '1',
                label: (
                    <Tooltip title={isMonthlyDisabled ? (userMonthlyPlans?.length > 0 ? "Report planned tasks before you create Monthly plan" : "Create Objective before you Plan") : ""}>
                        <span style={isMonthlyDisabled ? { color: '#8F94A3', cursor: 'not-allowed', opacity: 0.6 } : {}}>Monthly</span>
                    </Tooltip>
                ),
                disabled: isMonthlyDisabled,
                onClick: () => { setPlanningPeriodType('monthly'); setIsEdit(false); setIsWeeklyMonthlyModalOpen(true); }
            });
        }

        if (weeklyPeriod) {
            items.push({
                key: '2',
                label: (
                    <Tooltip title={isWeeklyDisabled ? (userWeeklyPlans?.length > 0 ? "Report planned tasks before you create Weekly plan" : (weeklyHierarchy?.parentPlan ? `Please create ${weeklyHierarchy.parentPlan.name} Plan before creating Weekly Plan` : "Create Objective before you Plan")) : ""}>
                        <span style={isWeeklyDisabled ? { color: '#8F94A3', cursor: 'not-allowed', opacity: 0.6 } : {}}>Weekly</span>
                    </Tooltip>
                ),
                disabled: isWeeklyDisabled,
                onClick: () => { setPlanningPeriodType('weekly'); setIsEdit(false); setIsWeeklyMonthlyModalOpen(true); }
            });
        }

        if (dailyPeriod) {
            items.push({
                key: '3',
                label: (
                    <Tooltip title={isDailyDisabled ? (userDailyPlans?.length > 0 ? "Report planned tasks before you create Daily plan" : (dailyHierarchy?.parentPlan ? `Please create ${dailyHierarchy.parentPlan.name} Plan before creating Daily Plan` : "Create Objective before you Plan")) : ""}>
                        <span style={isDailyDisabled ? { color: '#8F94A3', cursor: 'not-allowed', opacity: 0.6 } : {}}>Daily</span>
                    </Tooltip>
                ),
                disabled: isDailyDisabled,
                onClick: () => { setPlanningPeriodType('daily'); setIsEdit(false); setIsDailyModalOpen(true); }
            });
        }

        return items;
    }, [monthlyPeriod, weeklyPeriod, dailyPeriod, isMonthlyDisabled, isWeeklyDisabled, isDailyDisabled, userMonthlyPlans, userWeeklyPlans, userDailyPlans, weeklyHierarchy, dailyHierarchy]);

    const handleReport = (plan: any) => {
        setReportingPlan(plan);
        setIsReportModalOpen(true);
    };

    const handleSaveReport = (values: any) => {
        const tasksPayload: Record<string, any> = {};
        let achievedCount = 0;
        let totalCount = 0;

        values.tasks.forEach((formTask: any) => {
            if (formTask.isAchieved !== null) {
                totalCount += 1;
                if (formTask.isAchieved) achievedCount += 1;
                const originalTask = reportingPlan?.tasks?.find((t: any) => t.id === formTask.id);
                const targetValue = originalTask?.target || originalTask?.targetValue || 100;

                tasksPayload[formTask.id] = {
                    status: formTask.isAchieved ? 'Done' : 'Not',
                    actualValue: formTask.isAchieved ? targetValue : 0,
                    customReason: formTask.comment || ''
                };
            }
        });

        // Get planning period ID based on cadence
        const planPeriodId = reportingPlan.cadence === 'weekly' ? weeklyPeriod?.planningPeriod?.id :
            reportingPlan.cadence === 'daily' ? dailyPeriod?.planningPeriod?.id :
                monthlyPeriod?.planningPeriod?.id;

        // Get sessionId from selected sessions or all sessions
        const sessionId = selectedSessionIds.length > 0 
            ? selectedSessionIds[0] 
            : allSessionsOfYear.length > 0 
                ? allSessionsOfYear[0] 
                : undefined;

        const cadenceLabel = reportingPlan.cadence ? String(reportingPlan.cadence).charAt(0).toUpperCase() + String(reportingPlan.cadence).slice(1) : 'Report';
        const reportTitle = `${reportingPlan?.title ?? 'Plan'} - ${cadenceLabel} Report`;
        const reportScore = totalCount > 0 ? String(Math.round((achievedCount / totalCount) * 100)) : '0';

        // Prepare report data for CreateReportDTO (all required fields as strings)
        const reportData = {
            reportTitle,
            userId: String(userId ?? ''),
            status: 'Submitted',
            reportScore,
            tenantId: '', // mutation will set from store
            planId: reportingPlan.id,
            planningPeriodId: planPeriodId ?? '',
            tasks: tasksPayload
        };

        // Use the new endpoint without OKR calculations
        createReport({
            reportData: reportData,
            sessionId: sessionId
        }, {
            onSuccess: () => {
                setIsReportModalOpen(false);
                setReportingPlan(null);
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Planning</h1>
                <Dropdown menu={{ items: planMenuItems }} trigger={['click']}>
                    <Button type="primary" icon={<FaPlus className="text-sm" />} className="bg-blue-600 hover:bg-blue-700 h-10 px-6 rounded-lg font-medium flex items-center gap-2" disabled={(objective?.items?.length ?? 0) === 0}>
                        Add Plan <BsChevronDown className="ml-2 text-xs" />
                    </Button>
                </Dropdown>
            </div>

            <PlanFilters
                employeeOptions={employeeOptions}
                selectedEmployee={selectedUser?.[0] === 'all' ? 'all' : selectedUser?.[0]}
                handleEmployeeChange={handleEmployeeChange}
                planTypeOptions={planTypeOptions}
                selectedPlanType={selectedPlanType}
                handlePlanTypeChange={handlePlanTypeChange}
                departmentOptions={departmentOptions}
                selectedDepartment={selectedDepartment || 'all'}
                handleDepartmentChange={handleDepartmentChange}
                loadingEmployees={loadingEmployees}
            />

            <div className="space-y-4 mt-6">
                {isLoadingLoad ? Array.from({ length: 3 }).map((_, i) => <PlanCardSkeleton key={i} />) : planSummaries.length > 0 ? (
                    planSummaries.map((plan: any) => (
                        <BasicPlanCard
                            key={plan.id}
                            id={plan.id}
                            title={`${plan.cadence.charAt(0).toUpperCase() + plan.cadence.slice(1)} Plan`}
                            date={plan.createdAt ? dayjs(plan.createdAt).format('MMMM Do YYYY, h:mm:ss A') : 'N/A'}
                            reportedDate={plan.reportedDate ? dayjs(plan.reportedDate).format('MMMM Do YYYY, h:mm:ss A') : undefined}
                            isReported={plan.isReported}
                            tasks={plan.tasks || []}
                            isExpanded={true}
                            commentCount={plan.commentCount ?? 0}
                            comments={plan.comments ?? []}
                            reportId={plan.reportId}
                            onTaskStatusChange={handleTaskStatusChange}
                            onDelete={() => handleDelete(plan.id)}
                            onReport={() => handleReport(plan)}
                            owner={{ name: plan.owner?.name || 'Unknown', team: plan.owner?.role || 'N/A', avatar: plan.owner?.avatar, initials: plan.owner?.avatarInitials }}
                            planStatus={{
                                label: plan.status.label === 'Open' ? 'Pending' : plan.status.label,
                                date: plan.status.label === 'Closed' ? dayjs(plan.status.updatedAt).format('MMMM D YYYY, h:mm:ss A') : dayjs(plan.createdAt).format('MMMM D YYYY, h:mm:ss A'),
                                status: plan.status.label === 'Closed' ? 'success' as any : 'pending'
                            }}
                            onEdit={() => handleEdit(plan)}
                            onApprove={() => approvePlan({ id: plan.id, value: true })}
                            onOpen={() => approvePlan({ id: plan.id, value: false })}
                            canApprove={
                                String(userId) === String(getEmployeeData(plan.owner?.id)?.delegatedTo?.id || getEmployeeData(plan.owner?.id)?.reportingTo?.id)
                            }
                            canEdit={
                                String(userId) === String(plan.owner?.id) &&
                                (plan.status?.label === 'Open' || plan.status?.label === 'Pending') &&
                                !plan.isReported &&
                                isDataFromActiveSession(plan.createdAt)
                            }
                            canDelete={
                                String(userId) === String(plan.owner?.id) &&
                                (plan.status?.label === 'Open' || plan.status?.label === 'Pending') &&
                                !plan.isReported &&
                                isDataFromActiveSession(plan.createdAt)
                            }
                        />
                    ))
                ) : <div className="bg-white p-12 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-500"><Empty description="No plans found for this period" /></div>}
            </div>

            <div className="flex justify-center mt-6">
                <CustomPagination current={page} total={combinedPlanningData?.length || 0} pageSize={pageSize} onShowSizeChange={(size) => { setPageSize(size); setPage(1); }} onChange={(p, s) => { setPage(p); setPageSize(s); }} />
            </div>

            <DailyPlanModal
                open={isDailyModalOpen}
                onCancel={() => { setIsDailyModalOpen(false); setIsEdit(false); setEditingData(null); }}
                onAdd={handleAddDailyPlan}
                weeklyPlans={weeklyPlanningData?.items?.filter((p: any) => !p.isReported)?.map((p: any) => ({
                    id: p.id,
                    title: p.title || p.tasks?.[0]?.task || 'Untitled Weekly Plan',
                    tasks: p.tasks?.map((t: any) => ({ id: t.id, title: t.task || t.title })) || []
                })) || []}
                isLoading={isCreating || isUpdating}
                isEdit={isEdit}
                initialValues={editingData}
            />
            <WeeklyMonthlyPlanModal
                open={isWeeklyMonthlyModalOpen}
                onCancel={() => { setIsWeeklyMonthlyModalOpen(false); setIsEdit(false); setEditingData(null); }}
                onAdd={handleAddWeeklyMonthlyPlan}
                objectives={objective?.items?.map((obj: any) => ({
                    id: obj.id,
                    title: obj.title,
                    keyResults: obj.keyResults?.map((kr: any) => ({
                        id: kr.id,
                        title: kr.title
                    })) || []
                })) || []}
                isLoading={isCreating || isUpdating}
                type={planningPeriodType as 'weekly' | 'monthly'}
                isEdit={isEdit}
                initialValues={editingData}
            />
            <ReportModal open={isReportModalOpen} onCancel={() => { setIsReportModalOpen(false); setReportingPlan(null); }} onReport={handleSaveReport} plan={reportingPlan} isLoading={isReporting} />
        </div>
    );
}
