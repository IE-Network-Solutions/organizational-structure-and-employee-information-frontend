import { Button, Card, Drawer, Popconfirm, Table } from 'antd'
import React from 'react'
import { FaPlus } from 'react-icons/fa';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { useDeleteRecognitionType } from '@/store/server/features/CFR/recognition/mutation';
import { useDeleteRecognitionCriteria } from '@/store/server/features/CFR/recognitionCriteria/mutation';
import RecognitionForm from './createRecognition';
import CustomDrawerLayout from '@/components/common/customDrawer';



interface PropsData{
  data:any;
}
const AllRecognition:React.FC<PropsData>=({data})=>{
    const { open, setOpen, setSearchField,setSelectedRecognitionType ,selectedRecognitionType,setOpenRecognitionType,openRecognitionType} = ConversationStore();
    const {mutate:deleteRecognitionType}=useDeleteRecognitionType()
    const {mutate:deleteRecognitionCriteria}=useDeleteRecognitionCriteria()


    const showModal = () => {
      setOpen(true);
    };
    const columns = [
      {
        title: "Criteria Name",
        dataIndex: "criterionKey",
        key: "criterionKey",
      },
      {
        title: "Weight",
        dataIndex: "weight",
        key: "weight",
      },
      {
        title: "Operator",
        dataIndex: "operator",
        key: "operator",
      },
      {
        title: "Condition",
        dataIndex: "condition",
        key: "condition",
      },
      {
        title: "Value",
        dataIndex: "value",
        key: "value",
      },
    ];
  
    const handleDeleteItem = (id:string) => {
      deleteRecognitionType(id)
    };
    const handleEditItem = (id:string) => {
      setSelectedRecognitionType(id)
    };
    const handleEditCriterion = (id:string) => {
      deleteRecognitionType(id)
    };
    const handleDeleteCriterion = (id:string) => {
      deleteRecognitionCriteria(id);
    };
    const modalHeader = (
      <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
        Add New Recognition
      </div>
    );
  return (
    <div>
        <div className='flex justify-end mb-4'>
            <Button className='flex justify-end items-center' icon={<FaPlus/>} type="primary" onClick={showModal}>
              Recognition
            </Button>
        </div>
        <div>
        {data?.map((item: any) => (
          <Card
            title={item?.name}
            extra={
              <div className="flex justify-end gap-2">
                <Button type="primary" onClick={() => handleEditItem(item?.id)}>Edit</Button>
                <Popconfirm
                  title="Are you sure you want to delete this?"
                  onConfirm={() => handleDeleteItem(item?.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="primary" danger>
                    Delete
                  </Button>
                </Popconfirm>
              </div>
            }
          >
            <Card.Meta
              description={
                <Table
                  columns={columns}
                  dataSource={item?.recognitionCriteria || []}
                  rowKey="criterionKey" // Use a unique key for rows
                  pagination={false} // Disable pagination if not needed
                />
              }
            />
          </Card>
        ))}
        <CustomDrawerLayout
          open={selectedRecognitionType!==''}
          onClose={()=>setSelectedRecognitionType('')}
          modalHeader={modalHeader}
          width="50%"
        >
          <RecognitionForm /> 
        </CustomDrawerLayout>
        </div>
      
    </div>
  )
}

export default AllRecognition