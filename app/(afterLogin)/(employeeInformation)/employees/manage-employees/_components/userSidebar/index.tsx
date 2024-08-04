'use client';

import React, { useEffect, useState } from 'react';
import { Button, Card, Col, DatePicker, Form, Input, Radio, Row, Select, Steps, Switch, Table, TableProps, TimePicker, Upload } from 'antd';
import { useEmployeeManagmentStore, WorkSchedule, WorkScheduleData } from '@/store/uistate/features/employees/employeeManagment';
import {
  useGetRole,
  useGetRolesWithOutPagination,
  useGetRolesWithPermission,
} from '@/store/server/features/employees/settings/role/queries';
import CustomDrawerLayout from '@/components/common/customDrawer';
import {
  useAddEmployee,
  useUpdateEmployee,
} from '@/store/server/features/employees/employeeManagment/mutations';
import { InboxOutlined } from '@ant-design/icons';
import { SelectProps } from 'antd/lib';
import dayjs from 'dayjs';
import { MdOutlineUploadFile } from 'react-icons/md';
import { useGetEmployeInformationFormForTenant } from '@/store/server/features/employees/employeeManagment/employeInformationForm/queries';
import AddCustomField from '../addCustomField';
import { useGetWorkSchedules } from '@/store/server/features/employees/employeeManagment/workSchedule/queries';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
import { useGetPermission, useGetPermissionsWithOutPagination } from '@/store/server/features/employees/settings/permission/queries';
import { useGetNationalities } from '@/store/server/features/employees/employeeManagment/nationality/querier';
import { Permission } from '@/store/server/features/employees/settings/permission/interface';
import { useGetEmployementTypes } from '@/store/server/features/employees/employeeManagment/employmentType/queries';
import UserTable from '../userTable';
import DynamicFormFields from '../dynamicFormDisplayer';
import { transformData } from '../formData';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useGetBranches } from '@/store/server/features/employees/employeeManagment/branchOffice/queries';
interface DataType {
  key: string;
  workingDay: any;
  time: any;
}

