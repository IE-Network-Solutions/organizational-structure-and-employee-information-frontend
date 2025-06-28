import React, { useEffect, useState } from 'react';
import { Popconfirm, Button, Form, Input, Select } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { LoadingOutlined } from '@ant-design/icons';
import { useCreateMeetingAttendeesBulk } from '@/store/server/features/CFR/meeting/attendees/mutations';

interface AddParticipantsPopconfirmProps {
  loading: boolean;
  meetingId: string;
  attendees: any;
}

const AddParticipantsPopconfirm = ({
  meetingId,
  loading,
  attendees,
}: AddParticipantsPopconfirmProps) => {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const guests = Form.useWatch('guests', form);
  useEffect(() => {}, [guests]);
  const { data: allUsers } = useGetAllUsers();
  const { mutate: meetingAttendees, isLoading } =
    useCreateMeetingAttendeesBulk();
  const attendeeIds = attendees?.map((att: any) => att.userId) ?? [];

  const peopleOptions = allUsers?.items
    ?.filter((user: any) => !attendeeIds.includes(user.id))
    .map((i: any) => ({
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
      { attendees },
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
        overlayStyle={{ width: 353 }}
        icon={false}
        description={null}
        zIndex={0}
        title={
          <Form form={form} layout="vertical" onFinish={handleConfirm}>
            <div className="border p-2 mb-2 rounded-md w-full">
              <Form.Item
                rules={[
                  {
                    required: guests?.length > 0 ? false : true,
                    message: 'Participant is required',
                  },
                ]}
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
                      .toLowerCase()
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
                      <div key={key}>
                        <Form.Item
                          {...restField}
                          name={[name, 'name']}
                          label={
                            <div className="relative w-96 ">
                              <span>Name</span>
                              <Button
                                icon={<MdClose size={12} />}
                                type="link"
                                className="absolute right-0 top-1/2 -translate-y-1/2 text-black"
                                onClick={() => remove(name)}
                              />
                            </div>
                          }
                          rules={[
                            {
                              validator: (notused, value) => {
                                if (!value)
                                  return Promise.reject(
                                    new Error('Name is required'),
                                  );
                                const validName = /^[A-Za-z\s]+$/;
                                if (!validName.test(value)) {
                                  return Promise.reject(
                                    new Error(
                                      'Name can only include letters and spaces',
                                    ),
                                  );
                                }
                                return Promise.resolve();
                              },
                            },
                          ]}
                        >
                          <Input placeholder="Name" />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, 'email']}
                          label="Email"
                          rules={[
                            {
                              validator: (notused, value) => {
                                if (!value) {
                                  return Promise.reject(
                                    new Error('Email is required'),
                                  );
                                }
                                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                if (!emailRegex.test(value)) {
                                  return Promise.reject(
                                    new Error('Enter a valid email'),
                                  );
                                }
                                // Check email existence in attendees guests
                                const emailExists = attendees.some(
                                  (attendee: any) =>
                                    attendee.guestUser?.email.toLowerCase() ===
                                    value.toLowerCase(),
                                );
                                if (emailExists) {
                                  return Promise.reject(
                                    new Error(
                                      'This email is already added as a guest attendee',
                                    ),
                                  );
                                }
                                return Promise.resolve();
                              },
                            },
                          ]}
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
        {/* Dummy element to trigger Popconfirm */}
        <span />
      </Popconfirm>
    </div>
  );
};

export default AddParticipantsPopconfirm;
