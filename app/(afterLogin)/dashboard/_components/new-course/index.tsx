import { Card } from 'antd';

const courses = [
  { title: 'Create an LMS Website with LearnPress', date: '27 May 2023' },
  { title: 'Create an LMS Website with LearnPress', date: '28 May 2023' },
  { title: 'Create an LMS Website with LearnPress', date: '29 May 2023' },
];

export default function NewCourses() {
  return (
    <div className="p-4  ">
      <h2 className="text-lg font-semibold mb-4">Newly Added Courses</h2>
      <div className="flex space-x-4 overflow-x-auto">
        {courses.map((course, idx) => (
          <Card
            key={idx}
            className="min-w-[400px]"
            bodyStyle={{ padding: '10px' }}
          >
            <div className="flex  gap-4">
              <div className="bg-blue text-white px-4 py-2 rounded-xl h-fit text-xs">
                SaaS
              </div>
              <div className="flex flex-col">
                <div className="font-semibold text-md">{course.title}</div>
                <div className="font-normal text-xs">{course.title}</div>
                <p className=" text-xs font-semibold">{course.date}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
