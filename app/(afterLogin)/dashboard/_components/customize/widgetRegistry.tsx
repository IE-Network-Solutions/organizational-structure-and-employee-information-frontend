import LeftBar from '../leftBar';
import RightBar from '../rightBar';
import Calender from '../action-plan/calender';
import ThisWeeksAttendanceReviewCard from '../attendance-review';
import AverageOkrCard from '../header/cards/AverageOkrCard';
import CompanyOkrCard from '../header/cards/CompanyOkrCard';
import AppreciationCard from '../header/cards/AppreciationCard';
import ReprimandCard from '../header/cards/ReprimandCard';
import VariablePayCard from '../header/cards/VariablePayCard';
import DaysPresentCard from '../attendance-stats/DaysPresentCard';
import LateArrivalsCard from '../attendance-stats/LateArrivalsCard';
import LeavesTakenCard from '../attendance-stats/LeavesTakenCard';
import ClosedDaysSummaryCard from '../attendance-stats/ClosedDaysSummaryCard';
import RecentFeedbacks from '../recent-feedbacks';
import EventEssentials from '../event-essentials';
import {
  BirthdaysWidget,
  EmployeeOfTheWeekWidget,
  LeaderOfTheWeekWidget,
  WorkAnniversariesWidget,
} from './eventCards';
import type {
  DashboardPlanKey,
  DashboardPlanView,
  DashboardWidgetDefinition,
} from './types';

export const DASHBOARD_WIDGET_DEFINITIONS: DashboardWidgetDefinition[] = [
  {
    id: 'kpi-average-okr',
    title: 'Your Average OKR',
    minW: 10,
    minH: 8,
    defaultW: 12,
    defaultH: 8,
    render: () => <AverageOkrCard />,
  },
  {
    id: 'kpi-company-okr',
    title: 'Company OKR',
    minW: 10,
    minH: 8,
    defaultW: 12,
    defaultH: 8,
    render: () => <CompanyOkrCard />,
  },
  {
    id: 'kpi-appreciation',
    title: 'Appreciation',
    minW: 10,
    minH: 8,
    defaultW: 12,
    defaultH: 8,
    render: () => <AppreciationCard />,
  },
  {
    id: 'kpi-reprimand',
    title: 'Reprimand',
    minW: 10,
    minH: 8,
    defaultW: 12,
    defaultH: 8,
    render: () => <ReprimandCard />,
  },
  {
    id: 'kpi-variable-pay',
    title: 'Total Variable Pay',
    minW: 10,
    minH: 8,
    defaultW: 12,
    defaultH: 8,
    render: () => <VariablePayCard />,
  },
  {
    id: 'kpi-days-present',
    title: 'Days Present',
    minW: 10,
    minH: 8,
    defaultW: 15,
    defaultH: 8,
    render: () => <DaysPresentCard />,
  },
  {
    id: 'kpi-late-arrivals',
    title: 'Late Arrivals',
    minW: 10,
    minH: 8,
    defaultW: 15,
    defaultH: 8,
    render: () => <LateArrivalsCard />,
  },
  {
    id: 'kpi-leaves-taken',
    title: 'Leaves Taken',
    minW: 10,
    minH: 8,
    defaultW: 15,
    defaultH: 8,
    render: () => <LeavesTakenCard />,
  },
  {
    id: 'kpi-closed-days',
    title: 'Closed Days',
    minW: 10,
    minH: 8,
    defaultW: 15,
    defaultH: 8,
    render: () => <ClosedDaysSummaryCard />,
  },
  {
    id: 'my-plan',
    title: 'My Plan',
    minW: 15,
    minH: 10,
    defaultW: 20,
    defaultH: 16,
    render: () => <LeftBar />,
  },
  {
    id: 'attendance-review',
    title: "This Week's Attendance",
    minW: 15,
    minH: 12,
    defaultW: 20,
    defaultH: 20,
    render: () => <ThisWeeksAttendanceReviewCard />,
  },
  {
    id: 'recent-feedbacks',
    title: 'Recent Feedbacks',
    minW: 15,
    minH: 10,
    defaultW: 20,
    defaultH: 16,
    render: () => <RecentFeedbacks />,
  },
  {
    id: 'approval-status',
    title: 'Approval Status',
    minW: 15,
    minH: 12,
    defaultW: 20,
    defaultH: 18,
    render: (plan: DashboardPlanView) => <RightBar type={plan} />,
  },
  {
    id: 'birthdays',
    title: "Today's Birthday",
    minW: 10,
    minH: 8,
    defaultW: 15,
    defaultH: 10,
    render: () => <BirthdaysWidget />,
  },
  {
    id: 'work-anniversaries',
    title: 'Work Anniversary',
    minW: 10,
    minH: 8,
    defaultW: 15,
    defaultH: 10,
    render: () => <WorkAnniversariesWidget />,
  },
  {
    id: 'leader-of-the-week',
    title: 'Leader of the Week',
    minW: 10,
    minH: 8,
    defaultW: 15,
    defaultH: 10,
    render: () => <LeaderOfTheWeekWidget />,
  },
  {
    id: 'employee-of-the-week',
    title: 'Employee of the Week',
    minW: 10,
    minH: 8,
    defaultW: 15,
    defaultH: 10,
    render: () => <EmployeeOfTheWeekWidget />,
  },
  {
    id: 'event-essentials',
    title: 'Birthdays & Anniversaries',
    minW: 30,
    minH: 8,
    defaultW: 60,
    defaultH: 10,
    render: () => <EventEssentials />,
  },
  {
    id: 'calendar',
    title: 'Calendar',
    minW: 30,
    minH: 20,
    defaultW: 60,
    defaultH: 32,
    render: () => <Calender />,
  },
];

