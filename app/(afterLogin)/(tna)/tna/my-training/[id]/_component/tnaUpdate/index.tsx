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
    false,
    false,
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
      className: 'h-14',
      size: 'large',
      loading: isFetching || isLoading,
      onClick: () => onClose(),
    },
    {
      label: 'Create',
      key: 'create',
      className: 'h-14',
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
        modalHeader={
          <CustomDrawerHeader className="flex justify-center">
            TNA Update
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
          requiredMark={CustomLabel}
          onFinish={onFinish}
          disabled={isFetching || isLoading}
          initialValues={{ trainingProofs: [{}] }}
        >
          <Form.Item
            name="title"
            label="TNA"
            rules={[{ required: true, message: 'Required' }]}
            className="form-item"
          >
            <Input className="control" />
          </Form.Item>

          <Form.List name="trainingProofs">
            {(fields, { add, remove }) =>
              fields.map(({ key, name, ...restField }) => (
                <React.Fragment key={key}>
                  <Flex gap={10}>
                    <Form.Item
                      {...restField}
                      name={[name, 'attachmentFile']}
                      label="Name"
                      className="form-item flex-1"
                      valuePropName="fileList"
                      getValueFromEvent={(e) => {
                        return Array.isArray(e) ? e : e && e.fileList;
                      }}
                    >
                      <CustomUpload
                        id="tnaUpdateCustomUploadFieldId"
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
                      ></RemoveFormFieldButton>
                    )}
                  </Flex>

                  <Flex gap={10} align="center">
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
                    >
                      <Input
                        id="tnaUpdateLinkUploadFieldId"
                        className="control"
                      />
                    </Form.Item>
                    <Button
                      icon={<LuPlus size={16} />}
                      size="large"
                      type="primary"
                      id="tnaUpdateSubmitLinkButtonId"
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
          >
            <DatePicker
              id="tnaUpdateCompletedDateFieldId"
              className="control"
              format={DATE_FORMAT}
            />
          </Form.Item>
          <Form.Item
            name="certStatus"
            label="Certification Status"
            rules={[{ required: true, message: 'Required' }]}
            className="form-item"
          >
            <Select
              className="control"
              id="tnaUpdateCertificationStatusFieldId"
              suffixIcon={
                <MdKeyboardArrowDown size={16} className="text-gray-900" />
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
