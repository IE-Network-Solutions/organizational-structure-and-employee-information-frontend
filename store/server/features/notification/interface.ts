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

/** Response from GET /push-subscriptions/status?userId=... */
export interface PushSubscriptionStatusResponse {
  subscribed?: boolean;
  hasSubscription?: boolean;
}
