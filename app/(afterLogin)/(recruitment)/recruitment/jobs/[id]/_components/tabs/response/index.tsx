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
    <div
      className="h-full w-full bg-white"
      id="talent-acquisition-candidate-tab-response-container"
      data-cy="talent-acquisition-candidate-tab-response-container"
    >
      {isResponseLoading ? (
        <div
          className="border rounded shadow-sm"
          id="talent-acquisition-candidate-tab-response-loading"
          data-cy="talent-acquisition-candidate-tab-response-loading"
        >
          <Skeleton active />
        </div>
      ) : (
        <>
          <div
            className="text-md font-bold text-gray-800"
            id="talent-acquisition-candidate-tab-response-title"
            data-cy="talent-acquisition-candidate-tab-response-title"
          >
            Job Response
          </div>
          <List
            size="large"
            dataSource={candidates}
            id="talent-acquisition-candidate-tab-response-list"
            data-cy="talent-acquisition-candidate-tab-response-list"
            renderItem={(jobInfo: any, index: number) => (
              <>
                <List.Item
                  data-cy={`talent-acquisition-candidate-tab-response-personal-${jobInfo?.id ?? index}`}
                >
                  <div data-cy="-components-tabs-response-index-tsx-index-div-62">
                    <div
                      className="flex justify-between gap-5"
                      data-cy="talent-acquisition-candidate-tab-response-row-full-name"
                    >
                      <span
                        data-cy="-components-tabs-response-index-tsx-index-span-67"
                        className="text-md font-normal text-gray-500"
                      >
                        Full Name: {''}
                      </span>
                      <span
                        data-cy="-components-tabs-response-index-tsx-index-span-70"
                        className="text-md font-normal"
                      >
                        {JobResponse?.fullName || '---'}
                      </span>
                    </div>
                    <div
                      data-cy="-components-tabs-response-index-tsx-index-div-74"
                      className="flex justify-between gap-5"
                    >
                      <span
                        data-cy="-components-tabs-response-index-tsx-index-span-75"
                        className="text-md font-normal text-gray-500"
                      >
                        Phone Number: {''}
                      </span>
                      <span
                        data-cy="-components-tabs-response-index-tsx-index-span-78"
                        className="text-md font-normal"
                      >
                        {' ' + JobResponse?.phone || '---'}
                      </span>
                    </div>
                    <div
                      data-cy="-components-tabs-response-index-tsx-index-div-82"
                      className="flex justify-between gap-5"
                    >
                      <span
                        data-cy="-components-tabs-response-index-tsx-index-span-83"
                        className="text-md font-normal text-gray-500"
                      >
                        Email Address: {''}
                      </span>
                      <span
                        data-cy="-components-tabs-response-index-tsx-index-span-86"
                        className="text-md font-normal"
                      >
                        {JobResponse?.email || '---'}
                      </span>
                    </div>
                    <div
                      data-cy="-components-tabs-response-index-tsx-index-div-90"
                      className="flex justify-between gap-5"
                    >
                      <span
                        data-cy="-components-tabs-response-index-tsx-index-span-91"
                        className="text-md font-normal text-gray-500"
                      >
                        CGPA:
                      </span>
                      <span
                        data-cy="-components-tabs-response-index-tsx-index-span-94"
                        className="text-md font-normal"
                      >
                        {JobResponse?.CGPA || '---'}
                      </span>
                    </div>
                    <div
                      data-cy="-components-tabs-response-index-tsx-index-div-98"
                      className="flex justify-between gap-5"
                    >
                      <span
                        data-cy="-components-tabs-response-index-tsx-index-span-99"
                        className="text-md font-normal text-gray-500"
                      >
                        Application Date:
                      </span>
                      <span
                        data-cy="-components-tabs-response-index-tsx-index-span-102"
                        className="text-md font-normal"
                      >
                        {dayjs(JobResponse?.createdAt).format('DD MMMM YYYY') ??
                          '--'}
                      </span>
                    </div>
                  </div>
                </List.Item>
                <List.Item
                  data-cy={`talent-acquisition-candidate-tab-response-questions-${jobInfo?.id ?? index}`}
                >
                  <div
                    data-cy="-components-tabs-response-index-tsx-index-div-112"
                    className="flex flex-col gap-4"
                  >
                    {Array.isArray(jobInfo?.additionalInformation) &&
                      jobInfo.additionalInformation.map(
                        (addInfo: any, index: number) => (
                          <div
                            key={index}
                            className="flex flex-col mt-2 "
                            data-cy={`talent-acquisition-candidate-tab-response-question-${jobInfo?.id ?? index}-${addInfo?.question ?? index}`}
                          >
                            <div
                              data-cy="-components-tabs-response-index-tsx-index-div-121"
                              className="flex justify-between gap-5"
                            >
                              <span
                                data-cy="-components-tabs-response-index-tsx-index-span-122"
                                className="text-md font-normal text-gray-500"
                              >
                                Question No {index + 1}:
                              </span>
                              <span
                                data-cy="-components-tabs-response-index-tsx-index-span-125"
                                className="text-md font-normal"
                              >
                                {getJobQuestionNames(addInfo?.question)
                                  ?.question || ''}
                              </span>
                            </div>

                            <div
                              className="flex justify-between gap-5"
                              data-cy={`talent-acquisition-candidate-tab-response-answer-${jobInfo?.id ?? index}-${addInfo?.question ?? index}`}
                            >
                              <span
                                data-cy="-components-tabs-response-index-tsx-index-span-135"
                                className="text-md font-normal text-gray-500"
                              >
                                Response:
                              </span>
                              <span
                                data-cy="-components-tabs-response-index-tsx-index-span-138"
                                className="text-md font-normal"
                              >
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
