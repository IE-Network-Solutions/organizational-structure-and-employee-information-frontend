interface ConversationMeetingItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  name: string;
  questionSetId: string;
  conversationTypeId: string;
  userId: string[];
  departmentId: string[];
  agenda: string[];
  facilitatorId: string;
  managersFeedback: string;
  tenantId: string;
}

interface Meta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface ConversationMeetingData {
  items: ConversationMeetingItem[];
  meta: Meta;
}
