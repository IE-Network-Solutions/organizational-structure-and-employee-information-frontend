import CustomDrawerLayout from '@/components/common/customDrawer';
import { Button, Form, Input, Row, Select } from 'antd';
import React from 'react';

const AddApproverComponent = ({
  addModal,
  customFieldsDrawerHeader,
  onClose,
  form,
  handleSubmit,
  selectedItem,
  approverType,
  level,
  handleLevelChange,
  handleUserChange,
  users,
}: {
  addModal: any;
  customFieldsDrawerHeader: any;
  onClose: () => void;
  form: any;
  handleSubmit: (a: string) => void;
  selectedItem: any;
  approverType: any;
  level: any;
  handleLevelChange: (a: number) => void;
  handleUserChange: (value: string, index: number) => void;
  users: any;
}) => {
  return (
    <CustomDrawerLayout
      open={addModal}
      modalHeader={customFieldsDrawerHeader}
      onClose={onClose}
      width="40%"
      footer={null}
    >
      <div className="pb-[60px]">
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          initialValues={{
            workFlownName: selectedItem?.name,
          }}
        >
          <Form.Item
            className="text-lg font-bold mt-3 mb-1"
            name="workFlownName"
            label="WorkFlow Name"
            rules={[
              { required: true, message: 'Please enter a workFlow name!' },
            ]}
          >
            <Input disabled placeholder="Enter WorkFlow Name" />
          </Form.Item>

          <div className="my-3">
            <div className="text-lg font-bold ">
              {approverType === 'Parallel' ? 'Approvers' : 'Level'}
            </div>
            <Select
              showSearch
              optionFilterProp="label"
              className="w-full h-10 m-1"
              style={{ width: 120 }}
              onChange={handleLevelChange}
              defaultValue={1}
              placeholder="Select Levels"
              options={Array.from(
                { length: 9 },
                /* eslint-disable-next-line @typescript-eslint/naming-convention */ (
                  _,
                  i,
                ) => ({
                  value: i + 1,
                  label: `${i + 1}`,
                }),
              )}
            />

            <div className="font-medium">
              This is the specific approval stage or level within the process
            </div>
          </div>
          {Array.from({ length: level }).map(
            /* eslint-disable-next-line @typescript-eslint/naming-convention */ (
              _,
              index,
            ) => (
              <div key={index} className="px-10 my-1 ">
                {approverType !== 'Parallel' && (
                  <div>
                    Additional Levels:{' '}
                    {selectedItem?.approvers?.length + index + 1}
                  </div>
                )}

                {approverType === 'Parallel' && (
                  <Form.Item
                    className="font-semibold text-xs"
                    name={`level_${index}`}
                    label="Level"
                    rules={[
                      { required: true, message: 'Please enter a level!' },
                    ]}
                  >
                    <Input placeholder="Enter level" />
                  </Form.Item>
                )}

                <Form.Item
                  className="font-semibold text-xs"
                  name={`assignedUser_${index}`}
                  label={`Assign User `}
                  rules={[{ required: true, message: 'Please select a user!' }]}
                >
                  <Select
                    className="min-w-52 my-3"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    mode={approverType === 'Parallel' ? 'multiple' : undefined}
                    style={{ width: 120 }}
                    onChange={(value) =>
                      handleUserChange(value as string, index)
                    }
                    placeholder="Select User"
                    options={users?.items?.map((list: any) => ({
                      value: list?.id,
                      label: `${list?.firstName ? list?.firstName : ''} ${list?.middleName ? list?.middleName : ''} ${list?.lastName ? list?.lastName : ''}`,
                    }))}
                  />
                </Form.Item>
              </div>
            ),
          )}

          <Form.Item>
            <Row className="flex justify-end gap-3">
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Row>
          </Form.Item>
        </Form>
      </div>
    </CustomDrawerLayout>
  );
};

export default AddApproverComponent;
