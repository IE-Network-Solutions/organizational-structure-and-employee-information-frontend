import CheckboxField from '@/app/(afterLogin)/(feedback)/feedback/categories/[id]/survey/[slug]/_components/questions/checkboxField';
import MultipleChoiceField from '@/app/(afterLogin)/(feedback)/feedback/categories/[id]/survey/[slug]/_components/questions/multipleChoiceField';
import ParagraphField from '@/app/(afterLogin)/(feedback)/feedback/categories/[id]/survey/[slug]/_components/questions/paragraphField';
import ShortTextField from '@/app/(afterLogin)/(feedback)/feedback/categories/[id]/survey/[slug]/_components/questions/shortTextField';
import { useGetCustomFieldsTemplate } from '@/store/server/features/recruitment/settings/queries';
import { useJobState } from '@/store/uistate/features/recruitment/jobs';
import { useRecruitmentSettingsStore } from '@/store/uistate/features/recruitment/settings';
import { FieldType } from '@/types/enumTypes';
import { Checkbox, Collapse, Skeleton } from 'antd';
import React, { useEffect } from 'react';
import { TaRequiredMark } from '../../../../../_components/taRequiredMark';

const CustomFieldsSelector: React.FC = () => {
  const { templateCurrentPage, templatePageSize } =
    useRecruitmentSettingsStore();
  const { data: customFields, isLoading: isCustomFieldLoading } =
    useGetCustomFieldsTemplate(templatePageSize, templateCurrentPage);

  const { selectedQuestions, setSelectedQuestions, setFilteredQuestions } =
    useJobState();

  const handleSelectQuestion = (questionId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const updatedQuestions = selectedQuestions.includes(questionId)
      ? selectedQuestions.filter((id) => id !== questionId)
      : [...selectedQuestions, questionId];

    setSelectedQuestions(updatedQuestions);
  };

  useEffect(() => {
    if (customFields) {
      const filtered = customFields?.items?.filter((question: any) =>
        selectedQuestions.includes(question?.id),
      );
      setFilteredQuestions(filtered);
    }
  }, [selectedQuestions, setFilteredQuestions, customFields]);

  if (isCustomFieldLoading) {
    return (
      <div
        className="flex justify-center items-center h-64"
        data-cy="talent-acquisition-create-application-form-custom-field-loading"
      >
        <Skeleton
          active
          data-cy="talent-acquisition-create-application-form-custom-field-spin"
        />
      </div>
    );
  }

  return (
    <div data-cy="createjobs-createapplicationform-customfieldselector-index-tsx-index-div-55">
      <div
        data-cy="createjobs-createapplicationform-customfieldselector-index-tsx-index-div-56"
        className="inline-flex items-center justify-start gap-1.5"
      >
        <span
          className="text-md font-medium"
          data-cy="talent-acquisition-create-application-form-custom-field-label"
        >
          Choose your Custom field
        </span>
        <TaRequiredMark data-cy="createjobs-createapplicationform-customfieldselector-index-tsx-index-span-63" />
      </div>
      <Collapse defaultActiveKey={['1']}>
        <Collapse.Panel
          header="Custom Question Templates"
          key="0"
          id="talent-acquisition-create-application-form-panel-custom-question-templates"
          data-cy="talent-acquisition-create-application-form-panel-custom-question-templates"
        >
          <div
            id="talent-acquisition-create-application-form-panel-custom-question-div"
            data-cy="talent-acquisition-create-application-form-panel-custom-question-div"
            className="flex flex-col"
          >
            {customFields?.items && customFields?.items?.length > 0 ? (
              customFields?.items?.map((question: any, index: number) => (
                <div
                  id={`talent-acquisition-create-application-form-collapse-question-${question?.id}`}
                  data-cy={`talent-acquisition-create-application-form-collapse-question-${question?.id}`}
                  key={index}
                  className="my-2 mx-4"
                >
                  <Collapse key={question?.id}>
                    <Collapse.Panel
                      header={
                        <div
                          data-cy="createjobs-createapplicationform-customfieldselector-index-tsx-index-div-88"
                          className="flex items-center"
                        >
                          <Checkbox
                            id={`talent-acquisition-create-application-form-checkbox-question-${question?.id}`}
                            data-cy={`talent-acquisition-create-application-form-checkbox-question-${question?.id}`}
                            checked={selectedQuestions?.includes(question?.id)}
                            onClick={(e) =>
                              handleSelectQuestion(question?.id, e)
                            }
                          />
                          <span
                            id={`talent-acquisition-create-application-form-span-title-${question?.id}`}
                            data-cy={`talent-acquisition-create-application-form-span-title-${question?.id}`}
                            className="ml-2"
                          >
                            {question?.title ?? '-'}
                          </span>
                        </div>
                      }
                      key={question?.id}
                      id={`talent-acquisition-create-application-form-panel-question-${question?.id}`}
                      data-cy={`talent-acquisition-create-application-form-panel-question-${question?.id}`}
                    >
                      {question?.form?.map(
                        (item: any) =>
                          item?.fieldType === FieldType.MULTIPLE_CHOICE && (
                            <>
                              {question?.form?.map(
                                (formItem: any, index: number) => {
                                  return (
                                    <MultipleChoiceField
                                      data-cy={`talent-acquisition-create-application-form-multiple-choice-field-${index}`}
                                      key={index}
                                      choices={formItem?.field}
                                      selectedAnswer={[]}
                                    />
                                  );
                                },
                              )}
                            </>
                          ),
                      )}

                      {question?.form?.map(
                        (item: any, index: number) =>
                          item?.fieldType === FieldType.SHORT_TEXT && (
                            <ShortTextField
                              data-cy={`talent-acquisition-question-form-short-text${index}`}
                              key={item?.id || index}
                            />
                          ),
                      )}
                      {question?.form?.map(
                        (item: any) =>
                          item?.fieldType === FieldType.CHECKBOX && (
                            <>
                              {question?.form?.map(
                                (formItem: any, index: number) => (
                                  <CheckboxField
                                    data-cy={`talent-acquisition-question-form-checkbox-field-${index}`}
                                    key={index}
                                    options={formItem?.field ?? []}
                                  />
                                ),
                              )}
                            </>
                          ),
                      )}

                      {question?.form?.map(
                        (item: any, index: number) =>
                          item?.fieldType === FieldType.PARAGRAPH && (
                            <ParagraphField
                              data-cy={`talent-acquisition-question-form-paragraph-field-${index}`}
                              key={item?.id || index}
                            />
                          ),
                      )}
                    </Collapse.Panel>
                  </Collapse>
                </div>
              ))
            ) : (
              <div
                data-cy="createjobs-createapplicationform-customfieldselector-index-tsx-index-div-170"
                className="text-center my-5"
              >
                No custom fields available.
              </div>
            )}
          </div>
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};

export default CustomFieldsSelector;