const WIDGETS_BY_ID = new Map(
  DASHBOARD_WIDGET_DEFINITIONS.map((definition) => [definition.id, definition]),
);

/** Widgets each plan is allowed to place on its dashboard. */
const PLAN_WIDGET_IDS: Record<DashboardPlanKey, string[]> = {
  performance: [
    'kpi-average-okr',
    'kpi-company-okr',
    'kpi-appreciation',
    'kpi-reprimand',
    'kpi-variable-pay',
    'my-plan',
    'attendance-review',
    'recent-feedbacks',
    'approval-status',
    'birthdays',
    'work-anniversaries',
    'leader-of-the-week',
    'employee-of-the-week',
    'calendar',
  ],
  enterprise: [
    'kpi-average-okr',
    'kpi-company-okr',
    'kpi-appreciation',
    'kpi-reprimand',
    'kpi-variable-pay',
    'my-plan',
    'attendance-review',
    'approval-status',
    'recent-feedbacks',
    'birthdays',
    'work-anniversaries',
    'leader-of-the-week',
    'employee-of-the-week',
    'calendar',
  ],
  essential: [
    'kpi-days-present',
    'kpi-late-arrivals',
    'kpi-leaves-taken',
    'kpi-closed-days',
    'attendance-review',
    'approval-status',
    'event-essentials',
  ],
};

export function getWidgetDefinition(id: string) {
  return WIDGETS_BY_ID.get(id);
}

export function getPlanWidgetIds(planKey: DashboardPlanKey) {
  return PLAN_WIDGET_IDS[planKey];
}

/** Definitions available to a plan, in catalog order. */
export function getPlanWidgetDefinitions(planKey: DashboardPlanKey) {
  return PLAN_WIDGET_IDS[planKey]
    .map((id) => WIDGETS_BY_ID.get(id))
    .filter((definition): definition is DashboardWidgetDefinition =>
      Boolean(definition),
    );
}

export function toDashboardPlanKey(plan: DashboardPlanView): DashboardPlanKey {
  if (plan === 'Essential Plan ') return 'essential';
  if (plan === 'Enterprise Plan') return 'enterprise';
  return 'performance';
}
