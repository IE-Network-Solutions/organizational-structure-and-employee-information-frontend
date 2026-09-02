import type {
  DashboardPlanKey,
  DashboardWidgetLayoutResponse,
  DashboardWidgetLayoutRow,
} from './interface';

/**
 * Accepts either response shape: the current `{ userId, plan, items }`, or the
 * bare row array an older build of the API returns. Without this, a frontend
 * running ahead of the backend reads `items` as undefined and silently falls
 * back to the default layout — which looks exactly like every user's
 * customization being wiped on login.
 *
 * Rows carry their own `userId`, so per-user scoping survives either shape.
 */
export function normalizeDashboardWidgetLayout(
  raw: unknown,
  planKey: DashboardPlanKey,
  fallbackUserId: string,
): DashboardWidgetLayoutResponse {
  if (Array.isArray(raw)) {
    const items = raw as DashboardWidgetLayoutRow[];
    return {
      userId: items[0]?.userId ?? fallbackUserId,
      plan: planKey,
      items,
    };
  }

  const body = (raw ?? {}) as Partial<DashboardWidgetLayoutResponse>;
  const items = Array.isArray(body.items) ? body.items : [];
  return {
    userId: body.userId ?? items[0]?.userId ?? fallbackUserId,
    plan: body.plan ?? planKey,
    items,
  };
}

/**
 * True when the payload is safe to render for this signed-in user. A shared
 * HTTP cache can return another user's `{ userId, items }`; adopting that
 * would show — and on the next edit, save back — their dashboard as yours.
 */
export function isDashboardLayoutForUser(
  response: DashboardWidgetLayoutResponse,
  userId: string,
): boolean {
  return !response.userId || !userId || response.userId === userId;
}

export const dashboardWidgetLayoutKey = (
  userId: string,
  planKey: DashboardPlanKey,
) => ['dashboard', 'widget-layout', userId, planKey];
