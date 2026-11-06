// Card value scoring — the brief's formula:
// Net value per year = sum(monthly spend per category × earn rate, capped) × 12
//                    + value of benefits the user will actually use
//                    − annual fee
//                    − 2% × yearly spending abroad
(function (root) {
  const CATS = ['groceries', 'dining', 'online', 'bills', 'fuel', 'abroad'];

  function scoreCard(card, spend, fxDefault = 0.02) {
    let monthly = 0;
    for (const c of CATS) monthly += (spend[c] || 0) * ((card.rates && card.rates[c]) || 0);
    const cap = card.monthlyCap === undefined ? Infinity : card.monthlyCap;
    const monthlyCapped = Math.min(monthly, cap);
    const rewards = monthlyCapped * 12;

    const usedBenefits = (card.benefits || []).filter(b => !b.requires || (spend[b.requires] || 0) > 0);
    const benefits = usedBenefits.reduce((s, b) => s + (b.valueYear || 0), 0);

    const fee = card.annualFee || 0;
    const fxRate = card.fxFee === undefined ? fxDefault : card.fxFee;
    const fx = fxRate * (spend.abroad || 0) * 12;

    const net = rewards + benefits - fee - fx;
    return {
      rewards: Math.round(rewards), benefits: Math.round(benefits), fee: Math.round(fee), fx: Math.round(fx),
      net: Math.round(net), capped: monthly > cap, usedBenefits
    };
  }

  function rankCards(cards, spend, filters = {}) {
    return cards
      .filter(c => !filters.sharia || c.sharia)
      .filter(c => !filters.noFee || !c.annualFee)
      .map(card => ({ card, score: scoreCard(card, spend) }))
      .sort((a, b) => b.score.net - a.score.net);
  }

  // Best card for one purchase in one category (ignores fee: it's already paid).
  function bestForPurchase(cards, category, amount, owned) {
    const pool = owned && owned.length ? cards.filter(c => owned.includes(c.id)) : cards;
    const list = pool.map(card => {
      let earned = amount * ((card.rates && card.rates[category]) || 0);
      if (category === 'abroad') earned -= amount * (card.fxFee === undefined ? 0.02 : card.fxFee);
      return { card, earned: Math.round(earned * 100) / 100 };
    }).sort((a, b) => b.earned - a.earned);
    return list;
  }

  const api = { CATS, scoreCard, rankCards, bestForPurchase };
  root.MazbootScore = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
