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
}

export interface NotificationListResponse {
  data: NotificationType[];
  total?: number;
  page?: number;
  limit?: number;
} 
