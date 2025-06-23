import React from 'react';
import { Button, Form, Spin } from 'antd';
import { MeetingTemplateCard } from './meetingTemplateCard';
import { MeetingTemplateDrawer } from './meetingTemplateDrawer';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import {
  useCreateMeetingAgendaTemplate,
  useDeleteMeetingAgendaTemplate,
  useUpdateMeetingAgendaTemplate,
} from '@/store/server/features/CFR/meeting/agenda-template/mutations';
import { useGetMeetingAgendaTemplate } from '@/store/server/features/CFR/meeting/agenda-template/queries';

interface TemplateData {
  id: string;
  name: string;
  objective: string;
  description: string;
  agendaItems: string[];
}

const MeetingTypeDetail: React.FC = () => {
  const [form] = Form.useForm();

  const {
    mutate: createMeetingAgendaTemplate,
    isLoading: createMeetingAgendaTemplateLoading,
  } = useCreateMeetingAgendaTemplate();
  const {
    mutate: updateMeetingAgendaTemplate,
    isLoading: updateMeetingAgendaTemplateLoading,
  } = useUpdateMeetingAgendaTemplate();
  const {
    mutate: deleteMeetingAgendaTemplate,
    isLoading: deleteMeetingAgendaTemplateLoading,
  } = useDeleteMeetingAgendaTemplate();
  const {
    drawerOpen,
    setDrawerOpen,
    templates,
    setTemplates,
    editingTemplate,
    setEditingTemplate,
    meetingTypeDetailData,
    setMeetingTypeDetail,
  } = useMeetingStore();

  const handleOpen = () => {
    setEditingTemplate(null);
    setDrawerOpen(true);
  };

  const handleEdit = (template: TemplateData) => {
    setEditingTemplate({
      ...template,
      meetingTypeId: meetingTypeDetailData?.id,
      agendaItems: template.agendaItems?.map((item: any) => item?.agenda),
    });
    setDrawerOpen(true);
  };

  const handleDelete = (templateId: string) => {
    deleteMeetingAgendaTemplate(templateId);
  };

  const handleFinish = (values: TemplateData) => {
    if (editingTemplate) {
      updateMeetingAgendaTemplate(
        {
          ...values,
          id: editingTemplate?.id,
          meetingTypeId: meetingTypeDetailData?.id,
          agendaItems: values.agendaItems?.map((item: any) => ({
            agenda: item,
          })),
        },
        {
          onSuccess() {
            form.resetFields();
            setDrawerOpen(false);
          },
        },
      );
    } else {
      setTemplates([...templates, values]);
      createMeetingAgendaTemplate(
        {
          ...values,
          meetingTypeId: meetingTypeDetailData?.id,
          agendaItems: values.agendaItems?.map((item: any) => ({
            agenda: item,
          })),
        },
        {
          onSuccess() {
            form.resetFields();
            setDrawerOpen(false);
          },
        },
      );
    }
  };

  function handleClose() {
    setMeetingTypeDetail(null);
  }

  const {
    data: meetingAgendaTemplate,
    isLoading: meetingAgendaTemplateLoading,
  } = useGetMeetingAgendaTemplate(meetingTypeDetailData?.id);

  return (
    <Spin spinning={meetingAgendaTemplateLoading} className="">
      <div className="bg-white p-4 rounded-lg">
        <div className="flex gap-2 items-center mb-2">
          <MdKeyboardArrowLeft
            className="cursor-pointer text-gray-600"
            onClick={() => handleClose()}
            size={24}
          />
          <span className="font-bold text-lg">Detail</span>
        </div>
        <h2 className="text-lg font-bold mb-4 ml-6">
          {meetingTypeDetailData?.name}
        </h2>
        {meetingAgendaTemplate?.items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {meetingAgendaTemplate?.items.map(
                (template: any, idx: number) => (
                  <MeetingTemplateCard
                    key={idx}
                    title={template.name}
                    description={template.description}
                    onClick={() => handleEdit(template)}
                    onDelete={() => handleDelete(template.id)}
                    loading={deleteMeetingAgendaTemplateLoading}
                  />
                ),
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-lg font-bold mb-4">No templates available</h2>
          </div>
        )}
        <div className="mt-6 text-center">
          <Button type="primary" className="w-96 h-10" onClick={handleOpen}>
            Add new Template
          </Button>
        </div>
        <MeetingTemplateDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onFinish={handleFinish}
          initialValues={editingTemplate || undefined}
          loading={
            createMeetingAgendaTemplateLoading ||
            updateMeetingAgendaTemplateLoading
          }
          form={form}
        />
      </div>
    </Spin>
  );
};

export default MeetingTypeDetail;