const { Step } = Steps;
const { Option } = Select;
const UserSidebar = (props: any) => {
  const {
    setOpen,
    setModalType,
    setSelectedItem,
    modalType,
    userCurrentPage,
    pageSize,
    open,
    prefix,
    setPrefix,
  } = useEmployeeManagmentStore();
  const [form] = Form.useForm();
  const {setCurrent,current,workSchedule,setWorkSchedule,setSelectedWorkSchedule,selectedWorkSchedule}=useEmployeeManagmentStore();
  const {setSelectedRoleOnOption,selectedRoleOnList,setSelectedRoleOnList,selectedRoleOnOption}=useSettingStore();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { data: rolePermissionsData } = useGetRolesWithOutPagination();
  const { data: userListData } = useGetRole('865345678gfghd-nsdcbsd');
  const useCreateEmployeeMutation = useAddEmployee();
  const useUpdateEmployeeMutation = useUpdateEmployee();
  const [selectedPermissions,setSelectedPermissions]=useState<string[]|[]>([])
  
  const { data: customEmployeeInformationForm, isLoading, error } = useGetEmployeInformationFormForTenant();
  const { data: workSchedules, isLoading: workScheduleLoading } = useGetWorkSchedules();
  const { data: rolesWithPermission, isLoading: roleswithPermissionLoading } = useGetRolesWithPermission();
  const { data: Permissionlist, isLoading: PermissionList } = useGetPermissionsWithOutPagination();
  const { data: nationalities, isLoading: nationalityLoading } = useGetNationalities();
  const { data: employementType, isLoading: employementTypeLoading } = useGetEmployementTypes();
  const { data: branchOfficeData, isLoading: branchOfficeLoading } = useGetBranches();


  const [profileFileList, setProfileFileList] = useState<any[]>([]);
  const [documentFileList, setDocumentFileList] = useState<any[]>([]);

  const beforeProfileUpload = (file: any) => {
    setProfileFileList([file]);
    form.setFieldsValue({ profileImage: file });
    return false; // Prevent automatic upload
  };

  const beforeDocumentUpload = (file: any) => {
    setDocumentFileList([file]);
    form.setFieldsValue({ documentName: file });
    return false; // Prevent automatic upload
  };

  const handleProfileRemove = (file: any) => {
    setProfileFileList([]);
    form.setFieldsValue({ profileImage: null });
  };

  const handleDocumentRemove = (file: any) => {
    setDocumentFileList([]);
    form.setFieldsValue({ documentName: null });
  };
  

console.log(selectedPermissions,"selectedPermisisons")
console.log(Permissionlist,"selectedPermisisons1")



  const columns: TableProps<DataType>['columns'] = [
    {
      title: 'Working Day',
      dataIndex: 'workingDay',
      key: 'workingDay',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    }
  ]
  const data =selectedWorkSchedule?.detail?.map(schedule=>({
      key: '1',
      workingDay: <div className='flex space-x-2 justify-start'><Switch defaultChecked disabled /><span>{schedule?.dayOfWeek}</span></div>,
      time: <TimePicker defaultValue={dayjs(schedule?.hours || "00:00:00", 'HH:mm:ss')} disabled />,
  }));
   

  const handlePermissionChange = (value: string[]) => {
    setSelectedPermissions(value);
  };

  useEffect(()=>{
    form.setFieldValue('setOfPermission', selectedPermissions);
  },[selectedRoleOnOption,selectedPermissions])


  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 ">
      {modalType !== 'edit' ? 'Add New Employee' : 'Admin Edit'}
    </div>
  );
  const workscheduleChangeHandler = (value: string) => {
    const selectedValue = workSchedules?.items.find((schedule) => schedule.id === value);
    setSelectedWorkSchedule(selectedValue || null);
    setWorkSchedule(value);
  };
  const onRoleChangeHandler = (value: string) => {
    // Find the selected role based on the provided value (id)
    const selectedRole = rolesWithPermission?.find((role) => role.id === value);
  
    // Update the state for the selected role and option
    setSelectedRoleOnList(selectedRole);
    setSelectedRoleOnOption(value);

    //  const  newPermissions = selectedRole?.permissions?.items?.map((item: any) => item.id) || [];
    //  const uniquePermissions = Array.from(new Set([...selectedPermissions, ...newPermissions]));
    // Update the selected permissions with the permissions from the selected role
    // setSelectedPermissions(newPermissions);
  };

  const handleCreateUser = (values:any) => {
    console.log('Form Values:', transformData(values));
    useCreateEmployeeMutation?.mutate(transformData(values))
  };
  const onChange = (value: number) => {
    setCurrent(value);
  };
  const customDot = <div className='border-2 rounded-full h-8 w-8'><div  style={{ fontSize: '24px', lineHeight: '24px' }}>•</div></div> ;
  const bankInfoForm = customEmployeeInformationForm?.find((form:any) => form.formTitle === "Bank Information");
  const emergencyContact = customEmployeeInformationForm?.find((form:any) => form.formTitle === "Bank Information");
  const address = customEmployeeInformationForm?.find((form:any) => form.formTitle === "Bank Information");
  const addtionalInformation = customEmployeeInformationForm?.find((form:any) => form.formTitle === "Bank Information");


  return (
    open && (
      <CustomDrawerLayout
        open={open}
        onClose={props?.onClose}
        modalHeader={modalHeader}
        width='40%'
      >
      <Steps current={current} responsive={true} size='small' onChange={onChange} className='my-10'>
        <Step icon={customDot} />
        <Step icon={customDot} />
        <Step icon={customDot} />
      </Steps>
      <Form
        form={form}
        name="dependencies"
        autoComplete="off"
        style={{ maxWidth: '100%' }}
        layout="vertical"
        onFinishFailed={()=>NotificationMessage.error({ message:"some thing wrong or unfilled", description:"check back again" })}
        onFinish={handleCreateUser}
      >
          <Card bordered={false} hidden={current!==0}>
          <div>
          <Row justify="center" style={{ width: '100%' }}>
              <Col span={24}>
              <Form.Item
            className="font-semibold text-xs"
            label="Upload Profile"
            style={{ textAlign: 'center' }}
            name="profileImage"
            rules={[{ required: true, message: 'Please upload your profile image!' }]}
          >
            <Upload.Dragger
            name="files"
            fileList={profileFileList}
            beforeUpload={beforeProfileUpload}
            onRemove={handleProfileRemove}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text font-semibold text-xs">Upload Your Profile</p>
              <p className="ant-upload-hint text-xs">or drag and drop it here.</p>
            </Upload.Dragger>
          </Form.Item>
              </Col>
            </Row>
          <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Form.Item className='font-semibold text-xs' name={'userFirstName'} label="First Name" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item className='font-semibold text-xs' name={'userMiddleName'} label=" Middle Name" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item className='font-semibold text-xs' name={'userLastName'} label="Last Name" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
          </Row>
          <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item className='font-semibold text-xs' name={'userEmail'} label="Email Address" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item className='font-semibold text-xs' name={'employeeGender'} label=" Gender" rules={[{ required: true }]}>
                <Select
                  placeholder="Select an option and change input text above"
                  allowClear
                >
                  <Option value="male">Male</Option>
                  <Option value="female">Female</Option>
                </Select>
                </Form.Item>
              </Col>
          </Row>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item className='font-semibold text-xs' name={'dateOfBirth'} label="Date of Birth" rules={[{ required: true }]}>
                   <DatePicker className='w-full' />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item className='font-semibold text-xs' name={'nationalityId'} label=" Nationality" rules={[{ required: true }]}>
                <Select
                  placeholder="Select an option and change input text above"
                  allowClear
                >
                  {nationalities?.items?.map((nationality:any)=>(
                  <Option value={nationality?.id}>{nationality?.name}</Option>
                  ))}
                </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
            <Col xs={24} sm={24}>
              <Form.Item
                className='font-semibold text-xs'
                name={'martialStatus'}
                label="Martial status"
                rules={[{ required: true, message: 'Please select a marital status!' }]}
              >
                <Select
                  placeholder="Select an option and change input text above"
                  // onChange={onGenderChange}
                  allowClear
                >
                  <Option value="single">Single</Option>
                  <Option value="married">Married</Option>
                  <Option value="divorced">Divorced</Option>
                </Select>
              </Form.Item>
              </Col>
            </Row>
            <div className='flex justify-center items-center text-gray-950 text-sm font-semibold my-2'>Address</div>
            <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item className='font-semibold text-xs' name={'addressCountry'} label="Country" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item className='font-semibold text-xs' name={'addressCity'} label="City" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item className='font-semibold text-xs' name={'addressSubcity'} label="Subcity/zone" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item className='font-semibold text-xs' name={'addressWoreda'} label="Woreda" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item className='font-semibold text-xs' name={'addressPrimaryAddress'} label="Primary Address" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item className='font-semibold text-xs' name={'addressHouseNumber'} label="House Number" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
            </Row>
           {/* {bankInfoForm && bankInfoForm.form.map((field:any) => (
             <DynamicFormFields fields={field}/>
            ))}  */}
            {/* <AddCustomField formTitle='address' customEmployeeInformationForm={bankInfoForm}/> */}
          <div className='flex justify-center items-center text-gray-950 text-sm font-semibold my-2'>Emergency Contact</div>
          <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item className='font-semibold text-xs' name={'emergencyContactfullName'} label="Full Name" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item className='font-semibold text-xs' name={'emergencyContactlastName'} label="Last Name" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
          </Row>
          <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item className='font-semibold text-xs' name={'emergencyContactemailAddress'} label="Email Address" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item className='font-semibold text-xs' name={'emergencyContactgender'} label="Gender" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
          </Row>
          <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item className='font-semibold text-xs' name={'emergencyContactDateOfBirth'} label="Date Of Birth" rules={[{ required: true }]}>
                  <DatePicker className='w-full' />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item className='font-semibold text-xs' name={'emergencyContactNationality'} label="Nationality" rules={[{ required: true }]}>
                  <Select
                    placeholder="Select an option and change input text above"
                    allowClear
                  >
                    {nationalities?.items?.map((nationality:any)=>(
                    <Option value={nationality?.id}>{nationality?.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
          </Row>
          {/* {emergencyContact && emergencyContact.form.map((field:any) => (
             <DynamicFormFields fields={field}/>
            ))}  */}
          {/* <AddCustomField formTitle='emergencyContact' customEmployeeInformationForm={customEmployeeInformationForm}/> */}
     
          <div className='flex justify-center items-center text-gray-950 text-sm font-semibold my-2'>Bank Account</div>
          <Row gutter={16}>
              <Col xs={24} sm={12}>
              <Form.Item className='font-semibold text-xs' name={'bankName'} label="Bank Name" rules={[{ required: true }]}>
                <Select
                  placeholder="Select a option and change input text above"
                  // onChange={onGenderChange}
                  allowClear
                >
                  <Option value="bank 1">bank 1</Option>
                  <Option value="bank 2">bank 2</Option>
                  <Option value="bank 3">bank 3</Option>
                </Select>
              </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item className='font-semibold text-xs' name={'branch'} label="Branch" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
          </Row>
          <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item className='font-semibold text-xs' name={'accountName'} label="Account Name" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item className='font-semibold text-xs' name={'accountNumber'} label="Account Number" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
          </Row>
          {/* {address && address.form.map((field:any) => (
             <DynamicFormFields fields={field}/>
            ))}  */}
          {/* <AddCustomField formTitle='bankAccount' customEmployeeInformationForm={customEmployeeInformationForm}/> */}
          <Form.Item className='font-semibold text-xs'>
            <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-6 sm:mt-8">
              <Button
                name="cancelUserSidebarButton"
                id="cancelSidebarButtonId"
                className="px-6 py-3 text-xs font-bold"
                onClick={() => {
                  form.resetFields();
                  props?.onClose();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={()=>onChange(1)}
                id="sidebarActionCreate"
                className="px-6 py-3 text-xs font-bold"
                htmlType="button"
                type="primary"
              >
                save and continue
              </Button>
            </div>
          </Form.Item>
          </div>
          </Card>
          <Card bordered={false} hidden={current!==1}>
          <div>
              <div className='flex justify-center items-center text-gray-950 text-sm font-semibold my-2'>Job TimeLine</div>
              <Row gutter={16}>
                  <Col xs={24} sm={24}>
                    <Form.Item className='font-semibold text-xs' name={'joinedDate'} label="joinedDate" rules={[{ required: true }]}>
                      <DatePicker className='w-full' />
                    </Form.Item>
                  </Col>
              </Row>
              <Row gutter={16}>
                  <Col xs={24} sm={24}>
                    <Form.Item className='font-semibold text-xs' name={'effectiveEndDate'} label="Effective End Date" rules={[{ required: true }]}>
                      <DatePicker className='w-full' />
                    </Form.Item>
                  </Col>
              </Row>
              <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item className='font-semibold text-xs' name={'jobTitle'} label="Position" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item className='font-semibold text-xs' name={'employmentTypeId'} label="Employment Type" rules={[{ required: true }]}>
                <Select
                  placeholder="Select a option and change input text above"
                  allowClear
                >
                  {employementType?.items?.map(item=>(
                      <Option value={item?.id}>{item?.name}</Option>
                  ))}
                </Select>
                </Form.Item>
              </Col>
          </Row>
          <Row>
            <Col xs={24} sm={8}>
              <div className="font-semibold text-sm">Department Lead or Not</div>
            </Col>
            <Col xs={24} sm={16}>
              <Form.Item name="departmentLeadOrNot" valuePropName="checked">
                <Switch defaultChecked />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
              <Col xs={24} sm={24}>
                <Form.Item className='font-semibold text-xs' name={'departmentId'} label="Department" rules={[{ required: true }]}>
                <Select
                  placeholder="Select Department"
                  // onChange={onGenderChange}
                  allowClear
                >
                  <Option value="male">Operation</Option>
                  <Option value="female">SaaS</Option>
                  <Option value="other1">MDCC</Option>
                  <Option value="Startegy">Startegy</Option>

                </Select>
                </Form.Item>
              </Col>
          </Row>
          <Row gutter={16}>
              <Col xs={24} sm={24}>
                <Form.Item className='font-semibold text-xs' name={'branchId'} label="Branch Office" rules={[{ required: true }]}>
                <Select
                  placeholder="Select office branch"
                  allowClear
                >
                  {branchOfficeData?.items?.map(branch=>(
                  <Option value={branch?.id}>{branch?.name}</Option>
                  ))}
                 
                </Select>
                </Form.Item>
              </Col>
          </Row>
          <Row gutter={16} className='flex justify-center items-center'>
            <Col xs={24} className='flex justify-center items-center' >
              <Form.Item
                className='font-semibold text-xs'
                label=""
                name={'employmentContractType'}
                rules={[{ required: true, message: 'Please select a job type!' }]}
                initialValue={1}
              >
                <Radio.Group>
                  <Row>
                    <Col xs={24} sm={12}>
                      <Radio value={1}>Permanent</Radio>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Radio value={2}>Contract</Radio>
                    </Col>
                  </Row>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
          <div className='flex justify-center items-center text-gray-950 text-sm font-semibold my-2'>Role Permission</div>
          <Row gutter={16}>
              <Col xs={24} sm={24}>
                <Form.Item className='font-semibold text-xs' name={'roleId'} label="Role" rules={[{ required: true }]}>
                <Select
                  placeholder="Select office branch"
                  onChange={onRoleChangeHandler}
                  allowClear
                  value={selectedRoleOnOption}
                >
                {rolesWithPermission?.map((role:any)=>(
                  <Option value={role?.id}>{role?.name}</Option>
                  ))}
                </Select>
                </Form.Item>
              </Col>
          </Row>
          <Row gutter={16}>
              <Col xs={24} sm={24}>
              <Form.Item
                  className='font-semibold text-xs'
                  name={'setOfPermission'}
                  label="Set of Permissions"
                  rules={[{ required: true }]}
                >
                  <Select
                    mode="tags"
                    style={{ width: '100%' }}
                    onChange={handlePermissionChange}
                    options={Permissionlist?.items?.map(option => ({ label: option.name, value: option.id }))}
                    defaultValue={selectedPermissions}
                    allowClear
                  />
                </Form.Item>
              </Col>
          </Row>
          <div className='flex justify-center items-center text-gray-950 text-sm font-semibold my-2'>Work Schedule</div>
          <Row gutter={16}>
              <Col xs={24} sm={24}>
              <Form.Item
              className='font-semibold text-xs'
              name={'workScheduleId'}
              label="Work Schedule Category"
              rules={[{ required: true, message: 'Please select a work schedule!' }]}
            >
              <Select
                placeholder="Select an option"
                onChange={workscheduleChangeHandler}
                allowClear
                value={workSchedule}
              >
                {workSchedules?.items.map((schedule: any) => (
                  <Option key={schedule.id} value={schedule.id}>
                    {schedule.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
              </Col>
          </Row>
          <Row gutter={16}>
              <Col xs={24} sm={24}>
              <Table columns={columns} dataSource={data} pagination={false} />
              </Col>
          </Row>
          <Form.Item className='font-semibold text-xs'>
            <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-6 sm:mt-8">
              <Button
                name="cancelUserSidebarButton"
                id="cancelSidebarButtonId"
                className="px-6 py-3 text-xs font-bold"
                onClick={()=>onChange(0)}
              >
                Back
              </Button>
              <Button
                onClick={()=>onChange(2)}
                id="sidebarActionCreate"
                className="px-6 py-3 text-xs font-bold"
                htmlType="button"
                type="primary"
              >
                save and continue
              </Button>
            </div>
          </Form.Item>

          </div>
          </Card>
          <Card bordered={false} hidden={current!==2}>
            <div>
            {/* {addtionalInformation && addtionalInformation.form.map((field:any) => (
            //  <DynamicFormFields fields={field}/>
            ))}  */}
            <AddCustomField formTitle='bankAccount' customEmployeeInformationForm={addtionalInformation}/>

                <Row justify="center" style={{ width: '100%' }} className='mx-10'>
                  <Col span={24}>
                  <Form.Item
            className='font-semibold text-xs bg-white'
            style={{ textAlign: 'center' }}
            name="documentName"
            rules={[{ required: true, message: 'Please choose the type' }]}
          >
            <Upload.Dragger
              name="files"
              fileList={documentFileList}
              beforeUpload={beforeDocumentUpload}
              onRemove={handleDocumentRemove}
              listType="picture"
            >
              <div className='flex justify-start text-xl font-semibold text-gray-950'>Documents Upload</div>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-hint text-xl font-bold text-gray-950 my-4">Drag & drop here to Upload.</p>
              <p className="ant-upload-hint text-xs text-gray-950">or select file from your computer.</p>
              <Button className="ant-upload-text font-semibold text-white py-6 text-sm my-4" type='primary'>
                <MdOutlineUploadFile className='text-white text-xl' />
                Upload file
              </Button>
            </Upload.Dragger>
          </Form.Item>
                  </Col>
                </Row>
              <Form.Item className='font-semibold text-xs'>
                <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-6 sm:mt-8">
                  <Button
                    name="cancelUserSidebarButton"
                    id="cancelSidebarButtonId"
                    className="px-6 py-3 text-xs font-bold"
                    onClick={()=>onChange(1)}
                  >
                    Back
                  </Button>
                  <Button
                    id="sidebarActionCreate"
                    className="px-6 py-3 text-xs font-bold"
                    htmlType="submit"
                    type="primary"
                  >
                    Submit
                  </Button>
                </div>
            </Form.Item>
            </div>
          </Card>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default UserSidebar;
