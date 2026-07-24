import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import Stripe from 'stripe';

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const secretsManager = new SecretsManagerClient({});
const tableName = process.env.ACCOUNTS_TABLE_NAME;
const MAX_JSON_BODY_BYTES = 8 * 1024;
const MAX_WEBHOOK_BODY_BYTES = 256 * 1024;
const WEBHOOK_EVENT_TTL_SECONDS = 7 * 24 * 60 * 60;
const ACCOUNT_PATH = /^\/(?:en|ja|ko|es|fr|de|zh|zh-TW|pt|ar|it|id|vi|ro)\/account\/$/;
const REQUEST_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const BLOCKING_SUBSCRIPTION_STATUSES = new Set([
  'active',
  'trialing',
  'past_due',
  'unpaid',
  'paused',
  'incomplete',
]);
const SUBSCRIPTION_STATUS_PRIORITY = Object.freeze({
  active: 3,
  trialing: 3,
  past_due: 2,
  unpaid: 2,
  paused: 2,
  incomplete: 2,
  incomplete_expired: 1,
  canceled: 0,
});

const FEATURES = Object.freeze({
  personal: Object.freeze(['core-tools', 'desktop-app', 'product-updates', 'local-history']),
  professional: Object.freeze([
    'core-tools',
    'desktop-app',
    'product-updates',
    'local-history',
    'batch-processing',
    'workflow-builder',
    'advanced-ocr',
    'priority-support',
  ]),
});

let cachedSecrets;
let cachedStripe;

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'cache-control': 'no-store',
      'content-type': 'application/json; charset=utf-8',
      'x-content-type-options': 'nosniff',
    },
    body: JSON.stringify(body),
  };
}

function requestBody(event) {
  const raw = event.body ?? '';
  return event.isBase64Encoded ? Buffer.from(raw, 'base64').toString('utf8') : raw;
}

function assertBodySize(event, maximumBytes) {
  if (Buffer.byteLength(requestBody(event), 'utf8') > maximumBytes) {
    throw Object.assign(new Error('The request body is too large.'), { statusCode: 413 });
  }
}

function requireJsonContentType(event) {
  const contentType = event.headers?.['content-type'] ?? event.headers?.['Content-Type'] ?? '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    throw Object.assign(new Error('Content-Type must be application/json.'), { statusCode: 415 });
  }
}

function parseJsonBody(event) {
  assertBodySize(event, MAX_JSON_BODY_BYTES);
  requireJsonContentType(event);
  try {
    const body = JSON.parse(requestBody(event));
    if (!body || Array.isArray(body) || typeof body !== 'object') throw new Error('Invalid body');
    return body;
  } catch {
    throw Object.assign(new Error('The request body must be a valid JSON object.'), { statusCode: 400 });
  }
}

function accountIdFrom(event) {
  const accountId = event.requestContext?.authorizer?.jwt?.claims?.sub;
  if (!accountId) {
    throw Object.assign(new Error('A valid NoStressPDF account is required.'), { statusCode: 401 });
  }
  return accountId;
}

function allowedOrigins() {
  return (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function validateReturnUrl(value, origins = allowedOrigins()) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw Object.assign(new Error('A valid returnUrl is required.'), { statusCode: 400 });
  }
  if (
    !origins.includes(url.origin)
    || !ACCOUNT_PATH.test(url.pathname)
    || url.username
    || url.password
    || url.search
    || url.hash
  ) {
    throw Object.assign(new Error('returnUrl must be an allowed NoStressPDF account page.'), { statusCode: 400 });
  }
  return url;
}

export function priceMap(environment = process.env) {
  return {
    personal: {
      monthly: environment.PRICE_PERSONAL_MONTHLY,
      annual: environment.PRICE_PERSONAL_ANNUAL,
    },
    professional: {
      monthly: environment.PRICE_PROFESSIONAL_MONTHLY,
      annual: environment.PRICE_PROFESSIONAL_ANNUAL,
    },
  };
}

export function planForPrice(priceId, environment = process.env) {
  const prices = priceMap(environment);
  for (const [plan, intervals] of Object.entries(prices)) {
    if (Object.values(intervals).includes(priceId)) return plan;
  }
  return null;
}

export function publicEntitlement(item, accountId) {
  return {
    accountId,
    plan: item?.plan ?? null,
    status: item?.status ?? 'none',
    features: item?.features ?? [],
    trialEndsAt: item?.trialEndsAt ?? null,
    currentPeriodEndsAt: item?.currentPeriodEndsAt ?? null,
  };
}

export function normalizeSubscriptionStatus(status) {
  if (status === 'trialing' || status === 'active' || status === 'past_due' || status === 'canceled') {
    return status;
  }
  if (status === 'unpaid' || status === 'paused') return 'past_due';
  if (status === 'incomplete_expired') return 'canceled';
  return 'none';
}

