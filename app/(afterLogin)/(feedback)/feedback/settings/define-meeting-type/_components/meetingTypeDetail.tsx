import React from 'react';
import { Button, Form } from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import { MeetingTemplateCard } from './meetingTemplateCard';
import { MeetingTemplateDrawer } from './meetingTemplateDrawer';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import {
  useCreateMeetingAgendaTemplate,
  useDeleteMeetingAgendaTemplate,
  useUpdateMeetingAgendaTemplate,
} from '@/store/server/features/CFR/meeting/agenda-template/mutations';
import { useGetMeetingAgendaTemplate } from '@/store/server/features/CFR/meeting/agenda-template/queries';
import { useRouter } from 'next/navigation';

interface TemplateData {
  id: string;
  name: string;
  objective: string;
  description: string;
  agendaItems: string[];
}

const MeetingTypeDetail: React.FC = () => {
  const [form] = Form.useForm();
  const router = useRouter();

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
    form.resetFields();
    setDrawerOpen(true);
  };

  const handleEdit = (template: TemplateData) => {
    const normalizedAgendaItems = (template.agendaItems || [])
      .map((item: any) => (typeof item === 'string' ? item : item?.agenda))
      .filter(Boolean);

    setEditingTemplate({
      ...template,
      meetingTypeId: meetingTypeDetailData?.id,
      agendaItems: normalizedAgendaItems,
    });
    form.resetFields();
    setDrawerOpen(true);
  };

  const handleDelete = (templateId: string) => {
    deleteMeetingAgendaTemplate(templateId);
  };

  const handleCloseTemplateModal = () => {
    setDrawerOpen(false);
    setEditingTemplate(null);
    form.resetFields();
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
            setEditingTemplate(null);
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
            setEditingTemplate(null);
          },
        },
      );
    }
  };

  const { data: meetingAgendaTemplate } = useGetMeetingAgendaTemplate(
    meetingTypeDetailData?.id,
  );

  return (
    <div
      className="p-5 rounded-2xl bg-white h-full"
      data-cy="meeting-type-detail-container"
      id="meetingTypeDetailContainer"
    >
      <div
        className="flex items-start justify-between gap-4"
        data-cy="meeting-type-detail-header"
        id="meetingTypeDetailHeader"
      >
        <div
          className="flex items-start gap-3"
          data-cy="meeting-type-detail-title-area"
        >
          <Button
            type="default"
            size="small"
            icon={<ArrowLeftOutlined />}
            className="!h-8 !w-8 !p-0 flex items-center justify-center"
            onClick={() => router.back()}
            data-cy="meeting-type-detail-back-button"
            aria-label="Back"
          />
          <div className="min-w-0" data-cy="meeting-type-detail-titles">
            <div
              className="text-base md:text-lg font-semibold text-gray-900 truncate"
              title={meetingTypeDetailData?.name || 'Meeting Type'}
              data-cy="meeting-type-detail-name"
              id="meetingTypeDetailName"
            >
              {meetingTypeDetailData?.name || 'Meeting Type'}
            </div>
            <div
              className="text-xs text-gray-500 mt-1"
              data-cy="meeting-type-detail-subtitle"
              id="meetingTypeDetailSubtitle"
            >
              Meeting type templates and agendas
            </div>
          </div>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="rounded-md"
          onClick={handleOpen}
          data-cy="meeting-type-detail-add-button"
          id="meetingTypeDetailAddButton"
        >
          Add new Template
        </Button>
      </div>

      <div className="mt-6" data-cy="meeting-type-detail-body">
        {meetingAgendaTemplate?.items?.length ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
            data-cy="meeting-type-detail-templates-grid"
            id="meetingTypeDetailTemplatesGrid"
          >
            {meetingAgendaTemplate.items.map((template: any, idx: number) => (
              <MeetingTemplateCard
                key={idx}
                title={template.name}
                description={template.description}
                onClick={() => handleEdit(template)}
                onDelete={() => handleDelete(template.id)}
                loading={deleteMeetingAgendaTemplateLoading}
                data-cy="meeting-type-detail-template-card"
              />
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center h-full py-10 text-gray-500 border border-dashed border-gray-200 rounded-xl"
            data-cy="meeting-type-detail-empty"
            id="meetingTypeDetailEmpty"
          >
            No templates available.
          </div>
        )}
      </div>

      <MeetingTemplateDrawer
        open={drawerOpen}
        onClose={handleCloseTemplateModal}
        onFinish={handleFinish}
        initialValues={editingTemplate || undefined}
        loading={
          createMeetingAgendaTemplateLoading ||
          updateMeetingAgendaTemplateLoading
        }
        form={form}
        data-cy="meeting-type-detail-drawer"
      />
    </div>
  );
};

export default MeetingTypeDetail;
