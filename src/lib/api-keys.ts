import crypto from 'crypto';

export function generateApiKey(): { key: string; hash: string; preview: string } {
  const key = `fv_${crypto.randomBytes(32).toString('hex')}`;
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  const preview = key.slice(0, 10) + '...' + key.slice(-4);
  return { key, hash, preview };
}