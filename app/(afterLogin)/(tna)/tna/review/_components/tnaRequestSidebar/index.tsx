import React, { useEffect } from 'react';
import { useTnaReviewStore } from '@/store/uistate/features/tna/review';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { Form, Input, InputNumber, Select } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { formatToOptions } from '@/helpers/formatTo';
import { useSetTna } from '@/store/server/features/tna/review/mutation';
import {
  TrainingNeedAssessmentCertStatus,
  TrainingNeedAssessmentStatus,
} from '@/types/tna/tna';
import {
  useCurrency,
  useGetTna,
} from '@/store/server/features/tna/review/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useAllApproval } from '@/store/server/features/approver/queries';
import { APPROVALTYPES } from '@/types/enumTypes';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useGetTnaCategory } from '@/store/server/features/tna/category/queries';
import Filters from '@/app/(afterLogin)/(payroll)/payroll/_components/filters';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { AiOutlineDollarCircle } from 'react-icons/ai';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
const { Option } = Select;

const TnaRequestSidebar = () => {
  const {
    isShowTnaReviewSidebar,
    setIsShowTnaReviewSidebar,
    monthId,
    sessionId,
    yearId,
    searchQuery,
    setSearchQuery,
    tnaId,
    setTnaId,
  } = useTnaReviewStore();
  const { userId } = useAuthenticationStore();

  const { data: employeeData } = useGetEmployee(userId);
  const { data: departmentData } = useGetDepartments();

  const { data: tnaCurrency } = useCurrency();
  const { data: tnaCategoryData } = useGetTnaCategory({});

  const { data: approvalDepartmentData, refetch: getDepartmentApproval } =
    useAllApproval(
      employeeData?.employeeJobInformation?.[0]?.departmentId || '',
      APPROVALTYPES?.TNA,
    );

  const { data: approvalUserData, refetch: getUserApproval } = useAllApproval(
    userId || '',
    APPROVALTYPES?.TNA,
  );
  const { data: fiscalYearData } = useGetActiveFiscalYears();

  useEffect(() => {
    if (employeeData?.employeeJobInformation?.[0]?.departmentId)
      getDepartmentApproval();
  }, [employeeData?.employeeJobInformation?.[0]?.departmentId]);
  useEffect(() => {
    if (userId) getUserApproval();
  }, [userId]);

  const { mutate: setTna, isLoading } = useSetTna();
  const { data, isFetching, refetch } = useGetTna(
    {
      page: 1,
      limit: 1,
    },
    {
      filter: {
        id: tnaId ? [tnaId] : [],
      },
    },
    searchQuery,
    true,
    true,
  );

  const [form] = Form.useForm();

  useEffect(() => {
    if (tnaId) {
      refetch();
    }
  }, [tnaId]);

  useEffect(() => {
    if (data?.items?.[0] && tnaId !== null) {
      const formData = data.items[0];

     

    

      const formattedData = {
        title: formData.title || '',
        departmentId: formData.departmentId || undefined,
        reason: formData.reason || '',
        trainingNeedCategoryId: formData.trainingNeedCategoryId || undefined,
        currencyId: formData.currencyId || undefined,
        trainingPrice: formData.trainingPrice || undefined,
        detail: formData.detail || '',
        sessionId: formData.sessionId || undefined,
        yearId: formData.yearId || undefined,
        monthId: formData.monthId || undefined,
      };
      form.setFieldsValue(formattedData);
    } else {
      form.resetFields();
    }
  }, [data, form, fiscalYearData]);

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-12',
      size: 'large',
      loading: isLoading || isFetching,
      onClick: () => onClose(),
    },
    {
      label:
        approvalUserData?.length < 1 && approvalDepartmentData?.length < 1
          ? 'You lack an assigned approver.'
          : 'Request',
      key: 'request',
      className: 'h-12',
      type: 'primary',
      size: 'large',
      loading: isLoading || isFetching,
      onClick: () => form.submit(),
      disabled:
        approvalUserData?.length < 1 && approvalDepartmentData?.length < 1,
    },
  ];

  const onFinish = () => {
    const value = form.getFieldsValue(); // Get form values

    // Merge values with monthId, yearId, and sessionId
    const finalValues = { ...value, monthId, yearId, sessionId };

    // Extract `trainingNeedCategory`, keep `otherData`
    const { ...otherData } = data?.items?.[0] || {};

    const dataValue: any = [
      {
        ...otherData, // Retain existing data from items[0]
        ...finalValues, // Include monthId, yearId, sessionId
        certStatus: TrainingNeedAssessmentCertStatus.IN_PROGRESS,
        status: TrainingNeedAssessmentStatus.PENDING,

        assignedUserId: userId,
        approvalWorkflowId:
          approvalUserData?.length > 0
            ? approvalUserData[0]?.id
            : approvalDepartmentData?.[0]?.id,
      },
    ];

    const filteredData = dataValue?.map((originalData: any) => ({
      id: tnaId ?? undefined,
      title: originalData.title,
      trainingPrice: originalData?.trainingPrice, // Modify the training price as requested
      assignedUserId: originalData.assignedUserId,
      trainingNeedCategoryId: originalData.trainingNeedCategoryId,
      approvalWorkflowId: originalData.approvalWorkflowId,
      currencyId: originalData.currencyId,
      sessionId: originalData.sessionId,
      yearId: originalData.yearId,
      reason: originalData.reason,
      monthId: originalData.monthId,
      departmentId: originalData?.departmentId, // Modified departmentId
      status: originalData.status,
      certStatus: originalData.certStatus,
      trainingProofs: [],
    }));

    setTna(filteredData, { onSuccess: () => onClose() });
  };

  const onClose = () => {
    setTnaId(null);
    form.resetFields();
    setIsShowTnaReviewSidebar(false);
  };
  const handleSearch = (searchValues: any) => {
    const queryParams = new URLSearchParams();

    if (searchValues?.employeeId) {
      queryParams.append('employeeId', searchValues.employeeId);
    }
    if (searchValues?.monthId) {
      queryParams.append('monthId', searchValues.monthId);
    }

    const searchParams = queryParams.toString()
      ? `?${queryParams.toString()}`
      : '';
    setSearchQuery(searchParams);
    refetch();
  };

  return (
    isShowTnaReviewSidebar && (
      <CustomDrawerLayout
        open={isShowTnaReviewSidebar}
        onClose={() => onClose()}
        modalHeader={
          <CustomDrawerHeader className="flex justify-start">
            TNA Request
          </CustomDrawerHeader>
        }
        footer={
          <CustomDrawerFooterButton
            className="w-full bg-[#fff] flex justify-between space-x-5 p-4"
            buttons={footerModalItems}
          />
        }
        width="40%"
      >
        <Form
          layout="vertical"
          form={form}
          className="p-2"
          disabled={isLoading || isFetching}
          onFinish={onFinish}
          requiredMark={CustomLabel}
        >
          <Form.Item
            name="title"
            label="TNA Request Title"
            rules={[{ required: true, message: 'Required' }]}
            className="form-item"
          >
            <Input id="tnaRequestTitleFieldId" className="control h-10" />
          </Form.Item>

          <Filters
            onSearch={handleSearch}
            disable={['name', 'payPeriod']}
            defaultValues={
              data?.items?.[0]
                ? {
                    yearId: data.items[0].yearId,
                    sessionId: data.items[0].sessionId,
                    monthId: data.items[0].monthId,
                    departmentId: data.items[0].departmentId,
                  }
                : undefined
            }
          />
          <Form.Item
            name="departmentId"
            label="Department"
            className="form-item"
          >
            <Select
              placeholder="department data"
              allowClear
              style={{ width: '100%', height: '40px' }}
            >
              {departmentData?.map((department: any) => (
                <Option key={department.id} value={department.id}>
                  {department?.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="reason" label="Reason" className="form-item">
            <Input className="control" />
          </Form.Item>
          <Form.Item
            name="trainingNeedCategoryId"
            label="Training Category"
            className="form-item"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Select
              id="tnaCategoryOptionFieldId"
              className="control"
              suffixIcon={
                <MdKeyboardArrowDown size={16} className="text-gray-900 h-10" />
              }
              placeholder="Select"
              options={formatToOptions(
                tnaCategoryData?.items ?? [],
                'name',
                'id',
              )}
            />
          </Form.Item>

          <Form.Item
            name="currencyId"
            label="Currency"
            className="form-item"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Select
              id="currencyId"
              className="control"
              suffixIcon={
                <MdKeyboardArrowDown size={16} className="text-gray-900 h-10" />
              }
              placeholder="Select"
              options={formatToOptions(tnaCurrency, 'code', 'id')}
            />
          </Form.Item>
          <Form.Item
            name="trainingPrice"
            label="Training Price"
            rules={[{ required: true, message: 'Required' }]}
            className="form-item"
          >
            <InputNumber
              id="tnaTraniningPriceFieldId"
              min={0}
              suffix={<AiOutlineDollarCircle />}
              className="control-number h-10"
            />
          </Form.Item>
          <Form.Item
            name="detail"
            label="Detail Information"
            className="form-item"
          >
            <Input.TextArea
              id="tnaDetailInformationFieldId"
              className="control-tarea h-24"
              rows={6}
              placeholder="Enter brief reason for your training of choice"
            />
          </Form.Item>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default TnaRequestSidebar;
