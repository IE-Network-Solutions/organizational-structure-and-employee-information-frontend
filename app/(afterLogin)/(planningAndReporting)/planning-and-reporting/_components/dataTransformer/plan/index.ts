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
        achieveMK: task?.achieveMK,

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
      achieveMK: task?.achieveMK,
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
      achieveMK: task.achieveMK,
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
          (task: any) => !task.milestone?.id,
        );
        const tasksWithParent = tasksWithoutMilestone?.filter(
          (task: any) => task?.parentTask?.id,
        );
        const tasksWithoutParent = tasksWithoutMilestone?.filter(
          (task: any) => !task?.parentTask?.id,
        );

        const groupedTaskData = groupByParentTask(tasksWithParent);

        const milestones = groupByMilestone(
          keyResult?.tasks?.filter((task: any) => task?.milestone?.id),
        );

        const enhancedMilestones = milestones.map((milestone: any) => {
          const haveParentTasks = milestone?.tasks?.filter(
            (task: any) => task?.parentTask?.id,
          );
          const haveNoParentTasks = milestone?.tasks?.filter(
            (task: any) => !task?.parentTask?.id,
          );
          const groupedTasksByParentTask = groupByParentTask(haveParentTasks);

          return {
            ...milestone,
            parentTask: groupedTasksByParentTask,
            tasks: haveNoParentTasks,
          };
        });

        return {
          ...keyResult,
          tasks: tasksWithoutParent,
          parentTask: groupedTaskData,
          milestones: enhancedMilestones,
        };
      }),
    };
  });
};

interface Task {
  id: string;
  keyResult: {
    id: string;
    objective: {
      id: string;
      [key: string]: any; // Additional properties of the objective
    };
    [key: string]: any; // Additional properties of the key result
  };
  milestone?: {
    id: string;
    [key: string]: any; // Additional properties of the milestone
  };
  [key: string]: any; // Additional properties of the task
}

interface MilestoneGroup {
  id: string;
  tasks: Task[];
  [key: string]: any; // Additional properties of the milestone
}

interface KeyResultGroup {
  id: string;
  milestones: MilestoneGroup[];
  tasks: Task[];
  [key: string]: any; // Additional properties of the key result
}

interface ObjectiveGroup {
  id: string;
  keyResults: KeyResultGroup[];
  [key: string]: any; // Additional properties of the objective
}

export function groupParentTasks(tasks: Task[]): ObjectiveGroup[] {
  const result: Record<string, ObjectiveGroup> = {};

  tasks.forEach((task) => {
    const objectiveId = task.keyResult.objective.id;
    const keyResultId = task.keyResult.id;
    const milestoneId = task.milestone ? task.milestone.id : null;

    // Ensure the structure for objectives
    if (!result[objectiveId]) {
      result[objectiveId] = {
        ...task.keyResult.objective,
        id: objectiveId,
        keyResults: [],
      } as ObjectiveGroup;
    }

    const objective = result[objectiveId];

    // Ensure the structure for key results
    if (!objective.keyResults.some((kr) => kr.id === keyResultId)) {
      objective.keyResults.push({
        ...task.keyResult,
        id: keyResultId,
        milestones: [],
        tasks: [],
      } as KeyResultGroup);
    }

    const keyResult = objective.keyResults.find((kr) => kr.id === keyResultId)!;

    // If the task has a milestone, group it under the milestone
    if (milestoneId) {
      if (!keyResult.milestones.some((ms) => ms.id === milestoneId)) {
        keyResult.milestones.push({
          id: milestoneId,
          ...task.milestone,
          tasks: [],
        } as MilestoneGroup);
      }

      const milestone = keyResult.milestones.find(
        (ms) => ms.id === milestoneId,
      )!;
      milestone.tasks.push({ ...task });
    } else {
      // If no milestone, group it directly under the key result
      keyResult.tasks.push({ ...task });
    }
  });

  // Convert the result object into an array for easier traversal if needed
  return Object.values(result).map((objective) => ({
    ...objective,
    keyResults: objective.keyResults.map((keyResult) => ({
      ...keyResult,
      milestones: keyResult.milestones,
    })),
  }));
}
