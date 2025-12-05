import React from 'react';
import { Form, Input, Button } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { MdClose } from 'react-icons/md';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  onFinish: (values: any) => void;
  initialValues?: any;
  loading: boolean;
  form: any;
}

export const MeetingTemplateDrawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  onFinish,
  initialValues,
  loading,
  form,
}) => {
  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);
  const footer = (
    <div className="w-full flex justify-center items-center gap-4 pt-8" data-cy="meeting-template-drawer-footer" id="meetingTemplateDrawerFooter">
      <Button
        type="default"
        title="Cancel"
        onClick={() => onClose()}
        style={{ marginRight: 8 }}
        loading={loading}
        className="h-10"
        data-cy="meeting-template-drawer-cancel-button"
        id="meetingTemplateDrawerCancelButton"
      >
        Cancel
      </Button>
      <Button
        htmlType="submit"
        type="primary"
        onClick={() => form.submit()}
        loading={loading}
        className="h-10"
        data-cy="meeting-template-drawer-submit-button"
        id="meetingTemplateDrawerSubmitButton"
      >
        {initialValues ? 'Update' : 'Create'}
      </Button>
    </div>
  );

  return (
    <CustomDrawerLayout
      open={open}
      onClose={() => onClose()}
      modalHeader={
        <div className="text-center font-bold text-xl" data-cy="meeting-template-drawer-header" id="meetingTemplateDrawerHeader">
          {' '}
          {initialValues
            ? 'Update Meeting Template'
            : 'Add New Meeting Template'}
        </div>
      }
      width="40%"
      footer={footer}
      data-cy="meeting-template-drawer"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initialValues || { agendaItems: [''] }}
        data-cy="meeting-template-drawer-form"
        id="meetingTemplateDrawerForm"
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please enter the name' }]}
          data-cy="meeting-template-drawer-name-field"
          id="meetingTemplateDrawerNameField"
        >
          <Input placeholder="Template name" data-cy="meeting-template-drawer-name-input" id="meetingTemplateDrawerNameInput" />
        </Form.Item>

        <Form.Item
          label="Meeting Objective"
          name="objective"
          rules={[
            { required: true, message: 'Please enter the meeting objective' },
          ]}
          data-cy="meeting-template-drawer-objective-field"
          id="meetingTemplateDrawerObjectiveField"
        >
          <Input placeholder="The meeting objective" data-cy="meeting-template-drawer-objective-input" id="meetingTemplateDrawerObjectiveInput" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please enter a description' }]}
          data-cy="meeting-template-drawer-description-field"
          id="meetingTemplateDrawerDescriptionField"
        >
          <Input.TextArea placeholder="Some sort of description" data-cy="meeting-template-drawer-description-textarea" id="meetingTemplateDrawerDescriptionTextarea" />
        </Form.Item>

        <Form.List name="agendaItems" data-cy="meeting-template-drawer-agenda-items-list">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} className="mb-2" data-cy={`meeting-template-drawer-agenda-item-${name}`} id={`meetingTemplateDrawerAgendaItem${name}`}>
                  <Form.Item
                    {...restField}
                    name={name}
                    rules={[{ required: true, message: 'Missing agenda item' }]}
                    label={`Agenda Item ${key + 1}`}
                    className="w-full"
                    data-cy={`meeting-template-drawer-agenda-item-field-${name}`}
                    id={`meetingTemplateDrawerAgendaItemField${name}`}
                  >
                    <Input
                      placeholder="Agenda Item"
                      suffix={
                        <MdClose
                          className="cursor-pointer text-gray-500 hover:text-red-500"
                          onClick={() => remove(name)}
                          data-cy={`meeting-template-drawer-remove-agenda-item-${name}`}
                          id={`meetingTemplateDrawerRemoveAgendaItem${name}`}
                        />
                      }
                      data-cy={`meeting-template-drawer-agenda-item-input-${name}`}
                      id={`meetingTemplateDrawerAgendaItemInput${name}`}
                    />
                  </Form.Item>
                </div>
              ))}
              <Form.Item data-cy="meeting-template-drawer-add-agenda-item-container" id="meetingTemplateDrawerAddAgendaItemContainer">
                <Button type="primary" onClick={() => add()} block data-cy="meeting-template-drawer-add-agenda-item-button" id="meetingTemplateDrawerAddAgendaItemButton">
                  Add agenda item
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </CustomDrawerLayout>
  );
};
