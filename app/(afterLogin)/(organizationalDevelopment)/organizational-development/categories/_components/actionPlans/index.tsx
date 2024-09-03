import { InfoLine } from '@/app/(afterLogin)/(employeeInformation)/employees/manage-employees/[id]/_components/common/infoLine'
import EditAndDeleteButtonCard from '@/app/(afterLogin)/(employeeInformation)/employees/settings/_components/rolePermission/permission/role/editDeleteButtonCard';
import { Avatar, Button, Card, Col, List } from 'antd'
import React from 'react'
import { FaChevronUp } from 'react-icons/fa';
import { MdOutlineModeEditOutline } from 'react-icons/md';
import { RiDeleteBin5Line } from 'react-icons/ri';

function ActionPlans() {
  const data = [
    {
      title: 'Ant Design Title 1',
    },
    {
      title: 'Ant Design Title 2',
    },
    {
      title: 'Ant Design Title 3',
    },
    {
      title: 'Ant Design Title 4',
    },
  ];

  
  
  return (
    <div>
          <List
            itemLayout="horizontal"
            dataSource={data}
            renderItem={(item, index) => (
              <Card>
                <List.Item className='flex justify-between gap-2'>
                    <div className='flex justify-start gap-4'>
                     <FaChevronUp className='font-bold' />
                    <div>Purchase two sets of water dispensaries</div></div>
                    <div className='flex gap-2'>
                      <Button type='primary'><MdOutlineModeEditOutline/></Button>
                      <Button type="primary" danger><RiDeleteBin5Line/></Button>
                    </div>
                </List.Item>
                <List.Item className='flex justify-start gap-2'>
                  <div className='flex flex-col text-gray-400 text-sm'>
                   <p >Responsible Person</p>
                   <p >Description</p>

                  </div>
                  <List.Item.Meta
                    avatar={<Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`} />}
                    title={<span className='text-sm'>{item.title}</span>}
                    description="Ant Design, a design language for background applications, is refined by Ant UED Team"
                  />
                </List.Item>
              </Card>
            )}
          />

    </div>
  )
}

export default ActionPlans