// Cloudflare Pages Function: POST /api/checkout
// Creates a Stripe Checkout session. Prices are set HERE (server side), so a
// visitor can't change what they pay. Needs the STRIPE_SECRET_KEY secret set in
// Cloudflare Pages > Settings > Variables and Secrets.

const PRICE_CENTS = 699; // $6.99 per 4 oz bag. Keep in sync with src/data/site.js
const SHIPPING_CENTS = 599;
const FREE_SHIP_MIN_CENTS = 3500;
const MAX_QTY = 99;

const PRODUCTS = {
  'jazzberry-jamz': 'Jazzberry Jamz Gummies',
  'hurricane-blast': 'Hurricane Blast Gummies',
  'mardi-gras-ring': 'Mardi Gras Ring Gummies',
  'throw-me-a-bear': 'Throw Me A Bear! Gummies',
  'bayou-bliss': 'Bayou Bliss Gummies',
  'krewe-crawlers': 'Krewe Crawlers Gummies',
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export async function onRequestPost({ request, env }) {
  if (!env.STRIPE_SECRET_KEY) return json({ error: 'Checkout is not set up yet. Please email us to order.' }, 503);

  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid request.' }, 400); }

  const items = Array.isArray(body?.items) ? body.items : [];
  const lines = [];
  let qtyTotal = 0;
  for (const it of items) {
    const name = PRODUCTS[it?.slug];
    const qty = Math.floor(Number(it?.qty));
    if (!name || !(qty >= 1 && qty <= MAX_QTY)) return json({ error: 'Your bag has an item we could not find. Please refresh and try again.' }, 400);
    lines.push({ slug: it.slug, name, qty });
    qtyTotal += qty;
  }
  if (!lines.length) return json({ error: 'Your bag is empty.' }, 400);
  if (qtyTotal > MAX_QTY) return json({ error: `For orders over ${MAX_QTY} bags, please email us.` }, 400);

  const origin = new URL(request.url).origin;
  const subtotal = qtyTotal * PRICE_CENTS;
  const shipping = subtotal >= FREE_SHIP_MIN_CENTS ? 0 : SHIPPING_CENTS;

  const f = new URLSearchParams();
  f.set('mode', 'payment');
  f.set('success_url', `${origin}/success?session_id={CHECKOUT_SESSION_ID}`);
  f.set('cancel_url', `${origin}/shop`);
  f.set('shipping_address_collection[allowed_countries][0]', 'US');
  f.set('phone_number_collection[enabled]', 'true');
  lines.forEach((l, i) => {
    f.set(`line_items[${i}][quantity]`, String(l.qty));
    f.set(`line_items[${i}][price_data][currency]`, 'usd');
    f.set(`line_items[${i}][price_data][unit_amount]`, String(PRICE_CENTS));
    f.set(`line_items[${i}][price_data][product_data][name]`, l.name);
    f.set(`line_items[${i}][price_data][product_data][description]`, '4 oz bag');
    f.set(`line_items[${i}][price_data][product_data][metadata][slug]`, l.slug);
  });
  f.set('shipping_options[0][shipping_rate_data][type]', 'fixed_amount');
  f.set('shipping_options[0][shipping_rate_data][display_name]', shipping === 0 ? 'Free shipping' : 'Standard shipping');
  f.set('shipping_options[0][shipping_rate_data][fixed_amount][amount]', String(shipping));
  f.set('shipping_options[0][shipping_rate_data][fixed_amount][currency]', 'usd');

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: f,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) {
    console.error('Stripe error', res.status, JSON.stringify(data?.error || data));
    return json({ error: 'Checkout is unavailable right now. Please try again or email us.' }, 502);
  }
  return json({ url: data.url });
}

