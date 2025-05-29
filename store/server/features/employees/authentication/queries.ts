import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL, TENANT_MGMT_URL } from '@/utils/constants';
import axios from 'axios';
import { useMutation, useQuery } from 'react-query';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/utils/firebaseConfig';
import { message } from 'antd';

export const usePasswordReset = () => {
  return useMutation(
    async (email: string) => {
      const domainName = window.location.hostname;
      const dynamicLink = `https://${domainName}/authentication/reset-password`;
      const actionCodeSettings = {
        url: dynamicLink,
        handleCodeInApp: true,
      };
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
    },
    {
      onSuccess: () => {
        message.success('Password reset email sent! Please check your inbox.');
      },
      onError: () => {
        message.error('Error sending password reset email. Please try again.');
      },
    },
  );
};

/**
 * Function to fetch a tenant id by sending a GET request to the API
 * @param id The ID of the localId which fetch from firebase to fetch
 * @returns The response data from the API
 */
const getTenantId = async () => {
  const token = useAuthenticationStore.getState().token; // Access the latest token
  const localId = useAuthenticationStore.getState().localId;
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.get(
      `${ORG_AND_EMP_URL}/users/firebase/${localId}`,
      {
        headers,
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Custom hook to fetch a tenant ID by local ID which fetch from firebase using useQuery from react-query.
 *
 * @param localId The ID of the localId to fetch
 * @returns The query object for fetching the post.
 *
 * @description
 * This hook uses `useQuery` to fetch a single post by its ID. It returns the
 * query object containing the post data, and it keeps the previous data
 * while the new data is being fetched.
 */

const getTenantByDomainName = async (domain: string) => {
  try {
    const response = await axios.get(
      `${TENANT_MGMT_URL}/clients/get-clients/domain/name/client-data/${domain}`, // Fixed: wrapped in backticks
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getTenant = async (tenantId?: string) => {
  const tenantIdData = useAuthenticationStore.getState().tenantId ?? tenantId;
  try {
    const response = await axios.get(
      `${TENANT_MGMT_URL}/clients/${tenantIdData}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const useGetTenantByDomain = (domain: string) =>
  useQuery<any>(['domain', domain], () => getTenantByDomainName(domain), {
    keepPreviousData: true,
    enabled: false,
  });
export const useGetTenantId = () =>
  useQuery<any>(['tenantId'], () => getTenantId(), {
    keepPreviousData: true,
    enabled: false, // Disabled by default, will be triggered manually
  });
export const useGetTenant = (tenantId?: string) => {
  return useQuery<any>(
    ['tenant', tenantId],
    () => getTenant(tenantId ?? undefined),
    {
      // keepPreviousData: true,
      enabled: true, // Disabled by default, will be triggered manually
    },
  );
};
