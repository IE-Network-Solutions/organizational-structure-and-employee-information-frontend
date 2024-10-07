import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import { ORG_AND_EMP_URL, RECRUITMENT_URL } from '@/utils/constants';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { Candidate } from '@/types/dashboard/recruitment/talentPool';

/* eslint-disable @typescript-eslint/naming-convention */

// Fetch token and tenantId from the authentication store
const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
const headers = {
  tenantId: tenantId,
  Authorization: `Bearer ${token}`,
};

/**
 * Create a new candidate in the talent pool.
 * @param data - Candidate data to be created.
 * @returns Promise with the created candidate data.
 */
const createTalentPoolCandidate = async (data:any) => {
  return await crudRequest({
    url: `${RECRUITMENT_URL}/talent-pool`,
    method: 'POST',
    data,
    headers,
  });
};
/**
 * Update an existing talent pool candidate.
 * @param id - ID of the candidate to update.
 * @param data - Updated candidate data.
 * @returns Promise with the updated candidate data.
 */
const updateTalentPoolCandidate = async (id: string, data: Candidate) => {
  return await crudRequest({
    url: `${RECRUITMENT_URL}/recruitment/candidates/${id}`,
    method: 'PATCH',
    data,
    headers,
  });
};

/**
 * Delete a candidate from the talent pool.
 * @param id - ID of the candidate to delete.
 * @returns Promise confirming the deletion.
 */
const deleteTalentPoolCandidate = async (id: string) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/recruitment/candidates/${id}`,
    method: 'DELETE',
    headers,
  });
};


const moveTalentPoolToandidate = async({taletnPoolId, jobInformations}:any) =>{
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/talent-pool/transfer-talent-pool-to-candidate/${taletnPoolId}`,
    method: 'POST',
    data:jobInformations.
    headers,
  });

}

/**
 * Custom hook to create a new talent pool candidate using react-query.
 * Invalidate the "talentPool" query on success to refresh the data.
 * @returns Mutation object for creating a talent pool candidate.
 */
export const useCreateTalentPoolCandidate = () => {
  const queryClient = useQueryClient();
  return useMutation(createTalentPoolCandidate, {
    onSuccess: () => {
      queryClient.invalidateQueries('talentPool');
      handleSuccessMessage('POST');
    },
  });
};

/**
 * Custom hook to update an existing talent pool candidate using react-query.
 * Invalidate the "talentPool" query on success to refresh the data.
 * @returns Mutation object for updating a talent pool candidate.
 */
export const useUpdateTalentPoolCandidate = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: { id: string; candidate: Candidate }) =>
      updateTalentPoolCandidate(data.id, data.candidate),
    {
      onSuccess: (_, variables: any) => {
        queryClient.invalidateQueries('talentPool');
        const method = variables?.method?.toUpperCase();
        handleSuccessMessage(method || 'PATCH');
      },
    }
  );
};

/**
 * Custom hook to delete a candidate from the talent pool using react-query.
 * Invalidate the "talentPool" query on success to refresh the data.
 * @returns Mutation object for deleting a talent pool candidate.
 */
export const useDeleteTalentPoolCandidate = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteTalentPoolCandidate, {
    onSuccess: () => {
      queryClient.invalidateQueries('talentPool');
      handleSuccessMessage('DELETE');
    },
  });
};


/**
 * Custom hook to move a talent pool to candidate from the talent pool using react-query.
 * Invalidate the "talentPool" query on success to refresh the data.
 * @returns Mutation object for deleting a talent pool candidate.
 */
export const useMoveTalentPoolToCandidates =()  => {
  const queryClient = useQueryClient();
  return useMutation(moveTalentPoolToandidate, {
    onSuccess: () => {
      queryClient.invalidateQueries('talentPool');
      handleSuccessMessage('POST');
    },
  });
};

/* eslint-disable @typescript-eslint/naming-convention */
