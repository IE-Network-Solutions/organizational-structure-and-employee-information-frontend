import { UUID } from 'crypto';

export type DataItem = {
  name: string;
  description: string;
  jobTitleId: UUID;
  userId: UUID;
};
