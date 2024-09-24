import React from 'react';
import { Table, Button, Select } from 'antd';
import {
  Candidate,
  useTalentPoolStore,
} from '@/store/uistate/features/recruitment/talentPool';
import { useCandidatesStore } from '@/store/uistate/features/recruitment/candidates';
import { TbFileDownload } from 'react-icons/tb';

interface CandidateTableProps {
  candidates: Candidate[];
}

const { Option } = Select;

const CandidateTable: React.FC<CandidateTableProps> = ({ candidates }) => {
  const { setStage } = useTalentPoolStore();
  const handleStageChange = (id: string, value: string) => {
    setStage(id, value);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Candidate) => (
        <div>
          <p className="font-bold">{text}</p>
          <p className="text-gray-500 text-sm">{record.email}</p>
        </div>
      ),
    },
    {
      title: 'Phone Numebr',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Applied for',
      dataIndex: 'appliedFor',
      key: 'appliedFor',
    },
    {
      title: 'CGPA',
      dataIndex: 'cgpa',
      key: 'cgpa',
    },
    {
      title: 'CV',
      dataIndex: 'cv',
      key: 'cv',
      render: (text: string) => (
        <a
          className="flex justify-start gap-7 items-center"
          href={`/uploads/${text}`}
          download
        >
          <div>{text ?? '-'}</div>
          <TbFileDownload size={20} />
        </a>
      ),
    },
    {
      title: 'Moved in Date',
      dataIndex: 'movedInDate',
      key: 'movedInDate',
    },
    {
      title: 'Stage',
      dataIndex: 'stage',
      key: 'stage',
      render: (_: any, candidate: Candidate) => (
        <Select
          defaultValue={candidate.stage}
          onChange={(value) => handleStageChange(candidate?.id, value)} // Call handler with candidate ID and new stage
          className="w-full h-10"
        >
          <Option value="Talent Pool">Talent Pool</Option>
          <Option value="Interview">Interview</Option>
          <Option value="Offer">Offer</Option>
        </Select>
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_: Candidate) => (
        <div className="flex space-x-2">
          <Button
            className={'bg-[#ADD5F0] text-[#1D9BF0] rounded'}
            type="primary"
          >
            Onboard
          </Button>
        </div>
      ),
    },
  ];

  return <Table dataSource={candidates} columns={columns} pagination={false} />;
};

export default CandidateTable;
