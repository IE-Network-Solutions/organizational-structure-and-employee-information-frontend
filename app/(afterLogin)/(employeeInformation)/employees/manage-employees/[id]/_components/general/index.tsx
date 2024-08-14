import { Button, Card, Col, Form, Input, Row } from 'antd';
import { LuPencil } from 'react-icons/lu';
import { InfoLine } from '../common/infoLine';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import dayjs from 'dayjs';
import { useState } from 'react';

function General({ id }: { id: string }) {
  const { isLoading, data: employeeData } = useGetEmployee(id);
  const [edit,setEdit]=useState({'address':false,'general':false,'emergencyContact':false,'bankInformation':false});
  const [form] = Form.useForm();

const handleEditChange=(key:string)=>{
  setEdit((prev:any) => ({
    ...prev,
    [key]: !prev[key],
  })); 
}
  const handleSaveChanges = (key:string) => {
    form
      .validateFields()
      .then((values) => {
        console.log('Form Values:', values);
     })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };
  return (
    <>
    <Card
      loading={isLoading}
      title="Personal Info"
      extra={<LuPencil color="#BFBFBF" onClick={() => handleEditChange('general')} />}
      className="my-6 mt-0"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          firstName: employeeData?.firstName,
          middleName: employeeData?.middleName,
          lastName: employeeData?.lastName,
          dateOfBirth: dayjs(employeeData?.employeeInformation?.dateOfBirth).format('YYYY-MM-DD'),
          nationality: employeeData?.employeeInformation?.nationality?.name,
          gender: employeeData?.employeeInformation?.gender,
          maritalStatus: employeeData?.employeeInformation?.maritalStatus,
          joinedDate: dayjs(employeeData?.employeeInformation?.joinedDate).format('YYYY-MM-DD'),
        }}
      >
        <Row gutter={[16, 24]}>
          {edit.general ? (
            <>
              <Col lg={12}>
                <Form.Item
                  name="firstName"
                  label="First Name"
                  className='text-gray-950 text-xs'
                  rules={[{ required: true, message: 'Please enter the first name' }]}
                >
                  <Input placeholder="First Name" />
                </Form.Item>
                <Form.Item
                  name="middleName"
                  label="Middle Name"
                  className='text-gray-950 text-xs'
                  rules={[{ required: true, message: 'Please enter the middle name' }]}
                >
                  <Input placeholder="Middle Name" />
                </Form.Item>
                <Form.Item
                  name="lastName"
                  label="Last Name"
                  className='text-gray-950 text-xs'
                  rules={[{ required: true, message: 'Please enter the last name' }]}
                >
                  <Input placeholder="Last Name" />
                </Form.Item>
                <Form.Item
                  name="dateOfBirth"
                  label="Date of Birth"
                  className='text-gray-950 text-xs'
                  rules={[{ required: true, message: 'Please enter the date of birth' }]}
                >
                  <Input placeholder="YYYY-MM-DD" />
                </Form.Item>
              </Col>
              <Col lg={10}>
                <Form.Item
                  name="nationality"
                  label="Nationality"
                  className='text-gray-950 text-xs'
                  rules={[{ required: true, message: 'Please enter the nationality' }]}
                >
                  <Input placeholder="Nationality" />
                </Form.Item>
                <Form.Item
                  name="gender"
                  label="Gender"
                  className='text-gray-950 text-xs'
                  rules={[{ required: true, message: 'Please enter the gender' }]}
                >
                  <Input placeholder="Gender" />
                </Form.Item>
                <Form.Item
                  name="maritalStatus"
                  label="Marital Status"
                  className='text-gray-950 text-xs'
                  rules={[{ required: true, message: 'Please enter the marital status' }]}
                >
                  <Input placeholder="Marital Status" />
                </Form.Item>
                <Form.Item
                  name="joinedDate"
                  label="Joined Date"
                  className='text-gray-950 text-xs'
                  rules={[{ required: true, message: 'Please enter the joined date' }]}
                >
                  <Input placeholder="YYYY-MM-DD" />
                </Form.Item>
              </Col>
              <Col span={24} style={{ textAlign: 'right' }}>
                <Button type="primary" onClick={()=>handleSaveChanges}>
                  Save Changes
                </Button>
              </Col>
            </>
          ) : (
            <>
              <Col lg={12}>
                <InfoLine
                  title="Full Name"
                  value={`${employeeData?.firstName} ${employeeData?.middleName} ${employeeData?.lastName}`}
                />
                <InfoLine
                  title="Date of Birth"
                  value={dayjs(employeeData?.employeeInformation?.dateOfBirth).format('DD MMMM, YYYY') || '-'}
                />
                <InfoLine
                  title="Nationality"
                  value={employeeData?.employeeInformation?.nationality?.name || '-'}
                />
              </Col>
              <Col lg={10}>
                <InfoLine
                  title="Gender"
                  value={employeeData?.employeeInformation?.gender || '-'}
                />
                <InfoLine
                  title="Marital Status"
                  value={employeeData?.employeeInformation?.maritalStatus || '-'}
                />
                <InfoLine
                  title="Joined Date"
                  value={dayjs(employeeData?.employeeInformation?.joinedDate)?.format('DD MMMM, YYYY') || '-'}
                />
              </Col>
            </>
          )}
        </Row>
      </Form>
    </Card>

    <Card
      loading={isLoading}
      title="Address"
      extra={<LuPencil onClick={()=>handleEditChange('address')} />}
      className="my-6"
    >
      {edit.address ? (<Form
        form={form}
        layout="vertical"
        style={{ display: edit ? 'block' : 'none' }} // Hide form when not in edit mode
      >
        <Row gutter={[16, 24]}>
          <Col lg={16}>
            {Object.entries(employeeData?.employeeInformation?.addresses || {}).map(([key, val]) => (
              <Form.Item
                key={key}
                name={key}
                label={key}
                rules={[{ required: true, message: `Please enter your ${key}` }]} // Example validation
              >
                <Input placeholder={key} defaultValue={val?.toString()} />
              </Form.Item>
            ))}
          </Col>
        </Row>
        <Row>
          <Col span={24} style={{ textAlign: 'right' }}>
            <Button type="primary" onClick={()=>handleSaveChanges}>
              Save Changes
            </Button>
          </Col>
        </Row>
      </Form>)
      :
      (
        <Row gutter={[16, 24]}>
          <Col lg={16}>
            {Object.entries(employeeData?.employeeInformation?.addresses || {}).map(([key, val]) => (
              <InfoLine key={key} title={key} value={val?.toString() || '-'} />
            ))}
          </Col>
        </Row>
      )}
    </Card>

    <Card
      loading={isLoading}
      title="Emergency Contact"
      extra={<LuPencil onClick={()=>handleEditChange("emergencyContact")} />}
      className="my-6"
    >
      {edit.emergencyContact ? (
        <Form
        form={form}
        layout="vertical"
        style={{ display: edit ? 'block' : 'none' }} // Hide form when not in edit mode
      >
        <Row gutter={[16, 24]}>
          <Col lg={16}>
            {Object.entries(employeeData?.employeeInformation?.emergencyContact || {}).map(([key, val]) => (
              <Form.Item
                key={key}
                name={key}
                label={key}
                rules={[{ required: true, message: `Please enter the ${key}` }]} // Example validation
              >
                <Input placeholder={key} defaultValue={val?.toString()} />
              </Form.Item>
            ))}
          </Col>
        </Row>
        <Row>
          <Col span={24} style={{ textAlign: 'right' }}>
            <Button type="primary" onClick={()=>handleSaveChanges}>
              Save Changes
            </Button>
          </Col>
        </Row>
      </Form>
      ):(
        <Row gutter={[16, 24]}>
          <Col lg={16}>
            {Object.entries(employeeData?.employeeInformation?.emergencyContact || {}).map(([key, val]) => (
              <InfoLine key={key} title={key} value={val?.toString() || '-'} />
            ))}
          </Col>
        </Row>
      )}
    </Card>

    <Card
      loading={isLoading}
      title="Bank Information"
      extra={<LuPencil onClick={()=>handleEditChange("bankInformation")} />}
      className="my-6"
    >
      {edit.bankInformation ? (
      <Form
        form={form}
        layout="vertical"
        style={{ display: edit ? 'block' : 'none' }} // Hide form when not in edit mode
      >
        <Row gutter={[16, 24]}>
          <Col lg={16}>
            {Object.entries(employeeData?.employeeInformation?.bankInformation || {}).map(([key, val]) => (
              <Form.Item
                key={key}
                name={key}
                label={key}
                rules={[{ required: true, message: `Please enter the ${key}` }]} // Example validation
              >
                <Input placeholder={key} defaultValue={val?.toString()} />
              </Form.Item>
            ))}
          </Col>
        </Row>
        <Row>
          <Col span={24} style={{ textAlign: 'right' }}>
            <Button type="primary" onClick={()=>handleSaveChanges}>
              Save Changes
            </Button>
          </Col>
        </Row>
      </Form>
      ):(
        <Row gutter={[16, 24]}>
          <Col lg={16}>
            {Object.entries(employeeData?.employeeInformation?.bankInformation || {}).map(([key, val]) => (
              <InfoLine key={key} title={key} value={val?.toString() || '-'} />
            ))}
          </Col>
        </Row>
      )}
    </Card>
    </>
  );
}

export default General;
