import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { RECRUITMENT_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useQuery } from 'react-query';

const getCustomFieldsTemplate = async (
  templatePageSize: number,
  templateCurrentPage: number,
) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };
  return await crudRequest({
    url: `${RECRUITMENT_URL}/application-questions-form-template?limit=${templatePageSize}&&page=${templateCurrentPage}`,
    method: 'GET',
    headers,
  });
};

export const useGetCustomFieldsTemplate = (
  templatePageSize: number,
  templateCurrentPage: number,
) => {
  return useQuery(['customFields', templatePageSize, templateCurrentPage], () =>
    getCustomFieldsTemplate(templatePageSize, templateCurrentPage),
  );
};
