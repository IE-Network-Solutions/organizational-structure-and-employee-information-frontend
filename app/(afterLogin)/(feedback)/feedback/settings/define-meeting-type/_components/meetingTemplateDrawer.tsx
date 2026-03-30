import React from 'react';
import { Form, Input, Button, Modal } from 'antd';
import { MdClose } from 'react-icons/md';
import { useIsMobile } from '@/hooks/useIsMobile';

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
  const { isMobile } = useIsMobile();
  // Fallback to viewport width in case global isMobile updates after modal open.
  const isMobileViewport =
    isMobile ||
    (typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  React.useEffect(() => {
    if (!open) return;

    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        agendaItems: initialValues?.agendaItems?.length
          ? initialValues.agendaItems
          : [''],
      });
      return;
    }

    form.setFieldsValue({
      name: '',
      objective: '',
      description: '',
      agendaItems: [''],
    });
  }, [open, initialValues, form]);
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered={!isMobileViewport}
      width={isMobileViewport ? '100%' : 720}
      destroyOnClose
      // Keep modal content static; agenda section handles its own scroll.
      bodyStyle={{ paddingTop: 0 }}
      title={null}
      style={
        isMobileViewport
          ? {
              position: 'fixed',
              top: 'auto',
              bottom: 0,
              left: 0,
              right: 0,
              margin: 0,
              padding: 0,
              transform: 'none',
              width: '100%',
              maxWidth: '100%',
            }
          : undefined
      }
      styles={{
        content: isMobileViewport
          ? { width: '100%', maxWidth: '100%', margin: 0, borderRadius: 12 }
          : undefined,
        body: isMobileViewport
          ? { maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }
          : undefined,
      }}
      data-cy="meeting-template-drawer"
    >
      <div>
        <div
          className="flex justify-start text-xl font-extrabold text-gray-800 p-4"
          data-cy="meeting-template-drawer-header"
          id="meetingTemplateDrawerHeader"
        >
          <span data-cy="meeting-template-drawer-header-text">
            {initialValues
              ? 'Update Meeting Template'
              : 'Add New Meeting Template'}
          </span>
        </div>
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
            <Input
              placeholder="Template name"
              data-cy="meeting-template-drawer-name-input"
              id="meetingTemplateDrawerNameInput"
            />
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
            <Input
              placeholder="The meeting objective"
              data-cy="meeting-template-drawer-objective-input"
              id="meetingTemplateDrawerObjectiveInput"
            />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter a description' }]}
            data-cy="meeting-template-drawer-description-field"
            id="meetingTemplateDrawerDescriptionField"
          >
            <Input.TextArea
              placeholder="Some sort of description"
              data-cy="meeting-template-drawer-description-textarea"
              id="meetingTemplateDrawerDescriptionTextarea"
            />
          </Form.Item>

          <Form.List
            name="agendaItems"
            data-cy="meeting-template-drawer-agenda-items-list"
          >
            {(fields, { add, remove }) => (
              <>
                <div
                  className="max-h-56 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                  data-cy="meeting-template-drawer-agenda-scrollable"
                  id="meetingTemplateDrawerAgendaScrollable"
                >
                  {fields.map(({ key, name, ...restField }) => (
                    <div
                      key={key}
                      className="mb-2"
                      data-cy={`meeting-template-drawer-agenda-item-${name}`}
                      id={`meetingTemplateDrawerAgendaItem${name}`}
                    >
                      <Form.Item
                        {...restField}
                        name={name}
                        rules={[
                          { required: true, message: 'Missing agenda item' },
                        ]}
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
                </div>
                <div
                  className="flex justify-center mb-1 mt-2"
                  data-cy="meeting-template-drawer-add-agenda-item-container"
                  id="meetingTemplateDrawerAddAgendaItemContainer"
                >
                  <Button
                    className="flex items-center px-5"
                    type="primary"
                    onClick={() => add()}
                    data-cy="meeting-template-drawer-add-agenda-item-button"
                    id="meetingTemplateDrawerAddAgendaItemButton"
                  >
                    Add agenda item
                  </Button>
                </div>
              </>
            )}
          </Form.List>
        </Form>
        <div
          className="flex justify-end gap-3 pt-2"
          data-cy="meeting-template-drawer-footer"
          id="meetingTemplateDrawerFooter"
        >
          <Button
            type="default"
            onClick={onClose}
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
      </div>
    </Modal>
  );
};
