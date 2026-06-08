export interface JobMessageMention {
  id: string;
  messageId: string;
  mentionedUserId: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobMessageFile {
  id: string;
  messageId: string;
  fileUrl: string;
  fileType?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobMessage {
  id: string;
  jobId: string;
  senderId: string;
  content?: string | null;
  parentMessageId?: string | null;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  mentions?: JobMessageMention[];
  files?: JobMessageFile[];
}

export interface JobChatMessagesResponse {
  items: JobMessage[];
  total: number;
  page: number;
  limit: number;
}

export interface SendJobMessageFilePayload {
  fileUrl: string;
  fileType?: string;
  fileName?: string;
  fileSize?: number;
}

export interface SendJobMessagePayload {
  jobId: string;
  content?: string;
  parentMessageId?: string;
  mentionedUserIds?: string[];
  files?: SendJobMessageFilePayload[];
}

export type JobChatUnreadCounts = Record<string, number>;
