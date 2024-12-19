import React from 'react';
import { Card, Collapse, Switch, Button, Tooltip, Skeleton } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

import { Popconfirm } from 'antd/lib';

import { ConversationStore } from '@/store/uistate/features/conversation';
import CustomDrawerLayout from '@/components/common/customDrawer';
import QuestionSetForm from '../../../_components/questionSetForm';
import { EmptyImage } from '@/components/emptyIndicator';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useConversationTypes, useGetConversationById } from '@/store/server/features/CFR/conversation/queries';
import { useDeleteConversationQuestionSet, useUpdateConversationQuestionSet } from '@/store/server/features/CFR/conversation/mutation';
import { ConversationTypeItems } from '@/store/server/features/CFR/conversation/action-plan/interface';

type Question = {
  id: string;
  question: string;
  fieldType: string;
  mandatory: boolean;
  field: any[];
};

type QuestionSet = {
  id: string;
  name: string;
  active: boolean;
  conversationsQuestions: Question[];
};

const ConversationTypeDetail = ({ id }: { id: string }) => {
  const { data: getAllConversationType } = useConversationTypes();
  const { editableData, activeTab, setEditableData } = ConversationStore();

  const { data: conversationType, isLoading: getConversationLoading } =
    useGetConversationById(id);
  const { mutate: deleteConversationQuestionSet } =
    useDeleteConversationQuestionSet();
  const { mutate: updateConversationQuestionSet, isLoading: updateIsActive } =
    useUpdateConversationQuestionSet();

  const toggleActive = (id: string, active: boolean) => {
    updateConversationQuestionSet({ id, active });
  };

  const handleEdit = (set: QuestionSet) => {
    setEditableData(set);
  };
  const activeTabName =
    getAllConversationType?.items?.find(
      (item: ConversationTypeItems) => item.id === activeTab,
    )?.name || '';

  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Edit {activeTabName}
    </div>
  );

  return (
    <div className="p-4">
      {getConversationLoading && <Skeleton />}
      {conversationType?.questionSets?.map(
        (set: QuestionSet, index: number) => (
          <Collapse key={index}>
            <Card
              key={set?.id}
              className="mb-4"
              title={set?.name}
              extra={
                <div className="flex items-center space-x-2">
                  <AccessGuard
                    permissions={[Permissions.createConversationSet]}
                  >
                    <Tooltip title={set?.active ? 'Active' : 'Inactive'}>
                      <Switch
                        size="small"
                        className="text-xs text-gray-950"
                        checked={set?.active}
                        loading={updateIsActive}
                        onChange={(value: boolean) =>
                          toggleActive(set.id, value)
                        }
                      />
                    </Tooltip>
                  </AccessGuard>

                  <AccessGuard
                    permissions={[Permissions.createConversationSet]}
                  >
                    <Button
                      disabled={!set?.active}
                      size="small"
                      icon={<EditOutlined className="text-xs text-gray-950" />}
                      onClick={() => handleEdit(set)}
                    />
                  </AccessGuard>
                  <AccessGuard
                    permissions={[Permissions.createConversationSet]}
                  >
                    <Popconfirm
                      title="Are you sure you want to delete this?"
                      onConfirm={() => deleteConversationQuestionSet(set?.id)} // Action on confirm
                      okText="Yes"
                      cancelText="No"
                      placement="topRight"
                    >
                      <Button
                        disabled={!set?.active}
                        size="small"
                        icon={<DeleteOutlined />}
                        danger
                      />
                    </Popconfirm>
                  </AccessGuard>
                </div>
              }
            >
              {set.conversationsQuestions.map((question: Question) => (
                <div key={question.id} className="mb-2">
                  <p className="font-semibold text-xs">{question?.question}</p>
                  {question?.field?.length > 0 && (
                    <ul className="list-none text-gray-600 text-sm">
                      {question?.field.map((option, index) => (
                        <li key={option?.key} className="flex items-start">
                          <span className="font-bold mr-2">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <span>{option?.value}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </Card>
          </Collapse>
        ),
      )}
      {conversationType?.questionSets?.length < 1 && <EmptyImage />}
      <CustomDrawerLayout
        open={editableData !== null}
        onClose={() => setEditableData(null)}
        modalHeader={modalHeader}
        width="40%"
      >
        <QuestionSetForm />
      </CustomDrawerLayout>
    </div>
  );
};

export default ConversationTypeDetail;
