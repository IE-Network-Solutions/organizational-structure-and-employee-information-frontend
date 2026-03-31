import React from 'react';
import StatPill from './StatPill';
import { PlanSummary, KeyResult } from './types';

interface KRSummaryBarProps {
  plan: PlanSummary;
  viewMode: 'planning' | 'reporting';
  keyResult?: KeyResult;
}

export default function KRSummaryBar({
  plan,
  viewMode,
  keyResult,
}: KRSummaryBarProps) {
  // Collect all tasks from this specific keyResult
  const getAllKeyResultTasks = (kr: typeof keyResult): any[] => {
    if (!kr) return [];
    const tasks: any[] = [];

    // Add direct tasks
    if (kr.tasks) {
      tasks.push(...kr.tasks);
    }

    // Add milestone tasks
    kr.milestones?.forEach((milestone: any) => {
      if (milestone.tasks) {
        tasks.push(...milestone.tasks);
      }
      // Add parent tasks within milestones
      milestone.parentTask?.forEach((parent: any) => {
        if (parent.tasks) {
          tasks.push(...parent.tasks);
        }
      });
    });

    // Add parent tasks
    kr.parentTask?.forEach((parent: any) => {
      if (parent.tasks) {
        tasks.push(...parent.tasks);
      }
    });

    return tasks;
  };

  // Calculate values from this specific keyResult's tasks
  const calculateKeyResultValues = () => {
    if (!keyResult) {
      // If no keyResult, use plan-level values as fallback
      return {
        target: plan.target ?? 0,
        achieved: plan.achieved ?? 0,
        progress: plan.progress ?? 0,
      };
    }

    // Always calculate from tasks in this specific keyResult to ensure accuracy
    // This ensures we only reflect this key result's metric type, not the whole plan
    const allKRTasks = getAllKeyResultTasks(keyResult);

    // Calculate target from all tasks in this keyResult
    const target = allKRTasks.reduce((sum: number, task: any) => {
      const taskTarget =
        viewMode === 'planning'
          ? (task.target ?? 0)
          : (task.target ?? task.planTask?.targetValue ?? 0);
      return sum + taskTarget;
    }, 0);

    // Calculate achieved from all tasks in this keyResult (for reporting mode)
    // Achieved is the sum of weights of tasks that are completed/achieved (passed)
    // IMPORTANT: We ALWAYS recalculate from task weights, never use keyResult.currentValue
    const achieved =
      viewMode === 'reporting'
        ? (() => {
            // Filter to only completed/achieved tasks
            const completedTasks = allKRTasks.filter((task: any) => {
              // Check if task is completed/achieved/passed
              const taskStatus = task.status;
              const isAchieved = task.isAchieved === true;
              const isCompleted =
                taskStatus === 'completed' || taskStatus === 'Done';
              // Only count tasks that are explicitly marked as achieved/completed
              return isAchieved || isCompleted;
            });

            // Sum the WEIGHTS of completed tasks (not their achieved values)
            const sumOfWeights = completedTasks.reduce(
              (sum: number, task: any) => {
                const taskWeight = Number(task.weight) || 0;
                return sum + taskWeight;
              },
              0,
            );

            return sumOfWeights;
          })()
        : 0;

    // Calculate progress based on achieved vs target
    // Use keyResult's targetValue if available, otherwise use calculated target
    const finalTarget = keyResult.targetValue ?? target;
    const progress =
      finalTarget > 0 && viewMode === 'reporting'
        ? Math.round((achieved / finalTarget) * 100)
        : (keyResult.progress ?? plan.progress ?? 0);

    return {
      target: finalTarget,
      achieved: achieved, // Always use calculated achieved from this key result's tasks
      progress,
    };
  };

  const values = calculateKeyResultValues();
  const metricType = keyResult?.metricType?.name || plan.milestoneLabel;

  // Format numbers to remove trailing zeros (e.g., 100.000 -> 100, 15.00025 -> 15.00025)
  const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '0';
    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
    if (isNaN(num)) return '0';
    // If it's a whole number, return without decimals
    if (num % 1 === 0) {
      return num.toString();
    }
    // For decimals, remove only trailing zeros after the decimal point
    const str = num.toString();
    return str;
  };

  const toSentenceCase = (str: string): string => {
    if (!str) return 'N/A';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <div
      data-cy="-planningandreporting-planning-and-reporting-components-krsummarybar-tsx-krsummarybar-div-142"
      className="flex max-w-[1089px] min-h-[22px] w-full flex-row flex-wrap items-center gap-2 p-0"
    >
      <StatPill
        label="Metric"
        value={toSentenceCase(metricType)}
        variant="milestone"
      />
      <StatPill
        label="Target"
        value={formatNumber(values.target)}
        variant="target"
      />
      <StatPill
        label="Achieved"
        value={formatNumber(values.achieved)}
        variant="achieved"
      />
      <StatPill
        label="Key Result Progress"
        value={`${formatNumber(Number(values.progress))}%`}
        variant="progress"
      />
    </div>
  );
}
