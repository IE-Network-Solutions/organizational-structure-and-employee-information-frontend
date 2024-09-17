import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { usePublicFormStore } from '@/store/uistate/features/feedback/publicForm';
import { useDebounce } from '@/utils/useDebounce';
import { Checkbox, Col, Input, Row } from 'antd';
import { v4 as uuidv4 } from 'uuid';
interface RenderOptionsProps {
  type: string;
  field: Array<Record<string, string>>;
  questionId: string;
  form: any;
}

const RenderOptions: React.FC<RenderOptionsProps> = ({
  type,
  field,
  questionId,
  form,
}) => {
  const userId = useAuthenticationStore.getState().userId || null;

  const { setSelectedAnswer, selectedAnswer } = usePublicFormStore();
  const handleSelection = (choice: Record<string, string>[]) => {
    setSelectedAnswer({
      questionId,
      respondentId: userId,
      responseDetail: choice,
    });
    form.setFieldsValue({
      [`question_${questionId}`]: choice[0]?.value,
    });
  };
  const onValuesChange = useDebounce(handleSelection, 1500);

  return (
    <div key={questionId}>
      {type === 'multiple_choice' && (
        <Row key={questionId} gutter={16} className="ml-1 mt-2">
          {field?.map((choice, index) => {
            let isSelected = false;
            if (selectedAnswer) {
              for (const answer of selectedAnswer) {
                for (const detail of answer.responseDetail) {
                  if (
                    detail.value === choice.value &&
                    answer.questionId === questionId
                  ) {
                    isSelected = true;
                    break;
                  }
                }
                if (isSelected) {
                  break;
                }
              }
            }

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
      {type === 'checkbox' && (
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
              return (
                <Col span={24} key={index}>
                  <Checkbox value={choice.value}>{choice.value}</Checkbox>
                </Col>
              );
            })}
          </Row>
        </Checkbox.Group>
      )}
      {type === 'short_text' && (
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
      {type === 'paragraph' && (
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
