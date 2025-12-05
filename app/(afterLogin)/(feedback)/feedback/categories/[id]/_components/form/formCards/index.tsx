'use client';
import React, { useEffect } from 'react';
import {
  Card,
  Typography,
  Dropdown,
  Divider,
  Flex,
  Progress,
  Modal,
  Spin,
  Button,
} from 'antd';
import { FaEllipsisVertical, FaArrowRightLong, FaPlus } from 'react-icons/fa6';
import { useGetFormsByCategoryID } from '@/store/server/features/feedback/form/queries';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDynamicFormStore } from '@/store/uistate/features/feedback/dynamicForm';
import FeedbackPagination from '@/app/(afterLogin)/(feedback)/feedback/_components/feedbackPagination';
import EditFormsModal from './editFormCard';
import Question from '../../questions';
import Link from 'next/link';
import { useDeleteForm } from '@/store/server/features/feedback/form/mutation';
import { CheckCheck, Copy } from 'lucide-react';
import { ActionPlanStatus } from '@/types/enumTypes';

const { Title, Paragraph } = Typography;

const FormCard: React.FC<{ id: string }> = ({ id }) => {
  const {
    current,
    pageSize,
    selectedFormId,
    searchFormParams,
    setCurrent,
    setPageSize,
    setIsEditModalVisible,
    setSelectedFormId,
  } = CategoriesManagementStore();

  const {
    deletedItem,
    setDeletedItem,
    deleteFormModal,
    setDeleteFormModal,
    setIsDrawerOpen,
    isCopyURLModalOpen,
    setIsCopyModalOpen,
    generatedUrl,
    setGeneratedUrl,
    isChecked,
    setIsChecked,
    rows,
  } = useDynamicFormStore();

  const { data: formsByCategoryId, isLoading: isFormCardsLoading } =
    useGetFormsByCategoryID(
      id,
      searchFormParams?.form_name || '',
      searchFormParams?.form_description || '',
      searchFormParams?.createdBy || '',
      pageSize,
      current,
    );

  const { mutate: deleteForm, isLoading: deleteFormLoading } = useDeleteForm();
  const handleChange = (page: number = 1, pageSize: number) => {
    setCurrent(page);
    setPageSize(pageSize);
  };

  const handleShowSizeChange = (size: number) => {
    setPageSize(size);
    setCurrent(1);
  };

  const handleFormDelete = () => {
    deleteForm(deletedItem, {
      onSuccess: () => {
        setDeleteFormModal(false);
      },
    });
  };

  const getStrokeColor = (percent: number) => {
    if (percent < 30) return '#F44336';
    if (percent < 50) return '#FFA500';
    if (percent < 70) return '#63b7f1';
    return percent > 70 ? '#55c790' : '#4CAF50';
  };

  const handleMenuClick = (key: string, category: any) => {
    if (key === 'edit') {
      setIsEditModalVisible(true);
      setSelectedFormId(category.id);
    } else if (key === 'delete') {
      setDeletedItem(category.id);
      setDeleteFormModal(true);
    } else if (key === 'copy') {
      setSelectedFormId(category.id);
      setIsCopyModalOpen(true);
    }
  };

  const showDrawer = (formId: string) => {
    setIsDrawerOpen(true);
    setSelectedFormId(formId);
  };

  // ===========> STATUS AREA <================

  const uniqueStatusArray: string[] = [];

  formsByCategoryId?.items?.forEach((form: any) => {
    form?.actionPlans?.forEach((actionPlan: any) => {
      const status = actionPlan?.status;

      if (!uniqueStatusArray.includes(status)) {
        uniqueStatusArray.push(status);
      }
    });
  });

  const renderProgress = (
    percent: number,
    completed: number,
    total: number,
    label: string,
  ) => (
    <div
      className="text-center"
      data-cy="form-card-progress-container"
      id="form-card-progress-container"
    >
      <Progress
        type="circle"
        data-cy="form-card-progress-circle"
        percent={percent}
        size={80}
        strokeColor={getStrokeColor(percent)}
        format={(percent) => `${Math.round(percent ?? 0)}%`}
      />
      <div
        className="mt-2"
        data-cy="form-card-progress-content"
        id="form-card-progress-content"
      >
        <div
          className="text-sm font-bold text-gray-700"
          data-cy="form-card-progress-label"
          id="form-card-progress-label"
        >
          {percent ? Math.round(percent).toLocaleString() : 0}%
        </div>
        <div
          className="text-xs text-gray-500"
          data-cy="form-card-progress-description"
          id="form-card-progress-description"
        >{`${completed?.toLocaleString()}/${total?.toLocaleString()} ${label}`}</div>
      </div>
    </div>
  );

  const currentDate = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/surveys/${selectedFormId}`;
      setGeneratedUrl(url);
    }
  }, [selectedFormId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedUrl).then(() => {
      setIsChecked(true);
      setIsCopyModalOpen(true);
      setTimeout(() => {
        setIsChecked(false);
        setIsCopyModalOpen(false);
      }, 5000);
    });
  };

  if (isFormCardsLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );

  return (
    <>
      <div
        className="flex items-center flex-wrap justify-start gap-4 h-full"
        data-cy="form-card-list-container"
        id="form-card-list-container"
      >
        {formsByCategoryId?.items && formsByCategoryId?.items?.length > 0 ? (
          formsByCategoryId?.items?.map((form: any, index: number) => (
            <div
              key={index}
              className="flex justify-start items-center h-full"
              data-cy="form-card-wrapper"
              id="form-card-wrapper"
            >
              {form?.questions &&
              form.questions.length === 0 &&
              form?.actionPlans &&
              form.actionPlans.length === 0 ? (
                <Card
                  hoverable
                  className="w-[280px] bg-gray-100 flex flex-col justify-between "
                  data-cy="form-card-empty-card"
                  id="form-card-empty-card"
                >
                  <div
                    className="flex justify-between items-start mb-2"
                    data-cy="form-card-empty-header"
                    id="form-card-empty-header"
                  >
                    <Link
                      href={`/feedback/categories/${id}/survey/${form.id}`}
                      data-cy="form-card-empty-title-link"
                      id="form-card-empty-title-link"
                    >
                      <Title
                        level={5}
                        className="m-0"
                        data-cy="form-card-empty-title"
                        id="form-card-empty-title"
                      >
                        {form?.name}
                      </Title>
                    </Link>
                    <Dropdown
                      data-cy="form-card-empty-menu"
                      menu={{
                        items: [
                          {
                            key: 'copy',
                            label: 'Copy Question URL',
                            onClick: () => handleMenuClick('copy', form),
                          },
                          {
                            key: 'edit',
                            label: 'Edit',
                            onClick: () => handleMenuClick('edit', form),
                          },
                          {
                            key: 'delete',
                            label: 'Delete',
                            onClick: () => handleMenuClick('delete', form),
                          },
                        ],
                      }}
                      trigger={['click']}
                      placement="bottomRight"
                    >
                      <FaEllipsisVertical
                        className="text-lg text-gray-400 cursor-pointer"
                        data-cy="form-card-empty-menu-icon"
                        id="form-card-empty-menu-icon"
                      />
                    </Dropdown>
                  </div>
                  <Link
                    href={`/feedback/categories/${id}/survey/${form.id}`}
                    data-cy="form-card-empty-description-link"
                    id="form-card-empty-description-link"
                  >
                    <Paragraph
                      ellipsis={{ rows }}
                      className="text-gray-600 h-[50px]"
                      data-cy="form-card-empty-description"
                      id="form-card-empty-description"
                    >
                      {form?.description}
                    </Paragraph>
                    <div
                      className="flex flex-wrap items-center justify-around gap-1 text-gray-400 mx-3"
                      data-cy="form-card-empty-date-range"
                      id="form-card-empty-date-range"
                    >
                      <p
                        data-cy="form-card-empty-start-date"
                        id="form-card-empty-start-date"
                      >
                        {form?.startDate}
                      </p>{' '}
                      <FaArrowRightLong
                        data-cy="form-card-empty-date-arrow"
                        id="form-card-empty-date-arrow"
                      />
                      <p
                        data-cy="form-card-empty-end-date"
                        id="form-card-empty-end-date"
                      >
                        {form?.endDate}
                      </p>
                    </div>
                    <Divider
                      className="text-gray-300"
                      data-cy="form-card-empty-divider"
                    />
                  </Link>
                  <div
                    className="h-[125px]"
                    data-cy="form-card-empty-footer"
                    id="form-card-empty-footer"
                  >
                    {form?.endDate > currentDate ? (
                      <div
                        className="flex items-center justify-center "
                        data-cy="form-card-empty-action-wrapper"
                        id="form-card-empty-action-wrapper"
                      >
                        <Button
                          onClick={() => showDrawer(form?.id)}
                          className="text-gray-800 border-1 border-gray-500 bg-white font-light px-8 py-3"
                          data-cy="form-card-empty-add-question-button"
                          id="form-card-empty-add-question-button"
                        >
                          <div
                            className="font-semibold "
                            data-cy="form-card-empty-add-question-label"
                            id="form-card-empty-add-question-label"
                          >
                            Add Questions
                          </div>
                          <FaPlus
                            size={13}
                            data-cy="form-card-empty-add-question-icon"
                            id="form-card-empty-add-question-icon"
                          />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="flex items-center justify-center mx-5 text-red-500"
                        data-cy="form-card-empty-expired"
                        id="form-card-empty-expired"
                      >
                        Form has expired
                      </div>
                    )}
                  </div>
                </Card>
              ) : (
                <Card
                  hoverable
                  className="w-[280px] relative bg-gray-100 h-fit"
                  data-cy="form-card-summary-card"
                  id="form-card-summary-card"
                >
                  <div
                    className="flex justify-between items-start mb-2"
                    data-cy="form-card-summary-header"
                    id="form-card-summary-header"
                  >
                    <Link
                      href={`/feedback/categories/${id}/survey/${form.id}`}
                      data-cy="form-card-summary-title-link"
                      id="form-card-summary-title-link"
                    >
                      <Title
                        level={5}
                        className="m-0"
                        data-cy="form-card-summary-title"
                        id="form-card-summary-title"
                      >
                        {form?.name}
                      </Title>
                    </Link>
                    <Dropdown
                      data-cy="form-card-summary-menu"
                      menu={{
                        items: [
                          {
                            key: 'copy',
                            label: 'Copy Question URL',
                            onClick: () => handleMenuClick('copy', form),
                          },
                          {
                            key: 'edit',
                            label: 'Edit ',
                            onClick: () => handleMenuClick('edit', form),
                          },
                          {
                            key: 'delete',
                            label: 'Delete',
                            onClick: () => handleMenuClick('delete', form),
                          },
                        ],
                      }}
                      trigger={['click']}
                      placement="bottomRight"
                    >
                      <FaEllipsisVertical
                        className="text-lg text-gray-400 cursor-pointer"
                        data-cy="form-card-summary-menu-icon"
                        id="form-card-summary-menu-icon"
                      />
                    </Dropdown>
                  </div>
                  <Link
                    href={`/feedback/categories/${id}/survey/${form.id}`}
                    data-cy="form-card-summary-description-link"
                    id="form-card-summary-description-link"
                  >
                    <Paragraph
                      ellipsis={{ rows }}
                      className="text-gray-600 h-[50px]"
                      data-cy="form-card-summary-description"
                      id="form-card-summary-description"
                    >
                      {form?.description}
                    </Paragraph>
                    <div
                      className="flex flex-wrap items-center justify-around gap-1 text-gray-400 mx-3"
                      data-cy="form-card-summary-date-range"
                      id="form-card-summary-date-range"
                    >
                      <p
                        data-cy="form-card-summary-start-date"
                        id="form-card-summary-start-date"
                      >
                        {form?.startDate}
                      </p>{' '}
                      <FaArrowRightLong
                        data-cy="form-card-summary-date-arrow"
                        id="form-card-summary-date-arrow"
                      />
                      <p
                        data-cy="form-card-summary-end-date"
                        id="form-card-summary-end-date"
                      >
                        {form?.endDate}
                      </p>
                    </div>
                    <Divider
                      className="text-gray-300"
                      data-cy="form-card-summary-divider"
                    />
                  </Link>
                  <Flex
                    gap="small"
                    wrap
                    justify="center"
                    data-cy="form-card-summary-progress-wrapper"
                    id="form-card-summary-progress-wrapper"
                  >
                    {renderProgress(
                      (form.actionPlans?.filter(
                        (actionPlan: any) =>
                          actionPlan.status === ActionPlanStatus.PENDING,
                      ).length /
                        form.actionPlans.length) *
                        100,
                      form.actionPlans?.filter(
                        (actionPlan: any) =>
                          actionPlan.status === ActionPlanStatus.PENDING,
                      ).length,
                      form.actionPlans.length,
                      'Pending',
                    )}
                    {renderProgress(
                      (form.actionPlans?.filter(
                        (actionPlan: any) =>
                          actionPlan.status === ActionPlanStatus.SOLVED,
                      ).length /
                        form.actionPlans.length) *
                        100,
                      form.actionPlans?.filter(
                        (actionPlan: any) =>
                          actionPlan.status === ActionPlanStatus.SOLVED,
                      ).length,
                      form.actionPlans.length,
                      'Resolved',
                    )}
                  </Flex>
                </Card>
              )}
            </div>
          ))
        ) : (
          <div
            className="text-center my-5"
            data-cy="form-card-empty-message"
            id="form-card-empty-message"
          >
            No forms available.
          </div>
        )}
      </div>
      <FeedbackPagination
        current={current}
        data-cy="form-card-pagination"
        total={formsByCategoryId?.meta?.totalItems ?? 1}
        pageSize={pageSize}
        onChange={handleChange}
        onShowSizeChange={handleShowSizeChange}
      />
      <EditFormsModal id={id} data-cy="form-card-edit-modal" />
      <Question
        selectedFormId={selectedFormId}
        onClose={() => setIsDrawerOpen(false)}
        data-cy="form-card-question-drawer"
      />
      <DeleteModal
        open={deleteFormModal}
        onConfirm={handleFormDelete}
        loading={deleteFormLoading}
        onCancel={() => setDeleteFormModal(false)}
        data-cy="form-card-delete-modal"
      />
      <Modal
        title="Copy Question URL"
        data-cy="form-card-copy-modal"
        open={isCopyURLModalOpen}
        onCancel={() => setIsCopyModalOpen(false)}
        footer={null}
        centered
      >
        <div
          className="flex items-center justify-center gap-3 border-[1px] p-2 rounded-md"
          data-cy="form-card-copy-modal-content"
          id="form-card-copy-modal-content"
        >
          <div
            className="font-semibold"
            data-cy="form-card-copy-modal-url"
            id="form-card-copy-modal-url"
          >
            {' '}
            {generatedUrl}
          </div>
          <Divider type="vertical" data-cy="form-card-copy-modal-divider" />
          <div
            onClick={handleCopy}
            data-cy="form-card-copy-modal-copy-button"
            id="form-card-copy-modal-copy-button"
          >
            {isChecked ? (
              <CheckCheck
                size={20}
                strokeWidth={1.5}
                className="text-green-500"
                data-cy="form-card-copy-modal-copy-icon"
                id="form-card-copy-modal-copy-icon"
              />
            ) : (
              <Copy
                size={20}
                strokeWidth={1.5}
                data-cy="form-card-copy-modal-copy-icon"
                id="form-card-copy-modal-copy-icon"
              />
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default FormCard;
