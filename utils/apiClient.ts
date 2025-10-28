import axios from 'axios';
import { encrypt, decrypt } from './crypto';

const apiClient = axios.create();

// Helper function to check if encryption should be skipped
const shouldSkipEncryption = () => {
  // PRIMARY: Next.js public environment variable (GUARANTEED to work)
  if (process.env.NEXT_PUBLIC_ENCRYPTION_DISABLED === 'true') {
    return true;
  }

  return false;
};

// Encrypt request payload
apiClient.interceptors.request.use(async (config) => {
  if ((config as any).skipEncryption) {
    return config;
  }

  // Use the guaranteed check
  if (shouldSkipEncryption()) {
    return config;
  }

  if (config.data instanceof FormData) {
    try {
      // Convert FormData to an object first
      const formDataObj: Record<string, any> = {};
      for (const [key, value] of config.data.entries()) {
        formDataObj[key] = value;
      }

      // Encrypt the converted object
      const encryptedPayload = await encrypt(JSON.stringify(formDataObj));
      config.data = { data: encryptedPayload };
    } catch (err) {
      throw err;
    }
  } else if (config.data && typeof config.data === 'object') {
    try {
      const encryptedPayload = await encrypt(JSON.stringify(config.data));
      config.data = { data: encryptedPayload };
    } catch (err) {
      throw err;
    }
  }
  return config;
});

// Decrypt response payload
apiClient.interceptors.response.use(async (response) => {
  const data = response.data;

  // If skipEncryption is true in config, don't decrypt
  if ((response.config as any).skipEncryption) {
    return response;
  }

  // Use the guaranteed check
  if (shouldSkipEncryption()) {
    return response;
  }

  // If response is a Blob (binary file download), don't decrypt
  if (data instanceof Blob) {
    return response;
  }

  // Handle case where encrypted data is directly in data field
  if (data && typeof data === 'string') {
    try {
      const decryptedPayload = await decrypt(data);
      response.data = JSON.parse(decryptedPayload);
    } catch (err) {
      return response;
    }
  }
  // Handle case where encrypted data is nested under data.data
  else if (data?.data && typeof data.data === 'string') {
    try {
      const decryptedPayload = await decrypt(data.data);
      response.data = JSON.parse(decryptedPayload);
    } catch (err) {
      return response;
    }
  }

  return response;
});

export default apiClient;
