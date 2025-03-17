import { useGetCandidateById } from '@/store/server/features/recruitment/candidate/queries';
import { useGetJobsByID } from '@/store/server/features/recruitment/job/queries';
import { List, Skeleton } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

interface JobResponseParams {
  selectedCandidate: any;
}

const JobResponse: React.FC<JobResponseParams> = ({ selectedCandidate }) => {
  const { data: JobResponse, isLoading: isResponseLoading } =
    useGetCandidateById(selectedCandidate?.id);

  const candidates = JobResponse?.jobCandidate || [];

  const { data: JobQuestionTemplates } = useGetJobsByID(
    selectedCandidate?.jobCandidate.map(
      (item: any) => item?.jobInformation?.id,
    ),
  );

  const getJobQuestionNames = (id: string) => {
    return JobQuestionTemplates?.jobApplicationQuestionsForm?.form?.find(
      (question: any) => question?.id === id,
    );
  };

  return (
    <div className="h-full w-full bg-white">
      {isResponseLoading ? (
        <div className="border rounded shadow-sm">
          <Skeleton active />
        </div>
      ) : (
        <>
          <div className="text-md font-bold text-gray-800">Job Response</div>
          <List
            size="large"
            dataSource={candidates}
            renderItem={(jobInfo: any) => (
              <>
                <List.Item>
                  <div>
                    <div className="flex justify-between gap-5">
                      <span className="text-md font-normal text-gray-500">
                        Full Name: {''}
                      </span>
                      <span className="text-md font-normal">
                        {JobResponse?.fullName || '---'}
                      </span>
                    </div>
                    <div className="flex justify-between gap-5">
                      <span className="text-md font-normal text-gray-500">
                        Phone Number: {''}
                      </span>
                      <span className="text-md font-normal">
                        {' ' + JobResponse?.phone || '---'}
                      </span>
                    </div>
                    <div className="flex justify-between gap-5">
                      <span className="text-md font-normal text-gray-500">
                        Email Address: {''}
                      </span>
                      <span className="text-md font-normal">
                        {JobResponse?.email || '---'}
                      </span>
                    </div>
                    <div className="flex justify-between gap-5">
                      <span className="text-md font-normal text-gray-500">
                        CGPA:
                      </span>
                      <span className="text-md font-normal">
                        {JobResponse?.CGPA || '---'}
                      </span>
                    </div>
                    <div className="flex justify-between gap-5">
                      <span className="text-md font-normal text-gray-500">
                        Internal or External:
                      </span>
                      <span className="text-md font-normal">
                        {JobResponse?.jobCandidate
                          ? JobResponse?.jobCandidate.map((item: any) =>
                              item?.isExternalApplicant === false
                                ? 'External'
                                : 'Internal',
                            )
                          : '---'}
                      </span>
                    </div>
                    <div className="flex justify-between gap-5">
                      <span className="text-md font-normal text-gray-500">
                        Application Date:
                      </span>
                      <span className="text-md font-normal">
                        {dayjs(JobResponse?.createdAt).format('DD MMMM YYYY') ??
                          '--'}
                      </span>
                    </div>
                    <div className="flex justify-between gap-5">
                      <span className="text-md font-normal text-gray-500">
                        Status:
                      </span>
                      <span className="text-md font-normal">
                        {JobResponse?.jobCandidate
                          ? JobResponse?.jobCandidate.map((item: any) =>
                              item?.isExternalApplicant === false
                                ? 'External'
                                : 'Internal',
                            )
                          : '---'}
                      </span>
                    </div>
                  </div>
                </List.Item>
                <List.Item>
                  <div className="flex flex-col gap-4">
                    {Array.isArray(jobInfo?.additionalInformation) &&
                      jobInfo.additionalInformation.map(
                        (addInfo: any, index: number) => (
                          <div key={index} className="flex flex-col mt-2 ">
                            <div className="flex justify-between gap-5">
                              <span className="text-md font-normal text-gray-500">
                                Question No {index + 1}:
                              </span>
                              <span className="text-md font-normal">
                                {getJobQuestionNames(addInfo?.question)
                                  ?.question || ''}
                              </span>
                            </div>

                            <div className="flex justify-between gap-5">
                              <span className="text-md font-normal text-gray-500">
                                Response:
                              </span>
                              <span className="text-md font-normal">
                                {addInfo?.answer}
                              </span>
                            </div>
                          </div>
                        ),
                      )}
                  </div>
                </List.Item>
              </>
            )}
          />
        </>
      )}
    </div>
  );
};

export default JobResponse;
