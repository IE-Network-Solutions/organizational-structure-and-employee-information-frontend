import { FC } from 'react';
import MilestoneTasks from './milestoneTasks';
import TasksDisplayer from '../reporting/milestone';
import { PlanningVpnKeyIcon } from '../PlanningVpnKeyIcon';
import StatPill from '../StatPill';
import { PR_BORDER, PR_PRIMARY, PR_TEXT, PR_TEXT_MUTED } from '../planningUiTokens';
interface KeyResultTasksProps {
  keyResult?: any;
  keyResultIndex: number;
  activeTab: number;
}

const KeyResultTasks: FC<KeyResultTasksProps> = ({
  keyResult,
  keyResultIndex,
  activeTab,
}) => {
  const metricTypeName = keyResult?.metricType?.name;

  const targetValue =
    metricTypeName === 'Milestone'
      ? keyResult?.milestones?.length || 0
      : metricTypeName === 'Achieve'
        ? '100'
        : Number(keyResult?.targetValue)?.toLocaleString() || 0;

  const achievedValue =
    metricTypeName === 'Milestone'
      ? keyResult?.milestones?.filter((e: any) => e.status === 'Completed')
          ?.length || 0
      : metricTypeName === 'Achieve'
        ? keyResult?.progress
        : (
            Number(keyResult?.currentValue) + Number(keyResult?.initialValue)
          )?.toLocaleString() || 0;

  const progressValue = `${keyResult?.progress || 0}%`;

  return (
    <div
      className="my-3 rounded-lg border bg-white pb-6 shadow-none"
      style={{ borderColor: PR_BORDER }}
      data-cy={`key-result-tasks-container-${keyResultIndex}`}
    >
      <div
        className="grid gap-4 px-3 pt-4 sm:px-6"
        data-cy={`key-result-tasks-grid-${keyResultIndex}`}
      >
        <div
          className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
          data-cy={`key-result-tasks-header-${keyResultIndex}`}
        >
          <div className="min-w-0" data-cy={`key-result-tasks-title-section-${keyResultIndex}`}>
            <div
              className="flex items-center gap-2"
              data-cy={`key-result-tasks-title-container-${keyResultIndex}`}
            >
              <PlanningVpnKeyIcon
                size={22}
                color={PR_PRIMARY}
                className="flex-shrink-0"
                data-cy={`key-result-tasks-vpn-key-${keyResultIndex}`}
              />
              <div className="min-w-0">
                <div
                  className="text-xs font-semibold"
                  style={{ color: PR_TEXT_MUTED }}
                  data-cy={`key-result-tasks-subtitle-${keyResultIndex}`}
                >
                  Key Result
                </div>
                <h2
                  className="text-sm font-bold leading-snug text-[#161A2C] sm:text-base"
                  style={{ color: PR_TEXT }}
                  data-cy={`key-result-tasks-title-${keyResultIndex}`}
                >
                  {keyResult?.title}
                </h2>
              </div>
            </div>
          </div>

          <div
            className="flex flex-wrap items-center gap-2 sm:justify-end"
            data-cy={`key-result-tasks-metrics-row-${keyResultIndex}`}
          >
            <StatPill
              label={metricTypeName === 'Milestone' ? 'Milestones' : 'Target'}
              value={targetValue}
              variant={metricTypeName === 'Milestone' ? 'milestone' : 'target'}
            />
            <StatPill label="Achieved" value={achievedValue} variant="achieved" />
            <StatPill label="KR Progress" value={progressValue} variant="progress" />
          </div>
        </div>
      </div>
      {activeTab === 1 ? (
        <MilestoneTasks keyResultIndex={keyResultIndex} keyResult={keyResult} />
      ) : (
        <>
          {keyResult?.milestones?.map(
            (milestone: any, milestoneIndex: number) => (
              <TasksDisplayer key={milestoneIndex} tasks={milestone?.tasks} />
            ),
          )}
          <TasksDisplayer tasks={keyResult?.tasks} />
        </>
      )}
    </div>
  );
};

export default KeyResultTasks;
