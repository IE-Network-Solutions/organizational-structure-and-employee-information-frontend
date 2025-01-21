'use client';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import {
  RockStarOfTheWeekProps,
  useIncentiveStore,
} from '@/store/uistate/features/incentive/incentive';
import { Button, Col, Form, Input, Radio, Row, Tag, Typography } from 'antd';
import { RadioChangeEvent } from 'antd/lib';
import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const plainOptions = ['Fixed', 'Formula'];

const { Text } = Typography;

const RockStartOfTheWeek: React.FC<RockStarOfTheWeekProps> = ({
  // title = 'Rock Star of the Week',
  criteriaOptions = [
    'KPI',
    'Earned Schedule',
    'Budget',
    'Actual Time',
    'Other criteria',
  ],
  // onSubmit,
}) => {
  const {
    rockStarDrawer,
    criteria,
    operands,
    addCriteria,
    addOperand,
    clearFormula,
    setRockStarDrawer,
  } = useIncentiveStore();
  const [form] = Form.useForm();

  const [value1, setValue1] = React.useState('Apple');

  const handleClose = () => {
    setRockStarDrawer(false);
  };

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-14',
      size: 'small',
      onClick: handleClose,
    },
    {
      label: <span>Create</span>,
      key: 'create',
      className: 'h-14',
      type: 'primary',
      size: 'small',
      onClick: () => form.submit(),
    },
  ];

  const onChange1 = ({ target: { value } }: RadioChangeEvent) => {
    setValue1(value);
  };

  const handleSubmit = () => {};

  const handleCriteriaClick = (item: string) => {
    addCriteria(item);
  };

  const handleOperandClick = (item: string) => {
    addOperand(item);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from([...criteria, ...operands]);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
  };

  const handleClear = () => {
    clearFormula();
  };

  // const handleFinish = (values: any) => {
  //   if (onSubmit) {
  //     onSubmit({ ...values, formula: [...criteria, ...operands] });
  //   }
  // };

  return (
    <CustomDrawerLayout
      open={rockStarDrawer}
      onClose={handleClose}
      modalHeader={
        <CustomDrawerHeader className="flex justify-center ">
          Rockstar of the week
        </CustomDrawerHeader>
      }
      footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
      width="600px"
    >
      {/* <div style={{ marginBottom: '20px' }}>
        <span>Amount *</span>
        <Radio.Group style={{ marginLeft: '10px' }} defaultValue="Formula">
          <Radio.Button value="Fixed">Fixed</Radio.Button>
          <Radio.Button value="Formula">Formula</Radio.Button>
        </Radio.Group>
      </div> */}

      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Form.Item
          rules={[{ required: true, message: 'Please choose amount' }]}
          label={<span className="text-md font-semibold">Amount</span>}
          name="amountType"
        >
          <Radio.Group
            size="large"
            defaultValue="Fixed"
            options={plainOptions}
            onChange={onChange1}
            value={value1}
          />
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: 'Please choose amount' }]}
          label={<span className="text-md font-medium">Amount</span>}
          name="amount"
        >
          <Input size="large" />
        </Form.Item>

        {/* <Form.Item
          rules={[{ required: true, message: 'Please choose amount' }]}
          label={<span className="text-md font-medium">Formula</span>}
          name="formula"
        >
          <TextArea value={selectedOperand || ''} readOnly rows={4} />
        </Form.Item> */}

        <Form.Item label={<Text strong>Formula *</Text>}>
          <div
            style={{
              border: '1px solid #ddd',
              padding: 10,
              borderRadius: 5,
              minHeight: 100,
              marginTop: 10,
            }}
          >
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="formula">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {[...criteria, ...operands].map((item, index) => (
                      <Draggable
                        key={item + index}
                        draggableId={item + index}
                        index={index}
                      >
                        {(provided) => (
                          <Tag
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{ margin: '5px', cursor: 'move' }}
                          >
                            {item}
                            {/* <Button
                              type="link"
                              onClick={() => removeItem(index)}
                              style={{ marginLeft: '5px', padding: 0 }}
                            >
                              ✖
                            </Button> */}
                          </Tag>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </Form.Item>
        <div>
          <Row gutter={[16, 10]}>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <Form.Item label={<Text strong>Criteria *</Text>}>
                <div style={{ marginTop: 10 }}>
                  {criteriaOptions.map((item) => (
                    <Tag
                      key={item}
                      color="blue"
                      onClick={() => handleCriteriaClick(item)}
                      style={{ cursor: 'pointer', margin: '5px' }}
                    >
                      {item}
                    </Tag>
                  ))}
                </div>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <Form.Item label={<Text strong>Operands *</Text>}>
                <div style={{ marginTop: 10 }}>
                  {['+', '-', '*', '/', '(', ')', 'Clear'].map((item) => (
                    <Button
                      key={item}
                      type={item === 'Clear' ? 'default' : 'primary'}
                      shape="circle"
                      onClick={() =>
                        item === 'Clear'
                          ? handleClear()
                          : handleOperandClick(item)
                      }
                      style={{ margin: '5px' }}
                    >
                      {item}
                    </Button>
                  ))}
                </div>
              </Form.Item>
            </Col>
          </Row>
          {/* <div>Criteria</div> */}
        </div>
      </Form>
    </CustomDrawerLayout>
  );
};

export default RockStartOfTheWeek;
