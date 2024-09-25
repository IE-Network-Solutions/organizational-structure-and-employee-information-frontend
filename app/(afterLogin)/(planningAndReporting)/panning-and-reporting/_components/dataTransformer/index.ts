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
      keyResult: { ...task.keyResult }, // Optionally include keyResult data
    });
    return acc;
  }, {}); // Start with an empty object
  return Object.values(milestoneMap);
};
export const groupTasksByKeyResultAndMilestone = (plans: any) => {
  const groupedDataByKeyResult = groupTasksByKeyResultId(plans);

  return groupedDataByKeyResult?.map((plan: any) => {
    return {
      ...plan,
      keyResults: plan?.keyResults?.map((keyResult: any) => {
        const tasksWithoutMilestone = keyResult?.tasks?.filter(
          (task: any) => !task.milestone,
        );
        const milestones = groupByMilestone(
          keyResult?.tasks?.filter((task: any) => task.milestone),
        );
        return {
          ...keyResult,
          tasks: tasksWithoutMilestone, // Tasks without a milestone
          milestones: milestones, // Grouped tasks with a milestone
        };
      }),
    };
  });
};
