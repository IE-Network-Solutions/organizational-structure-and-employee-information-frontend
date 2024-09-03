import React from 'react';
import { Row, Col } from 'antd';
import SubcategoryCard from '../subcategoryCard';
import { useFetchedSubcategories } from '@/store/server/features/feedback/subcategory/queries';
import CategoryPagination from '../../../_components/categoryPagination';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';

const SubcategoriesPage: React.FC<any> = () => {
  const { data: subcategories } = useFetchedSubcategories();
  const { current, pageSize, totalPages, setCurrent, setPageSize } =
    CategoriesManagementStore();

  const handleChange = (page: number, pageSize: number) => {
    setCurrent(page);
    setPageSize(pageSize);
  };

  const handleShowSizeChange = (size: number) => {
    setPageSize(size);
    setCurrent(1);
  };

  return (
    <>
      <Row gutter={[24, 24]}>
        {subcategories &&
          subcategories.map((subcategory: any) => (
            <Col key={subcategory.id} xs={24} sm={14} md={14}>
              <SubcategoryCard {...subcategory} />
            </Col>
          ))}
      </Row>
      <CategoryPagination
        current={current}
        total={totalPages}
        pageSize={pageSize}
        onChange={handleChange}
        onShowSizeChange={handleShowSizeChange}
      />
    </>
  );
};

export default SubcategoriesPage;
