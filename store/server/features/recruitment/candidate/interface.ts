import { CandidateType, JobType } from '@/types/enumTypes';

export interface CreateCandidateForm {
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
  job: JobType;
  candidateType: CandidateType;
  cgpa: number;
  coverLetter: string;
  documentName: File[];
}
