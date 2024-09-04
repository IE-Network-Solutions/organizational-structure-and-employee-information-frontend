import { useFetchDynamicForms } from '@/store/server/features/feedback/dynamicForm/queries';
import { useRouter } from 'next/router';
import React from 'react';

const QuestionDisplay = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data: dynamicForms, isLoading } = useFetchDynamicForms();
  const questionData = dynamicForms?.find((form: any) => form.id === id);

  if (isLoading) return <div>Loading...</div>;

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
