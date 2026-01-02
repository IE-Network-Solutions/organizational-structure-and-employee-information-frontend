import { PlanSummary, PlanTask, KeyResult, ViewMode, Cadence, Milestone } from '../types';

/**
 * Normalize priority values to match the expected format
 */
const normalizePriority = (priority: string | undefined): 'Low' | 'Medium' | 'High' => {
  if (!priority) return 'Medium';
  const normalized = priority.toLowerCase();
  if (normalized === 'high') return 'High';
  if (normalized === 'low') return 'Low';
  return 'Medium';
};

/**
 * Get task status for reporting mode
 */
const getTaskStatus = (task: any, viewMode: ViewMode): 'completed' | 'pending' | 'failed' | undefined => {
  if (viewMode === 'reporting') {
    if (task.isAchieved === true) return 'completed';
    if (task.isAchieved === false) return 'failed';
    return task.status || 'pending';
  }
  return undefined;
};

/**
 * Transform a single task to PlanTask format
 */
const transformTask = (task: any, viewMode: ViewMode): PlanTask => {
  const baseTask: PlanTask = {
    id: task.id || task.taskId || '',
    title: task.taskName || task.task || task.title || task.name || 'Untitled Task',
    priority: normalizePriority(task.priority),
    weight: task.weight || 0,
    hasAttachment: task.hasAttachment || false,
  };

  if (viewMode === 'planning') {
    baseTask.target = task.targetValue || task.target || 0;
  } else {
    baseTask.achieved = task.actualValue || task.achievedValue || task.achieved || 0;
    baseTask.status = getTaskStatus(task, viewMode);
    // For reporting, use weightPlan if available
    baseTask.weight = task.weightPlan || task.planTask?.weight || task.weight || 0;
  }

  return baseTask;
};

/**
 * Transform keyResult data structure
 */
const transformKeyResult = (keyResult: any, viewMode: ViewMode): KeyResult => {
  const isMilestoneMetric = keyResult.metricType?.name === 'Milestone';
  
  // Transform tasks - filter out empty tasks
  const transformedTasks = (keyResult.tasks || [])
    .filter((task: any) => task?.task || task?.title || task?.name) // Exclude empty tasks
    .map((task: any) => transformTask(task, viewMode));

  // Transform milestones
  const transformedMilestones = (keyResult.milestones || []).map((milestone: any) => ({
    id: milestone.id || '',
    name: milestone.name,
    title: milestone.title || milestone.name,
    tasks: (milestone.tasks || [])
      .filter((task: any) => task?.task || task?.title || task?.name) // Exclude empty tasks
      .map((task: any) => transformTask(task, viewMode)),
    parentTask: (milestone.parentTask || []).map((parent: any) => ({
      ...parent,
      tasks: (parent.tasks || [])
        .filter((task: any) => task?.task || task?.title || task?.name) // Exclude empty tasks
        .map((task: any) => transformTask(task, viewMode)),
    })),
  }));

  // Transform parent tasks
  const transformedParentTasks = (keyResult.parentTask || []).map((parent: any) => ({
    ...parent,
    tasks: (parent.tasks || [])
      .filter((task: any) => task?.task || task?.title || task?.name) // Exclude empty tasks
      .map((task: any) => transformTask(task, viewMode)),
  }));

  // For non-milestone metric types, promote milestone parentTask groups to keyResult level
  // This ensures we show parent tasks with subtasks directly under the key result
  let finalParentTasks = [...transformedParentTasks];
  let finalMilestones = [...transformedMilestones];
  let finalTasks = [...transformedTasks];
  
  if (!isMilestoneMetric) {
    // Extract all parentTask groups from milestones and merge into keyResult.parentTask
    const milestoneParentTasks = transformedMilestones.flatMap((m: Milestone) => m.parentTask || []);
    finalParentTasks = [...transformedParentTasks, ...milestoneParentTasks];
    
    // Also promote standalone tasks from milestones to keyResult.tasks
    // These are tasks that don't have a parentTask and aren't parents themselves
    const milestoneStandaloneTasks = transformedMilestones.flatMap((m: Milestone) => m.tasks || []);
    finalTasks = [...transformedTasks, ...milestoneStandaloneTasks];
    
    // Clear milestones for non-milestone metric types to avoid showing empty milestone sections
    finalMilestones = [];
  }

  // Calculate target and achieved values
  const allTasks = [
    ...finalTasks,
    ...finalMilestones.flatMap((m: Milestone) => [
      ...m.tasks,
      ...(m.parentTask || []).flatMap((p: any) => p.tasks || []),
    ]),
    ...finalParentTasks.flatMap((p: any) => p.tasks || []),
  ];

  const targetValue = allTasks.reduce((sum, t) => sum + (t.target || 0), 0);
  // Calculate achieved as sum of weights of completed/achieved tasks for this key result only
  // IMPORTANT: Sum the WEIGHTS of completed tasks, not the achieved values
  const achievedValue = viewMode === 'reporting'
    ? allTasks
        .filter(t => t.status === 'completed' || t.isAchieved === true)
        .reduce((sum, t) => sum + (Number(t.weight) || 0), 0)
    : 0;

  return {
    id: keyResult.id || '',
    name: keyResult.name,
    title: keyResult.title || keyResult.name,
    tasks: finalTasks,
    milestones: finalMilestones,
    parentTask: finalParentTasks,
    objective: keyResult.objective,
    metricType: keyResult.metricType,
    targetValue: keyResult.targetValue || targetValue,
    currentValue: achievedValue, // Always use calculated achieved value from this key result's tasks
    progress: keyResult.progress || 0,
  };
};

