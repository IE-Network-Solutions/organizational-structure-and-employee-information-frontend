import ActionButtons from '@/components/common/actionButton/actionButtons';

const TnaCategoryCard = () => {
  return (
    <div className="flex justify-between items-center p-6 rounded-2xl border border-gray-200 mt-6 gap-2.5">
      <div className="text-lg font-semibold text-gray-900 flex-1">
        Category 1
      </div>

      <ActionButtons onDelete={() => {}} onEdit={() => {}} />
    </div>
  );
};

export default TnaCategoryCard;
