import axios from 'axios';
import { encrypt, decrypt } from './crypto';

const apiClient = axios.create();

// Encrypt request payload
apiClient.interceptors.request.use(async (config) => {

// Don't encrypt requests during build time
 const url = config.url || '';

  const shouldSkip =
    (config as any).skipEncryption ||
    url.includes('fonts.gstatic.com') ||
    url.includes('fonts.googleapis.com') ||
    url.endsWith('.woff2') ||
    url.endsWith('.ttf') ||
    url.endsWith('.otf') ||
    url.endsWith('.css')

  if (shouldSkip) {
    return config;
  }

  // If skipEncryption is true, don't encrypt
  if ((config as any).skipEncryption) {
    return config;
  }

  if (config.data && typeof config.data === 'object') {
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

  // If skipEncryption is true, don't decrypt
  if ((data as any).skipEncryption) {
    return response;
  }

  if (data?.data && typeof data.data === 'string') {
    try {
      const decryptedPayload = decrypt(data.data);
      response.data = JSON.parse(await decryptedPayload);
    } catch (err) {
      throw err
    }
  }

  return response;
});

export default apiClient;
