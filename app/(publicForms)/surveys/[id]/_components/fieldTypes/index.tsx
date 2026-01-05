import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { usePublicFormStore } from '@/store/uistate/features/feedback/publicForm';
import { FieldType } from '@/types/enumTypes';
import { useDebounce } from '@/utils/useDebounce';
import { Checkbox, Col, Input, Row } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import React from 'react';

interface RenderOptionsProps {
  type: string;
  field: Array<Record<string, string>>;
  questionId: string;
  form: any;
  isAnonymous?: boolean;
}

const RenderOptions: React.FC<RenderOptionsProps> = ({
  type,
  field,
  questionId,
  form,
  isAnonymous = false,
}) => {
  const userId = useAuthenticationStore.getState().userId || null;

  const { setSelectedAnswer, selectedAnswer } = usePublicFormStore();
  const handleSelection = (choice: Record<string, string>[]) => {
    setSelectedAnswer({
      questionId,
      respondentId: isAnonymous ? null : userId,
      responseDetail: choice,
    });
    form.setFieldsValue({
      [`question_${questionId}`]: choice[0]?.value,
    });
  };
  const onValuesChange = useDebounce(handleSelection, 1500);

  // Helper function to check if an answer is selected
  const isAnswerSelected = (choice: Record<string, string>) => {
    if (!selectedAnswer) return false;

    for (const answer of selectedAnswer) {
      // For anonymous forms, only check questionId
      if (isAnonymous) {
        if (answer.questionId === questionId) {
          for (const detail of answer.responseDetail) {
            if (detail.value === choice.value) {
              return true;
            }
          }
        }
      } else {
        // For non-anonymous forms, check both questionId and respondentId
        if (
          answer.questionId === questionId &&
          answer.respondentId === userId
        ) {
          for (const detail of answer.responseDetail) {
            if (detail.value === choice.value) {
              return true;
            }
          }
        }
      }
    }
    return false;
  };

  return (
    <div key={questionId}>
      {type === 'multiple_choice' && (
        <Row key={questionId} gutter={16} className="ml-1 mt-2">
          {field?.map((choice, index) => {
            const isSelected = isAnswerSelected(choice);

            return (
              <>
                {' '}
                <Row
                  key={index + questionId}
                  className="flex justify-start mb-3 w-full border-primary cursor-pointer"
                  onClick={() => handleSelection([choice])}
                >
                  <Col
                    span={1}
                    className={`${
                      isSelected ? 'bg-primary text-white' : 'bg-gray-200'
                    } flex justify-center items-center rounded bg-green`}
                  >
                    {index + 1}
                  </Col>
                  <Col
                    span={22}
                    className={`${
                      isSelected ? 'border-primary' : 'border-gray-200'
                    } flex justify-start items-center rounded ml-1 border-2 px-1 py-1 w-1/2`}
                  >
                    {choice.value}
                  </Col>
                </Row>
              </>
            );
          })}
        </Row>
      )}
      {type === FieldType.CHECKBOX && (
        <Checkbox.Group
          key={questionId}
          style={{ width: '100%' }}
          onChange={(e: string[]) => {
            const checkedValues = e.map((el) => {
              return {
                value: el,
                id: uuidv4(),
              };
            });
            handleSelection(checkedValues);
          }}
        >
          <Row>
            {field?.map((choice, index) => {
              const isSelected = isAnswerSelected(choice);
              return (
                <Col span={24} key={index}>
                  <Checkbox value={choice.value} checked={isSelected}>
                    {choice.value}
                  </Checkbox>
                </Col>
              );
            })}
          </Row>
        </Checkbox.Group>
      )}
      {type === FieldType.SHORT_TEXT && (
        <Row key={questionId}>
          <Col span={24}>
            <Input
              placeholder="Put your answers here"
              onChange={(e) => {
                onValuesChange([
                  {
                    value: e.target.value,
                    id: uuidv4(),
                  },
                ]);
              }}
            />
          </Col>
        </Row>
      )}
      {type === FieldType.PARAGRAPH && (
        <Input.TextArea
          key={questionId}
          rows={5}
          placeholder="Put your answers here"
          onChange={(e) => {
            onValuesChange([
              {
                value: e.target.value,
                id: uuidv4(),
              },
            ]);
          }}
        />
      )}
    </div>
  );
};

export default RenderOptions;
