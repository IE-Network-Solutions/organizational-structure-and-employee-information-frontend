import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Col, Form, Input, InputNumber, Row, Select, Spin } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import TextEditor from '@/components/form/textEditor';
import CustomUpload from '@/components/form/customUpload';
import React, { useEffect } from 'react';
import { useGetCourseLessonsMaterial } from '@/store/server/features/tna/lessonMaterial/queries';
import { formatLinkToUploadFile } from '@/helpers/formatTo';
import { CourseLessonMaterial as CourseLessonMaterialType } from '@/types/tna/course';
import { useSetCourseLessonMaterial } from '@/store/server/features/tna/lessonMaterial/mutation';

const CourseLessonMaterial = () => {
  const {
    isShowLessonMaterial: isShow,
    setIsShowLessonMaterial: setIsShow,
    lesson,
    setLesson,
    isShowAddLesson,
    lessonMaterial,
    setLessonMaterial,
    isFileUploadLoading,
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
  } = useSetCourseLessonMaterial();

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
        videos: item.videos.length
          ? item.videos.map((video) => formatLinkToUploadFile(video))
          : undefined,
        attachments: item.attachments.length
          ? item.attachments.map((attachment) =>
              formatLinkToUploadFile(attachment),
            )
          : undefined,
      });
    }
  }, [lessonMaterialData]);

  useEffect(() => {
    if (isSuccess) {
      onClose();
    }
  }, [isSuccess]);

  const getOrderOptions = (
    courseLessonMaterials: CourseLessonMaterialType[],
  ) => {
    const defaultOption = {
      label: 'Add at the end',
      value: 0, // Use 0 to indicate appending at the end
    };

    // Generate options from existing materials, excluding the current material (if editing)
    const materialOptions = courseLessonMaterials
      .filter(
        (material) => !lessonMaterial || material.id !== lessonMaterial.id,
      )
      ?.sort((a, b) => a.order - b.order)
      .map((material) => ({
        label: material.title || 'Untitled', // Fallback for missing titles
        value: material.order, // Use index+1 for unique values
        key: `material-${material.order}`, // Use unique keys
      }));

    return [defaultOption, ...materialOptions];
  };
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
      loading:
        isLoading ||
        isLoadingMaterial ||
        isFileUploadLoading?.video ||
        isFileUploadLoading?.attachment,
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

  const getMaterialOrder = (materialOrder: number): number => {
    const courseLessonMaterials = lesson?.courseLessonMaterials ?? [];
    // Return 0 if no materials or materialId is invalid
    if (!courseLessonMaterials?.length || !materialOrder) {
      return 0;
    }

    // Find the material with the given ID and its order
    const targetMaterial = courseLessonMaterials.find(
      (material) => material.order === materialOrder,
    );
    if (!targetMaterial) {
      return 0; // Return 0 if material not found
    }

    const targetOrder = targetMaterial.order;

    // Sort materials by order and find the last material with order < targetOrder
    const sortedMaterials = [...courseLessonMaterials].sort(
      (a, b) => a.order - b.order,
    );
    const previousMaterial = sortedMaterials
      .filter((material) => material.order < targetOrder)
      .pop(); // Get last material (highest order) less than targetOrder

    // If no previous material, return targetOrder / 2
    if (!previousMaterial) {
      return targetOrder / 2;
    }

    // Return average of previous material's order and targetOrder
    return (previousMaterial.order + targetOrder) / 2;
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
        order: getMaterialOrder(values.order),
        courseLessonId: lesson?.id ?? '',
        videos: values.videos?.map((video: any) => video.response) ?? [],
        attachments:
          values.attachments?.map((attachment: any) => attachment.response) ??
          [],
      },
    ]);
  };

  return (
    <CustomDrawerLayout
      open={isShow}
      onClose={() => onClose()}
      data-cy="tna-lesson-material-drawer"
      modalHeader={
        <CustomDrawerHeader className="flex justify-center" data-cy="tna-lesson-material-header">
          <div className="flex flex-wrap px-2 text-gray-900" id="tnaLessonMaterialHeaderContentId" data-cy="tna-lesson-material-header-content">
            <span className="whitespace-normal break-words" data-cy="tna-lesson-material-header-content-text" id="tnaLessonMaterialHeaderContentTextId">
              {lessonMaterial ? 'Update' : 'Add'}&nbsp;
              <span className="text-primary" data-cy="tna-lesson-material-header-content-text-title" id="tnaLessonMaterialHeaderContentTextTitleId">{lesson?.title}</span>&nbsp; Course
              Material
            </span>
          </div>
        </CustomDrawerHeader>
      }
      footer={
        <CustomDrawerFooterButton className="p-4" buttons={footerModalItems} data-cy="tna-lesson-material-footer" />
      }
      width="50%"
    >
      <Form
        layout="vertical"
        form={form}
        disabled={isLoading || isLoadingMaterial}
        requiredMark={CustomLabel}
        onFinish={onFinish}
        id="tnaLessonMaterialFormId"
        data-cy="tna-lesson-material-form"
      >
        <Form.Item
          name="title"
          label="Course Material Title"
          rules={[{ required: true, message: 'Required' }]}
          className="form-item"
          id="tnaLessonMaterialTitleItemId"
          data-cy="tna-lesson-material-title-item"
        >
          <Input id="tnaCourseMaterialTitleFieldId" data-cy="tna-course-material-title-field" className="control" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Lesson Description"
          rules={[{ required: true, message: 'Required' }]}
          className="form-item"
          id="tnaLessonMaterialDescriptionItemId"
          data-cy="tna-lesson-material-description-item"
        >
          <Input.TextArea
            id="tnaCourseLessonDescriptionFieldId"
            data-cy="tna-course-lesson-description-field"
            className="control-tarea"
            rows={6}
            placeholder="Enter the Description"
          />
        </Form.Item>
        <Form.Item
          name="article"
          label="Article"
          id="tnaArticleForCourseFieldId"
          data-cy="tna-article-for-course-field"
          rules={[{ required: true, message: 'Required' }]}
          className="form-item"
        >
          <TextEditor className="mt-3" placeholder="Enter the Article" data-cy="tna-lesson-material-article-editor" />
        </Form.Item>
        <Spin spinning={isFileUploadLoading.video} data-cy="tna-lesson-material-video-spinner">
          <Form.Item
            name="videos"
            label="Video"
            className="form-item"
            valuePropName="fileList"
            rules={[{ required: true, message: 'Required' }]}
            id="tnaLessonMaterialVideoItemId"
            data-cy="tna-lesson-material-video-item"
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
              targetState="fileList"
              uploadType="video"
              id="tnaLessonMaterialVideoUploadId"
              data-cy="tna-lesson-material-video-upload"
            />
          </Form.Item>
        </Spin>
        <Spin spinning={isFileUploadLoading.attachment} data-cy="tna-lesson-material-attachment-spinner">
          <Form.Item
            name="attachments"
            label="Attachment"
            className="form-item"
            valuePropName="fileList"
            rules={[{ required: true, message: 'Required' }]}
            id="tnaLessonMaterialAttachmentItemId"
            data-cy="tna-lesson-material-attachment-item"
            getValueFromEvent={(e) => {
              return Array.isArray(e) ? e : e && e.fileList;
            }}
          >
            <CustomUpload
              mode="dragWithLink"
              className="w-full mt-3"
              listType="picture"
              title="Upload Your Attachment"
              targetState="fileAttachmentList"
              uploadType="attachment"
              id="tnaLessonMaterialAttachmentUploadId"
              data-cy="tna-lesson-material-attachment-upload"
            />
          </Form.Item>
        </Spin>
        <Row gutter={24} id="tnaLessonMaterialRowId" data-cy="tna-lesson-material-row">
          <Col span={12} id="tnaLessonMaterialTimeColId" data-cy="tna-lesson-material-time-col">
            <Form.Item
              name="timeToFinishMinutes"
              label="Estimated time to Finish"
              className="form-item"
              id="tnaLessonMaterialTimeItemId"
              data-cy="tna-lesson-material-time-item"
            >
              <InputNumber
                className="control-number"
                placeholder="Enter estimated time"
                min={1}
                id="tnaLessonMaterialTimeInputId"
                data-cy="tna-lesson-material-time-input"
              />
            </Form.Item>
          </Col>
          <Col span={12} id="tnaLessonMaterialOrderColId" data-cy="tna-lesson-material-order-col">
            <Form.Item
              name="order"
              label="Insert Before"
              className="form-item"
              rules={[{ required: true, message: 'Please select a position' }]}
              initialValue={0} // Set default value to 0
              id="tnaLessonMaterialOrderItemId"
              data-cy="tna-lesson-material-order-item"
            >
              <Select
                className="control"
                placeholder="Select position"
                showSearch
                optionFilterProp="label"
                id="tnaLessonMaterialOrderSelectId"
                data-cy="tna-lesson-material-order-select"
                filterOption={(input, option) =>
                  (option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={getOrderOptions(lesson?.courseLessonMaterials ?? [])}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </CustomDrawerLayout>
  );
};

export default CourseLessonMaterial;
