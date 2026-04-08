import { TableSkeleton } from '@/components/tableSkeleton';
import { Button, Card, Popconfirm, Table } from 'antd';
import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { useDeleteRecognitionType } from '@/store/server/features/CFR/recognition/mutation';
import { useDeleteRecognitionCriteria } from '@/store/server/features/CFR/recognitionCriteria/mutation';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { Edit2, Trash2 } from 'lucide-react';

interface PropsData {
  data: any;
  all?: boolean;
  isLoading?: boolean;
}
const AllRecognition: React.FC<PropsData> = ({
  data,
  all = false,
  isLoading = false,
}) => {
  const {
    setOpen,
    setSelectedRecognitionType,
    setParentRecognitionTypeId,
    setOpenRecognitionType,
    setEditingRecognitionCriteriaId,
    // setEditingRowKeys,
  } = ConversationStore();
  const { mutate: deleteRecognitionType } = useDeleteRecognitionType();
  // const {mutate:deleteRecognitionCriteria}=useDeleteRecognitionCriteria()

  const { mutate: deleteRecognitionCriteria } = useDeleteRecognitionCriteria();

  const showModal = () => {
    setParentRecognitionTypeId(data?.[0]?.id);
    setOpen(true);
  };
  const columns = [
    {
      title: 'Criteria Name',
      dataIndex: 'criteriaName',
      key: 'criteriaName',
      render: (notused: string, record: any) => (
        <p
          data-cy="all-recognition-table-criteria-name"
          id="allRecognitionTableCriteriaName"
        >
          {record?.criteria?.criteriaName}
        </p>
      ),
    },
    {
      title: 'Weight',
      dataIndex: 'weight',
      key: 'weight',
    },
    {
      title: 'Operator',
      dataIndex: 'operator',
      key: 'operator',
    },
    {
      title: 'Condition',
      dataIndex: 'condition',
      key: 'condition',
    },
    {
      title: 'IsActive',
      dataIndex: 'active',
      key: 'active',
      render: (notused: any, record: any) => (
        <p
          data-cy="all-recognition-table-is-active"
          id="allRecognitionTableIsActive"
        >
          {record?.active ? 'True' : 'False'}
        </p>
      ),
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: 'Action',
      key: 'action',
      render: (notused: any, record: any) => (
        <>
          <AccessGuard
            permissions={[Permissions.DeleteRecognitionCriteria]}
            data-cy="all-recognition-table-delete-confirm-access-guard"
            id="allRecognitionTableDeleteConfirmAccessGuard"
          >
            <Popconfirm
              title="Are you sure you want to delete this?"
              onConfirm={() => handleDeleteItem(record?.id)}
              okText="Yes"
              cancelText="No"
              data-cy={`all-recognition-table-delete-confirm-${record?.id}`}
              id={`allRecognitionTableDeleteConfirm${record?.id}`}
            >
              <Button
                type="primary"
                danger
                data-cy={`all-recognition-table-delete-button-${record?.id}`}
                id={`allRecognitionTableDeleteButton${record?.id}`}
              >
                Delete
              </Button>
            </Popconfirm>
          </AccessGuard>
        </>
      ),
    },
  ];

  const handleDeleteItem = (id: string) => {
    deleteRecognitionCriteria(id);
  };
  const handleEditItem = (id: string) => {
    setEditingRecognitionCriteriaId('');
    setSelectedRecognitionType(id);
    // Only open modal for "All Recognitions" tab (when all=true)
    if (all) {
      setOpenRecognitionType(true);
    }
  };

  const handleDeleteRecognitionType = (id: string) => {
    deleteRecognitionType(id);
  };

  const recognitionShow = (item: any) => {
    return (
      <>
        <Card
          bodyStyle={{ padding: '0px' }} // Adjust padding for better spacing
          key={item?.id}
          title={item?.name}
          extra={
            <div
              className="flex justify-end gap-2"
              data-cy={`all-recognition-card-actions-${item?.id}`}
              id={`allRecognitionCardActions${item?.id}`}
            >
              <AccessGuard
                permissions={[Permissions.EditRecognitionCriteria]}
                data-cy="all-recognition-card-edit-button-access-guard"
                id="allRecognitionCardEditButtonAccessGuard"
              >
                <Button
                  type="primary"
                  onClick={() => handleEditItem(item?.id)}
                  icon={<Edit2 size={14} className="text-xs" />} // Smaller edit icon
                  data-cy={`all-recognition-card-edit-button-${item?.id}`}
                  id={`allRecognitionCardEditButton${item?.id}`}
                />
              </AccessGuard>

              <AccessGuard
                permissions={[Permissions.DeleteRecognitionCriteria]}
                data-cy="all-recognition-card-delete-button-access-guard"
                id="allRecognitionCardDeleteButtonAccessGuard"
              >
                <Popconfirm
                  title="Are you sure you want to delete this?"
                  onConfirm={() => handleDeleteRecognitionType(item?.id)}
                  okText="Yes"
                  cancelText="No"
                  data-cy={`all-recognition-card-delete-confirm-${item?.id}`}
                  id={`allRecognitionCardDeleteConfirm${item?.id}`}
                >
                  <Button
                    type="primary"
                    className="text-sm"
                    danger
                    icon={<Trash2 size={14} className="text-xs" />} // Use Trash2 for delete
                    data-cy={`all-recognition-card-delete-button-${item?.id}`}
                    id={`allRecognitionCardDeleteButton${item?.id}`}
                  />
                </Popconfirm>
              </AccessGuard>
            </div>
          }
          data-cy={`all-recognition-card-${item?.id}`}
          id={`allRecognitionCard${item?.id}`}
        >
          <Card.Meta
            description={
              <div
                className="overflow-x-auto"
                data-cy={`all-recognition-card-table-container-${item?.id}`}
                id={`allRecognitionCardTableContainer${item?.id}`}
              >
                {isLoading ? (
                  <TableSkeleton columns={columns} />
                ) : (
                  <Table
                    columns={columns}
                    dataSource={
                      item?.recognitionCriteria?.map((criteria: any) => ({
                        ...criteria,
                        recognitionTypeId: item?.id, // Add recognitionTypeId
                      })) || []
                    }
                    rowKey="id" // Ensure rowKey is unique, changed from `criterionKey` to `id`
                    pagination={false} // Disable pagination if not needed
                    data-cy={`all-recognition-card-table-${item?.id}`}
                    id={`allRecognitionCardTable${item?.id}`}
                  />
                )}
              </div>
            }
          />
        </Card>

        {item?.children?.map((child: any) => recognitionShow(child))}
      </>
    );
  };

  return (
    <div data-cy="all-recognition" id="allRecognition">
      <div
        className="flex justify-end mb-4"
        data-cy="all-recognition-actions"
        id="allRecognitionActions"
      >
        {!all && (
          <AccessGuard
            permissions={[Permissions.AddRecognitionCriteria]}
            data-cy="all-recognition-add-button-access-guard"
            id="allRecognitionAddButtonAccessGuard"
          >
            <Button
              className="flex justify-end items-center"
              icon={<FaPlus />}
              type="primary"
              onClick={showModal}
              data-cy="all-recognition-add-button"
              id="allRecognitionAddButton"
            >
              Recognition
            </Button>
          </AccessGuard>
        )}
      </div>
      {data?.map((item: any) => (
        <React.Fragment key={item.id} data-cy="all-recognition-item">
          {all
            ? recognitionShow(item)
            : item?.children?.map((child: any) => (
                <React.Fragment
                  key={child.id}
                  data-cy="all-recognition-item-child"
                >
                  {recognitionShow(child)}
                </React.Fragment>
              ))}
        </React.Fragment>
      ))}
    </div>
  );
};

export default AllRecognition;
