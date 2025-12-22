import React, { useEffect } from 'react';
import { Checkbox, Collapse } from 'antd';
import { useFetchQuestionTemplate } from '@/store/server/features/feedback/settings/queries';
import { useDynamicFormStore } from '@/store/uistate/features/feedback/dynamicForm';
import { FieldType } from '@/types/enumTypes';
import MultipleChoiceField from '../../survey/[slug]/_components/questions/multipleChoiceField';
import ParagraphField from '../../survey/[slug]/_components/questions/paragraphField';
import CheckboxField from '../../survey/[slug]/_components/questions/checkboxField';
import ShortTextField from '../../survey/[slug]/_components/questions/shortTextField';

const CustomQuestionTemplate = () => {
  const {
    pageSize,
    current,
    selectedQuestions,
    setSelectedQuestions,
    setFilteredQuestions,
  } = useDynamicFormStore();
  const { data: QuestionTemplate, isLoading: isQuestionTemplateLoading } =
    useFetchQuestionTemplate(pageSize, current);

  const handleSelectQuestion = (questionId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const updatedQuestions = selectedQuestions.includes(questionId)
      ? selectedQuestions.filter((id) => id !== questionId)
      : [...selectedQuestions, questionId];

    setSelectedQuestions(updatedQuestions);
  };

  useEffect(() => {
    if (QuestionTemplate) {
      const filtered = QuestionTemplate?.items?.filter((question: any) =>
        selectedQuestions.includes(question?.id),
      );
      setFilteredQuestions(filtered);
    }
  }, [selectedQuestions, QuestionTemplate]);

  if (isQuestionTemplateLoading)
    return (
      <div className="text-center my-5"> No custom question available.</div>
    );
  return (
    <>
      <div className="flex items-center justify-start gap-1 mb-3" data-cy="custom-question-template-header" id="custom-question-template-header">
        <p className="text-sm font-normal text-gray-400" data-cy="custom-question-template-header-text" id="custom-question-template-header-text">
          Choose your Custom field
        </p>
        <span className="text-red-500 " data-cy="custom-question-template-header-required-indicator" id="custom-question-template-header-required-indicator">*</span>
      </div>
      <Collapse defaultActiveKey={['1']} data-cy="custom-question-template-collapse">
        <Collapse.Panel header="Custom Question Templates" key="0" data-cy="custom-question-template-panel" id="custom-question-template-panel">
          <div className="flex flex-col" data-cy="custom-question-template-list" id="custom-question-template-list">
            {QuestionTemplate?.items?.map((question: any, index: number) => (
              <div key={index} className="my-2 mx-4" data-cy="custom-question-template-item" id="custom-question-template-item">
                <Collapse key={question?.id} defaultActiveKey={question?.id} data-cy="custom-question-template-collapse-item">
                  <Collapse.Panel
                    header={
                      <div className="flex items-center" data-cy="custom-question-template-header-item" id="custom-question-template-header-item">
                        <Checkbox
                          checked={selectedQuestions?.includes(question?.id)}
                          onClick={(e) => handleSelectQuestion(question?.id, e)}
                        />
                        <span className="ml-2" data-cy="custom-question-template-header-text-item" id="custom-question-template-header-text-item">
                          {question?.question ?? '-'}
                        </span>
                      </div>
                    }
                    key={question?.id}
                    data-cy="custom-question-template-panel-item"
                    id="custom-question-template-panel-item"
                  >
                    {question?.fieldType === FieldType.MULTIPLE_CHOICE && (
                      <MultipleChoiceField
                        choices={question?.field}
                        selectedAnswer={[]}
                        data-cy="custom-question-template-multiple-choice-field"
                      />
                    )}
                    {question?.fieldType === FieldType.SHORT_TEXT && (
                      <ShortTextField data-cy="custom-question-template-short-text-field" />
                    )}
                    {question?.fieldType === FieldType.CHECKBOX && (
                      <CheckboxField options={question?.field} data-cy="custom-question-template-checkbox-field" />
                    )}
                    {question?.fieldType === FieldType.PARAGRAPH && (
                      <ParagraphField data-cy="custom-question-template-paragraph-field" />
                    )}
                  </Collapse.Panel>
                </Collapse>
              </div>
            ))}
          </div>
        </Collapse.Panel>
      </Collapse>
    </>
  );
};

export default CustomQuestionTemplate;
