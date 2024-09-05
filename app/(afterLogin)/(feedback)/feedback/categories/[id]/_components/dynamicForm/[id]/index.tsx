import { useFetchDynamicForms } from '@/store/server/features/feedback/dynamicForm/queries';
import React from 'react';
interface Params {
  id: string;
}
interface QuestionProps {
  params: Params;
}

const QuestionDisplay = ({ params: { id } }: QuestionProps) => {
  const { data: dynamicForms, isLoading } = useFetchDynamicForms();
  const questionData = dynamicForms?.find((form: any) => form.id === id);

  return (
    <div>
      <h1>{questionData.title}</h1>
      {questionData.questions.map((question: any) => (
        <div key={question.id} className="mb-4">
          <h2 className="font-semibold">{question.question}</h2>
          <ul className="list-decimal pl-5">
            {question.options.map((option: any, index: any) => (
              <li key={option.id} className="my-2">
                <input
                  type="radio"
                  id={`question-${question.id}-option-${index}`}
                  name={`question-${question.id}`}
                  value={option.text}
                />
                <label
                  htmlFor={`question-${question.id}-option-${index}`}
                  className="ml-2"
                >
                  {option.text}
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default QuestionDisplay;
