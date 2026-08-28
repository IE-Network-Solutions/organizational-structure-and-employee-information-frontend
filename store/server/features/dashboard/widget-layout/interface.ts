export type DashboardPlanKey = 'performance' | 'enterprise' | 'essential';

/** One widget's slot on the dashboard grid, as stored by the API. */
export interface DashboardWidgetPlacement {
  widgetId: string;
  x: number;
  y: number;
  w: number;
  h: number;
  isVisible: boolean;
}

/** A row as it comes back from `GET /dashboard-widget-layouts/:plan`. */
export interface DashboardWidgetLayoutRow extends DashboardWidgetPlacement {
  id: string;
  tenantId: string;
  userId: string;
  plan: DashboardPlanKey;
}

export interface SaveDashboardWidgetLayoutPayload {
  plan: DashboardPlanKey;
  /** The complete layout — it replaces whatever the API had stored. */
  items: DashboardWidgetPlacement[];
}
