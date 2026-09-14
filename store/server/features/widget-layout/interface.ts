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

/**
 * Every response names the user it belongs to. The client scopes the layout on
 * this rather than on its own auth store, so a stale client-side userId can
 * never cause one user's dashboard to be rendered — or saved back — as another's.
 */
export interface DashboardWidgetLayoutResponse {
  userId: string;
  plan: DashboardPlanKey;
  items: DashboardWidgetLayoutRow[];
}

export interface SaveDashboardWidgetLayoutPayload {
  plan: DashboardPlanKey;
  /** The complete layout — it replaces whatever the API had stored. */
  items: DashboardWidgetPlacement[];
}
