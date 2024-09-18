import React, { CSSProperties } from 'react';
import { Collapse, theme } from 'antd';
import { useFetchQuestions } from '@/store/server/features/feedback/question/queries';
import type { CollapseProps } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';

const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;
const getItems: (panelStyle: CSSProperties) => CollapseProps['items'] = (
  panelStyle,
) => [
  {
    key: '1',
    label: 'This is panel header 1',
    children: <p className="my-2">{text}</p>,
  },
  {
    key: '2',
    label: 'This is panel header 2',
    children: <p>{text}</p>,
  },
  {
    key: '3',
    label: 'This is panel header 3',
    children: <p>{text}</p>,
  },
];

interface IdProps {
  id: string;
}
const CustomQuestionTemplate: React.FC<IdProps> = ({ id }) => {
  const { token } = theme.useToken();
  const { data: QuestionTemplate } = useFetchQuestions(id);

  const handleQuestionTemplateChange = (key: string | string[]) => {
    console.log(key);
  };

  const panelStyle: React.CSSProperties = {
    marginBottom: 24,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: 'none',
  };
  return (
    <div>
      <div className="flex flex-col">
        <div className="flex items-center justify-start gap-1">
          <p className="text-sm font-normal text-gray-400">
            Choose your Custom field
          </p>
          <span className="text-red-500 ">*</span>
        </div>
        <div className="my-2">
          <Collapse
            bordered={false}
            defaultActiveKey={['1']}
            expandIcon={({ isActive }) => (
              <CaretRightOutlined rotate={isActive ? 90 : 0} />
            )}
            style={{ background: token.colorBgContainer }}
            items={getItems(panelStyle)}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomQuestionTemplate;
