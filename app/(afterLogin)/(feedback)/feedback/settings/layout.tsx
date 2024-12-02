// 'use client';
// import CustomBreadcrumb from '@/components/common/breadCramp';
// import CustomButton from '@/components/common/buttons/customButton';
// import { useCustomQuestionTemplateStore } from '@/store/uistate/features/feedback/settings';
// import { Card, Col, Row, Typography } from 'antd';
// import React from 'react';
// import { FaPlus } from 'react-icons/fa';
// import { CalendarDays } from 'lucide-react';
// import QuestionTemplateDrawer from './_components/questionsTemplate/questionTemplateDrawer';
// import QuestionTemplateCard from './_components/questionsTemplate/questionTemplateCard';

// const { Title } = Typography;

// const QuestionTemplate: React.FC = () => {
//   const { setIsOpen } = useCustomQuestionTemplateStore();

//   const showDrawer = () => {
//     setIsOpen(true);
//   };
//   const onClose = () => {
//     setIsOpen(false);
//   };
//   const onClickHandler = () => {
//     setIsOpen(false);
//   };
//   return (
//     <div className="bg-[#F5F5F5] px-2 h-auto min-h-screen w-full">
//       <div className="flex gap-2 items-center mb-4">
//         <CustomBreadcrumb
//           title="Settings"
//           subtitle="Organizational Development Settings"
//         />
//       </div>
//       <Row gutter={[16, 24]}>
//         <Col lg={8} md={10} xs={24}>
//           <Card>
//             <div className='flex flex-col gap-2'>
//             <div className="bg-[#F5F5F5] p-4 rounded-md flex items-center justify-center gap-2">
//               <CalendarDays size={18} color="#2f78ee" />
//               <p className="text-sm font-semibold">Custom fields</p>
//             </div>
//             <div className="bg-[#F5F5F5] p-4 rounded-md flex items-center justify-center gap-2" onClick={()=>onClickHandler()}>
//               <CalendarDays size={18} color="#2f78ee" />
//               <p className="text-sm font-semibold">Recognition Types</p>
//             </div>
//             </div>
//           </Card>
//         </Col>
//         <Col lg={16} md={14} xs={24}>
//           <Card>
//             <div className="flex items-center justify-between">
//               <Title level={5}>Custom Fields</Title>
//               <CustomButton
//                 title="New Field"
//                 id="createUserButton"
//                 icon={<FaPlus size={13} className="mr-2" />}
//                 onClick={showDrawer}
//                 className="bg-blue-600 hover:bg-blue-700 h-12 py-5 text-medium font-semibold"
//               />
//               <QuestionTemplateDrawer onClose={onClose} />
//             </div>
//             <QuestionTemplateCard />
//           </Card>
//         </Col>
//       </Row>
//     </div>
//   );
// };

// export default QuestionTemplate;
'use client';
import { FC, ReactNode } from 'react';
import { CiCalendarDate } from 'react-icons/ci';
import { FiFileText } from 'react-icons/fi';
import { TbLayoutList } from 'react-icons/tb';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { SidebarMenuItem } from '@/types/sidebarMenu';
import SidebarMenu from '@/components/sidebarMenu';

interface TimesheetSettingsLayoutProps {
  children: ReactNode;
}

const CFRSettingLayout: FC<TimesheetSettingsLayoutProps> = ({
  children,
}) => {
  const menuItems = new SidebarMenuItem([
    {
      item: {
        key: 'feedback',
        icon: <CiCalendarDate />,
        label: <p className="menu-item-label">Feedback</p>,
        className: 'px-1',
      },
      link: '/feedback/settings/feedback',
    },
    {
      item: {
        key: 'recognition-setting',
        icon: <CiCalendarDate />,
        label: <p className="menu-item-label">Recognition</p>,
        className: 'px-1',
      },
      link: '/feedback/settings/recognition',
    },
  ]);

  return (
    <div className="h-auto w-auto pr-6 pb-6 pl-3">
      <PageHeader
        title="Settings"
        description="Organizational development settings"
      ></PageHeader>

      <div className="flex gap-6 mt-8">
        <SidebarMenu menuItems={menuItems} />

        <BlockWrapper className="flex-1 h-max">{children}</BlockWrapper>
      </div>
    </div>
  );
};

export default CFRSettingLayout;

