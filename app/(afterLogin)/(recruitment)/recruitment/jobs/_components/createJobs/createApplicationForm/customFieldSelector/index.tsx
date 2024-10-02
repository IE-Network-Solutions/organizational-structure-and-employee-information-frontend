import CheckboxField from '@/app/(afterLogin)/(feedback)/feedback/categories/[id]/survey/[slug]/_components/questions/checkboxField';
import MultipleChoiceField from '@/app/(afterLogin)/(feedback)/feedback/categories/[id]/survey/[slug]/_components/questions/multipleChoiceField';
import ParagraphField from '@/app/(afterLogin)/(feedback)/feedback/categories/[id]/survey/[slug]/_components/questions/paragraphField';
import ShortTextField from '@/app/(afterLogin)/(feedback)/feedback/categories/[id]/survey/[slug]/_components/questions/shortTextField';
import { useGetCustomFieldsTemplate } from '@/store/server/features/recruitment/settings/queries';
import { useJobState } from '@/store/uistate/features/recruitment/jobs';
import { FieldType } from '@/types/enumTypes';
import { Checkbox, Collapse, Spin } from 'antd';
import React, { useEffect } from 'react';

const CustomFieldsSelector: React.FC = () => {
  const { data: customFields, isLoading: isCustomFieldLoading } =
    useGetCustomFieldsTemplate();

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
      const filtered = customFields?.customFields?.filter((question: any) =>
        selectedQuestions.includes(question?.id),
      );
      setFilteredQuestions(filtered);
    }
  }, [selectedQuestions, customFields]);

  if (isCustomFieldLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }
  console.log(customFields, 'customFields');

  return (
    <div>
      <div className="flex items-center justify-start gap-1">
        <span className="text-md font-medium">Choose your Custom field</span>
        <span className="text-red-500">*</span>
      </div>
      <Collapse defaultActiveKey={['1']}>
        <Collapse.Panel header="Custom Question Templates" key="0">
          <div className="flex flex-col">
            {customFields?.items && customFields?.items?.length > 0 ? (
              customFields?.items?.map((question: any, index: number) => (
                <div key={index} className="my-2 mx-4">
                  <Collapse key={question?.id}>
                    <Collapse.Panel
                      header={
                        <div className="flex items-center">
                          <Checkbox
                            checked={selectedQuestions?.includes(question?.id)}
                            onClick={(e) =>
                              handleSelectQuestion(question?.id, e)
                            }
                          />
                          <span className="ml-2">{question?.title ?? '-'}</span>
                        </div>
                      }
                      key={question?.id}
                    >
                      {question?.fieldType === FieldType.MULTIPLE_CHOICE && (
                        <>
                          {question?.form?.map(
                            (formItem: any, index: number) => (
                              <MultipleChoiceField
                                key={index}
                                choices={formItem?.field ?? []}
                                selectedAnswer={[]}
                              />
                            ),
                          )}
                        </>
                      )}
                      {/* {question?.fieldType === FieldType.MULTIPLE_CHOICE && (
                        <MultipleChoiceField
                          choices={question?.form?.[0]?.field}
                          selectedAnswer={[]}
                        />
                      )} */}

                      {question?.fieldType === FieldType.SHORT_TEXT && (
                        <ShortTextField />
                      )}
                      {question?.fieldType === FieldType.CHECKBOX && (
                        <>
                          {question?.form?.map(
                            (formItem: any, index: number) => (
                              <CheckboxField
                                key={index}
                                options={formItem?.field ?? []}
                              />
                            ),
                          )}
                        </>
                      )}
                      {/* {question?.fieldType === FieldType.CHECKBOX && (
                        <CheckboxField options={question?.form?.[0]?.field} />
                      )} */}
                      {question?.fieldType === FieldType.PARAGRAPH && (
                        <ParagraphField />
                      )}
                    </Collapse.Panel>
                  </Collapse>
                </div>
              ))
            ) : (
              <div className="text-center my-5">
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
