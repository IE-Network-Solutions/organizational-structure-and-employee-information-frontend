'use client';
import InternTable from './_components/table';
import CreateIntern from './_components/drawer';
import { useInternStore } from '@/store/uistate/features/recruitment/talent-resource/intern';

const InternPage = () => {
  const {
    createInternDrawer,
    setCreateInternDrawer,
    setEditInternData,
    editInternData,
  } = useInternStore();

  const onClose = () => {
    setCreateInternDrawer(false);
    setEditInternData(null);
    return true;
  };

  const handleEdit = (data: any) => {
    setCreateInternDrawer(true);
    setEditInternData(data);
  };

  return (
    <div
      id="talent-acquisition-intern-page-div-container"
      data-cy="talent-acquisition-intern-page-div-container"
    >
      <div
        id="talent-acquisition-intern-page-div-content"
        data-cy="talent-acquisition-intern-page-div-content"
      >
        <InternTable
          data-cy="talent-acquisition-intern-table"
          onEdit={handleEdit}
        />
        <CreateIntern
          open={createInternDrawer}
          onClose={onClose}
          editData={editInternData}
          isEdit={!!editInternData}
        />
      </div>
    </div>
  );
};

export default InternPage;
