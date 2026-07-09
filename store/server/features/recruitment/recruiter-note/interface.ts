export interface RecruiterNote {
  id: string;
  jobId: string;
  note: string;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface PaginatedRecruiterNotes {
  items: RecruiterNote[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface CreateRecruiterNoteRequest {
  jobId: string;
  note: string;
}

export interface UpdateRecruiterNoteRequest {
  note?: string;
}
