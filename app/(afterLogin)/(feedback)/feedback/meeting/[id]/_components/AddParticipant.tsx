import React, { useState } from 'react';
import { Popconfirm, Button, Form, Input, Select } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useCreateMeetingAttendeesBulk } from '@/store/server/features/CFR/meeting/mutations';
import { LoadingOutlined } from '@ant-design/icons';

interface AddParticipantsPopconfirmProps {
  loading: boolean;
  meetingId: string;
}

const AddParticipantsPopconfirm = ({
  meetingId,
  loading,
}: AddParticipantsPopconfirmProps) => {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const { data: allUsers } = useGetAllUsers();
  const { mutate: meetingAttendees, isLoading } =
    useCreateMeetingAttendeesBulk();
  const peopleOptions = allUsers?.items?.map((i: any) => ({
    value: i.id,
    label: `${i?.firstName} ${i?.middleName} ${i?.lastName}`,
  }));
  const handleConfirm = (values: any) => {
    const attendees = [
      ...(values?.participants
        ? values?.participants?.map((userId: string) => ({
            meetingId,
            userId,
            guestUser: null,
            attendanceStatus: 'attended',
            absentismReason: '',
            lateBy: 0,
            acknowledgedMom: false,
          }))
        : []),
      ...(values?.guests
        ? values?.guests?.map((guest: any) => ({
            meetingId,
            userId: null,
            guestUser: {
              name: guest.name,
              email: guest.email,
            },
            attendanceStatus: 'attended',
            absentismReason: '',
            lateBy: 0,
            acknowledgedMom: false,
          }))
        : []),
    ];

    meetingAttendees(
      { attendees: attendees },
      {
        onSuccess() {
          form.resetFields();
          setVisible(false);
        },
      },
    );
  };

  return (
    <div>
      <Button
        loading={loading}
        icon={<FaPlus />}
        type="primary"
        onClick={() => setVisible(true)}
      >
        Add
      </Button>

      <Popconfirm
        placement="bottomRight"
        visible={visible}
        overlayStyle={{ width: 370 }}
        icon={false}
        description={null} // disables default message
        zIndex={0}
        title={
          <Form form={form} layout="vertical" onFinish={handleConfirm}>
            <div className="border p-2 mb-2 rounded-md w-full">
              <Form.Item
                rules={[{ required: true, message: 'Participant is required' }]}
                label="Name"
                name="participants"
              >
                <Select
                  showSearch
                  placeholder="Select person"
                  allowClear
                  mode="multiple"
                  filterOption={(input: any, option: any) =>
                    (option?.label ?? '')
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={peopleOptions}
                />
              </Form.Item>
            </div>

            <div className="border p-2 mb-2 rounded-md w-full">
              <Form.List name="guests">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} className="">
                        <Form.Item
                          {...restField}
                          name={[name, 'name']}
                          rules={[
                            { required: true, message: 'Name is required' },
                          ]}
                          label={
                            <div className="flex justify-between items-center w-72">
                              <span>Name</span>
                              <Button
                                icon={<MdClose size={12} />}
                                type="link"
                                className="text-black ml-4"
                                onClick={() => remove(name)}
                              />
                            </div>
                          }
                        >
                          <Input placeholder="Name" />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, 'email']}
                          rules={[
                            { required: true, message: 'Email is required' },
                          ]}
                          label="Email"
                        >
                          <Input placeholder="Email" />
                        </Form.Item>
                      </div>
                    ))}
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <span>Add Guest</span>
                      <Button
                        icon={<FaPlus size={12} />}
                        type="default"
                        onClick={() => add()}
                        className="w-6 h-6 p-0 flex items-center justify-center"
                      />
                    </div>
                  </>
                )}
              </Form.List>
            </div>
          </Form>
        }
        onConfirm={() => form.submit()}
        onCancel={() => setVisible(false)}
        cancelText="Cancel"
        okText={isLoading ? <LoadingOutlined /> : 'Add Participants'}
      >
        {/* Dummy element since Popconfirm needs a child */}
        <span />
      </Popconfirm>
    </div>
  );
};

export default AddParticipantsPopconfirm;
