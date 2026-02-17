'use client';
import CustomBreadcrumb from '@/components/common/breadCramp';
import {
  useGetDepartmentByID,
  useGetJobsByID,
} from '@/store/server/features/recruitment/job/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { Button, Col, Input, Row, Spin } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import Link from 'next/link';
import React from 'react';
import { IoArrowBack } from 'react-icons/io5';

interface Params {
  id: string;
}
interface CategoryForms {
  params: Params;
}

const JobDescription = ({ params: { id } }: CategoryForms) => {
  const { data: jobDescription, isLoading: ResponseLoading } =
    useGetJobsByID(id);

  const depId = jobDescription?.departmentId;
  const { data: depById } = useGetDepartmentByID(depId);

  const tenantId = useAuthenticationStore.getState().tenantId;

  if (ResponseLoading) {
    return (
      <div
        data-cy="job-openpositions-id-page-tsx-page-div-32"
        className="fixed inset-0 flex items-center justify-center bg-white/50"
      >
        <Spin size="large" />
      </div>
    );
  }

  const CustomBreadcrumbTitle = (
    <Link
      href={`/job/openPositions`}
      className="flex items-center justify-start gap-2 text-gray-800 "
    >
      <IoArrowBack />
      <div data-cy="job-openpositions-id-page-tsx-page-div-44">3D Designer</div>
    </Link>
  );
  return (
    <div data-cy="job-openpositions-id-page-tsx-page-div-48">
      <CustomBreadcrumb
        title={CustomBreadcrumbTitle}
        subtitle="Read the Job Description to apply"
      />
      <div
        data-cy="job-openpositions-id-page-tsx-page-div-53"
        className="w-full rounded-lg p-4 bg-white px-32 flex flex-col gap-4"
      >
        <div
          data-cy="job-openpositions-id-page-tsx-page-div-54"
          className="text-2xl text-primary font-bold py-4 text-center"
        >
          Job Description
        </div>
        <div
          data-cy="job-openpositions-id-page-tsx-page-div-57"
          className="flex flex-col justify-center gap-1"
        >
          <div data-cy="job-openpositions-id-page-tsx-page-div-58">
            <span
              data-cy="job-openpositions-id-page-tsx-page-span-59"
              className="text-md font-semibold text-gray-700"
            >
              Job Title
            </span>
          </div>
          <Input
            disabled
            placeholder={jobDescription?.jobTitle}
            variant="filled"
            className="text-sm w-full h-10"
          />
        </div>

        <Row gutter={16}>
          <Col xs={24} sm={24} lg={12} md={12} xl={12}>
            <div
              data-cy="job-openpositions-id-page-tsx-page-div-73"
              className="flex flex-col justify-center gap-1"
            >
              <div data-cy="job-openpositions-id-page-tsx-page-div-74">
                <span
                  data-cy="job-openpositions-id-page-tsx-page-span-75"
                  className="text-md font-semibold text-gray-700"
                >
                  Department
                </span>
              </div>
              <Input
                disabled
                placeholder={depById?.name}
                variant="filled"
                className="text-sm w-full h-10"
              />
            </div>
          </Col>
          <Col xs={24} sm={24} lg={12} md={12} xl={12}>
            <div
              data-cy="job-openpositions-id-page-tsx-page-div-88"
              className="flex flex-col justify-center gap-1"
            >
              <div data-cy="job-openpositions-id-page-tsx-page-div-89">
                <span
                  data-cy="job-openpositions-id-page-tsx-page-span-90"
                  className="text-md font-semibold text-gray-700"
                >
                  Employment Type
                </span>
              </div>
              <Input
                disabled
                placeholder={jobDescription?.employmentType}
                variant="filled"
                className="text-sm w-full h-10"
              />
            </div>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={24} lg={12} md={12} xl={12}>
            <div
              data-cy="job-openpositions-id-page-tsx-page-div-105"
              className="flex flex-col justify-center gap-1"
            >
              <div data-cy="job-openpositions-id-page-tsx-page-div-106">
                <span
                  data-cy="job-openpositions-id-page-tsx-page-span-107"
                  className="text-md font-semibold text-gray-700"
                >
                  Compensation
                </span>
              </div>
              <Input
                disabled
                placeholder={jobDescription?.compensation}
                variant="filled"
                className="text-sm w-full h-10"
              />
            </div>
          </Col>
          <Col xs={24} sm={24} lg={12} md={12} xl={12}>
            <div
              data-cy="job-openpositions-id-page-tsx-page-div-120"
              className="flex flex-col justify-center gap-1"
            >
              <div data-cy="job-openpositions-id-page-tsx-page-div-121">
                <span
                  data-cy="job-openpositions-id-page-tsx-page-span-122"
                  className="text-md font-semibold text-gray-700"
                >
                  Years of Experience
                </span>
              </div>
              <Input
                disabled
                placeholder={jobDescription?.yearOfExperience}
                variant="filled"
                className="text-sm w-full h-10"
              />
            </div>
          </Col>
        </Row>
        <TextArea
          disabled
          placeholder={
            jobDescription?.description ??
            `We are seeking a creative and detail-oriented UI/UX Designer to join our growing team. The ideal candidate will have a strong understanding of user-centered design principles and a passion for creating intuitive and visually appealing digital experiences. As a UI/UX Designer, you will work closely with product managers, developers, and other stakeholders to design user interfaces that are not only beautiful but also highly functional. Key Responsibilities: Collaborate with cross-functional teams to understand project requirements and user needs. Create wireframes, prototypes, and high-fidelity mockups for web and mobile applications. Conduct user research and usability testing to gather feedback and iterate on designs. Design and maintain a consistent user interface across all platforms. Develop and maintain design systems and style guides. Present and defend design decisions to stakeholders, clearly articulating the rationale behind design choices. Stay updated on the latest UI/UX trends, techniques, and technologies. Ensure designs are responsive, accessible, and optimized for performance. Work with developers to ensure accurate implementation of designs.`
          }
          variant="filled"
          className="text-sm w-full"
          autoSize={{ minRows: 10, maxRows: 10 }}
        />
      </div>
      <div
        data-cy="job-openpositions-id-page-tsx-page-div-146"
        className="flex justify-center w-full bg-[#fff] px-6 py-6 gap-6"
      >
        <Button
          type="primary"
          className="flex justify-center text-sm font-medium text-gray-800 bg-white p-4 px-10 h-12 hover:border-gray-500 border-gray-300"
        >
          Cancel
        </Button>
        <Link href={`/job/${tenantId}/${id}`}>
          <Button
            htmlType="submit"
            className="flex justify-center text-sm font-medium text-white bg-primary p-4 px-10 h-12"
          >
            Apply
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default JobDescription;
