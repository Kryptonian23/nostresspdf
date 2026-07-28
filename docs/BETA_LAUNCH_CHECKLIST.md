# Beta launch checklist

The repository defaults to a controlled beta. `NEXT_PUBLIC_BETA_MODE=true` keeps the beta notice visible, and beta builds will not enable an API identified as live by `NEXT_PUBLIC_BILLING_MODE=live`.

## Code-side release gate

- Run `npm ci`, `npm run check`, and `npm run build` with Node 22.13 or newer.
- Run `npm test` in `infra/billing`.
- Confirm the secret-scanning and dependency-review workflows pass.
- Keep the unsupported tools marked `disabled` in `src/config/tools.ts` until their behavior and claims have dedicated tests.
- Test merge, split, compression, conversion, signing, account access, plan gating, checkout, plan changes, and cancellation in the deployed beta.
- Verify Chrome, Firefox, Safari, Edge, Android, and iOS layouts using synthetic documents.

## Owner actions before inviting testers

- Choose the final domain and set `NEXT_PUBLIC_SITE_URL` to its HTTPS origin.
- Create a reviewed support address and replace the temporary Contact-page wording.
- Verify the operating identity, Terms, Privacy Policy, refund policy, and trademark position. The beta text is not a substitute for legal review.
- Keep Cognito and Stripe in isolated sandbox/test environments. Do not enable live Stripe keys or prices during beta.
- Configure AWS budgets, billing alarms, least-privilege deployment access, CloudFront security headers, access logs, and API rate limits.
- Set production Cognito callback/logout URLs only after the final HTTPS domain works.
- Run a restore test for infrastructure configuration and confirm no secrets are stored in Git or frontend environment variables.

## Paid-launch gate

Do not set `NEXT_PUBLIC_BETA_MODE=false` or `NEXT_PUBLIC_BILLING_MODE=live` until the business identity, domain, policies, support channel, live Stripe account, production Cognito stack, monitoring, backups, and end-to-end live-payment tests are complete.
