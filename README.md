# TailorCV AI

A full-stack SaaS starter for generating truthful, ATS-friendly CVs and tailored cover letters. It uses Next.js App Router, PostgreSQL/Prisma, Auth.js, GPT-4o Structured Outputs, Paddle Billing, and client-side PDF export.

The product is deliberately a **single $25 USD Lifetime Access purchase**. Generation APIs enforce premium access at the server boundary; the browser cannot grant itself access.

## Project structure

```text
ai-resume-saas/
├── app/
│   ├── (auth)/sign-in, register/      # Auth views
│   ├── api/
│   │   ├── auth/                       # Auth.js + password sign-up
│   │   ├── base-profiles/              # Own-profile CRUD
│   │   ├── generate/                   # Premium-only GPT-4o routes
│   │   ├── payments/checkout/          # Server-created Paddle transaction
│   │   └── webhooks/paddle/            # Raw-body, signed event receiver
│   ├── dashboard/                      # History, profile, generation, preview
│   ├── pricing/                        # $25 Lifetime Access checkout
│   └── page.tsx                        # Marketing page
├── components/                         # Responsive app and shadcn-compatible UI components
├── lib/                                # Auth, authorization, prompts, validators, Paddle, Prisma
├── prisma/schema.prisma                # PostgreSQL models and Auth.js adapter tables
├── proxy.ts                            # Edge-safe dashboard auth redirect
├── types/                              # Auth.js and document contracts
└── .env.example                        # Required configuration names
```

## Local setup

Prerequisites: Node.js 20.9+ and PostgreSQL 15+.

```powershell
cd C:\Users\USER\Desktop\ai-resume-saas
Copy-Item .env.example .env.local
npm install
npx prisma migrate dev --name init
npm run dev
```

Open `http://localhost:3000`. Before running generation or checkout, fill the corresponding values in `.env.local`.

```powershell
npm run lint
npm run build
```

## Environment configuration

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Long random Auth.js secret; generate with `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Google OAuth credentials; authorize `<app-url>/api/auth/callback/google` |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | OpenAI credential and model, defaulting to `gpt-4o` |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | Paddle.js client token — safe for the browser |
| `NEXT_PUBLIC_PADDLE_ENVIRONMENT` | `sandbox` locally, `production` when live |
| `PADDLE_API_KEY` | Server-only Paddle API key |
| `PADDLE_LIFETIME_PRICE_ID` | A Paddle one-time $25 USD price ID |
| `PADDLE_WEBHOOK_SECRET_KEY` | Secret for the configured Paddle notification destination |
| `NEXT_PUBLIC_APP_URL` | Canonical application URL |

Never commit `.env.local`, server API keys, or webhook secrets.

## Database model

`prisma/schema.prisma` defines the requested data model:

- `User`: credentials, Auth.js identity, `plan`, `isPremium`, and Paddle customer reference.
- `BaseProfile`: reusable truthful candidate data stored as typed JSON sections.
- `GeneratedDocument`: generated resume/letter content, target role, source profile, model, and timestamps.
- `PaymentTransaction`: one Paddle transaction per checkout plus amount, status, and raw payload.

It also includes Auth.js adapter tables and `PaddleWebhookEvent`, a small append-only event ledger that makes retried webhooks idempotent.

## Payment setup: Paddle Billing

Paddle is used as merchant of record. Its documentation says it supports software businesses anywhere except its published unsupported-country list (which does not include Bangladesh), and its sales-country list includes Bangladesh in USD. Confirm business approval, payout method, and current policy in your Paddle account before going live.

1. Create a one-time product and a **USD 25.00** price in Paddle Billing.
2. Add its `pri_...` ID as `PADDLE_LIFETIME_PRICE_ID`.
3. Create a notification destination at:

   ```text
   https://your-domain.com/api/webhooks/paddle
   ```

4. Subscribe it to `transaction.paid`, `transaction.completed`, and optionally `transaction.payment_failed`.
5. Copy that destination's secret into `PADDLE_WEBHOOK_SECRET_KEY`.
6. Test with Paddle's sandbox checkout and webhook simulator before using production tokens.

The checkout endpoint is intentionally server-side and never accepts a price or user ID from the browser. It creates a transaction with Paddle's fixed price ID and writes `{ userId, product: "lifetime_access" }` as transaction custom data. Paddle Checkout receives only the returned transaction ID.

The webhook reads the untouched request body, validates `Paddle-Signature` with a SHA-256 HMAC and short replay window, confirms the transaction exists locally, records the unique event ID, and atomically sets `User.plan = LIFETIME_PREMIUM` and `User.isPremium = true` after payment. Current Paddle Billing's successful-payment events are `transaction.paid` and `transaction.completed`; `order.successful` is not a current Paddle Billing event name.

## API surface

| Method / route | Access | Purpose |
| --- | --- | --- |
| `POST /api/auth/register` | Public | Validated email/password account creation with bcrypt hashing |
| `GET, POST /api/base-profiles` | Signed in | List/create the current user's profiles |
| `PATCH, DELETE /api/base-profiles/:id` | Owner | Update/delete an owned profile |
| `POST /api/generate/resume` | Lifetime | Generate and persist an ATS-ready CV |
| `POST /api/generate/cover-letter` | Lifetime | Generate and persist a role-specific letter |
| `POST /api/payments/checkout` | Signed in | Create fixed-price Paddle transaction |
| `POST /api/webhooks/paddle` | Paddle only | Verify, deduplicate, and fulfill payments |

The generation routes validate input with Zod, query a profile by both `id` and `userId`, and check premium entitlement again in the route handler. UI guards exist for clarity; server-side checks are the actual security control.

## AI contracts and prompts

The exact system prompts live in `lib/prompts.ts`. They impose the key safety rule: the model may select, reorder, and rephrase only candidate-provided information and may never invent employers, titles, metrics, dates, skills, or accomplishments. `lib/document-schemas.ts` uses GPT-4o JSON Schema Structured Outputs, so the renderer always receives a validated resume or letter-shaped JSON object rather than free-form HTML.

## Production checklist

- Run the initial migration against a managed PostgreSQL database and enable automated backups.
- Set a unique production `AUTH_SECRET`, HTTPS `NEXT_PUBLIC_APP_URL`, and Google OAuth redirect URI.
- Create Paddle sandbox and production notification destinations separately; do not reuse secrets.
- Add a production rate limiter (for example Upstash Redis) around auth registration and both generation endpoints before public launch.
- Add observability/error tracking, retention/deletion controls, a privacy policy, terms, refund policy, and a support address.
- Review the documents before use; generated content is constrained to the supplied profile but users remain responsible for factual accuracy.

## Verification

This scaffold was validated with:

```text
npm run lint
npm run build
```

The build completes successfully with Next.js 16.4.0, Prisma client generation, TypeScript checks, and production route compilation.
