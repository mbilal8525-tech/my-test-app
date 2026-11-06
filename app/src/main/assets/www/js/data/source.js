// Data layer. Screens only ever call MazbootData.* — never the dummy file or Base44 directly.
// To go live (Phase 2), set DATA_MODE to 'base44' in js/config.js and adjust the mappers below
// to match the field names in the Base44 tables (CreditCard, Merchant, Offer, ...).
(function () {
  const cfg = window.MAZBOOT_CONFIG;

  // ---------- Dummy adapter ----------
  const dummyAdapter = {
    async getCards() { return window.MAZBOOT_DUMMY.cards; },
    async getMerchants() { return window.MAZBOOT_DUMMY.merchants; },
    async getOffers() { return window.MAZBOOT_DUMMY.offers; },
    async getHome() { return window.MAZBOOT_DUMMY.home; }
  };

  // ---------- Base44 adapter (Phase 2) ----------
  async function b44(entity) {
    const url = `${cfg.BASE44.API_BASE}/${cfg.BASE44.APP_ID}/entities/${entity}`;
    const res = await fetch(url, { headers: { 'api_key': cfg.BASE44.API_KEY, 'Content-Type': 'application/json' } });
    if (!res.ok) throw new Error(`Base44 ${entity}: HTTP ${res.status}`);
    return res.json();
  }
  const num = (v, d = 0) => (v === undefined || v === null || isNaN(+v) ? d : +v);

  // Map a Base44 CreditCard record to the shape the screens use.
  function mapCard(r) {
    return {
      id: r.id,
      bank_en: r.bank_name || r.bank || '', bank_ar: r.bank_name_ar || r.bank_name || '',
      name_en: r.card_name || r.name || '', name_ar: r.card_name_ar || r.card_name || '',
      sharia: !!(r.sharia_compliant ?? r.is_islamic),
      annualFee: num(r.annual_fee), minSalary: num(r.min_salary), network: r.network || '',
      colors: [r.color_primary || '#0F6B5C', r.color_secondary || '#0B4F45'],
      fxFee: num(r.fx_fee, cfg.FX_FEE_DEFAULT),
      monthlyCap: num(r.monthly_cap, Infinity),
      rates: {
        groceries: num(r.rate_groceries), dining: num(r.rate_dining), online: num(r.rate_online),
        bills: num(r.rate_bills), fuel: num(r.rate_fuel), abroad: num(r.rate_abroad)
      },
      benefits: Array.isArray(r.benefits) ? r.benefits : []
    };
  }
  const mapMerchant = r => ({ id: r.id, name_en: r.name || '', name_ar: r.name_ar || r.name || '', category: r.category || 'online', icon: r.icon || '🏪' });
  const mapOffer = r => ({ id: r.id, merchantId: r.merchant_id, cardId: r.card_id, text_en: r.title || r.description || '', text_ar: r.title_ar || r.title || '', distance_km: r.distance_km ?? null });

  const base44Adapter = {
    async getCards() { return (await b44('CreditCard')).map(mapCard); },
    async getMerchants() { return (await b44('Merchant')).map(mapMerchant); },
    async getOffers() { return (await b44('Offer')).map(mapOffer); },
    async getHome() { return window.MAZBOOT_DUMMY.home; } // until LoyaltyAccount/PointsHistory are wired
  };

  const adapter = cfg.DATA_MODE === 'base44' ? base44Adapter : dummyAdapter;

  window.MazbootData = {
    mode: cfg.DATA_MODE,
    async loadAll() {
      try {
        const [cards, merchants, offers, home] = await Promise.all([
          adapter.getCards(), adapter.getMerchants(), adapter.getOffers(), adapter.getHome()
        ]);
        return { cards, merchants, offers, home, categories: window.MAZBOOT_DUMMY.categories };
      } catch (e) {
        console.warn('Live data failed, falling back to sample data:', e);
        const d = window.MAZBOOT_DUMMY;
        return { cards: d.cards, merchants: d.merchants, offers: d.offers, home: d.home, categories: d.categories, fallback: true };
      }
    }
  };
})();
