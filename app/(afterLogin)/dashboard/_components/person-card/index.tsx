// components/PersonCard.tsx
import { FC } from 'react';

interface PersonCardProps {
  name: string;
  email: string;
  imgSrc: string;
}

const PersonCard: FC<PersonCardProps> = ({ name, email, imgSrc }) => {
  return (
    <div className="flex flex-col items-center">
      <img src={imgSrc} alt={name} className="w-8 h-8 rounded-full" />
      <p className="font-medium">{name}</p>
      <p className="text-gray-500 text-xs">{email}</p>
    </div>
  );
};

export default PersonCard;
