export type DataItem = {
  actionPlan: string;
  description: string;
  responsiblePerson: string;
};

export type QuestionsType = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  formId: string;
  question: string;
  fieldType: string; // Add other field types as needed
  field: any; // Update this with the correct type if known
  order: number;
  tenantId: string;
  required: boolean;
  responseDetail?: any[];
};

export type Meta = {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
};

export type QuestionData = {
  items: QuestionsType[];
  meta: Meta;
};