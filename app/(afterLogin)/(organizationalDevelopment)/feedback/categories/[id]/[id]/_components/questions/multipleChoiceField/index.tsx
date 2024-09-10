import React from 'react';
import { Row, Col } from 'antd';

export interface Choice {
  id: string;
  value: string;
}
export interface SelectedAnswer {
  id: string;
  response: string;
}
interface MultipleChoiceFieldProps {
  choices: Choice[];
  selectedAnswer?: SelectedAnswer[];
}

const MultipleChoiceField: React.FC<MultipleChoiceFieldProps> = ({
  choices,
  selectedAnswer,
}) => (
  <Row gutter={16} className="ml-1 mt-2">
    {choices?.map((choice, index) => (
      <Row
        key={index}
        style={{ marginBottom: '10px' }}
        className="flex justify-start w-full"
      >
        <Col
          span={1}
          className={`${
            selectedAnswer?.some((item) => item.id === choice.id)
              ? 'bg-green-400 text-white'
              : 'bg-gray-200'
          } flex justify-center items-center rounded`}
        >
          {index + 1}
        </Col>
        <Col
          span={22}
          className="flex justify-start items-center rounded ml-2 border-2 px-1 py-1 w-1/2"
        >
          {choice.value}
        </Col>
      </Row>
    ))}
  </Row>
);

export default MultipleChoiceField;
