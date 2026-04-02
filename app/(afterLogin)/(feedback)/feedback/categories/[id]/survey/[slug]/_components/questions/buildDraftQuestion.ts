import { v4 as uuidv4 } from 'uuid';
import { FieldType } from '@/types/enumTypes';
import { QuestionsType } from '@/store/server/features/organization-development/categories/interface';

export function buildDraftQuestion(
  draftId: string,
  fieldType: string,
  order: number,
  formId: string,
): QuestionsType {
  const needsOptions =
    fieldType === FieldType.MULTIPLE_CHOICE || fieldType === FieldType.CHECKBOX;
  return {
    id: draftId,
    formId,
    question: '',
    fieldType,
    required: false,
    field: needsOptions
      ? [
          { value: '', id: uuidv4() },
          { value: '', id: uuidv4() },
        ]
      : [],
    order,
    createdAt: '',
    updatedAt: '',
    deletedAt: null,
    createdBy: null,
    updatedBy: null,
    tenantId: '',
  };
}
