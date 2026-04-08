export type RecentFeedbackRecordItemDto = {
  id: string;
  variant: string;
  category: string;
  description: string;
  feedbackName: string;
  points: number;
  createdAt: string;
  issuerId: string;
};

export type RecentFeedbacksActiveMonthMeta = {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
};

export type RecentFeedbacksActiveMonthResponse = {
  items: RecentFeedbackRecordItemDto[];
  meta: RecentFeedbacksActiveMonthMeta;
};
