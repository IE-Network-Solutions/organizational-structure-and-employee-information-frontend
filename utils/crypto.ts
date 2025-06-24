import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const key = crypto
  .createHash('sha256')
  .update(String(process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-secret-key'))
  .digest(); // 32 bytes for AES-256
const ivLength = 16; // AES block size

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return iv.toString('base64') + ':' + encrypted;
};

export const decrypt = (encrypted: string): string => {
  const [ivBase64, encryptedData] = encrypted.split(':');
  const iv = Buffer.from(ivBase64, 'base64');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
