import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { CommitmentRule } from '@/types/tna';
import { TnaCommitmentRequestBody } from '@/store/server/features/tna/commitment/interface';

const getTnaCommitment = async (data: Partial<TnaCommitmentRequestBody>) => {
  return await crudRequest({
    url: `${TNA_URL}/tna/commitment`,
    method: 'POST',
    headers: requestHeader(),
    data,
  });
};

export const useGetTnaCommitment = (
  data: Partial<TnaCommitmentRequestBody>,
  isKeepData: boolean = true,
  isEnabled: boolean = true,
) => {
  return useQuery<ApiResponse<CommitmentRule>>(
    Object.keys(data) ? ['commitment', data] : 'commitment',
    () => getTnaCommitment(data),
    {
      keepPreviousData: isKeepData,
      enabled: isEnabled,
    },
  );
};