/**
 * Transform reporting data from groupTasksByKeyResultAndMilestone format to PlanSummary format
 */
export const transformReportToPlanSummary = (
  dataItem: any,
  cadence: Cadence,
  employeeData: any,
): PlanSummary => {
  // Find employee - if employeeData is not loaded yet, employee will be empty
  const employee = employeeData?.items?.find((emp: any) => emp?.id === (dataItem?.createdBy || dataItem?.userId)) || {};
  const firstName = employee?.firstName || '';
  const middleName = employee?.middleName || '';
  const lastName = employee?.lastName || '';
  // Use 'Unknown User' and 'N/A' as placeholders - UserInfo component will detect these and show skeleton
  const fullName = `${firstName} ${middleName} ${lastName}`.trim() || 'Unknown User';
  const initials = `${firstName.charAt(0)}${middleName.charAt(0)}`.toUpperCase() || 'UU';
  const department = employee?.employeeJobInformation?.[0]?.department?.name || 'N/A';

  // Transform keyResults from reportTask data
  const reportTasks = dataItem?.reportTask || [];
  const keyResultsMap: Record<string, any> = {};

  reportTasks.forEach((task: any) => {
    const krId = task?.planTask?.keyResultId || '';
    if (!keyResultsMap[krId]) {
      keyResultsMap[krId] = {
        ...task?.planTask?.keyResult,
        id: krId,
        tasks: [],
        milestones: [],
        parentTask: [],
      };
    }

    const taskObj = {
      id: task.id || task.taskId || '',
      title: task.planTask?.task || task.taskName || '',
      priority: normalizePriority(task.planTask?.priority || task.priority),
      weight: task.weightPlan || task.planTask?.weight || task.weight || 0,
      achieved: task.actualValue || task.achievedValue || 0,
      target: task.planTask?.targetValue || task.targetValue || 0,
      status: getTaskStatus(task, 'reporting'),
      hasAttachment: task.hasAttachment || false,
      parentTask: task?.planTask?.parentTask, // Include parentTask reference for grouping
    };

    const milestone = task?.planTask?.milestone;
    if (!milestone) {
      // Check if this task has a parentTask - if so, we'll group it later
      if (task?.planTask?.parentTask?.id) {
        // Store task with parentTask reference for later grouping
        keyResultsMap[krId].tasks.push(taskObj);
      } else {
        keyResultsMap[krId].tasks.push(taskObj);
      }
    } else {
      let existingMilestone = keyResultsMap[krId].milestones.find((m: any) => m.id === milestone.id);
      if (!existingMilestone) {
        existingMilestone = {
          ...milestone,
          id: milestone.id,
          title: milestone.title || milestone.name,
          tasks: [],
          parentTask: [],
        };
        keyResultsMap[krId].milestones.push(existingMilestone);
      }
      existingMilestone.tasks.push(taskObj);
    }
  });
  
  // Group parent tasks for each key result
  Object.values(keyResultsMap).forEach((kr: any) => {
    // Group tasks with parentTask at keyResult level
    const tasksWithParent = (kr.tasks || []).filter((t: any) => t?.parentTask?.id);
    const tasksWithoutParent = (kr.tasks || []).filter((t: any) => !t?.parentTask?.id);
    
    const parentTaskMap: Record<string, any> = {};
    tasksWithParent.forEach((task: any) => {
      const parentId = task.parentTask.id;
      if (!parentTaskMap[parentId]) {
        parentTaskMap[parentId] = {
          ...task.parentTask,
          id: parentId,
          task: task.parentTask.task || task.parentTask.title || task.parentTask.name,
          tasks: [],
        };
      }
      parentTaskMap[parentId].tasks.push(task);
    });
    
    kr.parentTask = Object.values(parentTaskMap);
    
    // Remove parent tasks that are already grouped, and tasks that are children
    const parentTaskIds = new Set(Object.keys(parentTaskMap));
    const childTaskIds = new Set(tasksWithParent.map((t: any) => t.id));
    
    kr.tasks = tasksWithoutParent.filter((t: any) => 
      !parentTaskIds.has(t.id) && 
      !childTaskIds.has(t.id) &&
      (t.title || t.taskName || t.task) // Exclude empty tasks
    );
    
    // Group parent tasks within milestones
    (kr.milestones || []).forEach((milestone: any) => {
      const milestoneTasksWithParent = (milestone.tasks || []).filter((t: any) => t?.parentTask?.id);
      const milestoneTasksWithoutParent = (milestone.tasks || []).filter((t: any) => !t?.parentTask?.id);
      
      const milestoneParentTaskMap: Record<string, any> = {};
      milestoneTasksWithParent.forEach((task: any) => {
        const parentId = task.parentTask.id;
        if (!milestoneParentTaskMap[parentId]) {
          milestoneParentTaskMap[parentId] = {
            ...task.parentTask,
            id: parentId,
            task: task.parentTask.task || task.parentTask.title || task.parentTask.name,
            tasks: [],
          };
        }
        milestoneParentTaskMap[parentId].tasks.push(task);
      });
      
      milestone.parentTask = Object.values(milestoneParentTaskMap);
      
      // Remove parent tasks that are already grouped, and tasks that are children
      const milestoneParentTaskIds = new Set(Object.keys(milestoneParentTaskMap));
      const milestoneChildTaskIds = new Set(milestoneTasksWithParent.map((t: any) => t.id));
      
      milestone.tasks = milestoneTasksWithoutParent.filter((t: any) => 
        !milestoneParentTaskIds.has(t.id) && 
        !milestoneChildTaskIds.has(t.id) &&
        (t.title || t.taskName || t.task) // Exclude empty tasks
      );
    });
  });

  const transformedKeyResults = Object.values(keyResultsMap).map((kr: any) => {
    const isMilestoneMetric = kr.metricType?.name === 'Milestone';
    
    // For non-milestone metric types, promote milestone parentTask groups to keyResult level
    let finalParentTasks = [...(kr.parentTask || [])];
    let finalMilestones = [...(kr.milestones || [])];
    let finalTasks = [...(kr.tasks || [])];
    
    if (!isMilestoneMetric) {
      // Extract all parentTask groups from milestones and merge into keyResult.parentTask
      const milestoneParentTasks = (kr.milestones || []).flatMap((m: any) => m.parentTask || []);
      finalParentTasks = [...(kr.parentTask || []), ...milestoneParentTasks];
      
      // Also promote standalone tasks from milestones to keyResult.tasks
      // These are tasks that don't have a parentTask and aren't parents themselves
      const milestoneStandaloneTasks = (kr.milestones || []).flatMap((m: any) => 
        (m.tasks || []).filter((t: any) => t?.title || t?.taskName || t?.task) // Exclude empty tasks
      );
      finalTasks = [...(kr.tasks || []), ...milestoneStandaloneTasks];
      
      // Clear milestones for non-milestone metric types to avoid showing empty milestone sections
      finalMilestones = [];
    }
    
    // Collect ALL tasks from this key result including:
    // - Direct tasks
    // - Tasks in milestones (only for milestone metric type)
    // - Tasks in parent tasks within milestones (only for milestone metric type)
    // - Tasks in parent tasks at key result level
    const allTasks = [
      ...finalTasks.filter((t: any) => t?.title || t?.taskName || t?.task), // Exclude empty tasks
      ...finalMilestones.flatMap((m: any) => [
        ...(m.tasks || []).filter((t: any) => t?.title || t?.taskName || t?.task),
        ...(m.parentTask || []).flatMap((p: any) => 
          (p.tasks || []).filter((t: any) => t?.title || t?.taskName || t?.task)
        )
      ]),
      ...finalParentTasks.flatMap((p: any) => 
        (p.tasks || []).filter((t: any) => t?.title || t?.taskName || t?.task)
      ),
    ];
    
    // Calculate achieved as sum of weights of completed/achieved tasks
    // IMPORTANT: Sum the WEIGHTS of completed tasks, not the achieved values
    const achieved = allTasks
      .filter((t: any) => {
        // Check if task is completed/achieved
        return t.status === 'completed' || t.isAchieved === true;
      })
      .reduce((sum: number, t: any) => {
        // Use weight, not achieved value
        return sum + (Number(t.weight) || 0);
      }, 0);
    
    const totalWeight = allTasks.reduce((sum: number, t: any) => sum + (t.weight || 0), 0);
    
    return {
      ...kr,
      tasks: finalTasks.filter((t: any) => t?.title || t?.taskName || t?.task), // Exclude empty tasks
      milestones: finalMilestones,
      parentTask: finalParentTasks,
      targetValue: kr.targetValue || 0,
      currentValue: achieved, // Sum of weights of achieved tasks for this key result only
      progress: totalWeight > 0 ? (achieved / totalWeight) * 100 : 0,
    };
  });

  // Calculate overall progress
  const allTasks = transformedKeyResults.flatMap(kr => [
    ...kr.tasks,
    ...kr.milestones.flatMap((m: any) => m.tasks),
  ]);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.status === 'completed').length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Calculate total achieved
  const achieved = allTasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + (Number(t.weight) || 0), 0);

  const summary = transformedKeyResults[0]?.title || 'No key result specified';
  const statusLabel = dataItem?.plan?.isReportValidated ? 'Closed' : 'Open';
  const statusTone = dataItem?.plan?.isReportValidated ? 'success' : 'warning';

  const comments = dataItem?.comments || [];
  const commentCount = comments.length;
  const commentAvatars = comments
    .slice(0, 3)
    .map((c: any) => c?.user?.profileImage)
    .filter(Boolean);

  return {
    id: dataItem.id || '',
    cadence: cadence,
    owner: {
      name: fullName,
      role: department,
      avatarInitials: initials,
      avatar: employee?.profileImage,
    },
    status: {
      label: statusLabel,
      updatedAt: dataItem.updatedAt || dataItem.createdAt || '',
      tone: statusTone,
    },
    metricLabel: transformedKeyResults[0]?.metricType?.name || 'N/A',
    milestoneLabel: transformedKeyResults[0]?.metricType?.name || 'N/A',
    target: 0, // Reports don't have targets
    achieved: achieved,
    progress: progress,
    summary: summary,
    tasks: allTasks,
    keyResults: transformedKeyResults,
    commentCount: commentCount,
    commentAvatars: commentAvatars,
    comments: comments, // Include full comments data
    createdAt: dataItem.createdAt || '',
    reprimandCount: dataItem.reprimandCount || 0,
    appreciationCount: dataItem.appreciationCount || 0,
  };
};

