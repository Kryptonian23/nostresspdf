import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const template = readFileSync(resolve(process.cwd(), 'infra/hosting-staging.yaml'), 'utf8');
const wafTemplate = readFileSync(resolve(process.cwd(), 'infra/waf-cloudfront.yaml'), 'utf8');
const budgetTemplate = readFileSync(resolve(process.cwd(), 'infra/cost-controls.yaml'), 'utf8');

describe('static hosting security', () => {
  it('keeps the origin private and encrypted', () => {
    expect(template).toContain('OriginAccessControl');
    expect(template).toContain('RestrictPublicBuckets: true');
    expect(template).toContain('SSEAlgorithm: AES256');
  });

  it('retains rollback versions without retaining them forever', () => {
    expect(template).toMatch(/VersioningConfiguration:\s+Status: Enabled/);
    expect(template).toMatch(/NoncurrentVersionExpiration:\s+NoncurrentDays: 30/);
  });

  it('enforces browser isolation and a content security policy', () => {
    expect(template).toContain("default-src 'self'");
    expect(template).toContain("object-src 'none'");
    expect(template).toContain("frame-ancestors 'none'");
    expect(template).toContain('Cross-Origin-Opener-Policy');
    expect(template).toContain('Cross-Origin-Embedder-Policy');
    expect(template).toContain('Permissions-Policy');
  });

  it('supports managed WAF rules, per-IP rate limiting, and spend alerts', () => {
    expect(template).toContain('WebACLId:');
    expect(wafTemplate).toContain('AWSManagedRulesCommonRuleSet');
    expect(wafTemplate).toContain('RateBasedStatement');
    expect(budgetTemplate).toContain('NotificationType: FORECASTED');
    expect(budgetTemplate).toContain('NotificationType: ACTUAL');
  });
});
