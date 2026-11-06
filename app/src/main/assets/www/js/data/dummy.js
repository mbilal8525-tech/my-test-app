// Phase 1 sample data. Card names and rates are illustrative, for testing only.
// Rates are reward value as a fraction of spend (0.05 = 5% back, in SAR value).
window.MAZBOOT_DUMMY = {
  categories: ['groceries', 'dining', 'online', 'bills', 'fuel', 'abroad'],

  cards: [
    {
      id: 'rajhi-cashback', bank_en: 'Al Rajhi Bank', bank_ar: 'مصرف الراجحي',
      name_en: 'Cashback Platinum', name_ar: 'بلاتينيوم استرداد نقدي',
      sharia: true, annualFee: 0, minSalary: 5000, network: 'Mastercard',
      colors: ['#1d3c8f', '#3a63c9'], fxFee: 0.02, monthlyCap: 150,
      rates: { groceries: 0.03, dining: 0.02, online: 0.02, bills: 0.01, fuel: 0.01, abroad: 0.01 },
      benefits: []
    },
    {
      id: 'snb-travel', bank_en: 'Saudi National Bank', bank_ar: 'البنك الأهلي السعودي',
      name_en: 'Travel Signature', name_ar: 'سيجنتشر السفر',
      sharia: true, annualFee: 690, minSalary: 15000, network: 'Visa',
      colors: ['#0b4f45', '#13806d'], fxFee: 0.02, monthlyCap: 600,
      rates: { groceries: 0.01, dining: 0.02, online: 0.01, bills: 0.005, fuel: 0.005, abroad: 0.05 },
      benefits: [
        { id: 'lounge', name_en: 'Airport lounges (6 visits)', name_ar: 'صالات المطارات (6 زيارات)', valueYear: 900, requires: 'abroad' },
        { id: 'travel-ins', name_en: 'Travel insurance', name_ar: 'تأمين السفر', valueYear: 400, requires: 'abroad' }
      ]
    },
    {
      id: 'sab-dining', bank_en: 'SAB', bank_ar: 'ساب',
      name_en: 'Dining Rewards', name_ar: 'مكافآت المطاعم',
      sharia: false, annualFee: 250, minSalary: 8000, network: 'Visa',
      colors: ['#7a1f2b', '#c0394d'], fxFee: 0.02, monthlyCap: 250,
      rates: { groceries: 0.015, dining: 0.06, online: 0.02, bills: 0.005, fuel: 0.005, abroad: 0.01 },
      benefits: [
        { id: 'dine-offer', name_en: 'Buy-1-get-1 dining offers', name_ar: 'عروض اشترِ واحدة واحصل على الثانية', valueYear: 300, requires: 'dining' }
      ]
    },
    {
      id: 'riyad-fuel', bank_en: 'Riyad Bank', bank_ar: 'بنك الرياض',
      name_en: 'Drive Card', name_ar: 'بطاقة درايف',
      sharia: true, annualFee: 150, minSalary: 5000, network: 'Mastercard',
      colors: ['#1f4b6e', '#3b7fb3'], fxFee: 0.02, monthlyCap: 200,
      rates: { groceries: 0.01, dining: 0.01, online: 0.01, bills: 0.01, fuel: 0.07, abroad: 0.005 },
      benefits: [
        { id: 'car-wash', name_en: 'Monthly car wash', name_ar: 'غسيل سيارة شهري', valueYear: 240, requires: 'fuel' }
      ]
    },
    {
      id: 'alinma-online', bank_en: 'Alinma Bank', bank_ar: 'مصرف الإنماء',
      name_en: 'Online Plus', name_ar: 'أونلاين بلس',
      sharia: true, annualFee: 0, minSalary: 4000, network: 'Visa',
      colors: ['#5a3d1a', '#a8742f'], fxFee: 0.02, monthlyCap: 120,
      rates: { groceries: 0.01, dining: 0.01, online: 0.05, bills: 0.01, fuel: 0.005, abroad: 0.01 },
      benefits: []
    },
    {
      id: 'anb-everyday', bank_en: 'Arab National Bank', bank_ar: 'البنك العربي الوطني',
      name_en: 'Everyday Gold', name_ar: 'الذهبية اليومية',
      sharia: false, annualFee: 0, minSalary: 4000, network: 'Mastercard',
      colors: ['#8a6a12', '#d9a21b'], fxFee: 0.02, monthlyCap: 100,
      rates: { groceries: 0.02, dining: 0.015, online: 0.015, bills: 0.015, fuel: 0.01, abroad: 0.01 },
      benefits: []
    },
    {
      id: 'bsf-infinite', bank_en: 'Banque Saudi Fransi', bank_ar: 'البنك السعودي الفرنسي',
      name_en: 'Infinite Rewards', name_ar: 'إنفينيت للمكافآت',
      sharia: false, annualFee: 1200, minSalary: 25000, network: 'Visa',
      colors: ['#10252a', '#34525a'], fxFee: 0.02, monthlyCap: 1000,
      rates: { groceries: 0.025, dining: 0.03, online: 0.025, bills: 0.01, fuel: 0.01, abroad: 0.04 },
      benefits: [
        { id: 'lounge-unl', name_en: 'Unlimited airport lounges', name_ar: 'صالات مطارات بلا حدود', valueYear: 1500, requires: 'abroad' },
        { id: 'concierge', name_en: 'Concierge service', name_ar: 'خدمة الكونسيرج', valueYear: 200, requires: null }
      ]
    },
    {
      id: 'stcbank-debit', bank_en: 'STC Bank', bank_ar: 'بنك STC',
      name_en: 'Debit Card', name_ar: 'بطاقة مدى',
      sharia: true, annualFee: 0, minSalary: 0, network: 'Mada',
      colors: ['#4b1f7a', '#7b3fc4'], fxFee: 0.02, monthlyCap: 40,
      rates: { groceries: 0.005, dining: 0.005, online: 0.01, bills: 0.0, fuel: 0.0, abroad: 0.0 },
      benefits: []
    }
  ],

  merchants: [
    { id: 'panda', name_en: 'Panda', name_ar: 'بنده', category: 'groceries', icon: '🛒' },
    { id: 'danube', name_en: 'Danube', name_ar: 'الدانوب', category: 'groceries', icon: '🛒' },
    { id: 'albaik', name_en: 'Al Baik', name_ar: 'البيك', category: 'dining', icon: '🍗' },
    { id: 'hungerstation', name_en: 'HungerStation', name_ar: 'هنقرستيشن', category: 'dining', icon: '🛵' },
    { id: 'noon', name_en: 'noon', name_ar: 'نون', category: 'online', icon: '📦' },
    { id: 'amazon', name_en: 'Amazon.sa', name_ar: 'أمازون', category: 'online', icon: '📦' },
    { id: 'sec', name_en: 'Electricity bill', name_ar: 'فاتورة الكهرباء', category: 'bills', icon: '💡' },
    { id: 'aldrees', name_en: 'Aldrees', name_ar: 'الدريس', category: 'fuel', icon: '⛽' },
    { id: 'saudia', name_en: 'Saudia flights', name_ar: 'الخطوط السعودية', category: 'abroad', icon: '✈️' },
    { id: 'dubai-mall', name_en: 'Shopping abroad', name_ar: 'التسوق في الخارج', category: 'abroad', icon: '🌍' }
  ],

  offers: [
    { id: 'o1', merchantId: 'danube', cardId: 'rajhi-cashback', text_en: 'Extra 5% back this weekend', text_ar: '5% استرداد إضافي هذا الويكند', distance_km: 1.2 },
    { id: 'o2', merchantId: 'albaik', cardId: 'sab-dining', text_en: 'Free drink with any meal', text_ar: 'مشروب مجاني مع أي وجبة', distance_km: 0.8 },
    { id: 'o3', merchantId: 'aldrees', cardId: 'riyad-fuel', text_en: 'SAR 10 off a full tank', text_ar: 'خصم 10 ريال على تعبئة كاملة', distance_km: 2.4 },
    { id: 'o4', merchantId: 'noon', cardId: 'alinma-online', text_en: '10% off electronics', text_ar: 'خصم 10% على الإلكترونيات', distance_km: null },
    { id: 'o5', merchantId: 'panda', cardId: 'anb-everyday', text_en: 'Double points on Tuesdays', text_ar: 'نقاط مضاعفة يوم الثلاثاء', distance_km: 0.5 }
  ],

  // Sample personal data for the Home screen
  home: {
    streakDays: 6,
    alerts: [
      { type: 'points', text_en: '2,400 points expire in 9 days', text_ar: '2,400 نقطة تنتهي خلال 9 أيام' },
      { type: 'cap', text_en: 'Cashback cap reached on your grocery card', text_ar: 'وصلت للحد الأعلى للاسترداد في بطاقة البقالة' },
      { type: 'trip', text_en: 'Trip coming up? Use a card with lounge access', text_ar: 'عندك سفرة قريبة؟ استخدم بطاقة فيها صالات' }
    ]
  }
};
