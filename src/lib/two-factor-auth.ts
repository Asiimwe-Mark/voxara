/**
 * Two-Factor Authentication (2FA) Service
 * Supports TOTP (Time-based One-Time Password) and backup codes
 */

import crypto from 'crypto';

// 2FA types
export enum TwoFAMethod {
  TOTP = 'totp',
  BACKUP_CODES = 'backup_codes',
}

export interface TwoFASetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface TwoFAStatus {
  enabled: boolean;
  method: TwoFAMethod;
  backupCodesRemaining: number;
  lastUsed?: Date;
}

/**
 * Generate a random secret for TOTP
 */
export function generateTOTPSecret(): string {
  // Generate 32 bytes of random data and convert to base32
  const randomBytes = crypto.randomBytes(32);
  return base32Encode(randomBytes);
}

/**
 * Generate QR code data URL for authenticator apps
 * This returns the data that should be encoded as a QR code
 */
export function generateQRCodeData(email: string, secret: string, appName: string = 'voxara'): string {
  // Format: otpauth://totp/AppName:email@example.com?secret=SECRET&issuer=AppName
  const encodedEmail = encodeURIComponent(email);
  const encodedAppName = encodeURIComponent(appName);
  
  return `otpauth://totp/${encodedAppName}:${encodedEmail}?secret=${secret}&issuer=${encodedAppName}`;
}

/**
 * Generate backup codes for 2FA
 * 10 codes of 8 characters each
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const code = crypto
      .randomBytes(4)
      .toString('hex')
      .toUpperCase()
      .slice(0, 8);
    
    codes.push(code);
  }
  
  return codes;
}

/**
 * Hash backup codes for secure storage
 */
export function hashBackupCode(code: string): string {
  return crypto
    .createHash('sha256')
    .update(code)
    .digest('hex');
}

/**
 * Verify a TOTP code
 * Allows for a time window of +/- 30 seconds
 */
export function verifyTOTPCode(secret: string, code: string, timeWindow: number = 1): boolean {
  const decoded = base32Decode(secret);
  
  if (!decoded) {
    return false;
  }
  
  // Get current time in 30-second intervals (Unix timestamp / 30)
  const now = Math.floor(Date.now() / 1000 / 30);
  
  // Check current code and time window
  for (let i = -timeWindow; i <= timeWindow; i++) {
    const time = now + i;
    const hmac = crypto.createHmac('sha1', decoded);
    hmac.update(Buffer.from([0, 0, 0, 0]), 0, 4);
    hmac.update(Buffer.alloc(4, 0));
    
    // Write 64-bit big-endian representation of time
    const buf = Buffer.alloc(8);
    buf.writeBigInt64BE(BigInt(time), 0);
    
    hmac.update(buf);
    const digest = hmac.digest();
    const offset = digest[digest.length - 1] & 0xf;
    const part = digest.readUInt32BE(offset) & 0x7fffffff;
    const otp = (part % 1000000).toString().padStart(6, '0');
    
    if (otp === code) {
      return true;
    }
  }
  
  return false;
}

/**
 * Generate current TOTP code (for testing)
 */
export function generateCurrentTOTPCode(secret: string): string {
  const decoded = base32Decode(secret);
  
  if (!decoded) {
    return '';
  }
  
  const now = Math.floor(Date.now() / 1000 / 30);
  const buf = Buffer.alloc(8);
  buf.writeBigInt64BE(BigInt(now), 0);
  
  const hmac = crypto.createHmac('sha1', decoded);
  hmac.update(buf);
  const digest = hmac.digest();
  const offset = digest[digest.length - 1] & 0xf;
  const part = digest.readUInt32BE(offset) & 0x7fffffff;
  const otp = (part % 1000000).toString().padStart(6, '0');
  
  return otp;
}

/**
 * Verify backup code
 */
export function verifyBackupCode(hashedCodes: string[], code: string): boolean {
  const normalized = code.replace(/\s+/g, '').toUpperCase();
  const codeHash = hashBackupCode(normalized);
  
  return hashedCodes.includes(codeHash);
}

/**
 * Use backup code (remove from list)
 */
export function useBackupCode(hashedCodes: string[], code: string): string[] {
  const normalized = code.replace(/\s+/g, '').toUpperCase();
  const codeHash = hashBackupCode(normalized);
  
  return hashedCodes.filter((hash) => hash !== codeHash);
}

/**
 * Base32 encoding (RFC 4648)
 */
function base32Encode(buffer: Buffer): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let output = '';
  
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    
    while (bits >= 5) {
      bits -= 5;
      output += alphabet[(value >> bits) & 31];
    }
  }
  
  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }
  
  // Add padding
  while (output.length % 8 !== 0) {
    output += '=';
  }
  
  return output;
}

/**
 * Base32 decoding (RFC 4648)
 */
function base32Decode(encoded: string): Buffer | null {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  const output: number[] = [];
  
  for (let i = 0; i < encoded.length; i++) {
    const char = encoded[i];
    
    if (char === '=') {
      break;
    }
    
    const index = alphabet.indexOf(char);
    
    if (index === -1) {
      return null;
    }
    
    value = (value << 5) | index;
    bits += 5;
    
    if (bits >= 8) {
      bits -= 8;
      output.push((value >> bits) & 255);
    }
  }
  
  return Buffer.from(output);
}

/**
 * Validate format of TOTP code
 */
export function isValidTOTPFormat(code: string): boolean {
  return /^\d{6}$/.test(code);
}

/**
 * Validate format of backup code
 */
export function isValidBackupCodeFormat(code: string): boolean {
  const normalized = code.replace(/\s+/g, '').toUpperCase();
  return /^[A-Z0-9]{8}$/.test(normalized);
}

export default {
  generateTOTPSecret,
  generateQRCodeData,
  generateBackupCodes,
  hashBackupCode,
  verifyTOTPCode,
  generateCurrentTOTPCode,
  verifyBackupCode,
  useBackupCode,
  isValidTOTPFormat,
  isValidBackupCodeFormat,
  TwoFAMethod,
};
