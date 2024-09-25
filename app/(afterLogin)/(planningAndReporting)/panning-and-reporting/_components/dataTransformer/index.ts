// Group tasks by milestone
export const groupTasksByMilestone = (plans: any) => {
  return plans?.map((plan: any) => {
    const groupedTasks = {
      ...plan,
      milestones: groupByMilestone(plan?.tasks), // Assign the array of milestones for each plan
      keyResults: groupTasksWithoutMilestoneByKeyResult(plan?.tasks), // Group tasks without milestones by key result
    };

    // Remove the original tasks data
    delete groupedTasks.tasks; // Remove the tasks key from the groupedTasks object

    return groupedTasks || [];
  });
};

// Helper function to group tasks by milestone
const groupByMilestone = (tasks: any) => {
  const milestoneMap = tasks.reduce((acc: any, task: any) => {
    // Skip tasks where the milestone does not exist or is null
    if (!task?.milestone) {
      return acc; // Continue to the next iteration
    }

    const milestoneId = task.milestone.id; // No need for fallback since we are skipping null milestones

    // If the milestone is not already added, initialize it with its data and an empty tasks array
    if (!acc[milestoneId]) {
      acc[milestoneId] = {
        ...task.milestone, // Assign the milestone data
        tasks: [], // Initialize the tasks array
      };
    }

    // Push the task under the respective milestone
    acc[milestoneId].tasks.push({
      id: task?.id,
      task: task?.task,
      priority: task?.priority,
      createdAt: task?.createdAt,
      updatedAt: task?.updatedAt,
      targetValue: task?.targetValue,
      weight: task?.weight,
      keyResult: { ...task?.keyResult }, // Keep key result data if needed
    });

    return acc;
  }, {});

  // Convert the milestone map to an array of milestone objects
  return Object.values(milestoneMap);
};

// Helper function to group tasks by key result
const groupTasksWithoutMilestoneByKeyResult = (tasks: any) => {
  // Filter tasks that have no milestone key or have a null milestone
  const tasksWithoutMilestone = tasks.filter(
    (task: any) => !task.milestone || task.milestone === null,
  );

  // Group the filtered tasks by key result
  const keyResultMap = tasksWithoutMilestone.reduce((acc: any, task: any) => {
    const keyResultId = task?.keyResult?.id || 'noKeyResult'; // Handle tasks without key results

    // If the key result is not already added, initialize it with its data and an empty tasks array
    if (!acc[keyResultId]) {
      acc[keyResultId] = {
        ...(task?.keyResult || { id: 'noKeyResult', name: 'No Key Result' }), // Use a placeholder for tasks without a key result
        tasks: [], // Initialize the tasks array
      };
    }

    // Push the task under the respective key result
    acc[keyResultId].tasks.push({
      id: task.id,
      task: task.task,
      priority: task.priority,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      targetValue: task.targetValue,
      weight: task?.weight,
      milestone: { ...task.milestone }, // Keep milestone data if needed
    });

    return acc;
  }, {});

  // Convert the key result map to an array of key result objects
  return Object.values(keyResultMap);
};
