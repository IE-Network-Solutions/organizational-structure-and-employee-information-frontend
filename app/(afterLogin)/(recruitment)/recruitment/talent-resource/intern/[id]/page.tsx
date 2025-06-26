'use client';
import { Button, Card, Divider, Row, Col, Typography, Spin, Space } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import { useGetDepartmentByID } from '@/store/server/features/recruitment/job/queries';
import dayjs from 'dayjs';
import {
  FileTextOutlined,
  DownloadOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useGetInternById } from '@/store/server/features/recruitment/intern/query';

const { Title, Text } = Typography;

const InternDetails = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: internData, isLoading } = useGetInternById(id);

  const DepartmentName = ({ departmentId }: { departmentId: string }) => {
    const { data: department, isLoading: isDeptLoading } =
      useGetDepartmentByID(departmentId);

    if (isDeptLoading) return <Spin size="small" />;
    return <Text>{department?.name || 'N/A'}</Text>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!internData) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Text>Talent roaster not found</Text>
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
    <div className="w-full mx-auto p-4 space-y-6">
      {/* Back Button */}
      <div className="mb-4">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          Back to Interns
        </Button>
      </div>

      {/* Personal Info Section */}
      <Card title={<Title level={4}>Personal Info</Title>} className="w-full">
        <Row gutter={[24, 16]}>
          <Col xs={24} md={12}>
            <InfoRow label="Full Name" value={internData?.fullName || 'N/A'} />
            <InfoRow
              label="Application Date"
              value={
                internData?.createdAt
                  ? dayjs(internData.createdAt).format('DD MMM YYYY')
                  : 'N/A'
              }
            />
            <InfoRow
              label="CV"
              value={
                internData?.resumeUrl ? (
                  <Space>
                    <FileTextOutlined />
                    <a
                      href={internData.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {internData?.documentName || 'CV.pdf'}
                    </a>
                    <Button
                      type="link"
                      size="small"
                      icon={<DownloadOutlined />}
                      href={internData.resumeUrl}
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
              label="Expected Graduation Year"
              value={
                internData?.graduateYear ? internData?.graduateYear : 'N/A'
              }
            />
            <InfoRow label="CGPA" value={internData?.CGPA || 'N/A'} />
            <InfoRow
              label="Department"
              value={
                internData?.departmentId ? (
                  <DepartmentName departmentId={internData.departmentId} />
                ) : (
                  'N/A'
                )
              }
            />
          </Col>
        </Row>
      </Card>

      {/* Address Section */}
      <Card title={<Title level={4}>Address</Title>} className="w-full">
        <Row gutter={[24, 16]}>
          <Col xs={24} md={12}>
            <InfoRow label="Email Address" value={internData?.email || 'N/A'} />
            <InfoRow label="Phone Number" value={internData?.phone || 'N/A'} />
          </Col>
        </Row>
      </Card>

      {/* Additional Information Section */}
      <Card
        title={<Title level={4}>Additional Information</Title>}
        className="w-full"
      >
        <div className="space-y-4">
          <div>
            <Text className="text-gray-600">Expected Salary</Text>
            <div className="mt-1">
              <Text strong>
                {internData?.expectedSalary
                  ? `${internData.expectedSalary} Birr`
                  : 'N/A'}
              </Text>
            </div>
          </div>

          <Divider />

          <div>
            <Text className="text-gray-600">Motivation for applying</Text>
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <Text>
                {internData?.motivationForApplying ||
                  'No motivation statement provided'}
              </Text>
            </div>
          </div>

          <div>
            <Text className="text-gray-600">
              Why are you interested in this internship
            </Text>
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <Text>{internData?.whyInterested || 'No response provided'}</Text>
            </div>
          </div>
        </div>
      </Card>

      {/* Cover Letter Section */}
      {internData?.coverLetter && (
        <Card title={<Title level={4}>Cover Letter</Title>} className="w-full">
          <div className="p-3 bg-gray-50 rounded-lg">
            <Text style={{ whiteSpace: 'pre-wrap' }}>
              {internData.coverLetter}
            </Text>
          </div>
        </Card>
      )}
    </div>
  );
};

export default InternDetails;
