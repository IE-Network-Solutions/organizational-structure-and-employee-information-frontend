import React from 'react';
import { Row, Col } from 'antd';

export interface Choice {
  id: string;
  value: string;
}
export interface SelectedAnswer {
  id: string;
  value: string;
}
interface MultipleChoiceFieldProps {
  choices: Choice[];
  selectedAnswer?: SelectedAnswer[];
}

const MultipleChoiceField: React.FC<MultipleChoiceFieldProps> = ({
  choices,
  selectedAnswer,
}) => (
  <Row gutter={[16, 16]} className="mt-2">
    {choices?.map((choice, index) => (
      <Row
        key={index}
        style={{ marginBottom: '10px' }}
        className="flex justify-start w-full"
      >
        {/* Responsive numbering column */}
        <Col
          xs={2} sm={1} // Full width on mobile, reduced width on larger screens
          className={`${
            selectedAnswer?.some((item) => item.id === choice.id)
              ? 'bg-green-400 text-white'
              : 'bg-gray-200'
          } flex justify-center items-center rounded`}
        >
          {index + 1}
        </Col>

        {/* Responsive text column */}
        <Col
          xs={20} sm={22} // Full width on mobile, reduced width on larger screens
          className="flex justify-start items-center rounded ml-2 border-2 px-2 py-1"
        >
          {choice.value}
        </Col>
      </Row>
    ))}
  </Row>
);

export default MultipleChoiceField;
