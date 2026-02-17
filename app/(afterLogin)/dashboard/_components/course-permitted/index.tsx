import React from 'react';
import { Card, Collapse, Divider } from 'antd';
import { useGetCoursePermitted } from '@/store/server/features/dashboard/courses-permitted/queries';

// Register the chart.js components

const CoursePermitted: React.FC = () => {
  const { data: coursePermitted, isLoading } = useGetCoursePermitted();

  return (
    <Card
      loading={isLoading}
      className="w-full mx-auto min-h-28  py-3 px-5 shadow-lg"
      bodyStyle={{ padding: '0px', margin: '0px' }}
    >
      <div
        className="flex justify-between items-center mb-2"
        data-cy="course-permitted-header"
      ></div>

      <div className="grid items-center " data-cy="course-permitted-content">
        <Collapse
          className=""
          size="small"
          bordered={false}
          expandIcon={() => null} // hides the expand icon
          collapsible={
            coursePermitted && coursePermitted?.length > 0
              ? undefined
              : 'disabled'
          }
          items={[
            {
              key: '1',

              label: (
                <div
                  className="flex justify-between items-center"
                  data-cy="course-permitted-label"
                >
                  <div className="" data-cy="course-permitted-title-section">
                    <div
                      className="  font-bold text-lg"
                      data-cy="course-permitted-title"
                    >
                      Course Permitted
                    </div>{' '}
                    <div
                      className="font-medium text-sm"
                      data-cy="course-permitted-subtitle"
                    >
                      Latest permitted courses
                    </div>
                  </div>
                  <div data-cy="course-permitted-count">
                    {coursePermitted && coursePermitted?.length > 0 ? (
                      <div
                        className="p-2 bg-green-300 text-green-800 rounded-lg"
                        data-cy="course-permitted-count-badge"
                      >
                        {coursePermitted?.length} Courses
                      </div>
                    ) : (
                      <div
                        className="p-1 bg-red-100 text-error rounded-lg"
                        data-cy="course-permitted-no-courses-badge"
                      >
                        No Courses
                      </div>
                    )}{' '}
                  </div>
                </div>
              ),
              children: (
                <div data-cy="course-permitted-list">
                  {coursePermitted && coursePermitted?.length > 0 ? (
                    <Divider />
                  ) : (
                    ''
                  )}

                  {coursePermitted &&
                    coursePermitted?.map((item: any, index: number) => (
                      <Card
                        key={index}
                        className="mb-4 pb-2 shadow-md"
                        data-cy={`course-permitted-item-${index}`}
                      >
                        <div
                          className="flex justify-between items-center mb-1"
                          data-cy={`course-permitted-item-content-${index}`}
                        >
                          <div
                            className=""
                            data-cy={`course-permitted-item-details-${index}`}
                          >
                            <div
                              className="text-gray-700 font-semibold"
                              data-cy={`course-permitted-item-title-${index}`}
                            >
                              {item.title}
                            </div>
                            <div
                              className="text-gray-600 text-sm mb-1"
                              data-cy={`course-permitted-item-description-${index}`}
                            >
                              {item.description}
                            </div>
                            <div
                              className="text-gray-500 text-xs"
                              data-cy={`course-permitted-item-date-${index}`}
                            >
                              {item.date}
                            </div>
                          </div>
                          <div
                            className="text-sm p-3 bg-primary rounded-lg text-white"
                            data-cy={`course-permitted-item-team-${index}`}
                          >
                            {item.team}
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              ),
            },
          ]}
        />
      </div>
    </Card>
  );
};

export default CoursePermitted;
