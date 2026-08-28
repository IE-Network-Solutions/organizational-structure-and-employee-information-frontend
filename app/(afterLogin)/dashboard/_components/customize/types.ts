import type { ReactNode } from 'react';

// The plan key is part of the API contract, so it lives with the API types.
export type { DashboardPlanKey } from '@/store/server/features/dashboard/widget-layout/interface';

export type DashboardPlanView =
  | 'Performance Plan'
  | 'Essential Plan '
  | 'Enterprise Plan';

/** Placement of one widget on the 12 column dashboard grid. */
export interface DashboardWidgetLayoutItem {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DashboardWidgetDefinition {
  id: string;
  title: string;
  /** Smallest size the widget can be resized to. */
  minW: number;
  minH: number;
  /** Size the widget gets when it is added from the catalog. */
  defaultW: number;
  defaultH: number;
  render: (plan: DashboardPlanView) => ReactNode;
}

/**
 * A widget's slot plus whether it is currently on the dashboard. Hidden widgets
 * keep their geometry so re-adding one can restore where it used to sit.
 */
export interface DashboardWidgetPlacement extends DashboardWidgetLayoutItem {
  isVisible: boolean;
}
