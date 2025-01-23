const groupTasksByKeyResultId = (plans: any) => {
  return plans?.map((plan: any) => {
    const keyResultMap: any = {};
    plan?.tasks?.forEach((task: any) => {
      const keyResultId = task?.keyResult?.id;
      if (!keyResultMap[keyResultId]) {
        keyResultMap[keyResultId] = {
          ...task?.keyResult,
          tasks: [],
        };
      }
      keyResultMap[keyResultId].tasks.push({
        id: task?.id,
        task: task?.task,
        priority: task?.priority,
        createdAt: task?.createdAt,
        updatedAt: task?.updatedAt,
        targetValue: task?.targetValue,
        weight: task?.weight,
        parentTask: task?.parentTask,
        milestone: { ...task?.milestone },
      });
    });
    const resultPlan = {
      ...plan,
      keyResults: Object.values(keyResultMap),
    };
    // Delete the tasks property
    delete resultPlan.tasks;

    return resultPlan;
  });
};
const groupByMilestone = (tasks: any[]) => {
  const milestoneMap = tasks.reduce((acc: any, task: any) => {
    const milestone = task.milestone;
    const milestoneId = milestone.id;
    if (!acc[milestoneId]) {
      acc[milestoneId] = {
        ...milestone, // Include milestone properties (id, name, etc.)
        tasks: [], // Initialize an empty tasks array
      };
    }
    acc[milestoneId].tasks.push({
      id: task.id,
      task: task.task,
      priority: task.priority,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      targetValue: task.targetValue,
      weight: task.weight,
      parentTask: task?.parentTask,
      keyResult: { ...task.keyResult }, // Optionally include keyResult data
    });
    return acc;
  }, {}); // Start with an empty object
  return Object.values(milestoneMap);
};

const groupByParentTask = (tasks: any[]) => {
  const parentTaskMap: any = {};

  tasks.forEach((task) => {
    const parentTask = task.parentTask;
    if (!parentTask || !parentTask.id) return;

    if (!parentTaskMap[parentTask.id]) {
      parentTaskMap[parentTask.id] = {
        ...parentTask,
        tasks: [],
      };
    }

    parentTaskMap[parentTask.id].tasks.push({
      id: task.id,
      task: task.task,
      priority: task.priority,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      targetValue: task.targetValue,
      weight: task.weight,
    });
  });
    return Object.values(parentTaskMap);
};


export const groupPlanTasksByKeyResultAndMilestone = (plans: any) => {
  const groupedDataByKeyResult = groupTasksByKeyResultId(plans);

  return groupedDataByKeyResult?.map((plan: any) => {
    return {
      ...plan,
      keyResults: plan?.keyResults?.map((keyResult: any) => {
        const tasksWithoutMilestone = keyResult?.tasks?.filter(
          (task: any) => !task.milestone,
        );
        const tasksWithParent = tasksWithoutMilestone?.filter((task: any) => task?.parentTask?.id);
        const tasksWithoutParent = tasksWithoutMilestone?.filter((task: any) => !task?.parentTask?.id);
        const groupedTaskData = groupByParentTask(tasksWithParent);

        const milestones = groupByMilestone(
          keyResult?.tasks?.filter((task: any) => task.milestone),
        );

        const enhancedMilestones = milestones.map((milestone: any) => {
          const haveParentTasks = milestone?.tasks?.filter((task: any) => task?.parentTask?.id);
          const haveNoParentTasks = milestone?.tasks?.filter((task: any) => !task?.parentTask?.id);
          const groupedTasksByParentTask = groupByParentTask(haveParentTasks);

          return {
            ...milestone,
            parentTask: groupedTasksByParentTask,
            tasks: haveNoParentTasks,
          };
        });

        return {
          ...keyResult,
          tasks: groupedTaskData,
          parentTask: tasksWithoutParent,
          milestones: enhancedMilestones,
        };
      }),
    };
  });
};

