export const groupTasksByKeyResultAndMilestone = (reportTasks: any) => {
  const keyResultMap = reportTasks?.reduce((acc: any, task: any) => {
    const keyResultId = task.planTask.keyResultId;

    // Initialize the keyResult entry if it doesn't exist
    if (!acc[keyResultId]) {
      acc[keyResultId] = {
        ...task.planTask.keyResult,
        tasks: [],
        milestones: [],
      };
    }

    const { milestone } = task.planTask;

    const taskObject = {
      taskId: task.planTaskId,
      taskName: task.planTask.task,
      priority: task.planTask.priority,
      status: task.status,
      actualValue: task.actualValue,
      isAchived: task.isAchived,
      customReason: task.customReason,
    };

    // If milestone is null or undefined, push task directly to the tasks array
    if (!milestone) {
      acc[keyResultId].tasks.push(taskObject);
    } else {
      // Find if the milestone already exists in the milestones array
      let existingMilestone = acc[keyResultId].milestones.find(
        (m: any) => m.id === milestone.id,
      );
      // If the milestone doesn't exist, create it
      if (!existingMilestone) {
        existingMilestone = {
          ...milestone,
          tasks: [],
        };
        acc[keyResultId].milestones.push(existingMilestone);
      }
      // Add the task to the milestone's tasks array
      existingMilestone.tasks.push(taskObject);
    }

    return acc;
  }, {});
  const keyResultArray = Object.values(keyResultMap);
  return keyResultArray;
};

export const groupUnReportedTasksByKeyResultAndMilestone = (
  reportTasks: any,
) => {
  const keyResultMap = reportTasks?.reduce((acc: any, task: any) => {
    const keyResultId = task.keyResultId;

    // Initialize the keyResult entry if it doesn't exist
    if (!acc[keyResultId]) {
      acc[keyResultId] = {
        ...task.keyResult,
        tasks: [],
        milestones: [],
      };
    }

    const { milestone } = task;

    const taskObject = {
      ...task, // Include all attributes of planTask
      taskId: task?.id,
      taskName: task?.task,
      priority: task?.priority,
      actualValue: task?.actualValue || 0,
      targetValue: task?.targetValue || 0,
    };

    // If milestone is null or undefined, push task directly to the tasks array
    if (!milestone) {
      acc[keyResultId].tasks.push(taskObject);
    } else {
      // Find if the milestone already exists in the milestones array
      let existingMilestone = acc[keyResultId].milestones.find(
        (m: any) => m.id === milestone.id,
      );
      // If the milestone doesn't exist, create it
      if (!existingMilestone) {
        existingMilestone = {
          ...milestone,
          tasks: [],
        };
        acc[keyResultId].milestones.push(existingMilestone);
      }
      // Add the task to the milestone's tasks array
      existingMilestone.tasks.push(taskObject);
    }

    return acc;
  }, {});

  const keyResultArray = Object.values(keyResultMap);
  // Group key results by objective ID
  const objectiveMap: any = keyResultArray.reduce(
    (acc: any, keyResult: any) => {
      const objectiveId = keyResult.objectiveId;

      if (!acc[objectiveId]) {
        acc[objectiveId] = {
          ...keyResult.objective,
          keyResults: [],
        };
      }

      acc[objectiveId].keyResults.push(keyResult);
      return acc;
    },
    {},
  );

  // Convert objective map to array
  const objectiveArray = Object.values(objectiveMap);

  return objectiveArray;
};
