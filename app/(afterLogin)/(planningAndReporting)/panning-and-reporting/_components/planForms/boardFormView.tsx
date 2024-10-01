import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
} from 'antd';

interface BoardCardInterface {
  form: any;
  handleAddName: (arg1: Record<string, string>, arg2: string) => void;
  handleRemoveBoard: (arg1: number, arg2: string) => void;
  kId: string;
  hideTargetValue: boolean;
  name: string;
}

function BoardCardForm({
  form,
  handleAddName,
  handleRemoveBoard,
  hideTargetValue,
  name,
}: BoardCardInterface) {
  return (
    <Form.List name={`board-${name}`}>
      {(subfields, { remove: removeSub }) => (
        <>
          {subfields.map(({ key, name: subName, ...restSubField }) => (
            <Form.Item
              required={false}
              className="border-2 border-primary p-4 rounded-lg m-4 shadow-lg"
              key={key}
              label={'Task'}
            >
              <Form.Item
                {...restSubField}
                name={[subName, 'task']}
                key={`${subName}-task`} // Unique key for task
                rules={[{ required: true, message: 'Task is required' }]}
                noStyle // Use noStyle to avoid nested Form.Item issues
              >
                <Input placeholder="Add your tasks here" />
              </Form.Item>
              <Divider className="mt-4" />
              <Form.Item
                hidden={hideTargetValue}
                label="Target"
                {...restSubField}
                name={[subName, 'targetValue']}
                key={`${subName}-targetValue`} // Unique key for targetValue
              >
                <InputNumber
                  defaultValue={0}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                />
              </Form.Item>

              <Row justify="space-between">
                <Col>
                  <Space size={10}>
                    <Form.Item
                      label="Weight"
                      {...restSubField}
                      name={[subName, 'weight']}
                      key={`${subName}-weight`} // Unique key for weight
                      rules={[
                        { required: true, message: 'Weight is required' },
                      ]}
                    >
                      <InputNumber
                        placeholder={'0'}
                        className="w-16"
                        min={0}
                        max={100}
                      />
                    </Form.Item>
                    <Form.Item
                      label="Priority"
                      {...restSubField}
                      name={[subName, 'priority']}
                      key={`${subName}-priority`} // Unique key for priority
                      rules={[
                        { required: true, message: 'Priority is required' },
                      ]}
                    >
                      <Select
                        placeholder="Select Priority"
                        className="w-24"
                        options={[
                          {
                            label: <div className="text-error">High</div>,
                            value: 'high',
                          },
                          {
                            label: <div className="text-warning">Medium</div>,
                            value: 'medium',
                          },
                          {
                            label: <div className="text-success">Low</div>,
                            value: 'low',
                          },
                        ]}
                      />
                    </Form.Item>
                  </Space>
                </Col>
                <Col>
                  <Space>
                    <Button
                      type="primary"
                      onClick={() => {
                        form
                          .validateFields([`board-${name}`, subName])
                          .then(() => {
                            const boardsKey = `board-${name}`;
                            const currentBoardValues =
                              form.getFieldValue([boardsKey, subName]) || [];
                            handleAddName(currentBoardValues, name);
                            handleRemoveBoard(subName, name);
                          });
                      }}
                    >
                      Add Task
                    </Button>
                    <Button onClick={() => removeSub(subName)}>Cancel</Button>
                  </Space>
                </Col>
              </Row>
            </Form.Item>
          ))}
        </>
      )}
    </Form.List>
  );
}

export default BoardCardForm;
