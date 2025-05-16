'use client';
import { LoadingOutlined, UserOutlined } from '@ant-design/icons';
import { useGetRecognitionById } from '@/store/server/features/CFR/recognition/queries';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { Avatar, Button, Card, Col, Row, Tooltip } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import EmployeeScoreCard from '../_components/EmployeeScoreCard';
import { FaLongArrowAltLeft } from 'react-icons/fa';
interface Params {
  id: string;
}
interface RecognitionDetailsProps {
  params: Params;
}

function Page({ params: { id } }: RecognitionDetailsProps) {
  const { data: getRecognitionById, isLoading } = useGetRecognitionById(id);

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
    <div className="flex justify-between items-center  ">
      <div className="flex items-center gap-3">
        {' '}
        <FaLongArrowAltLeft
          className="cursor-pointer"
          onClick={() => window.history.back()}
        />{' '}
        <span>{recognitionType} </span>{' '}
      </div>
      <Tooltip placement="top" overlayClassName="custom-tooltip">
        <Button
          loading={isLoading}
          type="primary"
          id={`printCertificationCustomButtonId`}
          className={`h-14 px-6 py-6 rounded-lg flex justify-start items-center gap-2 text-xs bg-blue-600 hover:bg-blue-700`}
        >
          <div className="text-center text-base font-bold font-['Manrope'] leading-normal tracking-tight">
            Print Certification
          </div>
        </Button>
      </Tooltip>
    </div>
  );
  return (
    <div>
      <>
        <Card loading={isLoading} title={title} className="mt-5">
          <Row gutter={[16, 16]} style={{ width: 'auto' }}>
            <Col span={24}>
              <Row>
                <Col span={8} style={{ fontWeight: 'bold' }}>
                  Employee
                </Col>
                <Col span={12}>
                  <EmployeeDetails empId={getRecognitionById?.recipientId} />
                </Col>
              </Row>
            </Col>
            <Col span={24}>
              <Row>
                <Col span={8} style={{ fontWeight: 'bold' }}>
                  Issued Date
                </Col>
                <Col span={12}>
                  {getRecognitionById?.dateIssued
                    ? dayjs(getRecognitionById.dateIssued).format(
                        'MMMM D, YYYY',
                      ) // Format as "Month Day, Year"
                    : 'N/A'}
                </Col>
              </Row>
            </Col>
            <Col span={24}>
              <Row>
                <Col span={8} style={{ fontWeight: 'bold' }}>
                  Recognized By
                </Col>
                <Col span={12}>
                  <EmployeeDetails empId={getRecognitionById?.issuerId} />
                </Col>
              </Row>
            </Col>

            <Col span={24}>
              <Row>
                <Col span={8} style={{ fontWeight: 'bold' }}>
                  Details
                </Col>
                <Col span={12}>
                  {getRecognitionById?.recognitionType?.description || 'N/A'}
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>

        <EmployeeScoreCard data={getRecognitionById?.criteriaScore} />
      </>
    </div>
  );
}

export default Page;
