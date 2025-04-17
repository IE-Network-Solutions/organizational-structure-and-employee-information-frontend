import { requestHeader } from '@/helpers/requestHeader';
import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

const fetchAllObjectives = async () => {
  return crudRequest({
    url: `${OKR_AND_PLANNING_URL}/objective/objective-filter/all/objective`,
    method: 'GET',
    headers: requestHeader(),
  });
};

export const useGetAllObjective = () => {
  return useQuery<any>('objectives', fetchAllObjectives);
};
