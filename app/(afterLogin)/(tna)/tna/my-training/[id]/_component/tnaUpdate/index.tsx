import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Button, DatePicker, Flex, Form, Input, Select } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useTnaReviewStore } from '@/store/uistate/features/tna/review';
import React, { useEffect } from 'react';
import { DATE_FORMAT } from '@/utils/constants';
import CustomUpload from '@/components/form/customUpload';
import { LuPlus } from 'react-icons/lu';
import RemoveFormFieldButton from '@/components/common/formButtons/removeFormFieldButton';
import { useGetTna } from '@/store/server/features/tna/review/queries';
import { trainingNeedAssessmentCertStatusOptions } from '@/types/tna/tna';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { useSetTna } from '@/store/server/features/tna/review/mutation';
import dayjs from 'dayjs';
import { formatLinkToUploadFile } from '@/helpers/formatTo';

const TnaUpdateSidebar = () => {
  const {
    isShowTnaUpdateSidebar: isShow,
    setIsShowTnaUpdateSidebar: setIsShow,
    searchQuery,
    tnaId,
    setTnaId,
  } = useTnaReviewStore();

  const { mutate: updateTna, isLoading, isSuccess } = useSetTna();

  const { data, isFetching, refetch } = useGetTna(
    {
      page: 1,
      limit: 1,
    },
    {
      filter: {
        ...(tnaId && { id: [tnaId] }),
      },
    },
    searchQuery,
    true,
    true,
  );

  const [form] = Form.useForm();

  useEffect(() => {
    if (isSuccess) {
      onClose();
    }
  }, [isSuccess]);

  useEffect(() => {
    if (tnaId) {
      refetch();
    }
  }, [tnaId]);

  useEffect(() => {
    if (tnaId && data?.items?.length) {
      const item = data.items[0];
      form.setFieldValue('title', item.title);
      form.setFieldValue(
        'completedAt',
        item.completedAt ? dayjs(item.completedAt) : null,
      );
      form.setFieldValue('certStatus', item.certStatus);
      if (item.trainingProofs?.length) {
        const attachmentValue = item.trainingProofs.map((item) => ({
          attachmentFile: item.attachmentFile
            ? [formatLinkToUploadFile(item.attachmentFile)]
            : [],
          link: item.link,
        }));
        form.setFieldValue('trainingProofs', attachmentValue);
      }
    }
  }, [data]);

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-12',
      size: 'large',
      loading: isFetching || isLoading,
      onClick: () => onClose(),
    },
    {
      label: 'Create',
      key: 'create',
      className: 'h-12',
      type: 'primary',
      size: 'large',
      loading: isFetching || isLoading,
      onClick: () => form.submit(),
    },
  ];

  const onFinish = () => {
    const value = form.getFieldsValue();
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      trainingNeedCategory,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      trainingProofs: oldProof,
      ...otherValue
    } = data?.items[0] || {};

    const trainingProofs = value.trainingProofs?.map((item: any) => ({
      attachmentFile: item.attachmentFile?.length
        ? item.attachmentFile[0]['response']
        : null,
      link: item.link || null,
    }));

    updateTna([
      {
        ...otherValue,
        title: value.title,
        certStatus: value.certStatus,
        completedAt: value.completedAt,
        trainingProofs,
      },
    ]);
  };

  const onClose = () => {
    setTnaId(null);
    form.resetFields();
    setIsShow(false);
  };

  return (
    isShow && (
      <CustomDrawerLayout
        open={isShow}
        onClose={() => onClose()}
        data-cy="tna-my-training-update-drawer"
        modalHeader={
          <CustomDrawerHeader
            className="flex justify-start"
            data-cy="tna-my-training-update-header"
          >
            TNA Update
          </CustomDrawerHeader>
        }
        footer={
          <CustomDrawerFooterButton
            className="w-full bg-[#fff] flex justify-between space-x-5 p-4"
            buttons={footerModalItems}
            data-cy="tna-my-training-update-footer"
          />
        }
        width="50%"
      >
        <Form
          layout="vertical"
          form={form}
          requiredMark={CustomLabel}
          onFinish={onFinish}
          disabled={isFetching || isLoading}
          initialValues={{ trainingProofs: [{}] }}
          id="tnaMyTrainingUpdateFormId"
          data-cy="tna-my-training-update-form"
        >
          <Form.Item
            name="title"
            label="TNA"
            rules={[{ required: true, message: 'Required' }]}
            className="form-item"
            id="tnaMyTrainingUpdateTitleItemId"
            data-cy="tna-my-training-update-title-item"
          >
            <Input
              className="control"
              id="tnaMyTrainingUpdateTitleInputId"
              data-cy="tna-my-training-update-title-input"
            />
          </Form.Item>

          <Form.List
            name="trainingProofs"
            data-cy="tna-my-training-update-proof-list"
          >
            {(fields, { add, remove }) =>
              fields.map(({ key, name, ...restField }) => (
                <React.Fragment
                  key={key}
                  data-cy={`tna-my-training-update-proof-fragment-${key}`}
                >
                  <Flex
                    gap={10}
                    id={`tnaMyTrainingUpdateProofFlex${key}Id`}
                    data-cy={`tna-my-training-update-proof-flex-${key}`}
                  >
                    <Form.Item
                      {...restField}
                      name={[name, 'attachmentFile']}
                      label="Name"
                      className="form-item flex-1"
                      valuePropName="fileList"
                      id={`tnaMyTrainingUpdateProofItem${key}Id`}
                      data-cy={`tna-my-training-update-proof-item-${key}`}
                      getValueFromEvent={(e) => {
                        return Array.isArray(e) ? e : e && e.fileList;
                      }}
                    >
                      <CustomUpload
                        id="tnaUpdateCustomUploadFieldId"
                        data-cy="tna-update-custom-upload-field"
                        mode="draggable"
                        className="w-full mt-3"
                        listType="picture"
                        accept="image/*"
                        maxCount={1}
                      />
                    </Form.Item>
                    {fields.length > 1 && (
                      <RemoveFormFieldButton
                        onClick={() => {
                          remove(name);
                        }}
                        data-cy={`tna-my-training-update-remove-button-${key}`}
                      ></RemoveFormFieldButton>
                    )}
                  </Flex>

                  <Flex
                    gap={10}
                    align="center"
                    id={`tnaMyTrainingUpdateLinkFlex${key}Id`}
                    data-cy={`tna-my-training-update-link-flex-${key}`}
                  >
                    <Form.Item
                      {...restField}
                      name={[name, 'link']}
                      label="TNA"
                      className="form-item flex-1"
                      rules={[
                        {
                          required: false,
                          type: 'url',
                          message: 'Invalid URL',
                        },
                      ]}
                      id={`tnaMyTrainingUpdateLinkItem${key}Id`}
                      data-cy={`tna-my-training-update-link-item-${key}`}
                    >
                      <Input
                        id="tnaUpdateLinkUploadFieldId"
                        data-cy="tna-update-link-upload-field"
                        className="control"
                      />
                    </Form.Item>
                    <Button
                      icon={<LuPlus size={16} />}
                      size="large"
                      type="primary"
                      id="tnaUpdateSubmitLinkButtonId"
                      data-cy="tna-update-submit-link-button"
                      htmlType="button"
                      onClick={add}
                      className="mb-5 self-end"
                    >
                      Add link
                    </Button>
                  </Flex>
                </React.Fragment>
              ))
            }
          </Form.List>

          <Form.Item
            name="completedAt"
            label="Completed Date"
            rules={[{ required: true, message: 'Required' }]}
            className="form-item"
            id="tnaMyTrainingUpdateCompletedDateItemId"
            data-cy="tna-my-training-update-completed-date-item"
          >
            <DatePicker
              id="tnaUpdateCompletedDateFieldId"
              data-cy="tna-update-completed-date-field"
              className="control"
              format={DATE_FORMAT}
            />
          </Form.Item>
          <Form.Item
            name="certStatus"
            label="Certification Status"
            rules={[{ required: true, message: 'Required' }]}
            className="form-item"
            id="tnaMyTrainingUpdateCertStatusItemId"
            data-cy="tna-my-training-update-cert-status-item"
          >
            <Select
              className="control"
              id="tnaUpdateCertificationStatusFieldId"
              data-cy="tna-update-certification-status-field"
              suffixIcon={
                <MdKeyboardArrowDown
                  size={16}
                  className="text-gray-900"
                  data-cy="tna-my-training-update-cert-status-suffix-icon"
                  id="tnaMyTrainingUpdateCertStatusSuffixIconId"
                />
              }
              options={trainingNeedAssessmentCertStatusOptions}
            />
          </Form.Item>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default TnaUpdateSidebar;
