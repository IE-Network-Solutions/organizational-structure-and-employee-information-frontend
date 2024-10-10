import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useRecruitmentSettingsStore } from '@/store/uistate/features/recruitment/settings';
import { RECRUITMENT_URL } from '@/utils/constants';
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
    url: `${RECRUITMENT_URL}/application-questions-form-template?limit=${templatePageSize}&&page=${templateCurrentPage}`,
    // url: `http://172.16.35.115:8010/api/v1/application-questions-form-template?limit=${templatePageSize}&&page=${templateCurrentPage}`,
    method: 'GET',
    headers,
  });
};

export const useGetCustomFieldsTemplate = () => {
  return useQuery('customFields', getCustomFieldsTemplate);
};