async function stripeSecrets() {
  if (cachedSecrets) return cachedSecrets;
  const result = await secretsManager.send(new GetSecretValueCommand({
    SecretId: process.env.STRIPE_SECRET_ARN,
  }));
  const parsed = JSON.parse(result.SecretString ?? '{}');
  const stripeMode = process.env.STRIPE_MODE === 'live' ? 'live' : 'test';
  const requiredKeyPrefix = stripeMode === 'live' ? 'sk_live_' : 'sk_test_';
  if (!parsed.secretKey?.startsWith(requiredKeyPrefix) || !parsed.webhookSecret?.startsWith('whsec_')) {
    throw Object.assign(new Error(`Stripe ${stripeMode}-mode secrets are not configured.`), { statusCode: 503 });
  }
  cachedSecrets = parsed;
  return cachedSecrets;
}

async function stripeClient() {
  if (cachedStripe) return cachedStripe;
  const secrets = await stripeSecrets();
  cachedStripe = new Stripe(secrets.secretKey, { maxNetworkRetries: 2, timeout: 10_000 });
  return cachedStripe;
}

async function getAccount(accountId) {
  const result = await dynamo.send(new GetCommand({
    TableName: tableName,
    Key: { accountId },
    ConsistentRead: true,
  }));
  return result.Item;
}

async function updateAccount(accountId, values) {
  const names = {};
  const data = {};
  const assignments = [];
  for (const [key, value] of Object.entries(values)) {
    names[`#${key}`] = key;
    data[`:${key}`] = value;
    assignments.push(`#${key} = :${key}`);
  }
  names['#updatedAt'] = 'updatedAt';
  data[':updatedAt'] = new Date().toISOString();
  assignments.push('#updatedAt = :updatedAt');
  await dynamo.send(new UpdateCommand({
    TableName: tableName,
    Key: { accountId },
    UpdateExpression: `SET ${assignments.join(', ')}`,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: data,
  }));
}

async function entitlements(event) {
  const accountId = accountIdFrom(event);
  return response(200, publicEntitlement(await getAccount(accountId), accountId));
}

async function checkout(event) {
  const accountId = accountIdFrom(event);
  const { plan, interval, returnUrl, requestId } = parseJsonBody(event);
  if (typeof requestId !== 'string' || !REQUEST_ID_PATTERN.test(requestId)) {
    throw Object.assign(new Error('A valid checkout requestId is required.'), { statusCode: 400 });
  }
  const priceId = priceMap()[plan]?.[interval];
  if (!priceId || priceId.startsWith('price_replace_')) {
    throw Object.assign(new Error('That billing plan is not configured.'), { statusCode: 400 });
  }
  const returnPage = validateReturnUrl(returnUrl);
  const account = await getAccount(accountId);
  if (isBlockingSubscriptionStatus(account?.status)) {
    throw Object.assign(new Error('Manage the existing subscription in the billing portal.'), { statusCode: 409 });
  }

  const stripe = await stripeClient();
  let customerId = account?.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create(
      { metadata: { accountId } },
      { idempotencyKey: `hushpdf-customer-${accountId}` },
    );
    customerId = customer.id;
    await updateAccount(accountId, { stripeCustomerId: customerId });
  }

  // The account record is eventually consistent with Stripe webhooks. Check
  // Stripe directly as well so retries, delayed webhooks, or a stale record
  // cannot create overlapping subscriptions for the same customer.
  const existingSubscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    limit: 100,
  });
  if (existingSubscriptions.data.some((subscription) => isBlockingSubscriptionStatus(subscription.status))) {
    throw Object.assign(new Error('Manage the existing subscription in the billing portal.'), { statusCode: 409 });
  }

  const successUrl = new URL(returnPage);
  successUrl.searchParams.set('checkout', 'success');
  const cancelUrl = new URL(returnPage);
  cancelUrl.searchParams.set('checkout', 'canceled');
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    client_reference_id: accountId,
    metadata: { accountId, plan, interval, requestId },
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: { metadata: { accountId, plan, interval } },
    success_url: successUrl.toString(),
    cancel_url: cancelUrl.toString(),
  }, { idempotencyKey: `hushpdf-checkout-${accountId}-${requestId}` });
  if (!session.url) {
    throw Object.assign(new Error('Stripe did not return a Checkout URL.'), { statusCode: 502 });
  }
  return response(200, { url: session.url });
}

export function isBlockingSubscriptionStatus(status) {
  return BLOCKING_SUBSCRIPTION_STATUSES.has(status);
}

export function selectCanonicalSubscription(subscriptions) {
  return [...subscriptions].sort((left, right) => {
    const statusDifference = (SUBSCRIPTION_STATUS_PRIORITY[right.status] ?? -1)
      - (SUBSCRIPTION_STATUS_PRIORITY[left.status] ?? -1);
    if (statusDifference !== 0) return statusDifference;
    return (right.created ?? 0) - (left.created ?? 0);
  })[0] ?? null;
}

