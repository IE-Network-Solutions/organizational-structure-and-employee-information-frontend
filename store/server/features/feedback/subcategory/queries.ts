import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

const fetchSubcategories = async () => {
  return crudRequest({
    url: 'https://mocki.io/v1/5f25b112-cf80-4e52-a054-514a7243b3ff',
    method: 'GET',
  });
};

export const useFetchedSubcategories = () => {
  return useQuery<any[]>('subcategories', fetchSubcategories);
};
