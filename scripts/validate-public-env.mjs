import { fileURLToPath } from 'node:url';
import path from 'node:path';

export function validatePublicEnvironment(env = process.env) {
  const errors = [];
  const production = env.NODE_ENV === 'production';
  const tauri = env.TAURI_ENV === 'true';

  if (!production || tauri) return errors;

  const rawUrl = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!rawUrl) {
    errors.push('NEXT_PUBLIC_SITE_URL is required for a production web build.');
  } else {
    try {
      const url = new URL(rawUrl);
      if (url.protocol !== 'https:') errors.push('NEXT_PUBLIC_SITE_URL must use HTTPS.');
      if (['localhost', '127.0.0.1', '0.0.0.0'].includes(url.hostname)) {
        errors.push('NEXT_PUBLIC_SITE_URL must not use a local hostname in a production web build.');
      }
    } catch {
      errors.push('NEXT_PUBLIC_SITE_URL must be a valid absolute URL.');
    }
  }

  const beta = env.NEXT_PUBLIC_BETA_MODE !== 'false';
  const billingMode = env.NEXT_PUBLIC_BILLING_MODE || 'sandbox';
  if (beta && billingMode === 'live') {
    errors.push('Live billing is forbidden while NEXT_PUBLIC_BETA_MODE is enabled.');
  }

  if (!beta && billingMode === 'live') {
    for (const key of [
      'NEXT_PUBLIC_COGNITO_USER_POOL_ID',
      'NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID',
      'NEXT_PUBLIC_COGNITO_DOMAIN',
      'NEXT_PUBLIC_BILLING_API_URL',
    ]) {
      if (!env[key]?.trim()) errors.push(`${key} is required for a live public build.`);
    }
  }

  return errors;
}

const invokedDirectly = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  const errors = validatePublicEnvironment();
  if (errors.length) {
    console.error(`Public environment validation failed:\n- ${errors.join('\n- ')}`);
    process.exitCode = 1;
  } else {
    console.log('Public environment validation passed.');
  }
}
