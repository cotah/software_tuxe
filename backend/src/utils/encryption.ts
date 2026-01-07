import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';

dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

function getEncryptionKey(): string {
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY is required for encryption. Set it in your environment variables.');
  }
  return ENCRYPTION_KEY;
}

/**
 * Encrypt sensitive data (PII, API keys, etc.)
 */
export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, getEncryptionKey()).toString();
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encryptedText: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedText, getEncryptionKey());
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Hash data (one-way, for non-sensitive identifiers)
 */
export function hash(text: string): string {
  return CryptoJS.SHA256(text).toString();
}

export default {
  encrypt,
  decrypt,
  hash,
};

