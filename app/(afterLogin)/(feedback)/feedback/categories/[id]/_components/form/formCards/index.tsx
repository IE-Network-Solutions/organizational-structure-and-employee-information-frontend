'use client';
import React from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Dropdown,
  Divider,
  Flex,
  Progress,
} from 'antd';
import { FaEllipsisVertical, FaArrowRightLong, FaPlus } from 'react-icons/fa6';
import {
  useFetchedForms,
  useGetFormsByCategoryID,
} from '@/store/server/features/feedback/form/queries';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import CustomButton from '@/components/common/buttons/customButton';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteQuestions } from '@/store/server/features/feedback/question/mutation';
import { useDynamicFormStore } from '@/store/uistate/features/feedback/dynamicForm';
import FeedbackPagination from '@/app/(afterLogin)/(feedback)/feedback/_components/feedbackPagination';
import EditFormsModal from './editFormCard';
import Question from '../../questions';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

const FormCard: React.FC<{ id: string }> = ({ id }) => {
  const {
    current,
    pageSize,
    totalPages,
    selectedFormId,
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
    setIsAddOpen,
    setEditQuestionsModal,
  } = useDynamicFormStore();

  const { data: forms } = useFetchedForms(pageSize, current);
  const { data: Forms } = useGetFormsByCategoryID(id, pageSize, current);
  const { mutate: deleteForm } = useDeleteQuestions();
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
      setIsEditModalVisible(true);
    } else if (key === 'delete') {
      setDeletedItem(category.id);
      setDeleteFormModal(true);
    } else if ((key = 'editQuestions')) {
      setEditQuestionsModal(true);
    }
  };

  const showDrawer = (formId: string) => {
    setIsAddOpen(true);
    setSelectedFormId(formId);
  };

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
        <div className="text-xs text-gray-500">{`${completed.toLocaleString()}/${total.toLocaleString()} ${label}`}</div>
      </div>
    </div>
  );

  const currentDate = new Date();

  return (
    <>
      <Row gutter={[16, 24]}>
        {Forms &&
          Forms.map((forms: any, index: number) => (
            <div
              key={index}
              className="flex justify-start items-center gap-[13px]"
            >
              <Col key={index} lg={12} md={12} xs={24} className="h-full">
                <Card
                  hoverable
                  className="w-[280px] h-full relative bg-gray-100"
                >
                  <div className="flex justify-between items-start mb-2">
                    <Title level={5} className="m-0">
                      {forms?.name}
                    </Title>
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: 'edit',
                            label: 'Edit Form',
                            onClick: () => handleMenuClick('edit', forms),
                          },
                          {
                            key: 'editQuestions',
                            label: 'Edit Questions',
                            onClick: () =>
                              handleMenuClick('editQuestions', forms),
                          },
                          {
                            key: 'delete',
                            label: 'Delete',
                            onClick: () => handleMenuClick('delete', forms),
                          },
                        ],
                      }}
                      trigger={['click']}
                      placement="bottomRight"
                    >
                      <FaEllipsisVertical className="text-lg text-gray-400 cursor-pointer" />
                    </Dropdown>
                  </div>
                  <Link href={`/feedback/categories/${id}/survey/${forms.id}`}>
                  <Paragraph className="text-gray-600">
                    {forms?.description}
                  </Paragraph>
                  <div className="flex flex-wrap items-center justify-between gap-1 text-gray-400 mx-5">
                    <p>{forms?.startDate}</p> <FaArrowRightLong />
                    <p>{forms?.endDate}</p>
                  </div>
                  <Divider className="text-gray-300" />
                  </Link>
                  <Flex gap="small" wrap justify="center">
                    {renderProgress(
                      ((forms?.completedCount ?? 0) /
                        (forms?.totalCount ?? 1)) *
                        100,
                      forms?.completedCount ?? 0,
                      forms?.totalCount ?? 1,
                      'Completed',
                    )}
                    {renderProgress(
                      ((forms?.resolvedCount ?? 0) / (forms?.totalCount ?? 1)) *
                        100,
                      forms?.resolvedCount ?? 0,
                      forms?.totalCount ?? 1,
                      'Resolved',
                    )}
                  </Flex>
                </Card>
              </Col>
              <Col key={index + 1} lg={12} md={12} xs={24} className="h-full">
                <Card
                  hoverable
                  className="w-[260px] h-full relative bg-gray-100"
                >
                  <div className="flex justify-between items-start mb-2">
                    <Title level={5} className="m-0">
                      {forms?.title}
                    </Title>
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: 'edit',
                            label: 'Edit',
                            onClick: () => handleMenuClick('edit', forms),
                          },
                          {
                            key: 'delete',
                            label: 'Delete',
                            onClick: () => handleMenuClick('delete', forms),
                          },
                        ],
                      }}
                      trigger={['click']}
                      placement="bottomRight"
                    >
                      <FaEllipsisVertical className="text-lg text-gray-400 cursor-pointer" />
                    </Dropdown>
                  </div>
                  <Link href={`/feedback/categories/${id}/survey/${forms.id}`}>

                  <Paragraph className="text-gray-600">
                    {forms?.description}
                  </Paragraph>
                  <div className="flex flex-wrap items-center justify-between gap-1 text-gray-400 mx-5">
                    <p>{forms?.startDate}</p> <FaArrowRightLong />{' '}
                    <p>{forms?.endDate}</p>
                  </div>
                  <Divider className="text-gray-300" />
                  </Link>
                  {forms?.endDate < currentDate ? (
                    <div className="flex items-center justify-center mx-5">
                      <CustomButton
                        title="Add Questions"
                        icon={<FaPlus size={13} className="mr-2" />}
                        onClick={() => showDrawer(forms.id)}
                        className="text-gray-800 border-1 border-gray-500 bg-white font-light mx-5"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center mx-5">
                      Form has expired
                    </div>
                  )}
                </Card>
              </Col>
            </div>
          ))}
      </Row>
      <FeedbackPagination
        current={current}
        total={totalPages}
        pageSize={pageSize}
        onChange={handleChange}
        onShowSizeChange={handleShowSizeChange}
      />
      <EditFormsModal form={forms} />
      <Question
        selectedFormId={selectedFormId}
        onClose={() => setIsAddOpen(false)}
      />
      <DeleteModal
        open={deleteFormModal}
        onConfirm={handleFormDelete}
        onCancel={() => setDeleteFormModal(false)}
      />
    </>
  );
};

export default FormCard;
