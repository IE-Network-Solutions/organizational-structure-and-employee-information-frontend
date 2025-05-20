import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Col, Form, Input, InputNumber, Row, Select } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import TextEditor from '@/components/form/textEditor';
import CustomUpload from '@/components/form/customUpload';
import React, { useEffect } from 'react';
import { useSetCourseLessonMaterialWithProperOrderAdjustment } from '@/store/server/features/tna/lessonMaterial/mutation';
import { useGetCourseLessonsMaterial } from '@/store/server/features/tna/lessonMaterial/queries';
import { formatLinkToUploadFile } from '@/helpers/formatTo';

const CourseLessonMaterial = () => {
  const {
    isShowLessonMaterial: isShow,
    setIsShowLessonMaterial: setIsShow,
    lesson,
    course,
    setLesson,
    isShowAddLesson,
    lessonMaterial,
    setLessonMaterial,
  } = useTnaManagementCoursePageStore();
  const {
    data: lessonMaterialData,
    isLoading: isLoadingMaterial,
    refetch,
  } = useGetCourseLessonsMaterial(
    {
      filter: { id: [lessonMaterial?.id ?? ''] },
    },
    false,
    false,
  );

  const {
    mutate: setMaterial,
    isLoading,
    isSuccess,
  } = useSetCourseLessonMaterialWithProperOrderAdjustment();

  const [form] = Form.useForm();

  useEffect(() => {
    if (lessonMaterial && isShow) {
      refetch();
    }
  }, [lessonMaterial, isShow]);

  useEffect(() => {
    if (lesson && lessonMaterialData?.items?.length) {
      const item = lessonMaterialData.items[0];
      setLessonMaterial(item);
      form.setFieldsValue({
        title: item.title,
        description: item.description,
        article: item.article,
        timeToFinishMinutes: item.timeToFinishMinutes,
        order: item.order,
        videos: item.videos.length ? item.videos.map((video) => formatLinkToUploadFile(video)) : undefined,
        attachments: item.attachments.length ? item.attachments.map((attachment) => formatLinkToUploadFile(attachment)) : undefined
      });
    }
  }, [lessonMaterialData]);

  useEffect(() => {
    if (isSuccess) {
      onClose();
    }
  }, [isSuccess]);

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-10',
      size: 'large',
      loading: isLoading || isLoadingMaterial,
      onClick: () => onClose(),
    },
    {
      label: lessonMaterial ? 'Update' : 'Create',
      key: 'create',
      className: 'h-10',
      type: 'primary',
      size: 'large',
      loading: isLoading || isLoadingMaterial,
      onClick: () => {
        form.submit();
      },
    },
  ];

  const onClose = () => {
    if (!isShowAddLesson) {
      setLesson(null);
    }
    setLessonMaterial(null);
    form.resetFields();
    setIsShow(false);
  };

  const onFinish = () => {
    const values = form.getFieldsValue();
    
    setMaterial([
      {
        ...(lessonMaterial || {}),
        title: values.title,
        description: values.description,
        article: values.article,
        timeToFinishMinutes: values.timeToFinishMinutes,
        order: parseFloat(values.order),
        courseLessonId: lesson?.id ?? '',
        videos: values.videos?.map((video: any) => video.response) ?? [],
        attachments: values.attachments?.map((attachment: any) => attachment.response) ?? [],
      },
    ]);
  };

  const getOrderOptions = () => {
    const defaultOption = {
      label: 'Add at the end',
      value: parseFloat(((lesson?.courseLessonMaterials?.length || 0) + 1).toString()),
    };

    const materialOptions = (lesson?.courseLessonMaterials || [])
      .filter(material => !lessonMaterial || material.id !== lessonMaterial.id) // Exclude current material if editing
      .map(material => ({
        label: material.title,
        value: material.order,
      }));

    return [defaultOption, ...materialOptions];
  };

  return (
    <CustomDrawerLayout
      open={isShow}
      onClose={() => onClose()}
      modalHeader={
        <CustomDrawerHeader className="flex justify-center">
          <div className="flex flex-wrap px-2 text-gray-900">
            <span className="whitespace-normal break-words">
              {lessonMaterial ? 'Update' : 'Add'}&nbsp;
              <span className="text-primary">{lesson?.title}</span>&nbsp; Course
              Material
            </span>
          </div>
        </CustomDrawerHeader>
      }
      footer={
        <CustomDrawerFooterButton className="p-4" buttons={footerModalItems} />
      }
      width="50%"
    >
      <Form
        layout="vertical"
        form={form}
        disabled={isLoading || isLoadingMaterial}
        requiredMark={CustomLabel}
        onFinish={onFinish}
      >
        <Form.Item
          name="title"
          label="Course Material Title"
          rules={[{ required: true, message: 'Required' }]}
          className="form-item"
        >
          <Input id="tnaCourseMaterialTitleFieldId" className="control" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Lesson Description"
          rules={[{ required: true, message: 'Required' }]}
          className="form-item"
        >
          <Input.TextArea
            id="tnaCourseLessonDescriptionFieldId"
            className="control-tarea"
            rows={6}
            placeholder="Enter the Description"
          />
        </Form.Item>
        <Form.Item
          name="article"
          label="Article"
          id="tnaArticleForCourseFieldId"
          rules={[{ required: true, message: 'Required' }]}
          className="form-item"
        >
          <TextEditor className="mt-3" placeholder="Enter the Article" />
        </Form.Item>
        <Form.Item
          name="videos"
          label="Video"
          className="form-item"
          valuePropName="fileList"
          rules={[{ required: true, message: 'Required' }]}
          getValueFromEvent={(e) => {
            return Array.isArray(e) ? e : e && e.fileList;
          }}
        >
          <CustomUpload
            mode="dragWithLink"
            className="w-full mt-3"
            listType="picture"
            title="Upload Your video"
            accept="video/*"
            maxCount={1}
          />
        </Form.Item>
        <Form.Item
          name="attachments"
          label="Attachment"
          className="form-item"
          valuePropName="fileList"
          rules={[{ required: true, message: 'Required' }]}
          getValueFromEvent={(e) => {
            return Array.isArray(e) ? e : e && e.fileList;
          }}
        >
          <CustomUpload
            mode="dragWithLink"
            className="w-full mt-3"
            listType="picture"
            title="Upload Your Attachment"
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
              label="Insert Before"
              className="form-item"
              rules={[{ required: true, message: 'Required' }]}
              initialValue={parseFloat(((lesson?.courseLessonMaterials?.length || 0) + 1).toString())}
            >
              <Select
                className="control"
                placeholder="Select position"
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={getOrderOptions()}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </CustomDrawerLayout>
  );
};

export default CourseLessonMaterial;