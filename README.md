# Mazboot مضبوط

**The right card for every purchase.** البطاقة المضبوطة لكل مشترى

Android test app that tells people in Saudi Arabia which bank card fits how they spend, in SAR.

## Get the APK
Every change pushed to `main` builds a new APK automatically.
1. Open the **Releases** section of this repository (right-hand side).
2. Download the newest `Mazboot-v1.0.N.apk`.
3. Share it with testers (WhatsApp, email, Drive). On the phone: open the file → allow **Install unknown apps** → **Install**.

New builds install over old ones, so testers keep their settings.

## What's inside
| Screen | Notes |
|---|---|
| Onboarding | Welcome → pick your cards → six spend sliders → animated "extra SAR X a year" reveal |
| Card Match | Ranked by net SAR per year after fees; Sharia / No-fee filters; gold "Mazboot pick" |
| Card Detail | Rewards + benefits − fee − 2% foreign fee = SAR kept; eligibility; Apply button |
| Home | Value ring, earned this month, streak, three alerts, shortcuts |
| Which card here? | Pick a store → best card + riyals earned + nearby offers |
| Benefits / Report | First versions (full screens are later-phase) |

Arabic first (full RTL) with English switch in Settings or on Home.

## Project layout
```
app/src/main/assets/www/       ← the app screens (HTML/CSS/JS)
  js/config.js                 ← DATA_MODE: 'dummy' or 'base44'
  js/data/dummy.js             ← Phase 1 sample cards, stores, offers
  js/data/source.js            ← data layer (dummy + Base44 adapters)
  js/scoring.js                ← card value formula
  js/i18n.js                   ← Arabic + English text
app/src/main/java/.../MainActivity.java  ← Android shell
.github/workflows/build-apk.yml          ← automatic APK build + Release
```

## Phase 2: live data from Base44
Screens never read data directly; they call `MazbootData`. To go live:
1. In `js/config.js` set `DATA_MODE: 'base44'` and add a **read-only** API key.
2. Check the field names in the `mapCard`, `mapMerchant`, `mapOffer` functions in `js/data/source.js` against the Base44 tables (CreditCard, Merchant, Offer).
If the live call fails, the app falls back to sample data.

## Signing
Builds are signed with a **test-only** key in `keystore/`. Before any Play Store release, create a private key and store it in GitHub Secrets.

## Scoring formula
```
Net value per year = Σ(monthly spend × earn rate, capped monthly) × 12
                   + benefits the user will actually use
                   − annual fee
                   − 2% × yearly spending abroad
```
Sample card rates are illustrative and not real bank offers.
