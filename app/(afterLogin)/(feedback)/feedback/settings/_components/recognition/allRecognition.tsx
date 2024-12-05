import { Button, Card, Drawer, Popconfirm, Table } from 'antd'
import React, { useState } from 'react'
import { FaPlus } from 'react-icons/fa';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { useDeleteRecognitionType } from '@/store/server/features/CFR/recognition/mutation';
import { useAddRecognitionCriteria, useDeleteRecognitionCriteria, useUpdateRecognitionCriteria } from '@/store/server/features/CFR/recognitionCriteria/mutation';
import RecognitionForm from './createRecognition';
import CustomDrawerLayout from '@/components/common/customDrawer';
import RecognitionCriteriaModal from './updateRecognitionCriteria';



interface PropsData{
  data:any;
  all?:boolean;
}
const AllRecognition:React.FC<PropsData>=({data,all=false})=>{
    const { open, setOpen,setSelectedRecognitionType,setParentRecognitionTypeId, recognitionTypeId,setRecognitionTypeId,editingRowKeys, setEditingRowKeys,selectedRecognitionType} = ConversationStore();
    const {mutate:deleteRecognitionType}=useDeleteRecognitionType()
    // const {mutate:deleteRecognitionCriteria}=useDeleteRecognitionCriteria()

    const {mutate:updateCriteria}=useUpdateRecognitionCriteria()
    const {mutate:addCriteria}=useAddRecognitionCriteria()


    const {mutate:deleteRecognitionCriteria}=useDeleteRecognitionCriteria()

   

    const showModal = () => {
      setParentRecognitionTypeId(data?.[0]?.id);
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
        title: "IsActive",
        dataIndex: "active",
        key: "active",
        render: (_: any, record: any) => (
          <p>{record?.active ? "True" : "False"}</p>
        )
      },
      {
        title: "Value",
        dataIndex: "value",
        key: "value",
      },
      {
        title: "Action",
        key: "action",
        render: (_:any, record:any) =>
           <>
            <Button
              type="link"
              onClick={() => setEditingRowKeys(record)}
            >
              Edit
            </Button>
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
          </>
      },
    ];
  
    const handleDeleteItem = (id:string) => {
      deleteRecognitionCriteria(id)
    };
    const handleEditItem = (id:string) => {
      setSelectedRecognitionType(id)
    };
    const handleEditCriterion = (data:any) => {

      updateCriteria({...data,weight:parseInt(data?.weight),value:parseInt(data?.value)},{
        onSuccess:()=>{
          setEditingRowKeys({});
        }
      })
    };
    const handleAddCriterion = (data:any) => {
      addCriteria({...data,weight:parseInt(data?.weight),value:parseInt(data?.value)},{
        onSuccess:()=>{
          setEditingRowKeys({});
        }
      })
    };
    const handleDeleteRecognitionType = (id:string) => {
      deleteRecognitionType(id);
    };
    const modalHeader = (
      <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
        Add New Recognition
      </div>
    );
  return (
    <div>
        <div className='flex justify-end mb-4'>
            {!all && <Button className='flex justify-end items-center' icon={<FaPlus/>} type="primary" onClick={showModal}>
              Recognition
            </Button>}
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
                  onConfirm={() => handleDeleteRecognitionType(item?.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="primary" danger>
                    Delete
                  </Button>
                </Popconfirm>
                <Button type="primary" onClick={() => setRecognitionTypeId(item?.id)}>Add criteria</Button>
              </div>
            }
          >
            <Card.Meta
              description={
                <Table
                  columns={columns}
                  dataSource={
                    item?.recognitionCriteria?.map((criteria:any) => ({
                      ...criteria,
                      recognitionTypeId: item?.id, // Add recognitionTypeId
                    })) || []
                  }
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
          <RecognitionForm  /> 
        </CustomDrawerLayout>

        <RecognitionCriteriaModal
            isOpen={editingRowKeys?.id}
            onClose={() =>setEditingRowKeys({})}
            text="Update"
            onSubmit={handleEditCriterion}
            data={editingRowKeys}
          />
          <RecognitionCriteriaModal
            isOpen={recognitionTypeId!==''}
            onClose={() =>setRecognitionTypeId('')}
            text="Create"
            onSubmit={handleAddCriterion}
          />
        </div>
      
    </div>
  )
}

export default AllRecognition