import { Card, Col, Row } from 'antd';
import { LuPencil } from 'react-icons/lu';
import { InfoLine } from '../common/infoLine';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import dayjs from 'dayjs';

function General({ id }: { id: string }) {
  const { isLoading, data: employeeData } = useGetEmployee(id);

  return (
    <>
      <Card
        loading={isLoading}
        title="Personal Info"
        extra={<LuPencil color="#BFBFBF" />}
        className="my-6 mt-0"
      >
        <Row gutter={[16, 24]}>
          <Col lg={12}>
            <InfoLine
              title="Full Name"
              value={
                <>
                  {' '}
                  {employeeData?.firstName} {employeeData?.middleName}{' '}
                  {employeeData?.lastName}
                </>
              }
            />
            <InfoLine
              title="Date of Birth"
              value={
                dayjs(employeeData?.employeeInformation?.dateOfBirth).format(
                  'DD MMMM, YYYY',
                ) || '-'
              }
            />
            <InfoLine
              title="Nationality"
              value={
                employeeData?.employeeInformation?.nationality?.name || '-'
              }
            />
          </Col>
          <Col lg={10}>
            <InfoLine
              title="Gender"
              value={employeeData?.employeeInformation?.gender || '-'}
            />
            <InfoLine
              title="Maritial Status"
              value={employeeData?.employeeInformation?.maritalStatus || '-'}
            />
            <InfoLine
              title="Joined Date"
              value={
                dayjs(employeeData?.employeeInformation?.joinedDate)?.format(
                  'DD MMMM, YYYY',
                ) || '-'
              }
            />
          </Col>
        </Row>
      </Card>

      <Card
        loading={isLoading}
        title="Address"
        extra={<LuPencil />}
        className="my-6"
      >
        <Row gutter={[16, 24]}>
          <Col lg={16}>
            {Object.entries(
              employeeData?.employeeInformation?.addresses || {},
            ).map(([key, val]) => (
              <InfoLine key={key} title={key} value={val?.toString() || '-'} />
            ))}
          </Col>
        </Row>
      </Card>

      <Card
        loading={isLoading}
        title="Emergency Contact"
        extra={<LuPencil />}
        className="my-6"
      >
        <Row gutter={[16, 24]}>
          <Col lg={16}>
            {Object.entries(
              employeeData?.employeeInformation?.emergencyContact || {},
            ).map(([key, val]) => (
              <InfoLine key={key} title={key} value={val?.toString() || '-'} />
            ))}
          </Col>
        </Row>
      </Card>

      <Card
        loading={isLoading}
        title="Bank Information"
        extra={<LuPencil />}
        className="my-6"
      >
        <Row gutter={[16, 24]}>
          <Col lg={16}>
            {Object.entries(
              employeeData?.employeeInformation?.bankInformation || {},
            ).map(([key, val]) => (
              <InfoLine key={key} title={key} value={val?.toString() || '-'} />
            ))}
          </Col>
        </Row>
      </Card>
    </>
  );
}

export default General;
