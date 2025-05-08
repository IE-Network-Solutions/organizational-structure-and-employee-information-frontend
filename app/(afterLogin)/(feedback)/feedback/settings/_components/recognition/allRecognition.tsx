import { Button, Card, Popconfirm, Table } from 'antd';
import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { useDeleteRecognitionType } from '@/store/server/features/CFR/recognition/mutation';
import { useDeleteRecognitionCriteria } from '@/store/server/features/CFR/recognitionCriteria/mutation';
import RecognitionForm from './createRecognition';
import CustomDrawerLayout from '@/components/common/customDrawer';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { Edit2, Trash2 } from 'lucide-react';

interface PropsData {
  data: any;
  all?: boolean;
}
const AllRecognition: React.FC<PropsData> = ({ data, all = false }) => {
  const {
    setOpen,
    setSelectedRecognitionType,
    setParentRecognitionTypeId,
    // setEditingRowKeys,
    selectedRecognitionType,
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
      dataIndex: 'criterionKey',
      key: 'criterionKey',
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
        <p>{record?.active ? 'True' : 'False'}</p>
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
          <AccessGuard permissions={[Permissions.DeleteRecognitionCriteria]}>
            <Popconfirm
              title="Are you sure you want to delete this?"
              onConfirm={() => handleDeleteItem(record?.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="primary" danger>
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
    setSelectedRecognitionType(id);
  };

  const handleDeleteRecognitionType = (id: string) => {
    deleteRecognitionType(id);
  };

  const recognitionShow = (item: any) => {
    return (
      <>
        <Card
          key={item?.id}
          title={item?.name}
          extra={
            <div className="flex justify-end gap-2">
              <AccessGuard permissions={[Permissions.EditRecognitionCriteria]}>
                <Button
                  type="primary"
                  onClick={() => handleEditItem(item?.id)}
                  icon={<Edit2 size={14} className="text-xs" />} // Smaller edit icon
                />
              </AccessGuard>

              <AccessGuard
                permissions={[Permissions.DeleteRecognitionCriteria]}
              >
                <Popconfirm
                  title="Are you sure you want to delete this?"
                  onConfirm={() => handleDeleteRecognitionType(item?.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    type="primary"
                    className="text-sm"
                    danger
                    icon={<Trash2 size={14} className="text-xs" />} // Use Trash2 for delete
                  />
                </Popconfirm>
              </AccessGuard>
            </div>
          }
        >
          <Card.Meta
            description={
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
              />
            }
          />
        </Card>

        {item?.children?.map((child: any) => recognitionShow(child))}
      </>
    );
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        {!all && (
          <AccessGuard permissions={[Permissions.AddRecognitionCriteria]}>
            <Button
              className="flex justify-end items-center"
              icon={<FaPlus />}
              type="primary"
              onClick={showModal}
            >
              Recognition
            </Button>
          </AccessGuard>
        )}
      </div>
      {data?.map((item: any) => (
        <React.Fragment key={item.id}>
          {all
            ? recognitionShow(item)
            : item?.children?.map((child: any) => (
                <React.Fragment key={child.id}>
                  {recognitionShow(child)}
                </React.Fragment>
              ))}
        </React.Fragment>
      ))}

    </div>
  );
};

export default AllRecognition;
