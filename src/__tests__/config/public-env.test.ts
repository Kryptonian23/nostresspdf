import { describe, expect, it } from 'vitest';
import { validatePublicEnvironment } from '../../../scripts/validate-public-env.mjs';

describe('public production environment validation', () => {
  it('rejects a production web build without a public HTTPS URL', () => {
    expect(validatePublicEnvironment({ NODE_ENV: 'production' })).toContain(
      'NEXT_PUBLIC_SITE_URL is required for a production web build.',
    );
  });

  it('allows desktop builds without a public URL', () => {
    expect(validatePublicEnvironment({ NODE_ENV: 'production', TAURI_ENV: 'true' })).toEqual([]);
  });

  it('forbids live billing in beta', () => {
    const errors = validatePublicEnvironment({
      NODE_ENV: 'production',
      NEXT_PUBLIC_SITE_URL: 'https://beta.example.invalid',
      NEXT_PUBLIC_BETA_MODE: 'true',
      NEXT_PUBLIC_BILLING_MODE: 'live',
    });
    expect(errors).toContain('Live billing is forbidden while NEXT_PUBLIC_BETA_MODE is enabled.');
  });

  it('requires the public service identifiers for a live launch', () => {
    const errors = validatePublicEnvironment({
      NODE_ENV: 'production',
      NEXT_PUBLIC_SITE_URL: 'https://nostresspdf.example',
      NEXT_PUBLIC_BETA_MODE: 'false',
      NEXT_PUBLIC_BILLING_MODE: 'live',
    });
    expect(errors).toHaveLength(4);
  });
});
