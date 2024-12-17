export interface CategoryData {
  id?: string;
  name: string;
  description: string;
  items?: any[];
  users?: string[];
}

interface Item {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  description: string;
  tenantId: string | null;
}

interface Meta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface ResponseData {
  items: Item[];
  meta: Meta;
}

export interface CategoryFetch {
  pageSize: number;
  currentPage: number;
}

export type ConversationTypeItems = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  name: string;
  description: string;
};

export type FeedbackTypeItems = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  category: string;
  description: string;
};
export interface FeedbackItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  feedbackTypeId: string;
  variant: string;
  name: string;
  description: string;
  points: number;
  tenantId: string;
}

export type FeedbackRecord = {
  id: string;
  createdAt: string;  // Can also be Date if you're handling it as a Date object
  updatedAt: string;  // Can also be Date if you're handling it as a Date object
  deletedAt: string | null;  // Nullable if the value can be null
  createdBy: string | null;  // Nullable if the value can be null
  updatedBy: string | null;  // Nullable if the value can be null
  issuerId: string;
  recipientId: string;
  feedbackTypeId: string;
  feedbackId: string;
  reason: string;
  action: string;
  points: number;
  tenantId: string;
};

