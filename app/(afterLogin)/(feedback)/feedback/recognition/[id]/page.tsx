'use client';
import { LoadingOutlined, UserOutlined } from '@ant-design/icons';
import { useGetRecognitionById } from '@/store/server/features/CFR/recognition/queries';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { Avatar, Button, Card, Col, Row, Tooltip } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import EmployeeScoreCard from '../_components/EmployeeScoreCard';
import { FaLongArrowAltLeft } from 'react-icons/fa';
import { useDownloadCertificate } from '@/store/server/features/CFR/recognition/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

interface Params {
  id: string;
}
interface RecognitionDetailsProps {
  params: Params;
}

function Page({ params: { id } }: RecognitionDetailsProps) {
  const { data: getRecognitionById, isLoading } = useGetRecognitionById(id);
  const tenantId = useAuthenticationStore.getState().tenantId;
  const downloadMutation = useDownloadCertificate();

  const EmployeeDetailsComponent = ({ empId }: { empId: string }) => {
    const { data: userDetails, isLoading, error } = useGetEmployee(empId);

    if (isLoading) return <LoadingOutlined />;
    if (error || !userDetails) return '-';

    const userName =
      `${userDetails?.firstName} ${userDetails?.middleName} ${userDetails?.lastName}` ||
      '-';
    const profileImage = userDetails?.profileImage;

    return (
      <div className="flex gap-2 items-center">
        <Avatar src={profileImage} icon={<UserOutlined />} />
        <div>{userName}</div>
      </div>
    );
  };

  const EmployeeDetails = React.memo(EmployeeDetailsComponent);

  const recognitionType = getRecognitionById?.recognitionType?.name;
  const title = (
    <div
      className="flex justify-between items-center  "
      data-cy="recognition-detail-header"
      id="recognitionDetailHeader"
    >
      <div
        className="flex items-center gap-3"
        data-cy="recognition-detail-title-container"
        id="recognitionDetailTitleContainer"
      >
        {' '}
        <FaLongArrowAltLeft
          className="cursor-pointer"
          onClick={() => window.history.back()}
          data-cy="recognition-detail-back-button"
          id="recognitionDetailBackButton"
        />{' '}
        <span data-cy="recognition-detail-type" id="recognitionDetailType">
          {recognitionType}{' '}
        </span>{' '}
      </div>
      <Tooltip
        placement="top"
        overlayClassName="custom-tooltip"
        data-cy="recognition-detail-print-tooltip"
        id="recognitionDetailPrintTooltip"
      >
        <Button
          loading={downloadMutation.isLoading}
          onClick={() => {
            downloadMutation.mutate({ recognitionId: id, tenantId });
          }}
          type="primary"
          id={`printCertificationCustomButtonId`}
          className={`h-14 px-6 py-6 rounded-lg flex justify-start items-center gap-2 text-xs bg-blue-600 hover:bg-blue-700`}
          data-cy="recognition-detail-print-button"
        >
          <div
            className="text-center text-base font-bold font-['Manrope'] leading-normal tracking-tight"
            data-cy="recognition-detail-print-button-text"
            id="recognitionDetailPrintButtonText"
          >
            {downloadMutation.isLoading
              ? 'Downloading...'
              : 'Print Certification'}
          </div>
        </Button>
      </Tooltip>
    </div>
  );
  return (
    <div data-cy="recognition-detail-page" id="recognitionDetailPage">
      <>
        <Card
          loading={isLoading}
          title={title}
          className="mt-5"
          data-cy="recognition-detail-card"
          id="recognitionDetailCard"
        >
          <Row
            gutter={[16, 16]}
            style={{ width: 'auto' }}
            data-cy="recognition-detail-info-row"
            id="recognitionDetailInfoRow"
          >
            <Col
              span={24}
              data-cy="recognition-detail-employee-col"
              id="recognitionDetailEmployeeCol"
            >
              <Row
                data-cy="recognition-detail-employee-row"
                id="recognitionDetailEmployeeRow"
              >
                <Col
                  span={8}
                  style={{ fontWeight: 'bold' }}
                  data-cy="recognition-detail-employee-label"
                  id="recognitionDetailEmployeeLabel"
                >
                  Employee
                </Col>
                <Col
                  span={12}
                  data-cy="recognition-detail-employee-value"
                  id="recognitionDetailEmployeeValue"
                >
                  <EmployeeDetails
                    empId={getRecognitionById?.recipientId}
                    data-cy="recognition-detail-employee-details"
                  />
                </Col>
              </Row>
            </Col>
            <Col
              span={24}
              data-cy="recognition-detail-issued-date-col"
              id="recognitionDetailIssuedDateCol"
            >
              <Row
                data-cy="recognition-detail-issued-date-row"
                id="recognitionDetailIssuedDateRow"
              >
                <Col
                  span={8}
                  style={{ fontWeight: 'bold' }}
                  data-cy="recognition-detail-issued-date-label"
                  id="recognitionDetailIssuedDateLabel"
                >
                  Issued Date
                </Col>
                <Col
                  span={12}
                  data-cy="recognition-detail-issued-date-value"
                  id="recognitionDetailIssuedDateValue"
                >
                  {getRecognitionById?.dateIssued
                    ? dayjs(getRecognitionById.dateIssued).format(
                        'MMMM D, YYYY',
                      ) // Format as "Month Day, Year"
                    : 'N/A'}
                </Col>
              </Row>
            </Col>
            <Col
              span={24}
              data-cy="recognition-detail-recognized-by-col"
              id="recognitionDetailRecognizedByCol"
            >
              <Row
                data-cy="recognition-detail-recognized-by-row"
                id="recognitionDetailRecognizedByRow"
              >
                <Col
                  span={8}
                  style={{ fontWeight: 'bold' }}
                  data-cy="recognition-detail-recognized-by-label"
                  id="recognitionDetailRecognizedByLabel"
                >
                  Recognized By
                </Col>
                <Col
                  span={12}
                  data-cy="recognition-detail-recognized-by-value"
                  id="recognitionDetailRecognizedByValue"
                >
                  <EmployeeDetails
                    empId={getRecognitionById?.issuerId}
                    data-cy="recognition-detail-recognized-by-details"
                  />
                </Col>
              </Row>
            </Col>

            <Col
              span={24}
              data-cy="recognition-detail-details-col"
              id="recognitionDetailDetailsCol"
            >
              <Row
                data-cy="recognition-detail-details-row"
                id="recognitionDetailDetailsRow"
              >
                <Col
                  span={8}
                  style={{ fontWeight: 'bold' }}
                  data-cy="recognition-detail-details-label"
                  id="recognitionDetailDetailsLabel"
                >
                  Details
                </Col>
                <Col
                  span={12}
                  data-cy="recognition-detail-details-value"
                  id="recognitionDetailDetailsValue"
                >
                  {getRecognitionById?.recognitionType?.description || 'N/A'}
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>

        <EmployeeScoreCard
          data={getRecognitionById?.criteriaScore}
          data-cy="recognition-detail-employee-score-card"
        />
      </>
    </div>
  );
}

export default Page;
