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
| Product photos | `public/images/` (`.webp` for the site, `.jpg` for social share previews) |
| Colors and layout | `src/styles/global.css` |

## Run locally

```bash
npm install
npm run dev
```

## Deploy on Cloudflare Pages (free)

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → pick this repo.
2. Build settings: Framework **Astro**, build command `npm run build`, output directory `dist`.
3. **Settings → Variables and Secrets** → add secret `STRIPE_SECRET_KEY` (from Stripe → Developers → API keys). Use a `sk_test_…` key first, test an order, then switch to `sk_live_…`.
4. **Custom domains** → add `sugarkrewe.com` and `www.sugarkrewe.com`. The domain is already on Cloudflare, so it connects automatically.
5. Once the Cloudflare version works, turn off the Netlify site so there is only one.

Every push to the main branch redeploys automatically.

## Before going live — owner checks

- **Halal:** products marked Halal list beef gelatine. Only keep the Halal label if the gelatine is from a certified-halal source, and keep that paperwork.
- **Fat Free:** the recipes include palm/coconut oil. Confirm a serving has under 0.5 g fat (the FDA rule for "fat free").
- **Cottage food rules:** check with the Louisiana Department of Health whether cottage food products can be shipped, and to where. Checkout currently allows any US address; it can be limited to Louisiana in `checkout.js`.
- Add your Instagram / Facebook / TikTok links in `src/data/site.js`.

## Old site

`sugarkrewe-simple/` is the old Netlify version. It stays until the Cloudflare
site is live on sugarkrewe.com, then it can be deleted (and the Netlify site turned off).
