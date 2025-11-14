'use client';
import { Button, Card, Divider, Row, Col, Typography, Spin, Space } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import { useGetTalentRoasterById } from '@/store/server/features/recruitment/talent-roaster/query';
import { useGetDepartmentByID } from '@/store/server/features/recruitment/job/queries';
import dayjs from 'dayjs';
import {
  FileTextOutlined,
  DownloadOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const TalentRoasterDetails = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: talentData, isLoading } = useGetTalentRoasterById(id);

  const DepartmentName = ({ departmentId }: { departmentId: string }) => {
    const { data: department, isLoading: isDeptLoading } =
      useGetDepartmentByID(departmentId);

    if (isDeptLoading) return <Spin size="small" />;
    return <Text>{department?.name || 'N/A'}</Text>;
  };

  if (isLoading) {
    return (
      <div id="talent-acquisition-talent-roaster-detail-div-container" data-cy="talent-acquisition-talent-roaster-detail-div-container" className="flex justify-center items-center min-h-96">
        <Spin  data-cy="talent-acquisition-talent-roaster-detail-spin" size="large" />
      </div>
    );
  }

  if (!talentData) {
    return (
      <div id="talent-acquisition-talent-roaster-detail-div-not-found" data-cy="talent-acquisition-talent-roaster-detail-div-not-found" className="flex justify-center items-center min-h-96">
        <Text data-cy="talent-acquisition-talent-roaster-detail-text-not-found">Talent roaster not found</Text>
      </div>
    );
  }

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) => (
    <Row className="py-2">
      <Col span={8}>
        <Text className="text-gray-600">{label}</Text>
      </Col>
      <Col span={16}>
        <Text strong>{value}</Text>
      </Col>
    </Row>
  );

  return (
    <div id="talent-acquisition-talent-roaster-detail-div-container" data-cy="talent-acquisition-talent-roaster-detail-div-container" className="w-full mx-auto p-4 space-y-6">
      {/* Back Button */}
      <div id="talent-acquisition-talent-roaster-detail-div-button-back" data-cy="talent-acquisition-talent-roaster-detail-div-button-back" className="mb-4">
        <Button
          id="talent-acquisition-talent-roaster-detail-button-back"
          data-cy="talent-acquisition-talent-roaster-detail-button-back"
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          Back to Talent Roaster
        </Button>
      </div>

      {/* Personal Info Section */}
      <Card  data-cy="talent-acquisition-talent-roaster-detail-card-personal-info" title={<Title level={4}>Personal Info</Title>} className="w-full">
        <Row data-cy="talent-acquisition-talent-roaster-detail-row-personal-info" gutter={[24, 16]}>
          <Col data-cy="talent-acquisition-talent-roaster-detail-col-personal-info-full-name" xs={24} md={12}>
            <InfoRow data-cy="talent-acquisition-talent-roaster-detail-info-row-full-name" label="Full Name" value={talentData?.fullName || 'N/A'} />
            <InfoRow
              data-cy="talent-acquisition-talent-roaster-detail-info-row-application-date"
              label="Application Date"
              value={
                talentData?.createdAt
                  ? dayjs(talentData.createdAt).format('DD MMM YYYY')
                  : 'N/A'
              }
            />
            <InfoRow
              data-cy="talent-acquisition-talent-roaster-detail-info-row-cv"
              label="CV"
              value={
                talentData?.resumeUrl ? (
                  <Space>
                    <FileTextOutlined data-cy="talent-acquisition-talent-roaster-detail-icon-cv" />
                    <a
                      id="talent-acquisition-talent-roaster-detail-link-cv"
                      data-cy="talent-acquisition-talent-roaster-detail-link-cv"
                      href={talentData.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {talentData?.documentName || 'CV.pdf'}
                    </a>
                    <Button
                      id="talent-acquisition-talent-roaster-detail-button-download-cv"
                      data-cy="talent-acquisition-talent-roaster-detail-button-download-cv"
                      type="link"
                      size="small"
                      icon={<DownloadOutlined />}
                      href={talentData.resumeUrl}
                      target="_blank"
                    />
                  </Space>
                ) : (
                  'N/A'
                )
              }
            />
          </Col>
          <Col xs={24} md={12}>
            <InfoRow
              label="Year of Graduation"
              data-cy="talent-acquisition-talent-roaster-detail-info-row-year-of-graduation"
              value={
                talentData?.graduateYear ? talentData?.graduateYear : 'N/A'
              }
            />
            <InfoRow data-cy="talent-acquisition-talent-roaster-detail-info-row-cgpa" label="CGPA" value={talentData?.CGPA || 'N/A'} />
            <InfoRow
              data-cy="talent-acquisition-talent-roaster-detail-info-row-department"
              label="Department"
              value={
                talentData?.departmentId ? (
                  <DepartmentName departmentId={talentData.departmentId} />
                ) : (
                  'N/A'
                )
              }
            />
          </Col>
        </Row>
      </Card>

      {/* Address Section */}
      <Card data-cy="talent-acquisition-talent-roaster-detail-card-address" title={<Title level={4}>Address</Title>} className="w-full">
        <Row data-cy="talent-acquisition-talent-roaster-detail-row-address" gutter={[24, 16]}>
          <Col xs={24} md={12}>
            <InfoRow data-cy="talent-acquisition-talent-roaster-detail-info-row-email-address" label="Email Address" value={talentData?.email || 'N/A'} />
            <InfoRow data-cy="talent-acquisition-talent-roaster-detail-info-row-phone-number" label="Phone Number" value={talentData?.phone || 'N/A'} />
          </Col>
        </Row>
      </Card>

      {/* Additional Information Section */}
      <Card
        title={<Title level={4}>Additional Information</Title>}
        className="w-full"
      >
        <div data-cy="talent-acquisition-talent-roaster-detail-div-additional-info" className="space-y-4">
          <div data-cy="talent-acquisition-talent-roaster-detail-div-additional-info-expected-salary">
            <Text className="text-gray-600">Expected Salary</Text>
            <div data-cy="talent-acquisition-talent-roaster-detail-div-additional-info-expected-salary-value" className="mt-1">
              <Text strong>
                {talentData?.expectedSalary
                  ? `${talentData.expectedSalary} Birr`
                  : 'N/A'}
              </Text>
            </div>
          </div>

          <Divider />

          <div data-cy="talent-acquisition-talent-roaster-detail-div-additional-info-motivation-for-applying">
            <Text className="text-gray-600">Motivation for applying</Text>
            <div data-cy="talent-acquisition-talent-roaster-detail-div-additional-info-motivation-for-applying-value" className="mt-2 p-3 bg-gray-50 rounded-lg">
              <Text>
                {talentData?.motivationForApplying ||
                  'No motivation statement provided'}
              </Text>
            </div>
          </div>

          <div data-cy="talent-acquisition-talent-roaster-detail-div-additional-info-why-interested">
            <Text className="text-gray-600">
              Why are you interested in this Company?
            </Text>
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <Text>{talentData?.whyInterested || 'No response provided'}</Text>
            </div>
          </div>
        </div>
      </Card>

      {/* Cover Letter Section */}
      {talentData?.coverLetter && (
        <Card title={<Title level={4}>Cover Letter</Title>} className="w-full">
          <div data-cy="talent-acquisition-talent-roaster-detail-div-cover-letter-value" className="p-3 bg-gray-50 rounded-lg">
            <Text style={{ whiteSpace: 'pre-wrap' }}>
              {talentData.coverLetter}
            </Text>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TalentRoasterDetails;
