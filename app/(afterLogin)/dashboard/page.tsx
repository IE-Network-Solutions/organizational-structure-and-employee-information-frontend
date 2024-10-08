'use client';
import CardList from './_components/card-list';
import ActionPlans from './_components/action-plan';
import ApprovalStatus from './_components/approval-status';
import CoursePermitted from './_components/course-permitted';
import Header from './_components/header';
import NewCourses from './_components/new-course';
import SelfAttendance from './_components/self-attendance';

const categories = [
  { name: 'Category 1', value: 71, color: '#4a90e2' },
  { name: 'Category 2', value: 27, color: '#50e3c2' },
  { name: 'Category 3', value: 23, color: '#f5a623' },
];
const people = [
  {
    name: 'Pristia Candra',
    email: 'lincoln@ienetwork.com',
    imgSrc: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    name: 'Pristia Candra',
    email: 'lincoln@ienetwork.com',
    imgSrc: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    name: 'Pristia Candra',
    email: 'lincoln@ienetwork.com',
    imgSrc: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
];
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="grid grid-cols-12 gap-4 p-4">
        <div className="col-span-8">
          <Header />
          <SelfAttendance />
        </div>
        <div className="col-span-4">
          <ActionPlans />
        </div>
      </div>
      <NewCourses />
      <div className="grid grid-cols-12 gap-4 p-2">
        <div className="col-span-8 flex gap-4">
          <ApprovalStatus />
          <CoursePermitted total={112} categories={categories} />
        </div>
        <div className=" bg-gray-100  flex flex-col items-center col-span-4">
          <CardList
            title="Whose Birth Day is today?"
            people={people}
            date="July 10, 2024"
          />
          <CardList
            title="Work Anniversary"
            people={people}
            date="July 10, 2024"
          />
        </div>
      </div>
    </div>
  );
}