/**
 * Transform data from groupPlanTasksByKeyResultAndMilestone format to PlanSummary format
 */
export const transformToPlanSummary = (
  dataItem: any,
  viewMode: ViewMode,
  cadence: Cadence,
  employeeData: any,
): PlanSummary => {
  // Find employee - if employeeData is not loaded yet, employee will be empty
  const employee = employeeData?.items?.find((emp: any) => emp?.id === dataItem?.userId) || {};
  const firstName = employee?.firstName || '';
  const middleName = employee?.middleName || '';
  const lastName = employee?.lastName || '';
  // Use 'Unknown User' and 'N/A' as placeholders - UserInfo component will detect these and show skeleton
  const fullName = `${firstName} ${middleName} ${lastName}`.trim() || 'Unknown User';
  const initials = `${firstName.charAt(0)}${middleName.charAt(0)}`.toUpperCase() || 'UU';
  const department = employee?.employeeJobInformation?.[0]?.department?.name || 'N/A';

  // Transform keyResults
  const transformedKeyResults = (dataItem.keyResults || []).map((kr: any) => transformKeyResult(kr, viewMode));

  // Collect all tasks for flat list
  const allTasks: PlanTask[] = [];
  transformedKeyResults.forEach((kr: KeyResult) => {
    allTasks.push(...kr.tasks);
    kr.milestones?.forEach(m => {
      allTasks.push(...m.tasks);
      m.parentTask?.forEach(p => {
        allTasks.push(...p.tasks);
      });
    });
    kr.parentTask?.forEach(p => {
      allTasks.push(...p.tasks);
    });
  });

  // Calculate progress
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.status === 'completed').length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Calculate target and achieved
  const target = allTasks.reduce((sum, t) => sum + (t.target || 0), 0);
  const achieved = viewMode === 'reporting'
    ? allTasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.weight || 0), 0)
    : 0;

  // Get summary from first keyResult
  const summary = transformedKeyResults[0]?.title || 'No key result specified';

  // Determine status
  const statusLabel = dataItem?.isValidated ? 'Closed' : 'Open';
  const statusTone = dataItem?.isValidated ? 'success' : 'warning';

  // Get comment data
  const comments = dataItem?.comments || [];
  const commentCount = comments.length;
  const commentAvatars = comments
    .slice(0, 3)
    .map((c: any) => c?.user?.profileImage)
    .filter(Boolean);

  return {
    id: dataItem.id || '',
    cadence: cadence,
    owner: {
      name: fullName,
      role: department,
      avatarInitials: initials,
      avatar: employee?.profileImage,
    },
    status: {
      label: statusLabel,
      updatedAt: dataItem.updatedAt || dataItem.createdAt || '',
      tone: statusTone,
    },
    metricLabel: transformedKeyResults[0]?.metricType?.name || 'N/A',
    milestoneLabel: transformedKeyResults[0]?.metricType?.name || 'N/A',
    target: target,
    achieved: achieved,
    progress: progress,
    summary: summary,
    tasks: allTasks,
    keyResults: transformedKeyResults,
    commentCount: commentCount,
    commentAvatars: commentAvatars,
    comments: comments, // Include full comments data
    createdAt: dataItem.createdAt || '',
    reprimandCount: dataItem.reprimandCount || 0,
    appreciationCount: dataItem.appreciationCount || 0,
  };
};

