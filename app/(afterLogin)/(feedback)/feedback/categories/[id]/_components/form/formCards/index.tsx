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

  const { mutate: deleteForm } = useDeleteForm();
  const handleChange = (page: number = 1, pageSize: number) => {
    setCurrent(page);
    setPageSize(pageSize);
  };

  const handleShowSizeChange = (size: number) => {
    setPageSize(size);
    setCurrent(1);
  };

  const handleFormDelete = () => {
    deleteForm(deletedItem);
    setDeleteFormModal(false);
  };

  const getStrokeColor = (percent: number) => {
    if (percent < 30) return '#F44336';
    if (percent < 50) return '#FFA500';
    if (percent < 70) return '#63b7f1';
    return percent > 70 ? '#55c790' : '#4CAF50';
  };

  const handleMenuClick = (key: string, category: any) => {
    if (key === 'edit') {
      setSelectedFormId(category.id);
      setIsEditModalVisible(true);
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

  const pendingCount = uniqueStatusArray?.filter(
    (status: any) => status === 'pending',
  ).length;
  const solvedCount = uniqueStatusArray?.filter(
    (status: any) => status === 'solved',
  ).length;

  const total = uniqueStatusArray?.length;
  const pendingPercentage = (pendingCount / total) * 100;
  const resolvedPercentage = (solvedCount / total) * 100;

  const renderProgress = (
    percent: number,
    completed: number,
    total: number,
    label: string,
  ) => (
    <div className="text-center">
      <Progress
        type="circle"
        percent={percent}
        size={80}
        strokeColor={getStrokeColor(percent)}
        format={(percent) => `${Math.round(percent ?? 0)}%`}
      />
      <div className="mt-2">
        <div className="text-sm font-bold text-gray-700">
          {percent ? Math.round(percent).toLocaleString() : 0}%
        </div>
        <div className="text-xs text-gray-500">{`${completed?.toLocaleString()}/${total?.toLocaleString()} ${label}`}</div>
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
      <div className="flex items-center flex-wrap justify-start gap-4 h-full">
        {formsByCategoryId?.items && formsByCategoryId?.items?.length > 0 ? (
          formsByCategoryId?.items?.map((form: any, index: number) => (
            <div key={index} className="flex justify-start items-center h-full">
              {form?.questions &&
              form.questions.length === 0 &&
              form?.actionPlans &&
              form.actionPlans.length === 0 ? (
                <Card
                  hoverable
                  className="w-[280px] bg-gray-100 flex flex-col justify-between "
                >
                  <div className="flex justify-between items-start mb-2">
                    <Link href={`/feedback/categories/${id}/survey/${form.id}`}>
                      <Title level={5} className="m-0">
                        {form?.name}
                      </Title>
                    </Link>
                    <Dropdown
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
                      <FaEllipsisVertical className="text-lg text-gray-400 cursor-pointer" />
                    </Dropdown>
                  </div>
                  <Link href={`/feedback/categories/${id}/survey/${form.id}`}>
                    <Paragraph
                      ellipsis={{ rows }}
                      className="text-gray-600 h-[50px]"
                    >
                      {form?.description}
                    </Paragraph>
                    <div className="flex flex-wrap items-center justify-around gap-1 text-gray-400 mx-3">
                      <p>{form?.startDate}</p> <FaArrowRightLong />
                      <p>{form?.endDate}</p>
                    </div>
                    <Divider className="text-gray-300" />
                  </Link>
                  <div className="h-[125px]">
                    {form?.endDate > currentDate ? (
                      <div className="flex items-center justify-center ">
                        <Button
                          onClick={() => showDrawer(form?.id)}
                          className="text-gray-800 border-1 border-gray-500 bg-white font-light px-8 py-3"
                        >
                          <div className="font-semibold ">Add Questions</div>
                          <FaPlus size={13} />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center mx-5 text-red-500">
                        Form has expired
                      </div>
                    )}
                  </div>
                </Card>
              ) : (
                <Card
                  hoverable
                  className="w-[280px] relative bg-gray-100 h-fit"
                >
                  <div className="flex justify-between items-start mb-2">
                    <Link href={`/feedback/categories/${id}/survey/${form.id}`}>
                      <Title level={5} className="m-0">
                        {form?.name}
                      </Title>
                    </Link>
                    <Dropdown
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
                      <FaEllipsisVertical className="text-lg text-gray-400 cursor-pointer" />
                    </Dropdown>
                  </div>
                  <Link href={`/feedback/categories/${id}/survey/${form.id}`}>
                    <Paragraph
                      ellipsis={{ rows }}
                      className="text-gray-600 h-[50px]"
                    >
                      {form?.description}
                    </Paragraph>
                    <div className="flex flex-wrap items-center justify-around gap-1 text-gray-400 mx-3">
                      <p>{form?.startDate}</p> <FaArrowRightLong />
                      <p>{form?.endDate}</p>
                    </div>
                    <Divider className="text-gray-300" />
                  </Link>
                  <Flex gap="small" wrap justify="center">
                    {renderProgress(
                      pendingPercentage ?? 0,
                      pendingCount ?? 0,
                      total ?? 0,
                      'Pending',
                    )}
                    {renderProgress(
                      resolvedPercentage ?? 0,
                      solvedCount ?? 0,
                      total ?? 0,
                      'Resolved',
                    )}
                  </Flex>
                </Card>
              )}
            </div>
          ))
        ) : (
          <div className="text-center my-5">No forms available.</div>
        )}
      </div>
      <FeedbackPagination
        current={current}
        total={formsByCategoryId?.meta?.totalItems ?? 1}
        pageSize={pageSize}
        onChange={handleChange}
        onShowSizeChange={handleShowSizeChange}
      />
      <EditFormsModal id={id} />
      <Question
        selectedFormId={selectedFormId}
        onClose={() => setIsDrawerOpen(false)}
      />
      <DeleteModal
        open={deleteFormModal}
        onConfirm={handleFormDelete}
        onCancel={() => setDeleteFormModal(false)}
      />
      <Modal
        title="Copy Question URL"
        open={isCopyURLModalOpen}
        onCancel={() => setIsCopyModalOpen(false)}
        footer={null}
        centered
      >
        <div className="flex items-center justify-center gap-3 border-[1px] p-2 rounded-md">
          <div className="font-semibold"> {generatedUrl}</div>
          <Divider type="vertical" />
          <div onClick={handleCopy}>
            {isChecked ? (
              <CheckCheck
                size={20}
                strokeWidth={1.5}
                className="text-green-500"
              />
            ) : (
              <Copy size={20} strokeWidth={1.5} />
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default FormCard;
