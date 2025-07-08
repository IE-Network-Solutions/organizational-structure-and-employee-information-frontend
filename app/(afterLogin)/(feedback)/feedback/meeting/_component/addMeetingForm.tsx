import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  Radio,
  DatePicker,
  TimePicker,
  Button,
  Checkbox,
  Steps,
} from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import { MdClose } from 'react-icons/md';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetUserDepartment } from '@/store/server/features/okrplanning/okr/department/queries';

import { useCreateMeeting } from '@/store/server/features/CFR/meeting/mutations';
import { useGetAllMeetingType } from '@/store/server/features/CFR/meeting/type/queries';
import {
  useGetMeetingAgendaTemplate,
  useGetMeetingAgendaTemplateById,
} from '@/store/server/features/CFR/meeting/agenda-template/queries';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import dayjs from 'dayjs';

const { Step } = Steps;

export default function AddNewMeetingForm() {
  const [form] = Form.useForm();
  const [step, setStep] = useState(1);
  const [allowGuests, setAllowGuests] = useState(false);
  const { openAddMeeting, setOpenAddMeeting, templateId, setTemplateId } =
    useMeetingStore();
  const [locationType, setMeetingType] = useState<string>('');

  const firstStepFields = [
    'title',
    'type',
    'locationType',
    'location',
    'department',
    'date',
    'startTime',
    'endTime',
    'chairPerson',
    'facilitator',
    'attendees',
  ];

  const { data: allUsers } = useGetAllUsers();
  const { data: Departments } = useGetUserDepartment();
  const { data: meetTypes } = useGetAllMeetingType();
  const peopleOptions = allUsers?.items?.map((i: any) => ({
    value: i.id,
    label: `${i?.firstName} ${i?.middleName} ${i?.lastName}`,
  }));
  const departmentOptions = Departments?.map((i) => ({
    value: i.id,
    label: i?.name,
  }));
  const meetingOptions = meetTypes?.items?.map((i: any) => ({
    value: i.id,
    label: i?.name,
  }));
  const { mutate: createMeeting, isLoading: meetingLoading } =
    useCreateMeeting();
  const handleClose = () => {
    setOpenAddMeeting(false);
  };

  const onNext = async () => {
    try {
      await form.validateFields(firstStepFields);
      setStep(2);
    } catch (e) {
      // validation error
    }
  };

  const onPrev = () => {
    setStep(1);
  };

  const onFinish = (values: any) => {
    const date = values.date;
    const startTime = values.startAt;
    const endTime = values.endAt;

    const startAt = dayjs(
      `${date?.format('YYYY-MM-DD')}T${startTime?.format('HH:mm:ss')}`,
    );
    const endAt = dayjs(
      `${date?.format('YYYY-MM-DD')}T${endTime?.format('HH:mm:ss')}`,
    );
    const attendeeIds = Array.from(
      new Set(
        [
          ...(values.attendeeIds || []),
          values.facilitatorId,
          values.chairpersonId,
        ].filter(Boolean),
      ),
    );
    createMeeting(
      {
        ...values,
        startAt: startAt,
        endAt: endAt,
        agendaItems: values.agendaItems?.map((item: any, index: number) => ({
          agenda: item,
          order: index + 1,
        })),
        attendeeIds: attendeeIds,
        locationType: locationType,
      },
      {
        onSuccess() {
          form.resetFields();
          handleClose();
        },
      },
    );

    // Handle final submission
  };
  const meetingTypeId = Form.useWatch('meetingTypeId', form);

  // You can now use meetingTypeId reactively anywhere in your component
  useEffect(() => {}, [meetingTypeId]);
  const { data: meetingAgendaTemplate } = useGetMeetingAgendaTemplate(
    meetingTypeId || '',
  );
  const { data: meetingAgendaTemplateById } = useGetMeetingAgendaTemplateById(
    templateId || '',
  );
  const meetingTemplateOptions = meetingAgendaTemplate?.items?.map(
    (i: any) => ({
      value: i.id,
      label: i?.name,
    }),
  );
  useEffect(() => {
    if (meetingAgendaTemplateById) {
      const selectedTemplate = meetingAgendaTemplateById;
      if (selectedTemplate) {
        form.setFieldsValue({
          objective: selectedTemplate?.objective,
          agendaItems: meetingAgendaTemplateById.agendaItems?.map(
            (item: any) => item?.agenda,
          ),
        });
      }
    }
  }, [templateId, meetingAgendaTemplateById]);
  const footer = (
    <div className="flex justify-center gap-3 mt-6">
      <Button
        loading={meetingLoading}
        className="w-36"
        onClick={step === 2 ? onPrev : handleClose}
      >
        {step === 2 ? 'Back' : 'Cancel'}
      </Button>
      <Button
        type="primary"
        className="w-36"
        loading={meetingLoading}
        onClick={step === 2 ? () => form.submit() : onNext}
      >
        {step === 2 ? 'Create' : 'Next'}
      </Button>
    </div>
  );

  return (
    <CustomDrawerLayout
      open={openAddMeeting}
      onClose={handleClose}
      modalHeader={
        <h2 className="text-center font-semibold text-lg mb-2">
          Add New Meeting
        </h2>
      }
      width="40%"
      footer={footer}
    >
      <p className="text-center text-gray-600 mb-6 font-medium">
        Meeting Information
      </p>

      <div className="flex justify-center ">
        <Steps
          current={step - 1}
          size="small"
          labelPlacement="vertical"
          className="w-full max-w-md"
        >
          <Step
            icon={
              step === 1 ? (
                <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-blue">
                  <span className="w-3 h-3 bg-blue rounded-full"></span>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-300"></div>
              )
            }
          />
          <Step
            icon={
              step === 2 ? (
                <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-blue">
                  <span className="w-3 h-3 bg-blue rounded-full"></span>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full border border-gray-300"></div>
              )
            }
          />
        </Steps>
      </div>

      <Form
        initialValues={{ meetingTypeId: undefined }}
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        {/* Step 1 */}
        <div style={{ display: step === 1 ? 'block' : 'none' }}>
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please input the title' }]}
          >
            <Input placeholder="Input area" />
          </Form.Item>

          <Form.Item
            rules={[
              { required: true, message: 'Please select a meeting type' },
            ]}
            label="Meeting Type"
            name="meetingTypeId"
          >
            <Select
              showSearch
              placeholder="Select meeting type"
              allowClear
              maxTagCount={3}
              filterOption={(input: any, option: any) =>
                (option?.label ?? '')
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={meetingOptions}
            />
          </Form.Item>

          <Form.Item
            label="Location"
            name="locationType"
            rules={[{ required: true, message: 'Please select location type' }]}
          >
            <Radio.Group
              onChange={(e) => setMeetingType(e.target.value)}
              value={locationType}
              className="flex gap-2 w-full"
            >
              <Radio value="in-person" className="w-full border p-2 rounded-md">
                In-person
              </Radio>
              <Radio value="virtual" className="w-full border p-2 rounded-md">
                Virtual
              </Radio>
              <Radio value="hybrid" className="w-full border p-2 rounded-md">
                Hybrid
              </Radio>
            </Radio.Group>
          </Form.Item>
          {(locationType === 'virtual' || locationType === 'hybrid') && (
            <Form.Item
              label="Enter Link"
              name="virtualLink"
              rules={[{ required: true, message: 'Please enter Virtual Link' }]}
            >
              <Input placeholder="Meeting link" />
            </Form.Item>
          )}

          {(locationType === 'in-person' || locationType === 'hybrid') && (
            <Form.Item
              label="Enter Location"
              name="physicalLocation"
              rules={[{ required: true, message: 'Please enter location' }]}
            >
              <Input placeholder="Conference Room" />
            </Form.Item>
          )}

          <Form.Item
            label="Department"
            name="department"
            rules={[{ required: true, message: 'Please select a department' }]}
          >
            <Select
              showSearch
              placeholder="Select department"
              allowClear
              mode="multiple"
              maxTagCount={3}
              filterOption={(input: any, option: any) =>
                (option?.label ?? '')
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={departmentOptions}
            />
          </Form.Item>

          <div className="grid grid-cols-3 gap-3">
            <Form.Item
              label="Date"
              name="date"
              rules={[{ required: true, message: 'Please select date' }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>

            <Form.Item
              label="Start Time"
              name="startAt"
              rules={[{ required: true, message: 'Please select start time' }]}
            >
              <TimePicker format="hh:mm A" use12Hours className="w-full" />
            </Form.Item>

            <Form.Item
              label="End Time"
              name="endAt"
              dependencies={['startAt']}
              rules={[
                { required: true, message: 'Please select end time' },
                ({ getFieldValue }) => ({
                  validator(notused, value) {
                    const start = getFieldValue('startAt');
                    if (!value || !start || value.isAfter(start)) {
                      return Promise.resolve();
                    }
                    NotificationMessage.warning({
                      message: 'Warning',
                      description: 'End time must be after start time',
                    });
                    return Promise.reject(
                      new Error('End time must be after start time'),
                    );
                  },
                }),
              ]}
            >
              <TimePicker format="hh:mm A" use12Hours className="w-full" />
            </Form.Item>
          </div>

          <Form.Item
            label="Select Chair person"
            name="chairpersonId"
            rules={[{ required: true, message: 'Please select chair person' }]}
          >
            <Select
              showSearch
              placeholder="Select chair person"
              allowClear
              filterOption={(input: any, option: any) =>
                (option?.label ?? '')
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={peopleOptions}
            />
          </Form.Item>

          <Form.Item
            label="Select Facilitator"
            name="facilitatorId"
            rules={[{ required: true, message: 'Please select facilitator' }]}
          >
            <Select
              showSearch
              placeholder="Select a facilitator"
              allowClear
              filterOption={(input: any, option: any) =>
                (option?.label ?? '')
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={peopleOptions}
            />
          </Form.Item>

          <Form.Item
            label="Add Attendee"
            name="attendeeIds"
            rules={[{ required: true, message: 'Please add attendees' }]}
          >
            <Select
              showSearch
              placeholder="Add attendees"
              allowClear
              mode="multiple"
              maxTagCount={3}
              filterOption={(input: any, option: any) =>
                (option?.label ?? '')
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={peopleOptions}
            />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end">
              <Checkbox
                checked={allowGuests}
                onChange={(e) => setAllowGuests(e.target.checked)}
              >
                Allow Guests
              </Checkbox>
            </div>

            {allowGuests && (
              <Form.List name="guests">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} className="flex space-x-3">
                        <Form.Item
                          {...restField}
                          name={[name, 'name']}
                          label="Name"
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
                          className="w-full mt-2"
                        >
                          <Input placeholder="Name" />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, 'email']}
                          label={
                            <div className="flex justify-between items-center w-64">
                              <span>Email</span>
                              <Button
                                icon={<MdClose />}
                                type="link"
                                className="text-black ml-4"
                                onClick={() => remove(name)}
                              />
                            </div>
                          }
                          rules={[
                            {
                              validator: async (notused, value) => {
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

                                const allValues =
                                  form.getFieldValue('guests') || [];
                                const emails = allValues.map((g: any) =>
                                  g?.email?.toLowerCase(),
                                );
                                const duplicates = emails.filter(
                                  (e: any) => e === value.toLowerCase(),
                                );

                                if (duplicates.length > 1) {
                                  return Promise.reject(
                                    new Error('This email is already added'),
                                  );
                                }

                                return Promise.resolve();
                              },
                            },
                          ]}
                          className="w-full"
                        >
                          <Input placeholder="Email" type="email" />
                        </Form.Item>
                      </div>
                    ))}
                    <div className="flex justify-end">
                      <Button type="primary" onClick={() => add()}>
                        Add Guest
                      </Button>
                    </div>
                  </>
                )}
              </Form.List>
            )}
          </Form.Item>
        </div>

        {/* Step 2 */}
        <div style={{ display: step === 2 ? 'block' : 'none' }}>
          <Form.Item
            label="Meeting Objective"
            name="objective"
            rules={[
              { required: true, message: 'Please enter meeting objective' },
            ]}
          >
            <Input.TextArea
              placeholder="[[Meeting Type + Objective]]"
              rows={4}
            />
          </Form.Item>

          <Form.Item
            label="Templates"
            name="template"
            // rules={[{ required: true, message: 'Please select a template' }]}
          >
            <Select
              showSearch
              placeholder="Select template"
              allowClear
              maxTagCount={3}
              filterOption={(input: any, option: any) =>
                (option?.label ?? '')
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={meetingTemplateOptions}
              onChange={(value) => setTemplateId(value)}
            />
          </Form.Item>
          <Form.List name="agendaItems">
            {(fields, { remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="flex mb-1 gap-4 items-center">
                    <Form.Item
                      {...restField}
                      name={name}
                      rules={[
                        { required: true, message: 'Missing agenda item' },
                      ]}
                      className="w-full"
                      label={`Agenda Item ${key + 1}`}
                    >
                      <Input placeholder="Agenda Item" />
                    </Form.Item>
                    <MdClose onClick={() => remove(name)} />
                  </div>
                ))}
              </>
            )}
          </Form.List>
        </div>
      </Form>
    </CustomDrawerLayout>
  );
}
