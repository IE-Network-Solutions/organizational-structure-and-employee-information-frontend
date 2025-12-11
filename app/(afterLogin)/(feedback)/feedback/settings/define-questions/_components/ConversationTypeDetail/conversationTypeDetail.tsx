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
import {
  useConversationTypes,
  useGetConversationById,
} from '@/store/server/features/CFR/conversation/queries';
import {
  useDeleteConversationQuestionSet,
  useUpdateConversationQuestionSet,
} from '@/store/server/features/CFR/conversation/mutation';
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
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4" data-cy="conversation-type-detail-drawer-header" id="conversationTypeDetailDrawerHeader">
      Edit {activeTabName}
    </div>
  );

  return (
    <div className="p-4" data-cy="conversation-type-detail" id="conversationTypeDetail">
      {getConversationLoading && <Skeleton data-cy="conversation-type-detail-skeleton" />}
      {conversationType?.questionSets?.map(
        (set: QuestionSet, index: number) => (
          <Collapse key={index} data-cy={`conversation-type-detail-collapse-${set?.id}`}>
            <Card
              key={set?.id}
              className="mb-4"
              title={set?.name}
              extra={
                <div className="flex items-center space-x-2" data-cy={`conversation-type-detail-card-actions-${set?.id}`} id={`conversationTypeDetailCardActions${set?.id}`}>
                  <AccessGuard
                    permissions={[Permissions.createConversationSet]}
                    data-cy="conversation-type-detail-card-switch-access-guard"
                    id="conversationTypeDetailCardSwitchAccessGuard"
                  >
                    <Tooltip title={set?.active ? 'Active' : 'Inactive'} data-cy={`conversation-type-detail-card-switch-tooltip-${set?.id}`} id={`conversationTypeDetailCardSwitchTooltip${set?.id}`}>
                      <Switch
                        size="small"
                        className="text-xs text-gray-950"
                        checked={set?.active}
                        loading={updateIsActive}
                        onChange={(value: boolean) =>
                          toggleActive(set.id, value)
                        }
                        data-cy={`conversation-type-detail-card-switch-${set?.id}`}
                        id={`conversationTypeDetailCardSwitch${set?.id}`}
                      />
                    </Tooltip>
                  </AccessGuard>

                  <AccessGuard
                    permissions={[Permissions.createConversationSet]}
                    data-cy="conversation-type-detail-card-edit-button-access-guard"
                    id="conversationTypeDetailCardEditButtonAccessGuard"
                  >
                    <Button
                      disabled={!set?.active}
                      size="small"
                      icon={<EditOutlined className="text-xs text-gray-950" />}
                      onClick={() => handleEdit(set)}
                      data-cy={`conversation-type-detail-card-edit-button-${set?.id}`}
                      id={`conversationTypeDetailCardEditButton${set?.id}`}
                    />
                  </AccessGuard>
                  <AccessGuard
                    permissions={[Permissions.createConversationSet]}
                    data-cy="conversation-type-detail-card-delete-button-access-guard"
                    id="conversationTypeDetailCardDeleteButtonAccessGuard"
                  >
                    <Popconfirm
                      title="Are you sure you want to delete this?"
                      onConfirm={() => deleteConversationQuestionSet(set?.id)} // Action on confirm
                      okText="Yes"
                      cancelText="No"
                      placement="topRight"
                      data-cy={`conversation-type-detail-card-delete-confirm-${set?.id}`}
                      id={`conversationTypeDetailCardDeleteConfirm${set?.id}`}
                    >
                      <Button
                        disabled={!set?.active}
                        size="small"
                        icon={<DeleteOutlined data-cy="conversation-type-detail-card-delete-button-icon" id="conversationTypeDetailCardDeleteButtonIcon" />}
                        danger
                        data-cy={`conversation-type-detail-card-delete-button-${set?.id}`}
                        id={`conversationTypeDetailCardDeleteButton${set?.id}`}
                      />
                    </Popconfirm>
                  </AccessGuard>
                </div>
              }
              data-cy={`conversation-type-detail-card-${set?.id}`}
              id={`conversationTypeDetailCard${set?.id}`}
            >
              {set.conversationsQuestions.map(
                (question: Question, index: number) => (
                  <div key={question.id} className="mb-2" data-cy={`conversation-type-detail-question-${question.id}`} id={`conversationTypeDetailQuestion${question.id}`}>
                    <p className="font-semibold text-sm" data-cy={`conversation-type-detail-question-text-${question.id}`} id={`conversationTypeDetailQuestionText${question.id}`}>
                      {index + 1}. {question?.question}
                      {question.mandatory && (
                        <span className="text-red-500" data-cy={`conversation-type-detail-question-mandatory-${question.id}`} id={`conversationTypeDetailQuestionMandatory${question.id}`}>*</span>
                      )}
                    </p>
                    {question?.field?.length > 0 && (
                      <ul className="list-none text-gray-600 text-xs ml-2" data-cy={`conversation-type-detail-question-options-${question.id}`} id={`conversationTypeDetailQuestionOptions${question.id}`}>
                        {question?.field.map((option, index) => (
                          <li key={option?.key} className="flex items-start" data-cy={`conversation-type-detail-question-option-${question.id}-${index}`} id={`conversationTypeDetailQuestionOption${question.id}${index}`}>
                            <span className="font-bold mr-2" data-cy={`conversation-type-detail-question-option-label-${question.id}-${index}`} id={`conversationTypeDetailQuestionOptionLabel${question.id}${index}`}>
                              {String.fromCharCode(65 + index)}.
                            </span>
                            <span data-cy={`conversation-type-detail-question-option-value-${question.id}-${index}`} id={`conversationTypeDetailQuestionOptionValue${question.id}${index}`}>{option?.value}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ),
              )}
            </Card>
          </Collapse>
        ),
      )}
      {conversationType?.questionSets?.length < 1 && (
        <div className="flex justify-center items-center" data-cy="conversation-type-detail-empty" id="conversationTypeDetailEmpty">
          <EmptyImage data-cy="conversation-type-detail-empty-image" />
        </div>
      )}
      <CustomDrawerLayout
        open={editableData !== null}
        onClose={() => setEditableData(null)}
        modalHeader={modalHeader}
        width="40%"
        data-cy="conversation-type-detail-drawer"
      >
        <QuestionSetForm data-cy="conversation-type-detail-form" />
      </CustomDrawerLayout>
    </div>
  );
};

export default ConversationTypeDetail;
