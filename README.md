# Fumount Headless Storefront

## Frontend design update

The updated homepage has five benefits followed by four Best Sellers. The six
designs live on `/collections/all`, with two collections at `/collections/ritual`
and `/collections/treasury`. The original Shopify product, cart, account and
checkout implementation remains in place.

### Preview without Shopify access

```bash
npm ci
npm run dev:preview
```

Open `http://localhost:3000`. This builds and renders the actual Hydrogen app in
a local Node preview, including on Windows machines where Workerd cannot start.
It uses an in-memory session, leaves `.env` untouched and makes no store requests.
Purchasing and account features are unavailable in this visual preview. After
editing source, restart the command to rebuild. Normal connected development
continues to use `npm run dev` with the store's existing environment settings.

### Connect only confirmed matching products

Six designs are defined in `app/lib/catalogue.ts`. The storefront keeps them
visible even if Shopify has fewer products or is unavailable. An unmatched
design opens a local preview, with no invented price or purchase button.

When the real store is connected, matching uses an exact design handle or
collection/name combination, an explicit product/variant metafield, or a matching
colour variant under a clearly identified Ritual/Treasury product. The optional
Storefront-visible metafield is `custom.fumount_design_key`; its value must be one
of:

- `ritual-ivory`
- `ritual-ink`
- `treasury-vermilion`
- `treasury-imperial-gold`
- `treasury-walnut`
- `treasury-marble`

Matched cards link to the actual Shopify product and selected colour variant,
using its actual price and existing cart/checkout flow. Ambiguous matches stay
unlinked. No Shopify products are created or changed by this migration.
The matching rules have offline checks via `npm run test:catalogue`.

The fork runs frontend checks on push. The existing Oxygen deployment workflow
is restricted to the original `jackyuyz/fumount-web` repository; pushing this fork
does not deploy the original store.

This repository contains the Hydrogen storefront for the **Fumount Shopify account** (`fumount.com`).

## About Fumount

Fumount is a luxury incense brand rooted in Eastern wisdom and designed for modern ritual living.  
The brand focuses on premium botanicals, small-batch craftsmanship, and calm, refined sensory experiences.

## Live URL

Current accessible storefront URL:

- [https://fumount-0ef55f8c404167a921f4.o2.myshopify.dev/](https://fumount-0ef55f8c404167a921f4.o2.myshopify.dev/)

## Tech Stack

- Shopify Hydrogen
- React Router
- Shopify Storefront API
- Shopify Oxygen
- Tailwind CSS
- TypeScript

## Local Development

### Requirements

- Node.js 22+ (or compatible with project engines)
- npm
- Shopify CLI access to the Fumount store

### Install dependencies

```bash
npm install
```

### Run locally (default storefront work)

Use this for regular storefront development (home, product, collection, cart, etc.):

```bash
npm run dev
```

If `npm run dev` gets stuck on codegen, run:

```bash
npx shopify hydrogen dev
```

### Run locally for Customer Account routes (`/account`)

Use this when testing login/account pages such as `/account`, `/account/orders`, `/account/profile`.
Customer Account OAuth does not work on plain `localhost`.

```bash
npx shopify hydrogen dev --customer-account-push
```

After startup, open the `https://*.tryhydrogen.dev` tunnel URL shown in the terminal.
Do not use `http://localhost:3000` for `/account` flows.

## Build

```bash
npm run build
```

## Deploy to Shopify Oxygen

Manual deploy:

```bash
npx shopify hydrogen deploy
```

Typical production workflow:

1. Commit and push changes to the production branch (usually `main`).
2. If GitHub auto-deploy is connected in the Shopify Hydrogen channel, Oxygen deploys automatically.
3. Otherwise, run `npx shopify hydrogen deploy` manually.

## Customer Account API Notes

If you use `/account` routes, complete the Customer Account API setup:

- <https://shopify.dev/docs/custom-storefronts/building-with-the-customer-account-api/hydrogen#step-1-set-up-a-public-domain-for-local-development>
- Use `npx shopify hydrogen dev --customer-account-push` during local development for `/account` routes.
