'use client';
import { useEffect, useState } from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button, Flex, Spin } from 'antd';
import { LuPlus } from 'react-icons/lu';
import CourseCategorySidebar from './_components/courseSidebar';
import { useTnaManagementStore } from '@/store/uistate/features/tna/management';
import { useGetCourseCategory } from '@/store/server/features/tna/courseCategory/queries';
import { useGetCoursesManagement } from '@/store/server/features/tna/management/queries';
import CourseFilter from '@/app/(afterLogin)/(tna)/tna/management/_components/courseFilter';
import { CommonObject } from '@/types/commons/commonObject';
import { useDebounce } from '@/utils/useDebounce';
import { CourseManagementRequestBody } from '@/store/server/features/tna/management/interface';
import CourseCard from '@/app/(afterLogin)/(tna)/tna/management/_components/courseCard/index';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { localUserID } from '@/utils/constants';
import { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

import 'swiper/css';
import 'swiper/css/navigation';

const TnaManagementPage = () => {
  const { setIsShowCourseSidebar, isShowCourseSidebar, setCourseCategory } =
    useTnaManagementStore();
  const { data: categoryData, isFetching } = useGetCourseCategory({});
  const [filter, setFilter] = useState<Partial<CourseManagementRequestBody>>({});
  const [swiper, setSwiper] = useState<SwiperType>();
  const {
    data: coursesData,
    isFetching: isFetchingCourse,
    isLoading,
    refetch,
  } = useGetCoursesManagement(filter);

  useEffect(() => {
    if (!isShowCourseSidebar) {
      refetch();
    }
  }, [isShowCourseSidebar]);

  useEffect(() => {
    if (categoryData?.items) {
      setCourseCategory(categoryData.items);
    }
  }, [categoryData]);

  const onFilterChange = useDebounce((value: CommonObject) => {
    const nFilter: Partial<CourseManagementRequestBody> = {};

    if (value.search && value.search.trim().length > 0) {
      nFilter['modifiers'] = {
        search: `%${value.search.trim()}%`,
      };
    }

    if (value.courseCategoryId) {
      nFilter['filter'] = {
        courseCategoryId: [value.courseCategoryId],
      };
    }

    setFilter(nFilter);
  }, 500);

  return (
    <div className="page-wrap bg-[#f5f5f5]">
      <PageHeader
        title="Training & Learning"
        description="Training and Learning module"
      >
        <Flex gap={16}>
          <CourseFilter onChange={onFilterChange} />
          <AccessGuard permissions={[Permissions.CreateCourse]}>
            <Button
              id="tnaAddCourseActionButtonId"
              size="large"
              type="primary"
              className="h-[54px]"
              icon={<LuPlus size={16} />}
              loading={isFetching}
              onClick={() => setIsShowCourseSidebar(true)}
            >
              Add Course
            </Button>
          </AccessGuard>
        </Flex>
      </PageHeader>

      {isLoading ? (
        <div className="flex justify-center p-5">
          <Spin />
        </div>
      ) : (
        <Spin spinning={isFetchingCourse}>
          <div className="flex items-center">
            {coursesData?.items && coursesData.items.length > 3 && (
              <div className="w-10 flex flex-col justify-center">
                <Button
                  className="w-6 h-6"
                  type="text"
                  icon={<LeftOutlined size={16} className="text-black font-bold" />}
                  onClick={() => swiper?.slidePrev()}
                />
              </div>
            )}
            <Swiper
              className="flex-1 px-1 py-2"
              slidesPerView="auto"
              spaceBetween={16}
              breakpoints={{
                320: {
                  slidesPerView: 2.2,
                  spaceBetween: 12,
                },
                480: {
                  slidesPerView: 3.2,
                  spaceBetween: 16,
                },
                768: {
                  slidesPerView: 4,
                  spaceBetween: 20,
                },
                1024: {
                  slidesPerView: 5,
                  spaceBetween: 24,
                },
                1280: {
                  slidesPerView: 6,
                  spaceBetween: 24,
                }
              }}
              modules={[Navigation]}
              onInit={(swiper) => {
                setSwiper(swiper);
              }}
            >
              {coursesData?.items?.map((item) => (
                <SwiperSlide key={item.id}>
                  {item.isDraft ? (
                    item.preparedBy === localUserID ? (
                      <CourseCard item={item} refetch={refetch} />
                    ) : null
                  ) : (
                    <CourseCard item={item} refetch={refetch} />
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
            {coursesData?.items && coursesData.items.length > 3 && (
              <div className="w-10 h-full flex flex-col justify-center items-end">
                <Button
                  className="w-6 h-6"
                  type="text"
                  icon={<RightOutlined size={16} className="text-black font-bold" />}
                  onClick={() => swiper?.slideNext()}
                />
              </div>
            )}
          </div>
        </Spin>
      )}

      <CourseCategorySidebar />
    </div>
  );
};

export default TnaManagementPage;
