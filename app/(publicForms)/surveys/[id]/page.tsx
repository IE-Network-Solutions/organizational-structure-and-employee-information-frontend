'use client';
import { useFetchDynamicForms } from '@/store/server/features/feedback/dynamicForm/queries';
import React from 'react';
interface Params {
  id: string;
}
interface QuestionProps {
  params: Params;
}

const QuestionDisplay = ({ params: { id } }: QuestionProps) => {
  console.log('first', id);

  const { data: dynamicForms, isLoading } = useFetchDynamicForms(id);
  const questionData = dynamicForms?.items?.find(
    (form: any) => form.formId === id,
  );

  console.log('first', dynamicForms);

  return isLoading ? (
    <div>IsLoading....</div>
  ) : (
    <div>
      <div>{questionData?.question}</div>

      <div key={questionData.id} className="mb-4">
        <h2 className="font-semibold">{questionData.question}</h2>
        <ul className="list-decimal pl-5">
          {questionData?.field?.map((option: any, index: any) => (
            <li key={option.id} className="my-2">
              <input
                type="radio"
                id={`question-${questionData.id}-option-${index}`}
                name={`question-${questionData.id}`}
                value={option.text}
              />
              <label
                htmlFor={`question-${questionData?.id}-option-${index}`}
                className="ml-2"
              >
                {option.text}
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default QuestionDisplay;
