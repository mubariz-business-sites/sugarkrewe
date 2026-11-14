// Shopping bag: stored in the visitor's browser, checked out through Stripe
// via /api/checkout (Cloudflare Pages Function), which sets the real prices.
const KEY = 'sk-cart-v1';

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '{}');
    return v && typeof v === 'object' ? v : {};
  } catch {
    return {};
  }
}
function save(cart) {
  try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch {}
}
const money = (n) => '$' + n.toFixed(2);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function initCart() {
  const cat = JSON.parse(document.getElementById('catalog').textContent);
  const bySlug = Object.fromEntries(cat.products.map((p) => [p.slug, p]));
  let cart = load();
  for (const s of Object.keys(cart)) if (!bySlug[s] || !(cart[s] > 0)) delete cart[s];

  const backdrop = document.querySelector('[data-cart]');
  const body = document.querySelector('[data-cart-body]');
  const countEls = document.querySelectorAll('[data-cart-count]');
  let lastFocus = null;

  const totalQty = () => Object.values(cart).reduce((a, b) => a + b, 0);

  function renderCount() {
    const n = totalQty();
    countEls.forEach((el) => { el.textContent = n; el.hidden = n === 0; });
  }

  function render(error = '') {
    const items = Object.entries(cart);
    if (!items.length) {
      body.innerHTML = '<p class="cart-empty">Your bag is empty. Go grab some gummies!</p><a class="btn btn-gold btn-block" href="/shop">SHOP GUMMIES</a>';
      return;
    }
    const qty = totalQty();
    const subtotal = qty * cat.price;
    const shipping = subtotal >= cat.freeShipMin ? 0 : cat.shipping;
    body.innerHTML = `
      ${items.map(([slug, q]) => {
        const p = bySlug[slug];
        return `<div class="cart-item" style="--accent:${p.accent}">
          <img src="/images/${p.img}.webp" alt="" width="64" height="52" />
          <div class="cart-item-info">
            <div class="cart-item-name">${esc(p.name)}</div>
            <div class="cart-item-flavor">${esc(p.flavor)}</div>
            <div class="qty">
              <button type="button" data-dec="${slug}" aria-label="One less ${esc(p.name)}">−</button>
              <span>${q}</span>
              <button type="button" data-inc="${slug}" aria-label="One more ${esc(p.name)}">+</button>
              <span class="cart-line">${money(q * cat.price)}</span>
            </div>
          </div>
          <button type="button" class="remove" data-remove="${slug}" aria-label="Remove ${esc(p.name)}">✕</button>
        </div>`;
      }).join('')}
      <div class="cart-totals">
        <div><span>Subtotal</span><span>${money(subtotal)}</span></div>
        <div><span>Shipping</span><span class="${shipping === 0 ? 'free' : ''}">${shipping === 0 ? 'FREE!' : money(shipping)}</span></div>
        <div class="cart-total"><span>Total</span><span>${money(subtotal + shipping)}</span></div>
      </div>
      ${error ? `<div class="cart-error" role="alert">${esc(error)}</div>` : ''}
      <button type="button" class="btn btn-gold btn-block" data-checkout>CHECKOUT WITH STRIPE</button>
      <div class="cart-note">Secure checkout by Stripe${subtotal < cat.freeShipMin ? `<br><strong>Add ${money(cat.freeShipMin - subtotal)} more for FREE shipping!</strong>` : ''}</div>`;
  }

  function open() {
    lastFocus = document.activeElement;
    render();
    backdrop.hidden = false;
    document.body.classList.add('no-scroll');
    backdrop.querySelector('[data-close-cart]').focus();
  }
  function close() {
    backdrop.hidden = true;
    document.body.classList.remove('no-scroll');
    lastFocus?.focus?.();
  }

  function add(slug, n = 1) {
    if (!bySlug[slug]) return;
    cart[slug] = Math.min(99, (cart[slug] || 0) + n);
    save(cart);
    renderCount();
  }

  async function checkout(btn) {
    btn.disabled = true;
    btn.textContent = 'REDIRECTING…';
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: Object.entries(cart).map(([slug, qty]) => ({ slug, qty })) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error || 'Checkout is unavailable right now. Please try again or email us.');
      window.location.href = data.url;
    } catch (e) {
      render(e.message);
    }
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('button, [data-open-cart]');
    if (!t) return;
    if (t.matches('[data-open-cart]')) return open();
    if (t.matches('[data-close-cart]')) return close();
    if (t.dataset.add) {
      const qtyInput = t.closest('[data-buy]')?.querySelector('[data-qty]');
      const n = qtyInput ? Math.max(1, parseInt(qtyInput.textContent, 10) || 1) : 1;
      add(t.dataset.add, n);
      const label = t.textContent;
      t.textContent = '✓ ADDED!';
      t.classList.add('added');
      setTimeout(() => { t.textContent = label; t.classList.remove('added'); }, 1200);
      return;
    }
    if (t.dataset.qtyStep) {
      const el = t.closest('[data-buy]').querySelector('[data-qty]');
      el.textContent = Math.min(99, Math.max(1, (parseInt(el.textContent, 10) || 1) + Number(t.dataset.qtyStep)));
      return;
    }
    if (t.dataset.inc) { add(t.dataset.inc); return render(); }
    if (t.dataset.dec) {
      cart[t.dataset.dec] -= 1;
      if (cart[t.dataset.dec] <= 0) delete cart[t.dataset.dec];
      save(cart); renderCount(); return render();
    }
    if (t.dataset.remove) { delete cart[t.dataset.remove]; save(cart); renderCount(); return render(); }
    if (t.matches('[data-checkout]')) return checkout(t);
  });
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !backdrop.hidden) close(); });

  renderCount();
}
