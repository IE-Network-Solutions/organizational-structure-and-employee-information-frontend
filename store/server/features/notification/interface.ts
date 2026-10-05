export interface NotificationType {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  title: string;
  body: string;
  isRead?: boolean;
  user?: string;
  userId?: string;
  source_service?: string;
  /** Optional route to open when the notification is clicked (e.g. /incentive, /payroll/...) */
  route?: string;
  /** Optional URL to open when the notification is clicked (alias / fallback) */
  url?: string;
  /** Optional theme for display (e.g. green, blue, purple). Can also be parsed from route ?theme= */
  theme?: string;
  /** Nested payload from the notification service (employee / entity ids). */
  data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  employeeId?: string;
  relatedUserId?: string;
  createdBy?: string;
}

export interface NotificationListResponse {
  data: NotificationType[];
  total?: number;
  page?: number;
  limit?: number;
}

/** Push subscription payload for POST /push-subscriptions */
export interface PushSubscriptionPayload {
  userId: string;
  subscription: PushSubscriptionJSON;
  tenantId?: string;
}

/** Response from GET /push-subscriptions/status */
export interface PushSubscriptionStatusResponse {
  subscribed?: boolean;
  hasSubscription?: boolean;
}

/** Response from GET /notification/preferences?userId=... */
export interface NotificationPreferencesResponse {
  userId: string;
  preset: 'basic' | 'custom' | 'all';
  enabledById: Record<string, boolean>;
  updatedAt?: string;
}

/** Body for PUT /notification/preferences */
export interface UpsertNotificationPreferencesPayload {
  userId: string;
  tenantId?: string;
  preset: 'basic' | 'custom' | 'all';
  enabledById: Record<string, boolean>;
}
