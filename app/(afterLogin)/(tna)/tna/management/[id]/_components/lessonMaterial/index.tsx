import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Form, Spin } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import React, { useEffect } from 'react';
import {
  CourseMaterialArticleFormItem,
  CourseMaterialAttachmentsFormItem,
  CourseMaterialDescriptionFormItem,
  CourseMaterialImagesFormItem,
  CourseMaterialReferenceMaterialsFormItem,
  CourseMaterialTimeFormItem,
  CourseMaterialTitleFormItem,
  CourseMaterialVideosFormItem,
} from '../courseLesson/courseMaterialFormFields';
import { useGetCourseLessonsMaterial } from '@/store/server/features/tna/lessonMaterial/queries';
import { formatLinkToUploadFile } from '@/helpers/formatTo';
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
        videos: item.videos.length
          ? item.videos.map((video) => formatLinkToUploadFile(video))
          : undefined,
        attachments: item.attachments.length
          ? item.attachments.map((attachment) =>
              formatLinkToUploadFile(attachment),
            )
          : undefined,
        referenceMaterials: item.referenceMaterials?.length
          ? item.referenceMaterials.map((reference) =>
              formatLinkToUploadFile(reference),
            )
          : undefined,
        images: item.images?.length
          ? item.images.map((image) => formatLinkToUploadFile(image))
          : undefined,
      });
    }
  }, [lessonMaterialData]);

  useEffect(() => {
    if (isSuccess && isShow) {
      onClose();
    }
  }, [isSuccess, isShow]);

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
        isFileUploadLoading?.attachment ||
        isFileUploadLoading?.reference ||
        isFileUploadLoading?.image,
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
        order: lessonMaterial ? lessonMaterial.order : getMaterialOrder(0),
        courseLessonId: lesson?.id ?? '',
        videos: values.videos?.map((video: any) => video.response) ?? [],
        attachments:
          values.attachments?.map((attachment: any) => attachment.response) ??
          [],
        referenceMaterials:
          values.referenceMaterials?.map(
            (reference: any) => reference.response,
          ) ?? [],
        images: values.images?.map((image: any) => image.response) ?? [],
      },
    ]);
  };

  return (
    <CustomDrawerLayout
      open={isShow}
      onClose={() => onClose()}
      data-cy="tna-lesson-material-drawer"
      modalHeader={
        <CustomDrawerHeader
          className="flex justify-center"
          data-cy="tna-lesson-material-header"
        >
          <div
            className="flex flex-wrap px-2 text-gray-900"
            id="tnaLessonMaterialHeaderContentId"
            data-cy="tna-lesson-material-header-content"
          >
            <span
              className="whitespace-normal break-words"
              data-cy="tna-lesson-material-header-content-text"
              id="tnaLessonMaterialHeaderContentTextId"
            >
              {lessonMaterial ? 'Update' : 'Add'}&nbsp;
              <span
                className="text-primary"
                data-cy="tna-lesson-material-header-content-text-title"
                id="tnaLessonMaterialHeaderContentTextTitleId"
              >
                {lesson?.title}
              </span>
              &nbsp; Course Material
            </span>
          </div>
        </CustomDrawerHeader>
      }
      footer={
        <CustomDrawerFooterButton
          className="p-4"
          buttons={footerModalItems}
          data-cy="tna-lesson-material-footer"
        />
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
        <CourseMaterialTitleFormItem
          itemDataCy="tna-lesson-material-title-item"
          formItemClassName="form-item"
          formItemProps={{ id: 'tnaLessonMaterialTitleItemId' }}
          inputClassName="control"
          inputId="tnaCourseMaterialTitleFieldId"
          inputDataCy="tna-course-material-title-field"
        />
        <CourseMaterialDescriptionFormItem
          itemDataCy="tna-lesson-material-description-item"
          label="Lesson Description"
          formItemClassName="form-item"
          formItemProps={{ id: 'tnaLessonMaterialDescriptionItemId' }}
          placeholder="Enter the Description"
          inputId="tnaCourseLessonDescriptionFieldId"
          inputDataCy="tna-course-lesson-description-field"
        />
        <CourseMaterialArticleFormItem
          itemDataCy="tna-article-for-course-field"
          label="Article"
          formItemClassName="form-item"
          formItemProps={{ id: 'tnaArticleForCourseFieldId' }}
          editorPlaceholder="Enter the Article"
          editorDataCy="tna-lesson-material-article-editor"
        />
        <Spin
          spinning={isFileUploadLoading.video}
          data-cy="tna-lesson-material-video-spinner"
        >
          <CourseMaterialVideosFormItem
            itemDataCy="tna-lesson-material-video-item"
            formItemClassName="form-item"
            formItemProps={{ id: 'tnaLessonMaterialVideoItemId' }}
            uploadClassName="w-full mt-3"
            uploadTitle="Upload Your video"
            uploadDataCy="tna-lesson-material-video-upload"
            uploadId="tnaLessonMaterialVideoUploadId"
          />
        </Spin>
        <Spin
          spinning={isFileUploadLoading.attachment}
          data-cy="tna-lesson-material-attachment-spinner"
        >
          <CourseMaterialAttachmentsFormItem
            itemDataCy="tna-lesson-material-attachment-item"
            label="Attachment"
            formItemClassName="form-item"
            formItemProps={{ id: 'tnaLessonMaterialAttachmentItemId' }}
            uploadClassName="w-full mt-3"
            uploadTitle="Upload Your Attachment"
            uploadDataCy="tna-lesson-material-attachment-upload"
            uploadId="tnaLessonMaterialAttachmentUploadId"
          />
        </Spin>
        <Spin
          spinning={isFileUploadLoading.reference}
          data-cy="tna-lesson-material-reference-spinner"
        >
          <CourseMaterialReferenceMaterialsFormItem
            itemDataCy="tna-lesson-material-reference-item"
            formItemClassName="form-item"
            formItemProps={{ id: 'tnaLessonMaterialReferenceItemId' }}
            uploadClassName="w-full mt-3"
            uploadTitle="Upload Reference Material"
            uploadSubtitle="Optional. Reading material, slide decks or external links."
            uploadDataCy="tna-lesson-material-reference-upload"
            uploadId="tnaLessonMaterialReferenceUploadId"
          />
        </Spin>
        <Spin
          spinning={isFileUploadLoading.image}
          data-cy="tna-lesson-material-image-spinner"
        >
          <CourseMaterialImagesFormItem
            itemDataCy="tna-lesson-material-image-item"
            formItemClassName="form-item"
            formItemProps={{ id: 'tnaLessonMaterialImageItemId' }}
            uploadClassName="w-full mt-3"
            uploadTitle="Upload Supplementary Images"
            uploadSubtitle="Optional. Diagrams or screenshots shown alongside the session."
            uploadDataCy="tna-lesson-material-image-upload"
            uploadId="tnaLessonMaterialImageUploadId"
          />
        </Spin>
        <CourseMaterialTimeFormItem
          itemDataCy="tna-lesson-material-time-item"
          variant="inputNumber"
          label="Estimated time to Finish"
          formItemClassName="form-item"
          formItemProps={{ id: 'tnaLessonMaterialTimeItemId' }}
          inputNumberId="tnaLessonMaterialTimeInputId"
          inputNumberDataCy="tna-lesson-material-time-input"
        />
      </Form>
    </CustomDrawerLayout>
  );
};

export default CourseLessonMaterial;
