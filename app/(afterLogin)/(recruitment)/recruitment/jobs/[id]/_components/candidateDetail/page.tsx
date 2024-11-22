import CustomDrawerLayout from '@/components/common/customDrawer';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import { Button, Tabs } from 'antd';
import React, { useCallback } from 'react';
import { FaPhone } from 'react-icons/fa';
import { MdOutlineMail } from 'react-icons/md';
import CoverLetter from '../tabs/coverLetter';
import CandidateActivity from '../tabs/activity';
import JobResponse from '../tabs/response';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const CandidateDetail: React.FC = ({}) => {
  const { candidateDetailDrawer, setCandidateDetailDrawer, selectedCandidate } =
    useCandidateState();

  const items = [
    {
      key: '1',
      label: (
        <span className="mt-4">
          <p className="font-semibold">Cover Letter</p>
        </span>
      ),
      children: <CoverLetter selectedCandidate={selectedCandidate} />,
    },
    {
      key: '2',
      label: (
        <span className="mt-4">
          <p className="font-semibold">Response</p>
        </span>
      ),
      children: <JobResponse selectedCandidate={selectedCandidate} />,
    },
    {
      key: '3',
      label: (
        <span className="mt-4">
          <p className="font-semibold">Activity</p>
        </span>
      ),
      children: <CandidateActivity selectedCandidate={selectedCandidate} />,
    },
  ];
  const handleClose = useCallback(() => {
    setCandidateDetailDrawer(false);
  }, [setCandidateDetailDrawer]);

  const handleApprove = useCallback(() => {
    // Handle approval logic here
  }, []);
  const candidateDrawerHeader = (
    <div className="flex flex-col items-between justify-center gap-2">
      <div className="flex items-center justify-start gap-4">
        <div className="text-lg font-bold">{selectedCandidate?.fullName}</div>
        <div
          className={`mb-0 items-center text-xs font-normal rounded-lg px-4 py-1 bg-[#F8F8F8] text-[#A0AEC0] border-gray-200 border`}
        >
          Applied
        </div>
      </div>
      <div className="text-xs font-light text-gray-400">
        {selectedCandidate?.jobCandidate
          ?.map((item: any) => item?.jobInformation?.jobTitle)
          .join(', ')}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-start justify-center ">
          <div className="flex items-center justify-start gap-2 text-[12px] font-semibold">
            <MdOutlineMail className="text-gray-300" size={15} />
            {selectedCandidate?.email}
          </div>
          <div className="flex items-center justify-start gap-2 text-[12px] font-semibold">
            <FaPhone className="text-gray-300" size={13} />
            {selectedCandidate?.phone}
          </div>
        </div>
        <div className="flex justify-end w-full bg-[#fff] px-4 py-4 gap-6">
          <AccessGuard permissions={[Permissions.DeclineCandidate]}>
            <Button
              onClick={handleClose}
              className="flex justify-center text-xs font-medium text-gray-800 bg-white p-3 px-8 h-10 hover:border-gray-500 border-gray-300"
            >
              Decline
            </Button>
          </AccessGuard>
          <AccessGuard permissions={[Permissions.ApproveCandidate]}>
            <Button
              onClick={handleApprove}
              className="flex justify-center text-xs font-medium text-white bg-green-600 p-3 px-8 h-10"
            >
              Approve
            </Button>
          </AccessGuard>
        </div>
      </div>
    </div>
  );

  return (
    candidateDetailDrawer && (
      <div>
        <CustomDrawerLayout
          open={candidateDetailDrawer}
          onClose={() => setCandidateDetailDrawer(false)}
          modalHeader={candidateDrawerHeader}
          width="40%"
        >
          <div className="flex items-center justify-start gap-2">
            <Tabs
              items={items}
              // tabBarGutter={16}
              size="small"
              tabBarStyle={{ textAlign: 'center' }}
            />
          </div>
        </CustomDrawerLayout>
      </div>
    )
  );
};

export default CandidateDetail;
