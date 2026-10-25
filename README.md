# Peel Supply

Limited-run die-cut sticker store. Same design system and layout as the Au
Peptide Labs storefront, rebuilt as its own Next.js app.

## Run it

```bash
npm install          # .npmrc sets legacy-peer-deps (canary Next)
cp .env.example .env.local   # fill in at least the Supabase URL + publishable key
npm run dev
```

With only the publishable key the shop, product pages and cart work (the
catalogue is publicly readable). Placing and looking up orders needs
`SUPABASE_SECRET_KEY`, and order pages need `ORDER_STATUS_LINK_SECRET`.

## Pages

| Route | What |
| --- | --- |
| `/` | Hero with featured designs, facts strip, Drop 01 grid, collections, full set, FAQ, drop alerts |
| `/shop`, `/collections/[slug]` | Every sticker (filter, sort, `?q=` search) and one page per collection |
| `/product/[slug]` | Size picker, quantity, add to cart, edition size and copies left, sold-out drop alert |
| `/cart`, `/checkout` | Cart, then a bank-transfer checkout (desktop summary column, phone bottom bar) |
| `/order-status`, `/order-status/[orderNumber]` | Track Order lookup, and the signed order page with bank details while unpaid |
| `/about`, `/faq`, `/contact` | Content; the contact form emails `ORDER_ALERT_EMAIL` through Resend |
| `/shipping-policy`, `/refund-policy`, `/terms-of-service`, `/privacy-policy` | Policies, rendered from `SHIPPING_FACTS` and `order-policy.ts` |

Layout and Tailwind classes are ported from the matching Au Peptide Labs
pages, so the two stores look the same apart from the logo, images and copy.

## Data

Everything lives in the Au Peptide Labs Supabase project, in its own tables:

| Table | What | Who can read |
| --- | --- | --- |
| `sticker_products` | One row per design (edition size, finish, image) | Public (visible rows) |
| `sticker_variants` | Sizes, AUD price, stock | Public (visible products) |
| `sticker_orders` | Orders, priced and stock-checked by `place_sticker_order()` | Service role |
| `sticker_subscribers` | Drop-alert signups | Service role |

Migrations are in `supabase/migrations/`. To add a drop: insert products and
variants (stock per size must add up to `edition_size`), add the images under
`public/images/stickers/`, and add a collection in `app/lib/collections.ts`.

### Orders

1. Checkout posts variant ids + quantities to `/api/orders`.
2. `place_sticker_order()` prices from `sticker_variants`, locks and
   decrements stock, applies `SHIPPING_FACTS`, and writes the order.
3. The buyer lands on a signed order page with the bank details; a
   confirmation email goes out if Resend is configured.
4. Mark an order paid/shipped in the Supabase table editor (`status`,
   `paid_at`, `tracking_number`, `shipped_at`).
5. `/api/cron/cancel-stale-orders` (hourly) cancels orders still unpaid after
   48 hours and puts their stock back.

## Deploy

Vercel, region `syd1`. Set the env vars from `.env.example`, including
`CRON_SECRET` (Vercel Cron sends it as a bearer token).
