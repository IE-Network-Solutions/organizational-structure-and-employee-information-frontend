export interface User {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  firstName: string;
  middleName: string;
  lastName: string;
  hasChangedPassword: boolean;
  profileImage: string;
  profileImageDownload: string;
  email: string;
  roleId: string;
  tenantId: string;
  firebaseId: string;
  is2FAEnabled: boolean;
}

export interface ProbationTask {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string;
  probationId: string;
  taskName: string;
  weight: string;
  evaluator: string;
  evaluationScore: string;
  isCompleted: boolean;
  evaluatorUser: User;
}

export interface ProbationTarget {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string;
  name: string;
  userId: string;
  totalScore: string;
  user: User;
  probationTasks: ProbationTask[];
}

export interface CreateProbationTargetRequest {
  name: string;
  userId: string;
  totalScore: number;
  createdBy: string;
}

export interface UpdateProbationTargetRequest {
  id: string;
  name?: string;
  userId?: string;
  totalScore?: number;
  isCompleted?: boolean;
}

export interface ProbationTargetResponse {
  data: ProbationTarget;
  message: string;
  success: boolean;
}

export interface ProbationTargetListResponse {
  data: ProbationTarget[];
  message: string;
  success: boolean;
  totalCount?: number;
}
