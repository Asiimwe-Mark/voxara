/**
 * TOTP Secret Encryption
 *
 * Encrypts TOTP secrets before storing them in the database.
 * Uses AES-256-GCM (authenticated encryption) with a key derived from
 * TOTP_ENCRYPTION_KEY (or falls back to SUPABASE_SERVICE_ROLE_KEY).
 *
 * Format stored in DB:  iv_hex:authTag_hex:ciphertext_hex
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256-bit

function getEncryptionKey(): Buffer {
  const raw = process.env.TOTP_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      'TOTP_ENCRYPTION_KEY must be set to encrypt 2FA secrets. Do not fall back to SUPABASE_SERVICE_ROLE_KEY.'
    );
  }
  // Derive a 32-byte key from the raw secret using SHA-256
  return crypto.createHash('sha256').update(raw).digest();
}

export function encryptTOTPSecret(secret: string): string {
  const key = getEncryptionKey();
  const iv  = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const ciphertext = Buffer.concat([
    cipher.update(secret, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${ciphertext.toString('hex')}`;
}

export function decryptTOTPSecret(stored: string): string {
  const parts = stored.split(':');
  if (parts.length !== 3) {
    // Legacy: if value has no colons it was stored in plaintext before this fix
    return stored;
  }
  const [ivHex, tagHex, ciphertextHex] = parts;
  const key        = getEncryptionKey();
  const iv         = Buffer.from(ivHex, 'hex');
  const authTag    = Buffer.from(tagHex, 'hex');
  const ciphertext = Buffer.from(ciphertextHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return decipher.update(ciphertext).toString('utf8') + decipher.final('utf8');
}
