  export const groupTasksByKeyResultAndMilestone=(reportTasks:any)=>{
    const keyResultMap = reportTasks.reduce((acc:any, task:any) => {
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
      };
    
      // If milestone is null or undefined, push task directly to the tasks array
      if (!milestone) {
        acc[keyResultId].tasks.push(taskObject);
      } else {
        // Find if the milestone already exists in the milestones array
        let existingMilestone = acc[keyResultId].milestones.find(
          (m:any) => m.id === milestone.id
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
    console.log(keyResultArray,"reporttask")
    return keyResultArray;
}