export const ACCOUNT_ENV_KEYS = [
  'NEXT_PUBLIC_COGNITO_USER_POOL_ID',
  'NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID',
  'NEXT_PUBLIC_COGNITO_DOMAIN',
] as const;

export interface PublicAccountConfig {
  authEnabled: boolean;
  billingEnabled: boolean;
  billingMode: 'sandbox' | 'live';
  userPoolId: string;
  userPoolClientId: string;
  cognitoDomain: string;
  billingApiUrl: string;
  missingAuthConfiguration: readonly string[];
}

function clean(value: string | undefined): string {
  return value?.trim() ?? '';
}

function cleanDomain(value: string | undefined): string {
  return clean(value).replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function cleanUrl(value: string | undefined): string {
  return clean(value).replace(/\/$/, '');
}

export function getPublicAccountConfig(): PublicAccountConfig {
  const userPoolId = clean(process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID);
  const userPoolClientId = clean(process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID);
  const cognitoDomain = cleanDomain(process.env.NEXT_PUBLIC_COGNITO_DOMAIN);
  const billingApiUrl = cleanUrl(process.env.NEXT_PUBLIC_BILLING_API_URL);
  const billingMode = process.env.NEXT_PUBLIC_BILLING_MODE === 'live' ? 'live' : 'sandbox';
  const betaMode = process.env.NEXT_PUBLIC_BETA_MODE !== 'false';
  const values = [userPoolId, userPoolClientId, cognitoDomain];
  const missingAuthConfiguration = ACCOUNT_ENV_KEYS.filter((_, index) => !values[index]);

  return {
    authEnabled: missingAuthConfiguration.length === 0,
    // A beta build must never be able to reach a live billing API accidentally.
    billingEnabled:
      missingAuthConfiguration.length === 0 &&
      billingApiUrl.length > 0 &&
      !(betaMode && billingMode === 'live'),
    billingMode,
    userPoolId,
    userPoolClientId,
    cognitoDomain,
    billingApiUrl,
    missingAuthConfiguration,
  };
}
