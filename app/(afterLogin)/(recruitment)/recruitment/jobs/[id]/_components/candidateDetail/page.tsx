import CustomDrawerLayout from '@/components/common/customDrawer';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import { Tabs } from 'antd';
import React from 'react';
import { FaPhone } from 'react-icons/fa';
import { MdOutlineMail } from 'react-icons/md';
import CoverLetter from '../tabs/coverLetter';
import JobResponse from '../tabs/response';
import CustomButton from '@/components/common/buttons/customButton';

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
    // {
    //   key: '3',
    //   label: (
    //     <span className="mt-4">
    //       <p className="font-semibold">Activity</p>
    //     </span>
    //   ),
    //   children: <CandidateActivity selectedCandidate={selectedCandidate} />,
    // },
  ];

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
        <div className="flex justify-end w-full bg-[#fff] px-4 py-4 gap-2">
          <div className="border-[1px] border-gray-500 p-3 rounded-lg">
            <span className="text-sm font-normal text-gray-500">Status: </span>
            {selectedCandidate?.jobCandidate?.map((item: any) => (
              <span
                key={item?.id}
                className={`text-sm font-normal ${
                  item?.applicantStatusStage?.title === 'Accepted'
                    ? 'text-green-500'
                    : item?.applicantStatusStage?.title === 'Declined'
                      ? 'text-red-500'
                      : ''
                }`}
              >
                {' ' + item?.applicantStatusStage?.title}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    candidateDetailDrawer && (
      <CustomDrawerLayout
        open={candidateDetailDrawer}
        onClose={() => setCandidateDetailDrawer(false)}
        modalHeader={candidateDrawerHeader}
        width="40%"
        footer={
          <div className="flex justify-center items-center w-full">
            <div className="flex justify-between items-center gap-4">
              <CustomButton
                title="Cancel "
                onClick={() => setCandidateDetailDrawer(false)}
                type="default"
              />
            </div>
          </div>
        }
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
    )
  );
};

export default CandidateDetail;
