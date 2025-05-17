import React, { useState } from 'react';
import { Button } from 'antd';
import { MeetingTemplateCard } from './meetingTemplateCard';
import { MeetingTemplateDrawer } from './meetingTemplateDrawer';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import { MdKeyboardArrowLeft } from 'react-icons/md';

interface TemplateData {
    id:string;
  name: string;
  objective: string;
  description: string;
  agendaItems: string[];
}

const MeetingTypeDetail: React.FC = () => {
 const {
    drawerOpen,
  setDrawerOpen,
  templates,
  setTemplates,
  editingTemplate,
  setEditingTemplate,
    meetingTypeDetailData,
    setMeetingTypeDetail
  } = useMeetingStore();
  const handleOpen = () => {
    setEditingTemplate(null);
    setDrawerOpen(true);
  };

  const handleEdit = (template: TemplateData) => {
    setEditingTemplate(template);
    setDrawerOpen(true);
  };

  const handleFinish = (values: TemplateData) => {
    if (editingTemplate) {
      setTemplates((prev:any) => prev.map((t:any) => (t.name === editingTemplate.name ? values : t)));
    } else {
      setTemplates([...templates, values]);
    }
    setDrawerOpen(false);
  };
  function handleClose(){
    setMeetingTypeDetail(null)
  }
const meetingTemplate: TemplateData[] = [
  {
    id: '1',
    name: 'Template 1',
    objective: 'Discuss quarterly goals and progress',
    description: 'This template has details about the template',
    agendaItems: ['Review metrics', 'Identify roadblocks', 'Plan next steps']
  },
  {
    id: '2',
    name: 'Template 2',
    objective: 'Weekly team sync-up',
    description: 'This template has details about the template',
    agendaItems: ['Team updates', 'Announcements', 'Feedback round']
  },
  {
    id: '3',
    name: 'Template 3',
    objective: 'Sprint Planning',
    description: 'This template has details about the template',
    agendaItems: ['Review backlog', 'Assign tasks', 'Estimate stories']
  },
  {
    id: '4',
    name: 'Template 4',
    objective: 'Product Roadmap Discussion',
    description: 'This template has details about the template',
    agendaItems: ['Q1 roadmap', 'Prioritization', 'Resource allocation']
  },
  {
    id: '5',
    name: 'Template 5',
    objective: 'Client Status Update',
    description: 'This template has details about the template',
    agendaItems: ['Deliverables status', 'Risks/issues', 'Next steps']
  },
  {
    id: '6',
    name: 'Template 6',
    objective: 'Onboarding Session',
    description: 'This template has details about the template',
    agendaItems: ['Intro to team', 'Tools & access', 'Q&A']
  }
];
  return (
    <div className="">
    <div className='flex gap-4 items-center'>
        <MdKeyboardArrowLeft  className='cursor-pointer' onClick={()=>handleClose()} />
        <span className='font-bold text-lg'>Detail</span>
    </div>
      <h2 className="text-lg font-bold mb-4">{meetingTypeDetailData?.name}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {meetingTemplate.map((template, idx) => (
          <MeetingTemplateCard
            key={idx}
            title={template.name}
            description={template.description}
            onClick={() => handleEdit(template)}
          />
        ))}
      </div>
      <div className="mt-6 text-center">
        <Button type="primary" className='w-96' onClick={handleOpen}>
          Add new Template
        </Button>
      </div>

      <MeetingTemplateDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onFinish={handleFinish}
        initialValues={editingTemplate || undefined}
      />
    </div>
  );
};

export default MeetingTypeDetail;