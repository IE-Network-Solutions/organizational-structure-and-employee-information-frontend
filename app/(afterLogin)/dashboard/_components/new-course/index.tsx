import { useGetCourse } from '@/store/server/features/dashboard/new-courses/queries';
import { Card, Empty, Tooltip } from 'antd';
import dayjs from 'dayjs';

export default function NewCourses() {
  const { data: courses, isLoading } = useGetCourse();
  return (
    <div className="p-2">
      <h2 className="text-lg font-semibold mb-4">Newly Added Courses</h2>
      {courses?.length != 0 ? (
        <div className="flex space-x-4 overflow-x-auto scrollbar-none">
          {courses?.map((course, idx) => (
            <Card
              key={idx}
              className="min-w-[400px]"
              bodyStyle={{ padding: '10px' }}
              loading={isLoading}
            >
              <div className="flex  gap-4">
                <div className="bg-blue text-white px-4 py-2 rounded-xl h-fit w-fit text-xs text-center">
                  {course.course?.courseCategory?.title}
                </div>
                <div className="flex flex-col w-full">
                  <Tooltip title={course.course?.title}>
                    <div className="font-semibold text-md">
                      {course.course?.title?.length >= 40
                        ? course.course?.title?.slice(0, 40) + '...'
                        : course.course?.title}
                    </div>
                  </Tooltip>
                  <Tooltip title={course.course?.overview}>
                    <div className="font-normal text-xs">
                      {course.course?.overview?.length >= 70
                        ? course.course?.overview?.slice(0, 70) + '...'
                        : course.course?.overview}
                    </div>
                  </Tooltip>
                  <p className=" text-xs font-semibold">
                    {dayjs(course.course?.createdAt).format(
                      'dddd, MMMM D, YYYY',
                    )}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Empty />
      )}
    </div>
  );
}
