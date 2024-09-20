import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Col, Form, Input, InputNumber, Row } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import TextEditor from '@/components/form/textEditor';
import CustomUpload from '@/components/form/customUpload';
import React, { useEffect } from 'react';
import { useSetCourseLessonMaterial } from '@/store/server/features/tna/lessonMaterial/mutation';

const CourseLessonMaterial = () => {
  const {
    isShowLessonMaterial: isShow,
    setIsShowLessonMaterial: setIsShow,
    lesson,
  } = useTnaManagementCoursePageStore();

  const {
    mutate: setMaterial,
    isLoading,
    isSuccess,
  } = useSetCourseLessonMaterial();

  const [form] = Form.useForm();

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
      loading: isLoading,
      onClick: () => onClose(),
    },
    {
      label: 'Create',
      key: 'create',
      className: 'h-14',
      type: 'primary',
      size: 'large',
      loading: isLoading,
      onClick: () => form.submit(),
    },
  ];

  const onClose = () => {
    form.resetFields();
    setIsShow(false);
  };

  const onFinish = () => {
    const value = form.getFieldsValue();

    setMaterial([
      {
        title: value.title,
        description: value.description,
        article: value.article,
        timeToFinishMinutes: value.timeToFinishMinutes,
        order: value.order,
        courseLessonId: lesson?.id ?? '',
        videos: [value.video[0]['response']],
        attachments:
          value.attachments?.map((item: any) => item['response']) ?? [],
      },
    ]);
  };

  return (
    <CustomDrawerLayout
      open={isShow}
      onClose={() => onClose()}
      modalHeader={
        <CustomDrawerHeader className="flex justify-center">
          Add
          <span className="text-primary">&nbsp;{lesson?.title}&nbsp;</span>
          Course Material
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
        disabled={isLoading}
        requiredMark={CustomLabel}
        onFinish={onFinish}
      >
        <Form.Item
          name="title"
          label="Course Material Title"
          rules={[{ required: true, message: 'Required' }]}
          className="form-item"
        >
          <Input className="control" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Lesson Description"
          rules={[{ required: true, message: 'Required' }]}
          className="form-item"
        >
          <Input.TextArea
            className="control-tarea"
            rows={6}
            placeholder="Enter the Description"
          />
        </Form.Item>
        <Form.Item
          name="article"
          label="Article"
          rules={[{ required: true, message: 'Required' }]}
          className="form-item"
        >
          <TextEditor className="mt-3" placeholder="Enter the Article" />
        </Form.Item>
        <Form.Item
          name="video"
          label="Video"
          className="form-item"
          valuePropName="fileList"
          rules={[{ required: true, message: 'Required' }]}
          getValueFromEvent={(e) => {
            return Array.isArray(e) ? e : e && e.fileList;
          }}
        >
          <CustomUpload
            dragable={true}
            className="w-full mt-3"
            listType="picture"
            dragLabel="Upload Your video"
            maxCount={1}
          />
        </Form.Item>
        <Form.Item
          name="attachment"
          label="Attachment"
          className="form-item"
          valuePropName="fileList"
          rules={[{ required: true, message: 'Required' }]}
          getValueFromEvent={(e) => {
            return Array.isArray(e) ? e : e && e.fileList;
          }}
        >
          <CustomUpload
            dragable={true}
            className="w-full mt-3"
            listType="picture"
            dragLabel="Upload Your Attachment"
          />
        </Form.Item>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="timeToFinishMinutes"
              label="Estimated time to Finish"
              className="form-item"
            >
              <InputNumber
                className="control-number"
                placeholder="Enter estimated time"
                min={1}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="order"
              label="Course Material Order in No"
              className="form-item"
            >
              <InputNumber
                className="control-number"
                placeholder="Enter Order No"
                min={0}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </CustomDrawerLayout>
  );
};

export default CourseLessonMaterial;
