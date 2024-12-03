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
import { useGetTna } from '@/store/server/features/tna/review/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const TnaRequestSidebar = () => {
  const {
    isShowTnaReviewSidebar,
    setIsShowTnaReviewSidebar,
    tnaCategory,
    tnaId,
    setTnaId,
  } = useTnaReviewStore();
  const { userId } = useAuthenticationStore();
  const { mutate: setTna, isLoading, isSuccess } = useSetTna();
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
    false,
    false,
  );

  const [form] = Form.useForm();

  useEffect(() => {
    if (tnaId) {
      refetch();
    }
  }, [tnaId]);

  useEffect(() => {
    if (tnaId && data?.items?.length) {
      form.setFieldsValue(data.items[0]);
    }
  }, [data]);

  useEffect(() => {
    if (isSuccess) {
      onClose();
    }
  }, [isSuccess]);

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-14',
      size: 'large',
      loading: isLoading || isFetching,
      onClick: () => onClose(),
    },
    {
      label: 'Request',
      key: 'request',
      className: 'h-14',
      type: 'primary',
      size: 'large',
      loading: isLoading || isFetching,
      onClick: () => form.submit(),
    },
  ];

  const onFinish = () => {
    const value = form.getFieldsValue();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { trainingNeedCategory, ...otherData } = data?.items[0] || {};
    setTna([
      {
        ...otherData,
        ...value,
        certStatus: TrainingNeedAssessmentCertStatus.IN_PROGRESS,
        status: TrainingNeedAssessmentStatus.PENDING,
        assignedUserId: userId,
      },
    ]);
  };

  const onClose = () => {
    setTnaId(null);
    form.resetFields();
    setIsShowTnaReviewSidebar(false);
  };

  return (
    isShowTnaReviewSidebar && (
      <CustomDrawerLayout
        open={isShowTnaReviewSidebar}
        onClose={() => onClose()}
        modalHeader={
          <CustomDrawerHeader className="flex justify-center">
            TNA Request
          </CustomDrawerHeader>
        }
        footer={
          <CustomDrawerFooterButton
            className="w-1/2 mx-auto"
            buttons={footerModalItems}
          />
        }
        width="50%"
      >
        <Form
          layout="vertical"
          form={form}
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
            <Input id="tnaRequestTitleFieldId" className="control" />
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
                <MdKeyboardArrowDown size={16} className="text-gray-900" />
              }
              placeholder="Select"
              options={formatToOptions(tnaCategory, 'name', 'id')}
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
              suffix={'$'}
              className="control-number"
            />
          </Form.Item>
          <Form.Item
            name="detail"
            label="Detail Information"
            className="form-item"
          >
            <Input.TextArea
              id="tnaDetailInformationFieldId"
              className="control-tarea"
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
