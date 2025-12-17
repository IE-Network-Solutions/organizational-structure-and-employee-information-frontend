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
        <span
          className="mt-4"
          data-cy="talent-acquisition-job-candidate-detail-tab-cover-letter-label"
        >
          {/* eslint-disable-next-line data-cy-required */}
          <p
            className="font-semibold"
            data-cy="talent-acquisition-job-candidate-detail-tab-cover-letter-text"
          >
            <span data-cy="talent-acquisition-job-candidate-detail-tab-cover-letter-text-content">
              Cover Letter
            </span>
          </p>
        </span>
      ),
      children: <CoverLetter selectedCandidate={selectedCandidate} />,
    },
    {
      key: '2',
      label: (
        <span
          className="mt-4"
          data-cy="talent-acquisition-job-candidate-detail-tab-response-label"
        >
          <p
            className="font-semibold"
            data-cy="talent-acquisition-job-candidate-detail-tab-response-text"
          >
            <span data-cy="talent-acquisition-job-candidate-detail-tab-response-text-content">
              Response
            </span>
          </p>
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
    <div
      className="flex flex-col items-between justify-center gap-2"
      data-cy="talent-acquisition-job-candidate-detail-drawer-header"
    >
      <div
        className="flex items-center justify-start gap-4"
        data-cy="talent-acquisition-job-candidate-detail-drawer-header-name-section"
      >
        <div
          className="text-lg font-bold"
          data-cy="talent-acquisition-job-candidate-detail-drawer-header-name"
        >
          <span data-cy="talent-acquisition-job-candidate-detail-drawer-header-name-text">
            {selectedCandidate?.fullName}
          </span>
        </div>
        <div
          className={`mb-0 items-center text-xs font-normal rounded-lg px-4 py-1 bg-[#F8F8F8] text-[#A0AEC0] border-gray-200 border`}
          data-cy="talent-acquisition-job-candidate-detail-drawer-header-status-badge"
        >
          <span data-cy="talent-acquisition-job-candidate-detail-drawer-header-status-badge-text">
            Applied
          </span>
        </div>
      </div>
      <div
        className="text-xs font-light text-gray-400"
        data-cy="talent-acquisition-job-candidate-detail-drawer-header-job-title"
      >
        <span data-cy="talent-acquisition-job-candidate-detail-drawer-header-job-title-text">
          {selectedCandidate?.jobCandidate
            ?.map((item: any) => item?.jobInformation?.jobTitle)
            .join(', ')}
        </span>
      </div>
      <div
        className="flex items-center justify-between"
        data-cy="talent-acquisition-job-candidate-detail-drawer-header-contact-section"
      >
        <div
          className="flex flex-col items-start justify-center "
          data-cy="talent-acquisition-job-candidate-detail-drawer-header-contact-info"
        >
          <div
            className="flex items-center justify-start gap-2 text-[12px] font-semibold"
            data-cy="talent-acquisition-job-candidate-detail-drawer-header-email"
          >
            <MdOutlineMail
              className="text-gray-300"
              size={15}
              data-cy="talent-acquisition-job-candidate-detail-drawer-header-email-icon"
            />
            <span data-cy="talent-acquisition-job-candidate-detail-drawer-header-email-text">
              {selectedCandidate?.email}
            </span>
          </div>
          <div
            className="flex items-center justify-start gap-2 text-[12px] font-semibold"
            data-cy="talent-acquisition-job-candidate-detail-drawer-header-phone"
          >
            <FaPhone
              className="text-gray-300"
              size={13}
              data-cy="talent-acquisition-job-candidate-detail-drawer-header-phone-icon"
            />
            <span data-cy="talent-acquisition-job-candidate-detail-drawer-header-phone-text">
              {selectedCandidate?.phone}
            </span>
          </div>
        </div>
        <div
          className="flex justify-end w-full bg-[#fff] px-4 py-4 gap-2"
          data-cy="talent-acquisition-job-candidate-detail-drawer-header-status-section"
        >
          <div
            className="border-[1px] border-gray-500 p-3 rounded-lg"
            data-cy="talent-acquisition-job-candidate-detail-drawer-header-status-container"
          >
            <span
              className="text-sm font-normal text-gray-500"
              data-cy="talent-acquisition-job-candidate-detail-drawer-header-status-label"
            >
              <span data-cy="talent-acquisition-job-candidate-detail-drawer-header-status-label-text">
                Status:{' '}
              </span>
            </span>
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
                data-cy={`talent-acquisition-job-candidate-detail-drawer-header-status-value-${item?.id}`}
              >
                <span
                  data-cy={`talent-acquisition-job-candidate-detail-drawer-header-status-value-text-${item?.id}`}
                >
                  {' ' + item?.applicantStatusStage?.title}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return candidateDetailDrawer ? (
    <CustomDrawerLayout
      data-cy="talent-acquisition-job-candidate-detail-drawer"
      open={candidateDetailDrawer}
      onClose={() => setCandidateDetailDrawer(false)}
      modalHeader={candidateDrawerHeader}
      width="40%"
      footer={
        <div
          className="flex justify-center items-center w-full"
          data-cy="talent-acquisition-job-candidate-detail-drawer-footer"
        >
          <div
            className="flex justify-between items-center gap-4"
            data-cy="talent-acquisition-job-candidate-detail-drawer-footer-buttons"
          >
            <CustomButton
              title="Cancel "
              onClick={() => setCandidateDetailDrawer(false)}
              type="default"
              id="talent-acquisition-job-candidate-detail-button-cancel"
              data-cy="talent-acquisition-job-candidate-detail-button-cancel"
            />
          </div>
        </div>
      }
    >
      <div
        className="flex items-center justify-start gap-2"
        data-cy="talent-acquisition-job-candidate-detail-drawer-content"
      >
        <Tabs
          id="talent-acquisition-job-candidate-detail-tabs"
          data-cy="talent-acquisition-job-candidate-detail-tabs"
          items={items}
          // tabBarGutter={16}
          size="small"
          tabBarStyle={{ textAlign: 'center' }}
        />
      </div>
    </CustomDrawerLayout>
  ) : (
    <div data-cy="talent-acquisition-job-candidate-detail-drawer-empty"></div>
  );
};

export default CandidateDetail;
