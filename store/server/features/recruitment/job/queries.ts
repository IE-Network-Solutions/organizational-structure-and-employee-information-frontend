import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

const getJobs = async () => {
  return await crudRequest({
    url: 'https://api.example.com/jobs',
    method: 'GET',
    headers: {
      Authorization: 'Bearer your_access_token',
    },
  });
};

export const useGetJobs = () => {
  return useQuery(['jobs'], getJobs);
};
