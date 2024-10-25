export interface NotificationType {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  title: string;
  body: string;
  status: 'ACTIVE' | 'INACTIVE';
  user: string;
}
