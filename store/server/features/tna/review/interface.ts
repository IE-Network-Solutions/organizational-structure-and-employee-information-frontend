export interface TnaRequestBody {
  filter: {
    id?: string[];
    assignedUserId?: string[];
    completedAt?: {
      from: string;
      to: string;
    };
  };
}
