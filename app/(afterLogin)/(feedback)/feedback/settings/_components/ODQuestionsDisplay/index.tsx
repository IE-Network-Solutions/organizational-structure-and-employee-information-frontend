'use client';
import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';

const ODQuestionsDisplay: React.FC<any> = () => {
  return (
    <div className="flex items-center justify-between gap-3 my-5 mx-2 border-gray-100 border-[1px] rounded-md px-2 py-4">
      <div className="text-medium font-medium">Custom Field Name</div>
      <div className="flex items-center justify-center gap-2">
        <div className="bg-[#2f78ee] w-7 h-7 rounded-md flex items-center justify-center">
          <Pencil size={15} className="text-white" />
        </div>
        <div className="bg-[#e03137] w-7 h-7 rounded-md flex items-center justify-center">
          <Trash2 size={15} className="text-white" />
        </div>
      </div>
    </div>
  );
};

export default ODQuestionsDisplay;
