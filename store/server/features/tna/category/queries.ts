import { TnaCategoryRequestBody } from '@/store/server/features/tna/category/interface';
import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { TrainingNeedCategory } from '@/types/tna/tna';

const getTnaCategory = async (data: Partial<TnaCategoryRequestBody>) => {
  return await crudRequest({
    url: `${TNA_URL}/tna/category`,
    method: 'POST',
    headers: requestHeader(),
    data,
  });
};

export const useGetTnaCategory = (
  data: Partial<TnaCategoryRequestBody>,
  isKeepData: boolean = true,
  isEnabled: boolean = true,
) => {
  return useQuery<ApiResponse<TrainingNeedCategory>>(
    Object.keys(data) ? ['tna-category', data] : 'tna-category',
    () => getTnaCategory(data),
    {
      keepPreviousData: isKeepData,
      enabled: isEnabled,
    },
  );
};
