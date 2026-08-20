'use client';
import React, { createContext, useContext } from 'react';
import {
  AverageOkrKpiCard,
  CompanyOkrKpiCard,
  AppreciationKpiCard,
  ReprimandKpiCard,
  VpScoreKpiCard,
} from '../header/KpiWidgets';
import LeftBar from '../leftBar';
import RightBar from '../rightBar';
import Calender from '../action-plan/calender';
import {
  DaysPresentKpiCard,
  LateArrivalsKpiCard,
  LeavesTakenKpiCard,
  ClosedDaysKpiCard,
} from '../attendance-stats/AttendanceSummaryCards';
import ThisWeeksAttendanceReviewCard from '../attendance-review';
import RecentFeedbacks from '../recent-feedbacks';
import {
  BirthdayEventCard,
  AnniversaryEventCard,
  WeeklyLeaderEventCard,
  RockstarEventCard,
} from '../events/EventWidgets';
import {
  TodaysBirthdaysEssentialsCard,
  WorkAnniversariesEssentialsCard,
} from '../event-essentials';
import type { DashboardPlanView, DashboardWidgetId } from './types';
import {
  DASHBOARD_WIDGET_META,
  type DashboardWidgetMeta,
} from './layoutHelpers';

export {
  clampLayout,
  clampLayoutItem,
  defaultLayoutForPlan,
  resolveLayout,
  widgetMetaById,
  widgetsForPlan,
} from './layoutHelpers';

export const DashboardPlanContext =
  createContext<DashboardPlanView>('Performance Plan');

export const useDashboardPlan = () => useContext(DashboardPlanContext);

const ApprovalsWidget = () => {
  const plan = useDashboardPlan();
  return <RightBar type={plan} />;
};

const WIDGET_COMPONENTS: Record<DashboardWidgetId, React.ComponentType> = {
  'kpi-average-okr': AverageOkrKpiCard,
  'kpi-company-okr': CompanyOkrKpiCard,
  'kpi-appreciation': AppreciationKpiCard,
  'kpi-reprimand': ReprimandKpiCard,
  'kpi-vp-score': VpScoreKpiCard,
  'attendance-days-present': DaysPresentKpiCard,
  'attendance-late-arrivals': LateArrivalsKpiCard,
  'attendance-leaves': LeavesTakenKpiCard,
  'attendance-closed-days': ClosedDaysKpiCard,
  plan: LeftBar,
  'attendance-review': ThisWeeksAttendanceReviewCard,
  'recent-feedbacks': RecentFeedbacks,
  approvals: ApprovalsWidget,
  'event-birthday': BirthdayEventCard,
  'event-anniversary': AnniversaryEventCard,
  'event-leader': WeeklyLeaderEventCard,
  'event-employee': RockstarEventCard,
  'event-essentials-birthday': TodaysBirthdaysEssentialsCard,
  'event-essentials-anniversary': WorkAnniversariesEssentialsCard,
  calendar: Calender,
};

export interface DashboardWidgetDefinition extends DashboardWidgetMeta {
  Component: React.ComponentType;
}

export const DASHBOARD_WIDGETS: DashboardWidgetDefinition[] =
  DASHBOARD_WIDGET_META.map((meta) => ({
    ...meta,
    Component: WIDGET_COMPONENTS[meta.id],
  }));

export const widgetById = Object.fromEntries(
  DASHBOARD_WIDGETS.map((widget) => [widget.id, widget]),
) as Record<DashboardWidgetId, DashboardWidgetDefinition>;