async function portal(event) {
  const accountId = accountIdFrom(event);
  const { returnUrl } = parseJsonBody(event);
  const returnPage = validateReturnUrl(returnUrl);
  const account = await getAccount(accountId);
  if (!account?.stripeCustomerId) {
    throw Object.assign(new Error('No Stripe customer exists for this account yet.'), { statusCode: 409 });
  }
  const stripe = await stripeClient();
  const session = await stripe.billingPortal.sessions.create({
    customer: account.stripeCustomerId,
    return_url: returnPage.toString(),
  });
  return response(200, { url: session.url });
}

async function syncSubscription(subscription) {
  const accountId = subscription.metadata?.accountId;
  if (!accountId) return;
  const price = subscription.items?.data?.[0]?.price?.id;
  const plan = planForPrice(price);
  const status = normalizeSubscriptionStatus(subscription.status);
  const grantsAccess = status === 'active' || status === 'trialing';
  const periodEnd = subscription.current_period_end
    ?? subscription.items?.data?.[0]?.current_period_end;
  await updateAccount(accountId, {
    stripeCustomerId: typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id,
    stripeSubscriptionId: subscription.id,
    plan,
    status,
    features: grantsAccess && plan ? FEATURES[plan] : [],
    trialEndsAt: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    currentPeriodEndsAt: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
  });
}

async function claimWebhookEvent(stripeEvent) {
  const accountId = `stripe-event#${stripeEvent.id}`;
  try {
    await dynamo.send(new PutCommand({
      TableName: tableName,
      Item: {
        accountId,
        kind: 'stripe-webhook-event',
        stripeCreatedAt: stripeEvent.created,
        expiresAt: Math.floor(Date.now() / 1000) + WEBHOOK_EVENT_TTL_SECONDS,
      },
      ConditionExpression: 'attribute_not_exists(accountId)',
    }));
    return true;
  } catch (error) {
    if (error?.name === 'ConditionalCheckFailedException') return false;
    throw error;
  }
}

async function releaseWebhookEvent(stripeEvent) {
  await dynamo.send(new DeleteCommand({
    TableName: tableName,
    Key: { accountId: `stripe-event#${stripeEvent.id}` },
  }));
}

async function webhook(event) {
  assertBodySize(event, MAX_WEBHOOK_BODY_BYTES);
  const signature = event.headers?.['stripe-signature'] ?? event.headers?.['Stripe-Signature'];
  if (!signature) return response(400, { error: 'Missing Stripe signature.' });
  const secrets = await stripeSecrets();
  const stripe = await stripeClient();
  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(requestBody(event), signature, secrets.webhookSecret);
  } catch {
    return response(400, { error: 'Invalid Stripe signature.' });
  }

  if (!(await claimWebhookEvent(stripeEvent))) {
    return response(200, { received: true, duplicate: true });
  }

  try {
    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object;
      if (session.client_reference_id && session.customer) {
        await updateAccount(session.client_reference_id, {
          stripeCustomerId: typeof session.customer === 'string' ? session.customer : session.customer.id,
        });
      }
    }
    if (
      stripeEvent.type === 'customer.subscription.created'
      || stripeEvent.type === 'customer.subscription.updated'
      || stripeEvent.type === 'customer.subscription.deleted'
    ) {
      // Stripe does not guarantee webhook delivery order. Read the current
      // subscription instead of allowing an older event payload to restore
      // stale access after a cancellation or downgrade.
      const eventSubscription = await stripe.subscriptions.retrieve(stripeEvent.data.object.id);
      const customerId = typeof eventSubscription.customer === 'string'
        ? eventSubscription.customer
        : eventSubscription.customer?.id;
      const currentSubscriptions = customerId
        ? await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 100 })
        : { data: [eventSubscription] };
      const currentSubscription = selectCanonicalSubscription(currentSubscriptions.data);
      if (currentSubscription) await syncSubscription(currentSubscription);
    }
  } catch (error) {
    // Let Stripe retry a legitimately signed event after transient failures.
    await releaseWebhookEvent(stripeEvent);
    throw error;
  }
  return response(200, { received: true });
}

export async function handler(event) {
  try {
    const routeKey = event.routeKey;
    if (routeKey === 'GET /me/entitlements') return await entitlements(event);
    if (routeKey === 'POST /billing/checkout') return await checkout(event);
    if (routeKey === 'POST /billing/portal') return await portal(event);
    if (routeKey === 'POST /billing/webhook') return await webhook(event);
    return response(404, { error: 'Not found.' });
  } catch (error) {
    console.error('Billing request failed', { name: error?.name, message: error?.message });
    return response(error?.statusCode ?? 500, {
      error: error?.statusCode ? error.message : 'The billing service could not complete the request.',
    });
  }
}
