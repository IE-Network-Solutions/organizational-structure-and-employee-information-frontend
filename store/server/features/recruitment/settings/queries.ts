import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useRecruitmentSettingsStore } from '@/store/uistate/features/recruitment/settings';
import { RECRUITMENT } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

const getCustomFieldsTemplate = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const templateCurrentPage =
    useRecruitmentSettingsStore.getState().templateCurrentPage;
  const templatePageSize =
    useRecruitmentSettingsStore.getState().templatePageSize;

  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };
  return await crudRequest({
    // url: `${RECRUITMENT}/application-questions-form-template`,
    url: `http://172.16.33.228:8010/api/v1/application-questions-form-template?limit=${templatePageSize}&&page=${templateCurrentPage}`,
    // url: 'https://mocki.io/v1/77d848f4-1a44-4a30-8216-4154587e01b1',
    method: 'GET',
    headers,
  });
};

export const useGetCustomFieldsTemplate = () => {
  return useQuery('customFields', getCustomFieldsTemplate);
};
