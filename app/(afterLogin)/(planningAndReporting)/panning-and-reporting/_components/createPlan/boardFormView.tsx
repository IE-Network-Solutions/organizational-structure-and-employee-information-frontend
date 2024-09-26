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
  handleAddName: Function;
  handleRemoveBoard: Function;
  kId: string;
  hideTargetValue: boolean;
  name: string;
}

function BoardCardForm({
  form: form,
  handleAddName: handleAddName,
  handleRemoveBoard: handleRemoveBoard,
  kId: kId,
  hideTargetValue: hideTargetValue,
  name: name,
}: BoardCardInterface) {
  return (
    <Form.List name={`board-${name}`}>
      {(subfields, { remove: removeSub }) => (
        <>
          {subfields.map(({ key, name: subName, ...restSubField }, index) => (
            <Form.Item
              required={false}
              className="border-2 border-primary p-4 rounded-lg m-4 shadow-lg"
              key={key}
              label={'Task'}
            >
              <Form.Item
                {...restSubField}
                name={[subName, 'task']}
                key={`${subName}-task-${index}`} // Unique key for task
              >
                <Input placeholder="Add your tasks here" />
              </Form.Item>
              <Divider className="mt-4" />
              <Form.Item
                hidden={hideTargetValue}
                label="Target"
                {...restSubField}
                name={[subName, 'targetAmount']}
                key={`${subName}-targetAmount-${index}`} // Unique key for targetAmount
              >
                <InputNumber defaultValue={20} />
              </Form.Item>

              <Row justify="space-between">
                <Col>
                  <Space size={10}>
                    <Form.Item
                      label="Weight"
                      {...restSubField}
                      name={[subName, 'weight']}
                      key={`${subName}-weight-${index}`} // Unique key for weight
                    >
                      <InputNumber placeholder={'0'} className="w-16" />
                    </Form.Item>
                    <Form.Item
                      label="Priority"
                      {...restSubField}
                      name={[subName, 'priority']}
                      key={`${subName}-priority-${index}`} // Unique key for priority
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
                        const boardsKey = `board-${name}`; // Create a unique key for the specific list
                        const currentBoardValues =
                          form.getFieldValue([boardsKey, subName]) || [];
                        handleAddName(currentBoardValues, name);
                        handleRemoveBoard(subName, name);
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
