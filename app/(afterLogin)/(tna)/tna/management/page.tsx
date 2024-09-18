'use client';
import { useEffect } from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button, Card } from 'antd';
import Meta from 'antd/lib/card/Meta';
import ActionButton from '@/components/common/actionButton';
import { LuPlus } from 'react-icons/lu';
import CourseCategorySidebar from './_components/courseSidebar';
import { useTnaManagementStore } from '@/store/uistate/features/tna/management';
import { useGetCourseCategory } from '@/store/server/features/tna/courseCategory/queries';

const TnaManagementPage = () => {
  const { setIsShowCourseSidebar, isShowCourseSidebar, setCourseCategory } =
    useTnaManagementStore();
  const { data: categoryData, isFetching } = useGetCourseCategory({});

  useEffect(() => {
    if (categoryData?.items) {
      setCourseCategory(categoryData.items);
    }
  }, [categoryData]);

  return (
    <div className="page-wrap">
      <PageHeader
        title="Trainging & Learning"
        description="Training and Learning module"
      >
        <Button
          size="large"
          type="primary"
          className="h-[54px]"
          icon={<LuPlus size={16} />}
          loading={isFetching}
          onClick={() => setIsShowCourseSidebar(true)}
        >
          Add Course
        </Button>
      </PageHeader>

      <div className="grid grid-cols-course-list gap-6 mt-8">
        <Card
          hoverable
          cover={
            <img
              alt="example"
              src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
              className="w-full h-[250px] object-cover object-top"
            />
          }
        >
          <Meta
            title={
              <div className="flex items-center gap-1">
                <div className="text-lg font-bold text-gray-900 flex-1 text-pretty">
                  Create an LMS Website with LearnPress
                </div>
                <ActionButton />
              </div>
            }
            description={
              <div className="text-base text-gray-600">
                LearnPress is a comprehensive
              </div>
            }
          />
        </Card>
      </div>

      <CourseCategorySidebar />
    </div>
  );
};

export default TnaManagementPage;
