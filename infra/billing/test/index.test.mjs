import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isBlockingSubscriptionStatus,
  normalizeSubscriptionStatus,
  planForPrice,
  publicEntitlement,
  selectCanonicalSubscription,
  validateReturnUrl,
} from '../src/index.mjs';

const prices = {
  PRICE_PERSONAL_MONTHLY: 'price_personal_monthly',
  PRICE_PERSONAL_ANNUAL: 'price_personal_annual',
  PRICE_PROFESSIONAL_MONTHLY: 'price_professional_monthly',
  PRICE_PROFESSIONAL_ANNUAL: 'price_professional_annual',
};

test('return URLs must be an allowed account page', () => {
  assert.equal(
    validateReturnUrl('http://localhost:3000/en/account/', ['http://localhost:3000']).pathname,
    '/en/account/',
  );
  assert.throws(
    () => validateReturnUrl('https://attacker.example/en/account/', ['http://localhost:3000']),
    /allowed HushPDF account page/,
  );
  assert.throws(
    () => validateReturnUrl('http://localhost:3000/en/tools/', ['http://localhost:3000']),
    /allowed HushPDF account page/,
  );
  assert.throws(
    () => validateReturnUrl('http://localhost:3000/not-a-locale/account/', ['http://localhost:3000']),
    /allowed HushPDF account page/,
  );
  assert.throws(
    () => validateReturnUrl('http://localhost:3000/en/account/?next=evil', ['http://localhost:3000']),
    /allowed HushPDF account page/,
  );
});

test('Stripe price IDs map only to supported self-serve plans', () => {
  assert.equal(planForPrice('price_personal_annual', prices), 'personal');
  assert.equal(planForPrice('price_professional_monthly', prices), 'professional');
  assert.equal(planForPrice('price_unknown', prices), null);
});

test('Stripe statuses normalize to the public entitlement contract', () => {
  assert.equal(normalizeSubscriptionStatus('active'), 'active');
  assert.equal(normalizeSubscriptionStatus('paused'), 'past_due');
  assert.equal(normalizeSubscriptionStatus('incomplete_expired'), 'canceled');
  assert.equal(normalizeSubscriptionStatus('incomplete'), 'none');
});

test('accounts without a billing record fail closed', () => {
  assert.deepEqual(publicEntitlement(undefined, 'account-1'), {
    accountId: 'account-1',
    plan: null,
    status: 'none',
    features: [],
    trialEndsAt: null,
    currentPeriodEndsAt: null,
  });
});

test('existing chargeable subscription states block a second checkout', () => {
  for (const status of ['active', 'trialing', 'past_due', 'unpaid', 'paused', 'incomplete']) {
    assert.equal(isBlockingSubscriptionStatus(status), true, status);
  }
  for (const status of ['canceled', 'incomplete_expired', undefined]) {
    assert.equal(isBlockingSubscriptionStatus(status), false, String(status));
  }
});

test('webhook reconciliation keeps the highest-priority current subscription', () => {
  const selected = selectCanonicalSubscription([
    { id: 'sub_old', status: 'canceled', created: 100 },
    { id: 'sub_past_due', status: 'past_due', created: 300 },
    { id: 'sub_active', status: 'active', created: 200 },
  ]);
  assert.equal(selected.id, 'sub_active');

  const newestCanceled = selectCanonicalSubscription([
    { id: 'sub_first', status: 'canceled', created: 100 },
    { id: 'sub_latest', status: 'canceled', created: 200 },
  ]);
  assert.equal(newestCanceled.id, 'sub_latest');

  const newestAccessGrant = selectCanonicalSubscription([
    { id: 'sub_old_active', status: 'active', created: 100 },
    { id: 'sub_new_trial', status: 'trialing', created: 200 },
  ]);
  assert.equal(newestAccessGrant.id, 'sub_new_trial');
});
