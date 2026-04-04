import React, { useEffect, useMemo, useState } from 'react';
import {
  Form,
  Input,
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
import {
  ADD_MEETING_ASSIGNEE_SELECT_STYLES,
  MeetingFormOptionsMultiSelect,
  MeetingFormOptionsSingleSelect,
  MeetingFormUserMultiSelect,
  MeetingFormUserSingleSelect,
} from './meetingFormAssigneeStyleSelects';

const STEPPER_ACTIVE = '#1E40AF';

// Dot stepper (antd progressDot): 8×8px dots, active / connector #1E40AF
const stepperStyles = `
  .add-meeting-form-steps .ant-steps-item-tail::after {
    background-color: #d1d5db !important;
    height: 2px !important;
  }
  .add-meeting-form-steps .ant-steps-item-finish > .ant-steps-item-container > .ant-steps-item-tail::after {
    background-color: ${STEPPER_ACTIVE} !important;
  }
  .add-meeting-form-steps .ant-steps-item-process > .ant-steps-item-container > .ant-steps-item-tail::after {
    background-color: ${STEPPER_ACTIVE} !important;
  }
  /* Step 1: first connector fill tracks form completion (0–100% in quarter steps) */
  .add-meeting-form-steps-step1-progress .add-meeting-form-steps .ant-steps-item:first-child.ant-steps-item-process > .ant-steps-item-container > .ant-steps-item-tail::after {
    background: linear-gradient(
      90deg,
      ${STEPPER_ACTIVE} 0%,
      ${STEPPER_ACTIVE} var(--add-meeting-step1-line-pct, 0%),
      #d1d5db var(--add-meeting-step1-line-pct, 0%),
      #d1d5db 100%
    ) !important;
  }
  /* Step 2: second connector fill tracks attendees-step form (0–100% in quarter steps) */
  .add-meeting-form-steps-step2-progress .add-meeting-form-steps .ant-steps-item:nth-child(2).ant-steps-item-process > .ant-steps-item-container > .ant-steps-item-tail::after {
    background: linear-gradient(
      90deg,
      ${STEPPER_ACTIVE} 0%,
      ${STEPPER_ACTIVE} var(--add-meeting-step2-line-pct, 0%),
      #d1d5db var(--add-meeting-step2-line-pct, 0%),
      #d1d5db 100%
    ) !important;
  }
  .add-meeting-form-steps .ant-steps-item-process > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-title {
    color: ${STEPPER_ACTIVE} !important;
  }
  .add-meeting-form-steps .ant-steps-item-finish > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-title {
    color: ${STEPPER_ACTIVE} !important;
  }
  .add-meeting-form-steps .ant-steps-item-wait > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-title {
    color: rgba(0, 0, 0, 0.45) !important;
  }
`;

export interface AddNewMeetingFormProps {
  /** When true, render as a bordered panel (list view right column) instead of the drawer. */
  embedded?: boolean;
  'data-cy'?: string;
}

export default function AddNewMeetingForm({
  embedded = false,
  'data-cy': dataCy,
}: AddNewMeetingFormProps) {
  const [form] = Form.useForm();
  const [step, setStep] = useState(1);
  const [allowGuests, setAllowGuests] = useState(false);
  const {
    openAddMeeting,
    setOpenAddMeeting,
    templateId,
    setTemplateId,
    addMeetingFormResetNonce,
  } = useMeetingStore();
  const watchedLocationType =
    (Form.useWatch('locationType', form) as string | undefined) ?? '';
  const meetingTypeId = Form.useWatch('meetingTypeId', form);
  const titleW = Form.useWatch('title', form);
  const virtualLinkW = Form.useWatch('virtualLink', form);
  const physicalLocationW = Form.useWatch('physicalLocation', form);
  const departmentW = Form.useWatch('department', form);
  const dateW = Form.useWatch('date', form);
  const startAtW = Form.useWatch('startAt', form);
  const endAtW = Form.useWatch('endAt', form);

  /** Step 1 form completion in 4 quarters → first connector line 0 / 25 / 50 / 75 / 100%. */
  const step1CompletedQuarters = useMemo(() => {
    const q1 =
      typeof titleW === 'string' &&
      titleW.trim() !== '' &&
      meetingTypeId != null &&
      meetingTypeId !== '';
    const lt = watchedLocationType;
    let q2 = false;
    if (lt) {
      const needV = lt === 'virtual' || lt === 'hybrid';
      const needP = lt === 'in-person' || lt === 'hybrid';
      const vOk =
        !needV ||
        (typeof virtualLinkW === 'string' && virtualLinkW.trim() !== '');
      const pOk =
        !needP ||
        (typeof physicalLocationW === 'string' &&
          physicalLocationW.trim() !== '');
      q2 = vOk && pOk;
    }
    const q3 = Array.isArray(departmentW) && departmentW.length > 0;
    const q4 = Boolean(dateW && startAtW && endAtW);
    return [q1, q2, q3, q4].filter(Boolean).length;
  }, [
    titleW,
    meetingTypeId,
    watchedLocationType,
    virtualLinkW,
    physicalLocationW,
    departmentW,
    dateW,
    startAtW,
    endAtW,
  ]);

  const chairpersonIdW = Form.useWatch('chairpersonId', form);
  const facilitatorIdW = Form.useWatch('facilitatorId', form);
  const attendeeIdsW = Form.useWatch('attendeeIds', form);
  const guestsW = Form.useWatch('guests', form);

  /** Step 2: chair → facilitator → attendees → (guests if enabled, else “all required” together). */
  const step2CompletedQuarters = useMemo(() => {
    const q1 = chairpersonIdW != null && chairpersonIdW !== '';
    const q2 = facilitatorIdW != null && facilitatorIdW !== '';
    const q3 = Array.isArray(attendeeIdsW) && attendeeIdsW.length > 0;
    let q4 = false;
    if (!allowGuests) {
      q4 = q1 && q2 && q3;
    } else {
      const guests = Array.isArray(guestsW) ? guestsW : [];
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      q4 =
        guests.length > 0 &&
        guests.every(
          (g: { name?: string; email?: string }) =>
            typeof g?.name === 'string' &&
            g.name.trim() !== '' &&
            typeof g?.email === 'string' &&
            g.email.trim() !== '' &&
            emailRe.test(g.email),
        );
    }
    return [q1, q2, q3, q4].filter(Boolean).length;
  }, [
    chairpersonIdW,
    facilitatorIdW,
    attendeeIdsW,
    allowGuests,
    guestsW,
  ]);

  const { data: allUsers } = useGetAllUsers();
  const { data: Departments } = useGetUserDepartment();
  const { data: meetTypes } = useGetAllMeetingType();
  const departmentSelectOptions = useMemo(
    () =>
      Departments?.map((i) => ({
        value: String(i.id),
        label: i?.name ?? '',
      })) ?? [],
    [Departments],
  );
  const meetingTypeSelectOptions = useMemo(
    () =>
      meetTypes?.items?.map((i: any) => ({
        value: String(i.id),
        label: i?.name ?? '',
      })) ?? [],
    [meetTypes],
  );
  const { mutate: createMeeting, isLoading: meetingLoading } =
    useCreateMeeting();
  const resetFormState = () => {
    form.resetFields();
    setStep(1);
    setAllowGuests(false);
  };

  const handleClose = () => {
    if (embedded) {
      resetFormState();
    } else {
      setOpenAddMeeting(false);
    }
  };

  useEffect(() => {
    if (!embedded || addMeetingFormResetNonce === 0) return;
    resetFormState();
  }, [addMeetingFormResetNonce, embedded]);

  const getStep1FieldNames = (): string[] => {
    const names = [
      'title',
      'meetingTypeId',
      'locationType',
      'department',
      'date',
      'startAt',
      'endAt',
    ];
    const lt = form.getFieldValue('locationType');
    if (lt === 'virtual' || lt === 'hybrid') names.push('virtualLink');
    if (lt === 'in-person' || lt === 'hybrid') names.push('physicalLocation');
    return names;
  };

  const getStep3FieldNames = (): string[] => ['objective', 'agendaItems'];

  const onNext = async () => {
    try {
      if (step === 1) {
        await form.validateFields(getStep1FieldNames());
        setStep(2);
      } else if (step === 2) {
        const step2Names = ['chairpersonId', 'facilitatorId', 'attendeeIds'];
        await form.validateFields(step2Names);
        if (allowGuests) {
          await form.validateFields(['guests']);
        }
        setStep(3);
      }
    } catch {
      // validation error
    }
  };

  const onBack = () => {
    setStep((s) => Math.max(1, s - 1));
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
        locationType: values.locationType,
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

  const { data: meetingAgendaTemplate } = useGetMeetingAgendaTemplate(
    meetingTypeId || '',
  );
  const { data: meetingAgendaTemplateById } = useGetMeetingAgendaTemplateById(
    templateId || '',
  );
  const meetingTemplateSelectOptions = useMemo(
    () =>
      meetingAgendaTemplate?.items?.map((i: any) => ({
        value: String(i.id),
        label: i?.name ?? '',
      })) ?? [],
    [meetingAgendaTemplate],
  );

  const templateField = Form.useWatch('template', form);
  useEffect(() => {
    setTemplateId(templateField ?? '');
  }, [templateField, setTemplateId]);

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
  const onSubmitStep3 = async () => {
    try {
      await form.validateFields(getStep3FieldNames());
      form.submit();
    } catch {
      // validation error
    }
  };

  const footerSecondaryBtnClass =
    'inline-flex h-8 min-h-8 items-center justify-center rounded-[6px] px-[15px] text-[14px] leading-none';
  const footerPrimaryBtnClass =
    'inline-flex !h-[40px] !min-h-[40px] items-center justify-center rounded-[6px] !px-[15px] text-[14px] leading-none';

  const footer = (
    <div
      className={`flex justify-end gap-3 ${embedded ? 'mt-0' : 'mt-6'}`}
      data-cy="add-meeting-form-footer"
      id="addMeetingFormFooter"
    >
      <Button
        loading={meetingLoading}
        className={footerSecondaryBtnClass}
        onClick={step === 1 ? handleClose : onBack}
        data-cy="add-meeting-form-cancel-button"
        id="addMeetingFormCancelButton"
      >
        {step === 1 ? 'Cancel' : 'Back'}
      </Button>
      <Button
        type="primary"
        className={footerPrimaryBtnClass}
        loading={meetingLoading}
        onClick={step === 3 ? onSubmitStep3 : onNext}
        data-cy="add-meeting-form-submit-button"
        id="addMeetingFormSubmitButton"
      >
        {step === 3 ? 'Create' : 'Continue'}
      </Button>
    </div>
  );

  const formBody = (
    <>
      <style
        data-cy="add-meeting-form-stepper-styles"
        id="addMeetingFormStepperStyles"
      >
        {stepperStyles}
      </style>
      <style
        data-cy="add-meeting-form-assignee-select-styles"
        id="addMeetingFormAssigneeSelectStyles"
      >
        {ADD_MEETING_ASSIGNEE_SELECT_STYLES}
      </style>
      <div
        className="mb-4 flex justify-center p-[4px]"
        data-cy="add-meeting-form-steps-container"
        id="addMeetingFormStepsContainer"
      >
        <div
          className={[
            step === 1 && 'add-meeting-form-steps-step1-progress',
            step === 2 && 'add-meeting-form-steps-step2-progress',
          ]
            .filter(Boolean)
            .join(' ')}
          style={
            {
              ...(step === 1 && {
                ['--add-meeting-step1-line-pct' as string]: `${step1CompletedQuarters * 25}%`,
              }),
              ...(step === 2 && {
                ['--add-meeting-step2-line-pct' as string]: `${step2CompletedQuarters * 25}%`,
              }),
            } as React.CSSProperties
          }
        >
          <Steps
            current={step - 1}
            size="small"
            labelPlacement="vertical"
            progressDot={(_dot, { status }) => (
              <span
                aria-hidden
                className="mx-auto block shrink-0 rounded-full"
                style={{
                  width: 8,
                  height: 8,
                  backgroundColor:
                    status === 'wait' ? '#d1d5db' : STEPPER_ACTIVE,
                }}
              />
            )}
            className="add-meeting-form-steps w-full max-w-xl"
            items={[
              { title: 'Meeting Information' },
              { title: 'Meeting Attendees' },
              { title: 'Additional Information' },
            ]}
            data-cy="add-meeting-form-steps"
          />
        </div>
      </div>

      <Form
        initialValues={{ meetingTypeId: undefined }}
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="add-meeting-form"
        data-cy="add-meeting-form"
        id="addMeetingForm"
      >
        {/* Step 1 — Tailwind `important: true` overrides inline display:none; use `hidden` */}
        <div
          className={
            step === 1
              ? 'flex flex-col gap-[15px]'
              : 'hidden'
          }
          data-cy="add-meeting-form-step-1-content"
          id="addMeetingFormStep1Content"
        >
          <Form.Item
            label="Meeting Name"
            name="title"
            rules={[{ required: true, message: 'Please input the meeting name' }]}
            className="!mb-0"
            data-cy="add-meeting-form-title-field"
            id="addMeetingFormTitleField"
          >
            <Input
              placeholder="Input"
              className="h-8"
              data-cy="add-meeting-form-title-input"
              id="addMeetingFormTitleInput"
            />
          </Form.Item>

          <Form.Item
            rules={[
              { required: true, message: 'Please select a meeting type' },
            ]}
            label="Meeting Type"
            name="meetingTypeId"
            className="!mb-0"
            data-cy="add-meeting-form-meeting-type-field"
            id="addMeetingFormMeetingTypeField"
          >
            <MeetingFormOptionsSingleSelect
              options={meetingTypeSelectOptions}
              hint="Select"
              data-cy="add-meeting-form-meeting-type-select"
            />
          </Form.Item>

          <Form.Item
            label="Location"
            name="locationType"
            rules={[{ required: true, message: 'Please select location type' }]}
            className="!mb-0"
            data-cy="add-meeting-form-location-type-field"
            id="addMeetingFormLocationTypeField"
          >
            <Radio.Group
              className="flex w-full flex-row gap-2"
              data-cy="add-meeting-form-location-type-group"
              id="addMeetingFormLocationTypeGroup"
            >
              <Radio
                value="in-person"
                className="flex h-8 flex-1 items-center rounded-md border px-2 py-0 !mr-0"
                data-cy="add-meeting-form-location-type-in-person"
                id="addMeetingFormLocationTypeInPerson"
              >
                <span
                  className="ml-2"
                  data-cy="add-meeting-form-location-type-in-person-label"
                  id="addMeetingFormLocationTypeInPersonLabel"
                >
                  In person
                </span>
              </Radio>
              <Radio
                value="virtual"
                className="flex h-8 flex-1 items-center rounded-md border px-2 py-0 !mr-0"
                data-cy="add-meeting-form-location-type-virtual"
                id="addMeetingFormLocationTypeVirtual"
              >
                <span
                  className="ml-2"
                  data-cy="add-meeting-form-location-type-virtual-label"
                  id="addMeetingFormLocationTypeVirtualLabel"
                >
                  Virtual
                </span>
              </Radio>
              <Radio
                value="hybrid"
                className="flex h-8 flex-1 items-center rounded-md border px-2 py-0 !mr-0"
                data-cy="add-meeting-form-location-type-hybrid"
                id="addMeetingFormLocationTypeHybrid"
              >
                <span
                  className="ml-2"
                  data-cy="add-meeting-form-location-type-hybrid-label"
                  id="addMeetingFormLocationTypeHybridLabel"
                >
                  Hybrid
                </span>
              </Radio>
            </Radio.Group>
          </Form.Item>
          {(watchedLocationType === 'virtual' ||
            watchedLocationType === 'hybrid') && (
            <Form.Item
              label="Enter Link"
              name="virtualLink"
              rules={[{ required: true, message: 'Please enter Virtual Link' }]}
              className="!mb-0"
              data-cy="add-meeting-form-virtual-link-field"
              id="addMeetingFormVirtualLinkField"
            >
              <Input
                placeholder="Meeting link"
                className="h-8"
                data-cy="add-meeting-form-virtual-link-input"
                id="addMeetingFormVirtualLinkInput"
              />
            </Form.Item>
          )}

          {(watchedLocationType === 'in-person' ||
            watchedLocationType === 'hybrid') && (
            <Form.Item
              label="Enter Location"
              name="physicalLocation"
              rules={[{ required: true, message: 'Please enter location' }]}
              className="!mb-0"
              data-cy="add-meeting-form-physical-location-field"
              id="addMeetingFormPhysicalLocationField"
            >
              <Input
                placeholder="Conference Room"
                className="h-8"
                data-cy="add-meeting-form-physical-location-input"
                id="addMeetingFormPhysicalLocationInput"
              />
            </Form.Item>
          )}

          <Form.Item
            label="Department"
            name="department"
            rules={[{ required: true, message: 'Please select a department' }]}
            className="!mb-0"
            data-cy="add-meeting-form-department-field"
            id="addMeetingFormDepartmentField"
          >
            <MeetingFormOptionsMultiSelect
              options={departmentSelectOptions}
              hint="Select"
              data-cy="add-meeting-form-department-select"
            />
          </Form.Item>

          <div
            className="grid grid-cols-3 gap-3"
            data-cy="add-meeting-form-date-time-container"
            id="addMeetingFormDateTimeContainer"
          >
            <Form.Item
              label="Date"
              name="date"
              rules={[{ required: true, message: 'Please select date' }]}
              className="!mb-0"
              data-cy="add-meeting-form-date-field"
              id="addMeetingFormDateField"
            >
              <DatePicker
                placeholder="Select date"
                className="w-full h-8"
                disabledDate={(current) =>
                  current && current < dayjs().startOf('day')
                }
                data-cy="add-meeting-form-date-picker"
                id="addMeetingFormDatePicker"
              />
            </Form.Item>

            <Form.Item
              label="Start Time"
              name="startAt"
              rules={[{ required: true, message: 'Please select start time' }]}
              className="!mb-0"
              data-cy="add-meeting-form-start-time-field"
              id="addMeetingFormStartTimeField"
            >
              <TimePicker
                format="hh:mm A"
                use12Hours
                placeholder="Select time"
                className="w-full h-8"
                data-cy="add-meeting-form-start-time-picker"
                id="addMeetingFormStartTimePicker"
              />
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
              className="!mb-0"
              data-cy="add-meeting-form-end-time-field"
              id="addMeetingFormEndTimeField"
            >
              <TimePicker
                format="hh:mm A"
                use12Hours
                placeholder="Select time"
                className="w-full h-8"
                data-cy="add-meeting-form-end-time-picker"
                id="addMeetingFormEndTimePicker"
              />
            </Form.Item>
          </div>
        </div>

        {/* Step 2 — Attendees */}
        <div
          className={
            step === 2
              ? 'flex flex-col gap-[15px]'
              : 'hidden'
          }
          data-cy="add-meeting-form-step-2-content"
          id="addMeetingFormStep2Content"
        >
          <Form.Item
            label="Select Chair Person"
            name="chairpersonId"
            rules={[{ required: true, message: 'Please select chair person' }]}
            className="!mb-0"
            data-cy="add-meeting-form-chairperson-field"
            id="addMeetingFormChairpersonField"
          >
            <MeetingFormUserSingleSelect
              allUsers={allUsers}
              hint="Select"
              data-cy="add-meeting-form-chairperson-select"
            />
          </Form.Item>

          <Form.Item
            label="Select Facilitator"
            name="facilitatorId"
            rules={[{ required: true, message: 'Please select facilitator' }]}
            className="!mb-0"
            data-cy="add-meeting-form-facilitator-field"
            id="addMeetingFormFacilitatorField"
          >
            <MeetingFormUserSingleSelect
              allUsers={allUsers}
              hint="Select"
              data-cy="add-meeting-form-facilitator-select"
            />
          </Form.Item>

          <Form.Item
            label="Select Attendees"
            name="attendeeIds"
            rules={[{ required: true, message: 'Please add attendees' }]}
            className="!mb-0"
            data-cy="add-meeting-form-attendees-field"
            id="addMeetingFormAttendeesField"
          >
            <MeetingFormUserMultiSelect
              allUsers={allUsers}
              hint="Select"
              data-cy="add-meeting-form-attendees-select"
            />
          </Form.Item>

          <Form.Item
            className="!mb-0"
            data-cy="add-meeting-form-allow-guests-field"
            id="addMeetingFormAllowGuestsField"
          >
            <div
              className="rounded-lg border border-blue-500 p-3"
              data-cy="add-meeting-form-allow-guests-container"
              id="addMeetingFormAllowGuestsContainer"
            >
              <Checkbox
                checked={allowGuests}
                onChange={(e) => {
                  setAllowGuests(e.target.checked);
                  if (e.target.checked) {
                    const currentGuests = form.getFieldValue('guests') || [];
                    form.setFieldsValue({
                      guests: [...currentGuests, { name: '', email: '' }],
                    });
                  } else {
                    form.setFieldsValue({ guests: [] });
                  }
                }}
                className="items-start"
                data-cy="add-meeting-form-allow-guests-checkbox"
                id="addMeetingFormAllowGuestsCheckbox"
              >
                <span className="inline-block pl-2">
                  <span
                    className="font-semibold text-[#262626]"
                    data-cy="add-meeting-form-allow-guests-label"
                    id="addMeetingFormAllowGuestsLabel"
                  >
                    Allow Guests
                  </span>
                  <div className="mt-1 text-sm font-normal text-gray-600">
                    People that are not users of selamnew workspace can attend
                    this meeting.
                  </div>
                </span>
              </Checkbox>
            </div>

            {allowGuests && (
              <Form.List name="guests" data-cy="add-meeting-form-guests-list">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div
                        key={key}
                        className="bg-gray-50 p-4 rounded-lg mb-3 border"
                        data-cy={`add-meeting-form-guest-item-${name}`}
                        id={`addMeetingFormGuestItem${name}`}
                      >
                        <div
                          className="flex justify-between items-center mb-3"
                          data-cy={`add-meeting-form-guest-header-${name}`}
                          id={`addMeetingFormGuestHeader${name}`}
                        >
                          <span
                            className="font-semibold text-gray-700"
                            data-cy="add-meeting-form-guest-header-label"
                            id="addMeetingFormGuestHeaderLabel"
                          >
                            {name === 0 ? 'First Guest' : `Guest ${name + 1}`}
                          </span>
                          <Button
                            icon={
                              <MdClose
                                data-cy="add-meeting-form-guest-header-remove-icon"
                                id="addMeetingFormGuestHeaderRemoveIcon"
                              />
                            }
                            type="text"
                            className="text-gray-500 hover:text-red-500"
                            onClick={() => remove(name)}
                            data-cy={`add-meeting-form-remove-guest-${name}`}
                            id={`addMeetingFormRemoveGuest${name}`}
                          />
                        </div>
                        <div
                          className="grid grid-cols-2 gap-3"
                          data-cy={`add-meeting-form-guest-fields-${name}`}
                          id={`addMeetingFormGuestFields${name}`}
                        >
                          <Form.Item
                            {...restField}
                            name={[name, 'name']}
                            label="Guest Name"
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
                            className="w-full"
                            data-cy={`add-meeting-form-guest-name-field-${name}`}
                            id={`addMeetingFormGuestNameField${name}`}
                          >
                            <Input
                              placeholder="Name"
                              className="h-8"
                              data-cy={`add-meeting-form-guest-name-input-${name}`}
                              id={`addMeetingFormGuestNameInput${name}`}
                            />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, 'email']}
                            label="Guest Email"
                            rules={[
                              {
                                validator: async (notused, value) => {
                                  if (!value) {
                                    return Promise.reject(
                                      new Error('Email is required'),
                                    );
                                  }

                                  const emailRegex =
                                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
                            data-cy={`add-meeting-form-guest-email-field-${name}`}
                            id={`addMeetingFormGuestEmailField${name}`}
                          >
                            <Input
                              placeholder="Email"
                              type="email"
                              className="h-8"
                              data-cy={`add-meeting-form-guest-email-input-${name}`}
                              id={`addMeetingFormGuestEmailInput${name}`}
                            />
                          </Form.Item>
                        </div>
                      </div>
                    ))}
                    <div
                        className="flex justify-end"
                      data-cy="add-meeting-form-add-guest-button-container"
                      id="addMeetingFormAddGuestButtonContainer"
                    >
                      <Button
                        type="primary"
                        onClick={() => add()}
                        className="h-8"
                        data-cy="add-meeting-form-add-guest-button"
                        id="addMeetingFormAddGuestButton"
                      >
                        Add
                      </Button>
                    </div>
                  </>
                )}
              </Form.List>
            )}
          </Form.Item>
        </div>

        {/* Step 3 — Additional information */}
        <div
          className={
            step === 3
              ? 'flex flex-col gap-[15px]'
              : 'hidden'
          }
          data-cy="add-meeting-form-step-3-content"
          id="addMeetingFormStep3Content"
        >
          <Form.Item
            label="Meeting Objective"
            name="objective"
            rules={[
              { required: true, message: 'Please enter meeting objective' },
            ]}
            className="!mb-0"
            data-cy="add-meeting-form-objective-field"
            id="addMeetingFormObjectiveField"
          >
            <Input.TextArea
              placeholder="[[Meeting Type + Objective]]"
              rows={1}
              autoSize={{ minRows: 1, maxRows: 8 }}
              className="min-h-8"
              data-cy="add-meeting-form-objective-textarea"
              id="addMeetingFormObjectiveTextarea"
            />
          </Form.Item>

          <Form.Item
            label="Templates"
            name="template"
            className="!mb-0"
            // rules={[{ required: true, message: 'Please select a template' }]}
            data-cy="add-meeting-form-template-field"
            id="addMeetingFormTemplateField"
          >
            <MeetingFormOptionsSingleSelect
              options={meetingTemplateSelectOptions}
              hint="Select template"
              data-cy="add-meeting-form-template-select"
            />
          </Form.Item>
          <Form.List
            name="agendaItems"
            data-cy="add-meeting-form-agenda-items-list"
          >
            {(fields, { remove }) => (
              <div className="flex flex-col gap-[15px]">
                {fields.map(({ key, name, ...restField }) => (
                  <div
                    key={key}
                    className="flex mb-1 gap-4 items-center"
                    data-cy={`add-meeting-form-agenda-item-${name}`}
                    id={`addMeetingFormAgendaItem${name}`}
                  >
                    <Form.Item
                      {...restField}
                      name={name}
                      rules={[
                        { required: true, message: 'Missing agenda item' },
                      ]}
                      className="w-full"
                      label={`Agenda Item ${key + 1}`}
                      data-cy={`add-meeting-form-agenda-item-field-${name}`}
                      id={`addMeetingFormAgendaItemField${name}`}
                    >
                      <Input
                        placeholder="Agenda Item"
                        className="h-8"
                        data-cy={`add-meeting-form-agenda-item-input-${name}`}
                        id={`addMeetingFormAgendaItemInput${name}`}
                      />
                    </Form.Item>
                    <MdClose
                      onClick={() => remove(name)}
                      data-cy={`add-meeting-form-remove-agenda-item-${name}`}
                      id={`addMeetingFormRemoveAgendaItem${name}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </Form.List>
        </div>
      </Form>
    </>
  );

  if (embedded) {
    return (
      <div
        className="box-border flex h-auto w-full max-w-full min-w-0 flex-col gap-[15px] overflow-hidden rounded-[8px] border-[1px] border-solid border-[#D9D9D9] bg-white px-4 py-[15px] opacity-100 xl:h-[720px] xl:min-h-0"
        data-cy={dataCy ?? 'feedback-meeting-add-meeting-inline-panel'}
      >
        <h2
          className="shrink-0 text-left text-base font-normal text-black/70"
          data-cy="add-meeting-form-header-inline"
          id="addMeetingFormHeaderInline"
        >
          Create Meeting
        </h2>
        <div className="flex min-w-0 flex-col xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:scrollbar-none">
          {formBody}
        </div>
        <div className="shrink-0">{footer}</div>
      </div>
    );
  }

  return (
    <CustomDrawerLayout
      open={openAddMeeting}
      onClose={handleClose}
      modalHeader={
        <div className="w-full text-left">
          <h2
            className="text-base font-normal text-black/70"
            data-cy="add-meeting-form-header"
            id="addMeetingFormHeader"
          >
            Create Meeting
          </h2>
        </div>
      }
      width="40%"
      footer={footer}
      data-cy="add-meeting-form-drawer"
    >
      {formBody}
    </CustomDrawerLayout>
  );
}
