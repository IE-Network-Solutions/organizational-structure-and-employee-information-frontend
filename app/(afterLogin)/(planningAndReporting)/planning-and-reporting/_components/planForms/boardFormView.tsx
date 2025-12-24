import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select
} from 'antd';
import { MdCancel } from 'react-icons/md';
import { NAME } from '@/types/enumTypes';
import useClickStatus from '@/store/uistate/features/planningAndReporting/planingState';

interface BoardCardInterface {
  form: any;
  handleAddName: (arg1: Record<string, string>, arg2: string) => void;
  handleRemoveBoard: (arg1: number, arg2: string) => void;
  kId: string;
  hideTargetValue?: boolean;
  name: string;
  isMKAsTask?: boolean;
  keyResult: any;
  targetValue?: number;
  milestoneId?: number;
  parentPlanId?: string;
  onCancle?: () => void;
}

function BoardCardForm({
  form,
  handleAddName,
  handleRemoveBoard,
  hideTargetValue,
  name,
  isMKAsTask = false,
  keyResult,
  targetValue,
  milestoneId,
}: BoardCardInterface) {
  const { setMKAsATask, mkAsATask } = PlanningAndReportingStore();
  const { setClickStatus } = useClickStatus();

  const showTarget = keyResult?.metricType?.name !== NAME.ACHIEVE &&
    keyResult?.metricType?.name !== NAME.MILESTONE;
  return (
    <Form.List name={`board-${name}`}>
      {(subfields, { remove: removeSub }) => (
        <>
          {subfields.map(({ key, name: subName, ...restSubField }) => (
            <Form.Item
              required={false}
              className="py-3"
              key={key}
              style={{ marginBottom: 0 }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', width: '100%', marginBottom: '16px' }} className="[&_.ant-form-item-explain-error]:text-[11px]">
                <Form.Item
                  {...restSubField}
                  name={[subName, 'task']}
                  key={`${subName}-task`} // Unique key for task
                  rules={[{ required: true, message: 'Task is required' }]}
                  initialValue={isMKAsTask ? mkAsATask?.title : ''}
                  style={{ flex: 1, marginBottom: 0 }}
                >
                  <Input
                    disabled={
                      form.getFieldValue(`board-${name}`)?.[subName]?.achieveMK
                    }
                    placeholder="Add your tasks here"
                    className="text-[12px] h-10"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <MdCancel
                  className="text-primary cursor-pointer"
                  size={20}
                  style={{ marginTop: '10px' }}
                  onClick={() => {
                    removeSub(subName);
                    setClickStatus(milestoneId + '', false);
                  }}
                />
              </div>
              <Form.Item
                {...restSubField}
                name={[subName, 'achieveMK']}
                key={`${subName}-task`} // Unique key for task
                noStyle // Use noStyle to avoid nested Form.Item issues
                initialValue={isMKAsTask ? true : false}
              >
                <Input type="hidden" />
              </Form.Item>
              {/* <Divider className="mt-2 mb-2" /> */}
              <div className="mt-2 [&_.ant-form-item-explain-error]:text-[11px]">
                <Row gutter={[12, 12]} align="top">
                  {showTarget && (
                    <Col xs={12} sm={8} md={6}>
                      <Row align="middle" gutter={8} wrap={false}>
                        <Col flex="none">
                          <div className="text-xs flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-primary inline-block"></span>
                            Target
                          </div>
                        </Col>
                        <Col flex="auto">
                          <Form.Item
                            hidden={hideTargetValue}
                            {...restSubField}
                            name={[subName, 'targetValue']}
                            key={`${subName}-targetValue`}
                            style={{ marginBottom: 0 }}
                          >
                            <InputNumber
                              min={0}
                              className="w-full text-xs h-10 [&_.ant-input-number]:h-full [&_.ant-input-number-input-wrap]:h-full [&_.ant-input-number-input-wrap]:flex [&_.ant-input-number-input-wrap]:items-center [&_.ant-input-number-input]:h-full"
                              defaultValue={0}
                              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                  )}

                  <Col xs={showTarget ? 12 : 12} sm={8} md={5}>
                    <Row align="middle" gutter={8} wrap={false}>
                      <Col flex="none">
                        <div className="text-xs flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-primary inline-block"></span>
                          Weight
                        </div>
                      </Col>
                      <Col flex="auto">
                        <Form.Item
                          {...restSubField}
                          name={[subName, 'weight']}
                          key={`${subName}-weight`}
                          style={{ marginBottom: 0 }}
                          rules={[
                            { required: true, message: 'Weight is required' },
                            {
                              validator: (nonused, value) => {
                                if (value !== undefined && value !== null && value <= 0) {
                                  return Promise.reject(new Error('Weight must be greater than 0'));
                                }
                                return Promise.resolve();
                              },
                            },
                          ]}
                        >
                          <InputNumber
                            placeholder={'0'}
                            className="w-full text-xs h-10 [&_.ant-input-number]:h-full [&_.ant-input-number-input-wrap]:h-full [&_.ant-input-number-input-wrap]:flex [&_.ant-input-number-input-wrap]:items-center [&_.ant-input-number-input]:h-full"
                            min={1}
                            max={100}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>

                  <Col xs={12} sm={8} md={6}>
                    <Row align="middle" gutter={8} wrap={false}>
                      <Col flex="none">
                        <div className="text-xs flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-primary inline-block"></span>
                          Priority
                        </div>
                      </Col>
                      <Col flex="auto">
                        <Form.Item
                          {...restSubField}
                          name={[subName, 'priority']}
                          key={`${subName}-priority`}
                          style={{ marginBottom: 0 }}
                          rules={[{ required: true, message: 'Priority is required' }]}
                        >
                          <Select
                            placeholder={<div className="text-xs">Priority</div>}
                            className="w-full h-10"
                            options={[
                              { label: <div className="text-error text-xs">High</div>, value: 'high' },
                              { label: <div className="text-warning text-xs">Medium</div>, value: 'medium' },
                              { label: <div className="text-success text-xs">Low</div>, value: 'low' },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>

                  <Col xs={showTarget ? 12 : 24} sm={24} md={showTarget ? 7 : 13} className="text-right">
                    <Button
                      id="add-task-button-for-planning-and-reporting"
                      type="primary"
                      className="h-10 px-6 font-semibold"
                      onClick={() => {
                        const boardsKey = `board-${name}`;
                        const fieldsToValidate = [
                          [boardsKey, subName, 'task'],
                          [boardsKey, subName, 'weight'],
                          [boardsKey, subName, 'priority'],
                        ];
                        if (showTarget && !hideTargetValue) {
                          fieldsToValidate.push([boardsKey, subName, 'targetValue']);
                        }

                        form.validateFields(fieldsToValidate).then(() => {
                          const currentBoardValues = form.getFieldValue([boardsKey, subName]) || [];
                          handleAddName(currentBoardValues, name);
                          handleRemoveBoard(subName, name);
                          setMKAsATask(null);
                        });
                      }}
                    >
                      Add Task
                    </Button>
                  </Col>
                </Row>
              </div>
            </Form.Item>
          ))}
        </>
      )}
    </Form.List>
  );
}

export default BoardCardForm;
