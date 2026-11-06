(function () {
  const S = window.MazbootScore;
  const I18N = window.MAZBOOT_I18N;
  const $app = document.getElementById('app');
  const CAT_ICONS = { groceries: '🛒', dining: '🍽️', online: '📦', bills: '💡', fuel: '⛽', abroad: '✈️' };
  const SLIDER_MAX = { groceries: 5000, dining: 3000, online: 3000, bills: 3000, fuel: 1500, abroad: 6000 };

  // ---------- State ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem('mz_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('mz_' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  };
  const state = {
    lang: store.get('lang', 'ar'),
    owned: store.get('owned', []),
    spend: store.get('spend', { groceries: 1500, dining: 800, online: 600, bills: 700, fuel: 400, abroad: 500 }),
    onboarded: store.get('onboarded', false),
    filters: { sharia: false, noFee: false },
    which: { merchant: null, amount: 200 },
    data: null
  };
  const save = () => { store.set('lang', state.lang); store.set('owned', state.owned); store.set('spend', state.spend); store.set('onboarded', state.onboarded); };

  // ---------- Helpers ----------
  const t = () => I18N[state.lang];
  const L = (obj, base) => obj[`${base}_${state.lang}`] || obj[`${base}_en`] || '';
  const fmt = n => Math.round(n).toLocaleString('en-US');
  const sar = n => state.lang === 'ar' ? `${fmt(n)} <span class="cur">ريال</span>` : `<span class="cur">SAR</span> ${fmt(n)}`;
  const sarText = n => state.lang === 'ar' ? `${fmt(n)} ريال` : `SAR ${fmt(n)}`;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cardById = id => state.data.cards.find(c => c.id === id);

  function bestOwnedNet() {
    const owned = state.data.cards.filter(c => state.owned.includes(c.id));
    if (!owned.length) return 0;
    return Math.max(0, ...owned.map(c => S.scoreCard(c, state.spend).net));
  }
  function bestNet() { const r = S.rankCards(state.data.cards, state.spend); return r.length ? Math.max(0, r[0].score.net) : 0; }

  function toast(msg) {
    const el = document.createElement('div');
    el.className = 'toast'; el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 2600);
  }

  function miniCard(card, extraClass = '') {
    return `<div class="minicard ${extraClass}" style="background:linear-gradient(135deg,${card.colors[0]},${card.colors[1]})">
      <span class="mc-bank">${esc(L(card, 'bank'))}</span><span class="mc-net">${esc(card.network)}</span></div>`;
  }

  // ---------- Router ----------
  const history = [];
  let current = null;
  function go(screen, opts = {}) {
    if (current && !opts.replace) history.push(current);
    current = screen;
    render();
    window.scrollTo(0, 0);
  }
  function back() {
    if (!history.length) return false;
    current = history.pop();
    render();
    return true;
  }
  window.handleBack = back; // called by the Android back button

  const TABS = ['home', 'which', 'benefits', 'report'];
  function nav(active) {
    const icons = { home: '⌂', which: '◎', benefits: '★', report: '▤' };
    return `<nav class="bottomnav">${TABS.map(k => `<button class="${k === active ? 'on' : ''}" data-tab="${k}"><span class="ni">${icons[k]}</span><span>${t().nav[k]}</span></button>`).join('')}</nav>`;
  }

  function render() {
    const tr = t();
    document.documentElement.lang = state.lang;
    document.documentElement.dir = tr.dir;
    const [name, arg] = current.split(':');
    const screens = { welcome, pick, spend, reveal, match, detail, home, which, benefits, report, settings };
    $app.innerHTML = screens[name](arg);
    $app.className = 'screen-' + name;
    bind(name, arg);
  }

  // ---------- Screens ----------
  function progress(step) {
    return `<div class="progress">${[1, 2, 3].map(i => `<span class="${i <= step ? 'on' : ''}"></span>`).join('')}</div>`;
  }
  function topbar(title, showBack = true) {
    return `<header class="topbar">${showBack ? `<button class="iconbtn" data-act="back" aria-label="${t().back}">${t().dir === 'rtl' ? '→' : '←'}</button>` : '<span></span>'}
      <h1>${title}</h1><span></span></header>`;
  }

  function welcome() {
    const tr = t();
    return `<section class="welcome">
      <button class="langpill" data-act="lang">${tr.scLang}</button>
      <div class="logo-wrap">${logoSvg(96)}</div>
      <div class="wordmark"><span>Mazboot</span><span class="ar">مضبوط</span></div>
      <p class="tag">${tr.tagline}</p>
      <h2>${tr.welcomeTitle}</h2>
      <p class="muted">${tr.welcomeBody}</p>
      <button class="btn gold big" data-go="pick">${tr.start}</button>
      ${state.data.fallback || state.data ? `<p class="sample">${tr.sample}</p>` : ''}
    </section>`;
  }

  function pick() {
    const tr = t();
    return `${topbar('')}${progress(1)}
    <section class="pad">
      <h2>${tr.pickTitle}</h2><p class="muted">${tr.pickBody}</p>
      <div class="picklist">
        ${state.data.cards.map(c => `<button class="pickrow ${state.owned.includes(c.id) ? 'sel' : ''}" data-card="${c.id}">
          ${miniCard(c, 'sm')}<span class="pr-text"><b>${esc(L(c, 'name'))}</b><small>${esc(L(c, 'bank'))}</small></span>
          <span class="check">✓</span></button>`).join('')}
      </div>
      <button class="btn ghost" data-act="none">${tr.noneYet}</button>
    </section>
    <footer class="cta"><button class="btn primary big" data-go="spend">${tr.next}</button></footer>`;
  }

  function spend() {
    const tr = t();
    return `${topbar('')}${progress(2)}
    <section class="pad">
      <h2>${tr.spendTitle}</h2><p class="muted">${tr.spendBody}</p>
      ${S.CATS.map(c => `<div class="slider">
        <div class="sl-head"><span>${CAT_ICONS[c]} ${tr.cats[c]}</span><b data-val="${c}">${sar(state.spend[c])}</b></div>
        <input type="range" min="0" max="${SLIDER_MAX[c]}" step="50" value="${state.spend[c]}" data-cat="${c}">
      </div>`).join('')}
    </section>
    <footer class="cta"><button class="btn primary big" data-go="reveal">${tr.next}</button></footer>`;
  }

  function reveal() {
    const tr = t();
    const extra = Math.max(0, bestNet() - bestOwnedNet());
    return `<section class="reveal">
      <div class="confetti" aria-hidden="true"></div>
      ${progress(3)}
      <p class="rv-pre">${tr.revealPre}</p>
      <div class="rv-num" data-count="${extra}">${sar(0)}</div>
      <p class="rv-post">${tr.revealPost}</p>
      <div class="cheer">${tr.revealCheer}</div>
      <p class="muted light">${tr.revealSub}</p>
      <button class="btn gold big" data-act="finish">${tr.seeMatch}</button>
    </section>`;
  }

  function match() {
    const tr = t();
    const ranked = S.rankCards(state.data.cards, state.spend, state.filters);
    return `${topbar(tr.matchTitle, history.length > 0)}
    <section class="pad">
      <p class="muted">${tr.matchSub}</p>
      <div class="chips">
        <button class="chip ${state.filters.sharia ? 'on' : ''}" data-filter="sharia">☪ ${tr.filterSharia}</button>
        <button class="chip ${state.filters.noFee ? 'on' : ''}" data-filter="noFee">0 ${tr.filterNoFee}</button>
      </div>
      ${ranked.length ? ranked.map((r, i) => `<button class="rankrow ${i === 0 ? 'top' : ''}" data-detail="${r.card.id}">
        ${i === 0 ? `<span class="pickbadge">★ ${tr.pick}</span>` : ''}
        <div class="rr-main">${miniCard(r.card, 'sm')}
          <span class="pr-text"><b>${esc(L(r.card, 'name'))}</b><small>${esc(L(r.card, 'bank'))}${state.owned.includes(r.card.id) ? ` · <em>${tr.owned}</em>` : ''}</small></span>
          <span class="rr-val ${r.score.net < 0 ? 'neg' : ''}"><span>${sar(r.score.net)}</span><small>${tr.perYear}</small></span></div>
      </button>`).join('') : `<p class="empty">${tr.noResults}</p>`}
    </section>${nav('')}`;
  }

  function detail(id) {
    const tr = t();
    const card = cardById(id);
    const s = S.scoreCard(card, state.spend);
    return `${topbar(esc(L(card, 'name')))}
    <section class="pad">
      <div class="bigcard" style="background:linear-gradient(135deg,${card.colors[0]},${card.colors[1]})">
        <span class="bc-bank">${esc(L(card, 'bank'))}</span>
        <span class="bc-name">${esc(L(card, 'name'))}</span>
        <span class="bc-chip"></span><span class="bc-net">${esc(card.network)}</span>
      </div>
      <h3>${tr.detailMath}</h3>
      <div class="math">
        <div><span>${tr.rewards}</span><b class="pos">+ ${sar(s.rewards)}</b></div>
        <div><span>${tr.benefitsUsed}</span><b class="pos">+ ${sar(s.benefits)}</b></div>
        <div><span>${tr.annualFee}</span><b class="neg">− ${sar(s.fee)}</b></div>
        <div><span>${tr.fxFee}</span><b class="neg">− ${sar(s.fx)}</b></div>
        <div class="total"><span>${tr.kept}</span><b>${sar(s.net)}</b></div>
      </div>
      ${s.capped ? `<p class="note">⚠ ${tr.capNote}</p>` : ''}
      <h3>${tr.eligibility}</h3>
      <div class="kv">
        <div><span>${tr.minSalary}</span><b>${card.minSalary ? sar(card.minSalary) : tr.noSalary}</b></div>
        <div><span>${tr.type}</span><b><span class="pill ${card.sharia ? 'mint' : ''}">${card.sharia ? tr.shariaYes : tr.shariaNo}</span></b></div>
      </div>
      <h3>${tr.benefitsList}</h3>
      ${card.benefits.length ? `<ul class="benlist">${card.benefits.map(b => `<li><span>${esc(L(b, 'name'))}</span><b>${sar(b.valueYear)}</b></li>`).join('')}</ul>` : `<p class="muted">${tr.noBenefits}</p>`}
    </section>
    <footer class="cta"><button class="btn gold big" data-act="apply">${tr.apply}</button></footer>`;
  }

  function home() {
    const tr = t();
    const best = bestNet(), mine = bestOwnedNet();
    const pct = best > 0 ? Math.min(100, Math.round((mine / best) * 100)) : 0;
    const R = 52, C = 2 * Math.PI * R;
    const alertIcon = { points: '⏳', cap: '⚠', trip: '✈️' };
    return `<header class="homehead">
      <div class="hh-row"><div class="hh-brand">${logoSvg(30)}<span>${tr.brand}</span></div>
        <button class="iconbtn light" data-go="settings" aria-label="${tr.settings}">⚙</button></div>
      <div class="ringwrap">
        <svg viewBox="0 0 120 120" class="ring"><circle cx="60" cy="60" r="${R}" class="ring-bg"/>
          <circle cx="60" cy="60" r="${R}" class="ring-fg" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct / 100)}"/></svg>
        <div class="ring-text"><b>${pct}%</b><small>${tr.valueCaptured}</small></div>
      </div>
      <div class="hh-stats">
        <div><small>${tr.earnedMonth}</small><b>${sar(mine / 12)}</b></div>
        <div><small>🔥 ${tr.streak}</small><b>${state.data.home.streakDays}</b></div>
      </div>
    </header>
    <section class="pad">
      <h3>${tr.alerts}</h3>
      ${state.data.home.alerts.map(a => `<div class="alert ${a.type}"><span class="al-ic">${alertIcon[a.type] || '•'}</span><span>${esc(L(a, 'text'))}</span></div>`).join('')}
      <h3>${tr.shortcuts}</h3>
      <div class="shortcuts">
        <button data-tab="which"><span>◎</span>${tr.scWhich}</button>
        <button data-go="match"><span>★</span>${tr.scMatch}</button>
        <button data-go="spend"><span>⇅</span>${tr.scSpend}</button>
        <button data-act="lang"><span>Aa</span>${tr.scLang}</button>
      </div>
    </section>${nav('home')}`;
  }

  function which() {
    const tr = t();
    const m = state.which.merchant ? state.data.merchants.find(x => x.id === state.which.merchant) : null;
    let result = '';
    if (m) {
      const owned = state.owned.length ? state.owned : null;
      const list = S.bestForPurchase(state.data.cards, m.category, state.which.amount, owned);
      const top = list[0];
      const offers = state.data.offers.filter(o => o.merchantId === m.id || cardById(o.cardId) && o.cardId === top.card.id);
      result = `<div class="result">
        <small class="muted">${owned ? tr.fromYourCards : tr.fromAll}</small>
        <div class="res-row">${miniCard(top.card)}<div><span class="muted">${tr.useCard}</span><b>${esc(L(top.card, 'name'))}</b><small>${esc(L(top.card, 'bank'))}</small></div></div>
        <div class="res-earn"><span>${tr.youEarn}</span><b>${sar(top.earned)}</b><span>${tr.onThis}</span></div>
      </div>
      ${offers.length ? `<h3>${tr.nearby}</h3>${offers.map(o => {
        const mm = state.data.merchants.find(x => x.id === o.merchantId); const cc = cardById(o.cardId);
        return `<div class="offer"><span class="of-ic">${mm ? mm.icon : '🏪'}</span><span class="of-t"><b>${esc(L(o, 'text'))}</b><small>${mm ? esc(L(mm, 'name')) : ''} · ${cc ? esc(L(cc, 'name')) : ''}</small></span><span class="of-d">${o.distance_km == null ? tr.online : o.distance_km + ' ' + tr.km}</span></div>`;
      }).join('')}` : ''}`;
    }
    return `${topbar(tr.whichTitle, false)}
    <section class="pad">
      <p class="muted">${tr.whichSub}</p>
      <div class="merchants">${state.data.merchants.map(x => `<button class="merch ${state.which.merchant === x.id ? 'sel' : ''}" data-merchant="${x.id}"><span>${x.icon}</span>${esc(L(x, 'name'))}</button>`).join('')}</div>
      ${m ? `<label class="amount"><span>${tr.amount} (${tr.sar})</span><input type="number" inputmode="numeric" min="1" value="${state.which.amount}" data-amount></label>` : ''}
      <div id="which-result">${result}</div>
    </section>${nav('which')}`;
  }

  function benefits() {
    const tr = t();
    const owned = state.data.cards.filter(c => state.owned.includes(c.id));
    return `${topbar(tr.benefitsTitle, false)}
    <section class="pad"><p class="muted">${tr.benefitsSub}</p>
      ${owned.length ? owned.map(c => `<div class="bencard">${miniCard(c, 'sm')}<div class="bc-body"><b>${esc(L(c, 'name'))}</b>
        ${c.benefits.length ? `<ul class="benlist">${c.benefits.map(b => `<li><span>${esc(L(b, 'name'))}</span><b>${sar(b.valueYear)}</b></li>`).join('')}</ul>`
        : `<small class="muted">${tr.noBenefits}</small>`}</div></div>`).join('') : `<p class="empty">${tr.benefitsEmpty}</p>`}
    </section>${nav('benefits')}`;
  }

  function report() {
    const tr = t();
    const best = S.rankCards(state.data.cards, state.spend)[0];
    const mine = bestOwnedNet() / 12;
    const missed = Math.max(0, best.score.net / 12 - mine);
    const ownsBest = state.owned.includes(best.card.id);
    return `${topbar(tr.reportTitle, false)}
    <section class="pad"><p class="muted">${tr.reportSub}</p>
      <div class="repgrid"><div class="rep earned"><small>${tr.earned}</small><b>${sar(mine)}</b></div>
        <div class="rep missed"><small>${tr.missed}</small><b>${sar(missed)}</b></div></div>
      <h3>${tr.verdict}</h3>
      <div class="verdict">${ownsBest || missed < 1 ? `✓ ${tr.keep}` : `${tr.switchTo} <b>${esc(L(best.card, 'name'))}</b> · +${sarText(missed * 12)} ${tr.perYear}`}</div>
      <p class="sample">${tr.soon}</p>
    </section>${nav('report')}`;
  }

  function settings() {
    const tr = t();
    return `${topbar(tr.settings)}
    <section class="pad">
      <h3>${tr.language}</h3>
      <div class="seg"><button class="${state.lang === 'ar' ? 'on' : ''}" data-setlang="ar">العربية</button><button class="${state.lang === 'en' ? 'on' : ''}" data-setlang="en">English</button></div>
      <h3>${tr.myCards}</h3>
      <button class="btn ghost" data-go="pick">${tr.pickTitle}</button>
      <button class="btn ghost" data-go="spend">${tr.scSpend}</button>
      <button class="btn danger" data-act="redo">${tr.redo}</button>
      <p class="sample">${tr.sample} · v${window.MAZBOOT_VERSION || '1.0'}</p>
    </section>`;
  }

  // ---------- Events ----------
  function bind(name) {
    $app.querySelectorAll('[data-go]').forEach(b => b.onclick = () => go(b.dataset.go));
    $app.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { history.length = 0; go(b.dataset.tab, { replace: true }); });
    $app.querySelectorAll('[data-detail]').forEach(b => b.onclick = () => go('detail:' + b.dataset.detail));
    $app.querySelectorAll('[data-act="back"]').forEach(b => b.onclick = back);
    $app.querySelectorAll('[data-act="lang"]').forEach(b => b.onclick = () => { state.lang = state.lang === 'ar' ? 'en' : 'ar'; save(); render(); });
    $app.querySelectorAll('[data-setlang]').forEach(b => b.onclick = () => { state.lang = b.dataset.setlang; save(); render(); });

    if (name === 'pick') {
      $app.querySelectorAll('[data-card]').forEach(b => b.onclick = () => {
        const id = b.dataset.card;
        state.owned = state.owned.includes(id) ? state.owned.filter(x => x !== id) : [...state.owned, id];
        b.classList.toggle('sel'); save();
      });
      $app.querySelector('[data-act="none"]').onclick = () => { state.owned = []; save(); go('spend'); };
    }
    if (name === 'spend') {
      $app.querySelectorAll('input[type=range]').forEach(r => r.oninput = () => {
        state.spend[r.dataset.cat] = +r.value;
        $app.querySelector(`[data-val="${r.dataset.cat}"]`).innerHTML = sar(+r.value);
        save();
      });
    }
    if (name === 'reveal') {
      const el = $app.querySelector('.rv-num'); const target = +el.dataset.count; const t0 = performance.now();
      const step = now => { const p = Math.min(1, (now - t0) / 1400); const e = 1 - Math.pow(1 - p, 3); el.innerHTML = sar(target * e); if (p < 1) requestAnimationFrame(step); else burst(); };
      requestAnimationFrame(step);
      $app.querySelector('[data-act="finish"]').onclick = () => { state.onboarded = true; save(); history.length = 0; current = 'home'; go('match'); };
    }
    if (name === 'match') {
      $app.querySelectorAll('[data-filter]').forEach(b => b.onclick = () => { state.filters[b.dataset.filter] = !state.filters[b.dataset.filter]; render(); });
    }
    if (name === 'detail') { $app.querySelector('[data-act="apply"]').onclick = () => toast(t().applyToast); }
    if (name === 'which') {
      $app.querySelectorAll('[data-merchant]').forEach(b => b.onclick = () => { state.which.merchant = b.dataset.merchant; render(); });
      const amt = $app.querySelector('[data-amount]');
      if (amt) amt.onchange = () => { state.which.amount = Math.max(1, +amt.value || 1); render(); };
    }
    if (name === 'settings') {
      $app.querySelector('[data-act="redo"]').onclick = () => { state.onboarded = false; save(); history.length = 0; current = null; go('welcome'); };
    }
  }

  function burst() {
    const box = $app.querySelector('.confetti'); if (!box) return;
    const colors = ['#D9A21B', '#FBF1D6', '#DFF4EA', '#ffffff', '#D9604B'];
    for (let i = 0; i < 60; i++) {
      const p = document.createElement('i');
      p.style.left = Math.random() * 100 + '%';
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = Math.random() * 0.4 + 's';
      p.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
      p.style.setProperty('--rot', (Math.random() * 720) + 'deg');
      box.appendChild(p);
    }
    $app.querySelector('.cheer').classList.add('pop');
    if (navigator.vibrate) try { navigator.vibrate(40); } catch (e) { }
  }

  function logoSvg(size) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 108 108" aria-hidden="true">
      <rect width="108" height="108" rx="26" fill="#0F6B5C"/>
      <rect x="22" y="34" width="64" height="42" rx="8" fill="#0B4F45" stroke="#FBF1D6" stroke-opacity=".35" stroke-width="2"/>
      <rect x="22" y="44" width="64" height="7" fill="#FBF1D6" fill-opacity=".25"/>
      <path d="M38 58 L50 70 L76 38" fill="none" stroke="#D9A21B" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  // ---------- Boot ----------
  window.MazbootData.loadAll().then(data => {
    state.data = data;
    current = null;
    go(state.onboarded ? 'home' : 'welcome', { replace: true });
  });
})();
