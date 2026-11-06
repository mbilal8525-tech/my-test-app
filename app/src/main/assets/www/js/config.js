// Mazboot app configuration.
// DATA_MODE: 'dummy'  -> uses the sample data in js/data/dummy.js (Phase 1, testing)
//            'base44' -> reads live data from the Base44 app (Phase 2)
// Switching modes does NOT require any change to the screens.
window.MAZBOOT_CONFIG = {
  DATA_MODE: 'dummy',
  BASE44: {
    APP_ID: '698395ef47da94bf314e96ad',
    API_BASE: 'https://app.base44.com/api/apps',
    // Put a read-only API key here when Phase 2 starts. Never commit a key with write access.
    API_KEY: ''
  },
  FX_FEE_DEFAULT: 0.02,   // 2% foreign transaction fee used in the scoring formula
  CURRENCY: 'SAR'
};
