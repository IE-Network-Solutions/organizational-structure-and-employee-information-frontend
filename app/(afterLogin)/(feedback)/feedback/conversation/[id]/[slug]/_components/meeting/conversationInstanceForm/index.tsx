import React, { useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  DatePicker,
  TimePicker,
  Select,
  Checkbox,
  Popconfirm,
} from 'antd';
import { CgClose } from 'react-icons/cg';
import { TiPlusOutline } from 'react-icons/ti';
import dayjs from 'dayjs';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { ConversationStore as ConversationStoreCopy } from '@/store/uistate/features/feedback/conversation';

const { Option } = Select;

interface StepOneFormProps {
  allUserData?: any;
  initialValues?: any;
  isEdit?: boolean;
  form: any;
  allDepartmentWithData: any[];
  onUserChange: (values: string[]) => void;
  onDepartmentChange: (values: string[]) => void;
  handleContinue?: () => void;
}

const ConversationInstanceForm: React.FC<StepOneFormProps> = ({
  allUserData,
  initialValues,
  isEdit = false,
  form,
  allDepartmentWithData,
  onUserChange,
  onDepartmentChange,
  handleContinue,
}) => {
  const {
    agendaItems,
    setAgendaItems,
    setSelectedDepartments,
    selectedDepartments,
    selectedUsers,
  } = useOrganizationalDevelopment();
  const { setOfUser, setSetOfUser, setOpen } = ConversationStore();

  const { setOpenModal } = ConversationStoreCopy();
  const handleAgendaChange = (value: string, index: number) => {
    const updatedAgenda = [...agendaItems];
    updatedAgenda[index] = value;
    setAgendaItems(updatedAgenda);
  };
  const addAgendaItem = () => {
    setAgendaItems([...agendaItems, '']); // Add a new empty agenda item
  };
  const removeAgendaItem = (index: number) => {
    /* eslint-disable @typescript-eslint/naming-convention */
    const updatedAgenda = agendaItems.filter((_, idx) => idx !== index);
    /* eslint-enable @typescript-eslint/naming-convention */
    setAgendaItems(updatedAgenda);
  };
  useEffect(() => {
    if (form && initialValues) {
      setAgendaItems(initialValues?.agenda ?? ['']);
      setSelectedDepartments(initialValues?.departmentId);
      // Combine the date and time into a single DateTime for the form

      form.setFieldsValue({
        name: initialValues?.name,
        departmentId: initialValues?.departmentId,
        agenda: initialValues?.agenda,

        // Set dateOfMeeting and timeOfMeeting separately for the form
        dateOfMeeting: initialValues?.dateOfMeeting
          ? dayjs(initialValues?.dateOfMeeting).isValid()
            ? dayjs(initialValues?.dateOfMeeting)
            : null
          : null,

        timeOfMeeting: initialValues?.timeOfMeeting
          ? dayjs(initialValues?.timeOfMeeting, 'HH:mm:ss').isValid()
            ? dayjs(initialValues?.timeOfMeeting, 'HH:mm:ss')
            : null
          : null,

        userId: initialValues?.userId,
      });
    }
  }, [form, initialValues]);

  useEffect(() => {
    if (selectedDepartments?.length === 0) {
      setSetOfUser([]); // Clear the setOfUser if no departments are selected
    } else {
      const usersInSelectedDepartments = allUserData?.items?.filter(
        (user: any) => {
          const departmentId = user.employeeJobInformation?.find(
            (job: any) => job?.departmentId && job?.isPositionActive === true,
          )?.departmentId;

          return departmentId && selectedDepartments?.includes(departmentId);
        },
      );
      setSetOfUser(usersInSelectedDepartments);
    }
  }, [selectedDepartments, selectedDepartments, allUserData?.items]); // Trigger effect when selectedDepartmentIds or allUserData changes

  return (
    <>
      <Form.Item
        name="name"
        label={
          <span
            className="text-black text-xs font-semibold"
            data-cy="conversation-instance-form-meeting-name-label"
          >
            Bi-weekly Meeting Name
          </span>
        }
        rules={[
          {
            required: true,
            message: 'Please enter the bi-weekly meeting name',
          },
        ]}
      >
        <Input
          name="name"
          placeholder="Enter the meeting name"
          className="text-black text-xs font-semibold"
          data-cy="conversation-instance-form-meeting-name-input"
        />
      </Form.Item>

      <div
        className="flex gap-4"
        data-cy="conversation-instance-form-date-time-container"
      >
        <Form.Item
          name="dateOfMeeting"
          label={
            <span
              className="text-black text-xs font-semibold"
              data-cy="conversation-instance-form-date-label"
            >
              Date of Meeting
            </span>
          }
          rules={[
            {
              required: true,
              message: 'Please select the date of the meeting',
            },
          ]}
          style={{ flex: 1 }}
        >
          <DatePicker
            style={{ width: '100%', font: '10px' }}
            data-cy="conversation-instance-form-date-picker"
          />
        </Form.Item>

        <Form.Item
          name="timeOfMeeting"
          label={
            <span
              className="text-black text-xs font-semibold"
              data-cy="conversation-instance-form-time-label"
            >
              Time of Meeting
            </span>
          }
          rules={[
            {
              required: true,
              message: 'Please select the time of the meeting',
            },
          ]}
          style={{ flex: 1 }}
        >
          <TimePicker
            format="HH:mm"
            style={{ width: '100%', font: '10px' }}
            minuteStep={5}
            showNow={false}
            data-cy="conversation-instance-form-time-picker"
          />
        </Form.Item>
      </div>

      <Form.Item
        name="departmentId"
        label={
          <span
            className="text-black text-xs font-semibold"
            data-cy="conversation-instance-form-department-label"
          >
            Department
          </span>
        }
        rules={[
          { required: true, message: 'Please select at least one department' },
        ]}
      >
        <Select
          mode="multiple"
          placeholder="Select a department"
          className="text-black text-xs font-semibold"
          onChange={onDepartmentChange}
          data-cy="conversation-instance-form-department-select"
        >
          {allDepartmentWithData?.map((dep) => (
            <Option
              key={dep.id}
              value={dep.id}
              data-cy={`conversation-instance-form-department-option-${dep.id}`}
            >
              <span
                className="text-xs font-semibold text-black"
                data-cy={`conversation-instance-form-department-option-text-${dep.id}`}
              >
                {dep.name}
              </span>
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="userId"
        label={
          <span
            className="text-black text-xs font-semibold"
            data-cy="conversation-instance-form-users-label"
          >
            Users
          </span>
        }
        rules={[{ required: true, message: 'Please select at least one user' }]}
      >
        <Select
          mode="multiple"
          placeholder="Select users"
          className="text-black text-xs font-semibold"
          value={selectedUsers}
          showSearch
          onChange={onUserChange}
          optionLabelProp="label"
          filterOption={(input, option: any) =>
            option.label?.toLowerCase().includes(input.toLowerCase())
          }
          data-cy="conversation-instance-form-users-select"
        >
          {setOfUser?.map((user) => (
            <Option
              key={user.id}
              value={user.id}
              label={`${user?.firstName} ${user?.middleName} ${user?.lastName}`}
              data-cy={`conversation-instance-form-user-option-${user.id}`}
            >
              <Checkbox
                checked={selectedUsers.includes(user.id)}
                onClick={(e) => e.stopPropagation()}
                data-cy={`conversation-instance-form-user-checkbox-${user.id}`}
              >
                {user?.firstName} ${user?.middleName} {user?.lastName}
              </Checkbox>
            </Option>
          ))}
        </Select>
      </Form.Item>

      <div data-cy="conversation-instance-form-agenda-container">
        <span
          className="text-gray-950 font-semibold text-xs"
          data-cy="conversation-instance-form-agenda-title"
        >
          Meeting Agenda
        </span>
        {agendaItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center mt-2"
            data-cy={`conversation-instance-form-agenda-item-${index}`}
          >
            <Form.Item
              name={['agenda', index]}
              label={null}
              className="flex-grow"
            >
              <Input
                value={item}
                onChange={(e) => handleAgendaChange(e.target.value, index)}
                placeholder={`Agenda item ${index + 1}`}
                className="text-black font-semibold text-xs"
                data-cy={`conversation-instance-form-agenda-input-${index}`}
              />
            </Form.Item>

            <Button
              type="text"
              icon={<CgClose />}
              onClick={() => removeAgendaItem(index)}
              disabled={agendaItems.length === 1}
              className="ml-2"
              data-cy={`conversation-instance-form-agenda-remove-button-${index}`}
            />
          </div>
        ))}
      </div>

      <Button
        type="dashed"
        onClick={addAgendaItem}
        className="flex items-center text-sm font-semibold mt-2"
        icon={<TiPlusOutline />}
        data-cy="conversation-instance-form-agenda-add-button"
      >
        Add Agenda Item
      </Button>

      <div
        className="w-full bg-[#fff] absolute bottom-8 flex justify-center space-x-5"
        data-cy="conversation-instance-form-actions"
      >
        <Popconfirm
          title="Are you sure you want to cancel and reset the form?"
          onConfirm={() => {
            setOpenModal(false);
            setOpen(false);
            form.resetFields();
          }}
          okText="Yes"
          cancelText="No"
        >
          <Button
            style={{ marginRight: 8 }}
            data-cy="conversation-instance-form-cancel-button"
          >
            Cancel
          </Button>
        </Popconfirm>

        {isEdit ? (
          <Button
            htmlType="submit"
            type="primary"
            data-cy="conversation-instance-form-edit-button"
          >
            Edit
          </Button>
        ) : (
          <Button
            type="primary"
            onClick={handleContinue}
            data-cy="conversation-instance-form-continue-button"
          >
            Continue
          </Button>
        )}
      </div>
    </>
  );
};

export default ConversationInstanceForm;
