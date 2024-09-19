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
      <div className="flex items-center justify-start gap-1 mb-3">
        <p className="text-sm font-normal text-gray-400">
          Choose your Custom field
        </p>
        <span className="text-red-500 ">*</span>
      </div>
      <Collapse defaultActiveKey={['1']}>
        <Collapse.Panel header="Custom Question Templates" key="0">
          <div className="flex flex-col">
            {QuestionTemplate?.items?.map((question: any, index: number) => (
              <div key={index} className="my-2 mx-4">
                <Collapse key={question?.id} defaultActiveKey={question?.id}>
                  <Collapse.Panel
                    header={
                      <div className="flex items-center">
                        <Checkbox
                          checked={selectedQuestions?.includes(question?.id)}
                          onClick={(e) => handleSelectQuestion(question?.id, e)}
                        />
                        <span className="ml-2">
                          {question?.question ?? '-'}
                        </span>
                      </div>
                    }
                    key={question?.id}
                  >
                    {question?.fieldType === FieldType.MULTIPLE_CHOICE && (
                      <MultipleChoiceField
                        choices={question?.field}
                        selectedAnswer={[]}
                      />
                    )}
                    {question?.fieldType === FieldType.SHORT_TEXT && (
                      <ShortTextField />
                    )}
                    {question?.fieldType === FieldType.CHECKBOX && (
                      <CheckboxField options={question?.field} />
                    )}
                    {question?.fieldType === FieldType.PARAGRAPH && (
                      <ParagraphField />
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
