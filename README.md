# Sugar Krewe website

New Orleans inspired gummies — https://sugarkrewe.com

Static [Astro](https://astro.build) site hosted free on **Cloudflare Pages**, with
Stripe Checkout handled by a Cloudflare Pages Function (`functions/api/checkout.js`).

## Where to change things

| What | File |
|---|---|
| Products, descriptions, ingredients | `src/data/products.js` |
| Price, shipping, email, social links | `src/data/site.js` |
| Price actually charged at checkout | `functions/api/checkout.js` (keep in sync with `site.js`) |
| Halal certificates (page at /halal) | put files in `public/halal/`, then edit `HALAL_CERTS` in `src/data/site.js` |
| Product photos | `public/images/` (`.webp` for the site, `.jpg` for social share previews) |
| Colors and layout | `src/styles/global.css` |

## Run locally

```bash
npm install
npm run dev
```

## Deploy on Cloudflare (free)

This runs as a **Cloudflare Worker** with static assets (`wrangler.jsonc`):
the built site in `dist/` is served as files, and `worker/index.js` handles
`POST /api/checkout` using `functions/api/checkout.js`.

1. Cloudflare → **Workers & Pages** → the `sugarkrewe` Worker, connected to this repo, branch `main`.
2. Build command `npm run build`, deploy command `npx wrangler deploy`, root directory `/`.
3. **Settings → Variables and Secrets** → add a **Secret** named `STRIPE_SECRET_KEY`. Test with a `sk_test_…` key first, then switch to `sk_live_…`.
4. **Settings → Domains & Routes** → add custom domains `sugarkrewe.com` and `www.sugarkrewe.com`.

Every push to `main` redeploys automatically.

## Before going live — owner checks

- **Halal:** products marked Halal list beef gelatine. Only keep the Halal label if the gelatine is from a certified-halal source, and keep that paperwork.
- **Fat Free:** the recipes include palm/coconut oil. Confirm a serving has under 0.5 g fat (the FDA rule for "fat free").
- **Cottage food rules:** check with the Louisiana Department of Health whether cottage food products can be shipped, and to where. Checkout currently allows any US address; it can be limited to Louisiana in `checkout.js`.
- Add your Instagram / Facebook / TikTok links in `src/data/site.js`.

## Instagram posting

`social/` holds the scheduled Instagram posts (`schedule.json`, `CAPTIONS.txt`);
the images are served from `public/social/`. `social/ig-post.sh <n>` publishes
post `n` to @sugarkrewegummies through Meta's Graph API. The access token lives
in the Claude cloud environment (injected for graph.facebook.com), not in this repo.
