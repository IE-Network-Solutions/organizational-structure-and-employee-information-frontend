export interface CreateProbationTaskRequest {
  probationId: string;
  taskName: string;
  weight: number;
  evaluator: string;
  evaluationScore: number;
  createdBy: string;
  description?: string;
}

export interface UpdateProbationTaskRequest {
  id: string;
  taskName?: string;
  weight?: number;
  evaluator?: string;
  evaluationScore?: number;
  isCompleted?: boolean;
  description?: string;
}

export interface ProbationTaskResponse {
  data: any;
  message: string;
  success: boolean;
}
