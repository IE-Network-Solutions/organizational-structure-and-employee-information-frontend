import React, { useMemo, useState } from 'react';
import { Button, Form, Input, Modal } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useCreateMeetingAttendeesBulk } from '@/store/server/features/CFR/meeting/attendees/mutations';
import { meetingFormRequiredMark } from '../../_component/meetingFormRequiredMark';
import {
  ADD_MEETING_ASSIGNEE_SELECT_STYLES,
  MeetingFormUserMultiSelect,
} from '../../_component/meetingFormAssigneeStyleSelects';

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
  const { data: allUsers } = useGetAllUsers();
  const { mutateAsync: meetingAttendeesAsync, isLoading } =
    useCreateMeetingAttendeesBulk();

  const selectableUsers = useMemo(() => {
    const ids = attendees?.map((att: any) => att.userId) ?? [];
    return allUsers?.items?.filter((user: any) => !ids.includes(user.id)) ?? [];
  }, [allUsers?.items, attendees]);

  const buildPayload = (values: any) => [
    ...(values?.participants
      ? values.participants.map((userId: string) => ({
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
      ? values.guests.map((guest: any) => ({
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

  const handleModalOk = async () => {
    const values = await form.validateFields();
    await meetingAttendeesAsync({ attendees: buildPayload(values) });
    form.resetFields();
    setVisible(false);
  };

  const handleClose = () => {
    form.resetFields();
    setVisible(false);
  };

  const footer = (
    <div
      className="flex justify-end gap-2"
      data-cy="feedback-meeting-components-addparticipant-footer"
    >
      <Button
        className="flex h-[32px] items-center justify-center rounded-[8px] border border-solid border-[#D9D9D9] px-[15px] py-0 text-[14px] font-normal text-[#595959] hover:text-[#262626]"
        onClick={handleClose}
        disabled={isLoading}
        data-cy="feedback-meeting-components-addparticipant-button-cancel"
      >
        Cancel
      </Button>
      <Button
        type="primary"
        className="flex h-[32px] items-center justify-center rounded-[8px] border-none bg-[#1E40AF] px-[15px] py-0 text-[14px] font-normal hover:bg-[#1e3a8a]"
        onClick={handleModalOk}
        loading={isLoading}
        data-cy="feedback-meeting-components-addparticipant-button-submit"
      >
        Add Participants
      </Button>
    </div>
  );

  return (
    <div data-cy="feedback-meeting-components-addparticipant-div">
      <Button
        loading={loading}
        type="primary"
        className="!h-[22px] !px-[15px] !rounded-[6px] !text-[14px] !font-normal flex items-center justify-center !bg-[#1E40AF]"
        onClick={() => setVisible(true)}
        data-cy="feedback-meeting-components-addparticipant-button-open"
      >
        Add
      </Button>

      <Modal
        title={
          <span
            className="text-[16px] font-bold text-black/70"
            data-cy="feedback-meeting-components-addparticipant-modal-title"
          >
            Add attendees
          </span>
        }
        open={visible}
        onCancel={handleClose}
        footer={footer}
        confirmLoading={isLoading}
        width={480}
        destroyOnClose
        maskClosable={!isLoading}
        closable={!isLoading}
        className="okr-settings-modal meeting-add-attendees-modal"
        data-cy="feedback-meeting-components-addparticipant-modal"
      >
        <style
          jsx
          global
          data-cy="feedback-meeting-components-addparticipant-modal-global-styles"
        >{`
          ${ADD_MEETING_ASSIGNEE_SELECT_STYLES}
          .okr-settings-modal .ant-modal-content {
            padding: 0 !important;
          }
          .okr-settings-modal .ant-modal-header {
            padding: 20px 24px 8px 24px !important;
            border-bottom: none !important;
            margin-bottom: 0 !important;
          }
          .okr-settings-modal .ant-modal-body {
            padding: 12px 24px !important;
          }
          .okr-settings-modal .ant-modal-footer {
            padding: 1px 24px 20px 24px !important;
            border-top: none !important;
            margin-top: 0 !important;
          }
          .okr-settings-modal .ant-modal-close {
            width: 22px !important;
            height: 22px !important;
          }
          .okr-settings-modal .ant-modal-close-x {
            width: 22px !important;
            height: 22px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .okr-settings-modal .ant-modal-close .anticon,
          .okr-settings-modal .ant-modal-close svg {
            width: 16px !important;
            height: 16px !important;
            font-size: 16px !important;
          }
          .meeting-add-attendees-modal .ant-input {
            height: 40px !important;
            min-height: 40px !important;
          }
        `}</style>
        <Form
          form={form}
          layout="vertical"
          preserve={false}
          requiredMark={meetingFormRequiredMark}
          className="add-meeting-form meeting-form-field-spacing pt-1"
          data-cy="feedback-meeting-components-addparticipant-form"
        >
          <div
            className="border p-2 mb-2 rounded-md w-full"
            id="feedback-meeting-components-addparticipant-form-div-participants"
            data-cy="feedback-meeting-components-addparticipant-form-div-participants"
          >
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
              <MeetingFormUserMultiSelect
                allUsers={{ items: selectableUsers }}
                hint="Select person"
                data-cy="feedback-meeting-components-addparticipant-select-participants"
              />
            </Form.Item>
          </div>

          <div
            className="border p-2 mb-2 rounded-md w-full"
            id="feedback-meeting-components-addparticipant-form-div-guests"
            data-cy="feedback-meeting-components-addparticipant-form-div-guests"
          >
            <Form.List
              name="guests"
              data-cy="feedback-meeting-components-addparticipant-list-guests"
            >
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div
                      key={key}
                      id={`feedback-meeting-components-addparticipant-item-${key}`}
                      data-cy={`feedback-meeting-components-addparticipant-item-${key}`}
                    >
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        label={
                          <div
                            className="relative w-96 "
                            id={`feedback-meeting-components-addparticipant-item-label-${key}`}
                            data-cy={`feedback-meeting-components-addparticipant-item-label-${key}`}
                          >
                            <span
                              id={`feedback-meeting-components-addparticipant-item-label-span-${key}`}
                              data-cy={`feedback-meeting-components-addparticipant-item-label-span-${key}`}
                            >
                              Name
                            </span>
                            <Button
                              icon={
                                <MdClose
                                  size={12}
                                  id={`feedback-meeting-components-addparticipant-button-remove-guest-icon-${key}`}
                                  data-cy={`feedback-meeting-components-addparticipant-button-remove-guest-icon-${key}`}
                                />
                              }
                              type="link"
                              className="absolute right-0 top-1/2 -translate-y-1/2 text-black"
                              onClick={() => remove(name)}
                              data-cy={`feedback-meeting-components-addparticipant-button-remove-guest-${key}`}
                              id={`feedback-meeting-components-addparticipant-button-remove-guest-${key}`}
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
                        <Input
                          placeholder="Name"
                          id={`feedback-meeting-components-addparticipant-input-name-${key}`}
                          data-cy={`feedback-meeting-components-addparticipant-input-name-${key}`}
                        />
                      </Form.Item>

                      <Form.Item
                        id={`feedback-meeting-components-addparticipant-item-email-${key}`}
                        data-cy={`feedback-meeting-components-addparticipant-item-email-${key}`}
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
                        <Input
                          placeholder="Email"
                          id={`feedback-meeting-components-addparticipant-input-email-${key}`}
                          data-cy={`feedback-meeting-components-addparticipant-input-email-${key}`}
                        />
                      </Form.Item>
                    </div>
                  ))}
                  <div
                    className="flex items-center justify-end gap-2 mt-2"
                    id="feedback-meeting-components-addparticipant-div-add-guest"
                    data-cy="feedback-meeting-components-addparticipant-div-add-guest"
                  >
                    <span
                      id="feedback-meeting-components-addparticipant-span-add-guest"
                      data-cy="feedback-meeting-components-addparticipant-span-add-guest"
                    >
                      Add Guest
                    </span>
                    <Button
                      icon={
                        <FaPlus
                          size={12}
                          id="feedback-meeting-components-addparticipant-button-add-guest-icon"
                          data-cy="feedback-meeting-components-addparticipant-button-add-guest-icon"
                        />
                      }
                      type="default"
                      onClick={() => add()}
                      className="w-6 h-6 p-0 flex items-center justify-center"
                      data-cy="feedback-meeting-components-addparticipant-button-add-guest"
                    />
                  </div>
                </>
              )}
            </Form.List>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AddParticipantsPopconfirm;
