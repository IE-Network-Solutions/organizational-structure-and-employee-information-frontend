// components/CardList.tsx
import { FC } from 'react';
import PersonCard from '../person-card';

interface CardListProps {
  title: string;
  people: { name: string; email: string; imgSrc: string }[];
  date: string;
}

const CardList: FC<CardListProps> = ({ title, people, date }) => {
  return (
    <div className="bg-white p-2 rounded-lg shadow-md mb-2 w-full ">
      <div className="flex items-center mb-2">
        <span className="mr-2 text-2xl">🎉</span>
        <h4 className="text-lg font-semibold">{title}</h4>
      </div>

      <div className="flex items-center justify-between mb-2 overflow-x-auto  scrollbar-thumb-rounded-full scrollbar-thumb-white scrollbar-track-gray-300 scrollbar-track-rounded-full scrollbar-thin ">
        <div className="flex space-x-4">
          {people.map((person, index) => (
            <PersonCard
              key={index}
              name={person.name}
              email={person.email}
              imgSrc={person.imgSrc}
            />
          ))}
        </div>
      </div>

      <p className="text-gray-500">Date: {date}</p>
    </div>
  );
};

export default CardList;
