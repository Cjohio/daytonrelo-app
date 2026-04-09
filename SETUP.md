# Dayton Relo App — Setup Guide

> **Platform:** macOS (M-series or Intel)
> **Project path:** `~/Documents/Claude/Claude/Projects/Set up open clay discord/dayton-relo-app`
> **Last verified:** April 9, 2026

---

## 1. Prerequisites

Make sure these are installed (see `MAC-SETUP.md` for full install instructions):

```bash
node --version    # 22+ required
npm --version     # 10+ required
git --version     # any recent version
eas --version     # Expo Application Services CLI
```

---

## 2. Install dependencies

```bash
cd ~/Documents/Claude/Claude/Projects/Set\ up\ open\ clay\ discord/dayton-relo-app
npm install
```

---

## 3. Verify your .env file

Your `.env` should already exist in the project. Check:

```bash
ls -la .env
```

If it's missing, copy from the example:

```bash
cp .env.example .env
```

Open and fill in any remaining placeholders:

```bash
open -e .env
```

Key variables to fill in before launch:

| Variable | Where to get it | Status |
|---|---|---|
| `EXPO_PUBLIC_POSTHOG_API_KEY` | https://posthog.com → Project Settings | ⚠️ Placeholder |
| `EXPO_PUBLIC_CRM_WEBHOOK_URL` | Your Zapier webhook | ⚠️ Placeholder |
| `EXPO_PUBLIC_TRESTLE_CLIENT_ID` | DABR (request from your board) | ⚠️ Pending |
| `EXPO_PUBLIC_TRESTLE_CLIENT_SECRET` | DABR | ⚠️ Pending |
| `EXPO_PUBLIC_SUPABASE_URL` | Already set | ✅ |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Already set | ✅ |
| `EXPO_PUBLIC_CLAUDE_API_KEY` | Already set | ✅ |
| `EXPO_PUBLIC_TWILIO_*` | Already set | ✅ |
| `EXPO_PUBLIC_FRED_API_KEY` | Already set | ✅ |

> **Note:** The app runs without any placeholders filled in — SimplyRETS sandbox data loads automatically for listings. PostHog and Zapier will silently no-op.

---

## 4. Start the development server

```bash
# Standard start
npx expo start

# With cache cleared (recommended after dependency changes)
npx expo start --clear

# Via tunnel (share with anyone off your network)
npx expo start --tunnel
```

Scan the QR code with the **Expo Go** app on your phone to preview.

---

## 5. EAS Build (for App Store / Play Store)

```bash
# Make sure you're logged in
eas whoami   # should show: wolfbot

# iOS production build
eas build --platform ios --profile production

# Android production build
eas build --platform android --profile production

# Submit after builds complete
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

See `APP_STORE_LAUNCH_CHECKLIST.md` for the full pre-launch checklist.

---

## 6. Git workflow

```bash
# Always check status BEFORE staging (prevent accidental deletions)
git status --short

# Stage specific files only — never use git add -A
git add path/to/file.tsx
git commit -m "your message"
git push origin main
```

⚠️ **Important:** Always run `git status --short` before any `git add`. If you see `D ` lines (staged deletions) you didn't intend, run `git reset HEAD` first.

---

## 7. Switch listings to Trestle MLS (once DABR credentials arrive)

1. Open `.env`, fill in `EXPO_PUBLIC_TRESTLE_CLIENT_ID` and `EXPO_PUBLIC_TRESTLE_CLIENT_SECRET`
2. In these three files, replace `simplyRetsApi` with `trestleApi` and adjust the import:
   - `app/(tabs)/explore.tsx`
   - `app/listing.tsx`
   - `app/open-houses.tsx`
3. The `api/trestle.ts` client and `api/config.ts` trestle block are already built and wired.

---

## Project Structure

```
dayton-relo-app/
├── app/
│   ├── _layout.tsx              Root stack, AuthGate, PostHog screen tracker
│   ├── (tabs)/
│   │   ├── _layout.tsx          5-tab bar: Search, Tools, Community, Chat, Contact
│   │   ├── index.tsx            Hub redirector (routes to persona hub)
│   │   ├── explore.tsx          MLS listing search
│   │   ├── tools.tsx            Persona-aware tool directory
│   │   ├── community.tsx        Real-time community board (Supabase)
│   │   ├── chat.tsx             DaytonBot AI chat
│   │   ├── contact.tsx          Chris's card + call/text/YouTube
│   │   ├── eats.tsx             Dayton restaurants (hidden tab)
│   │   └── profile.tsx          User profile (hidden tab)
│   ├── auth/
│   │   ├── signup.tsx           Persona selection + account creation
│   │   ├── login.tsx            Email + password sign-in
│   │   ├── forgot.tsx           Password reset
│   │   └── callback.tsx         OAuth callback handler
│   ├── military-hub.tsx         Military persona home
│   ├── relocation.tsx           Relocation persona home
│   ├── discover.tsx             Discover persona home
│   ├── bah-calculator.tsx
│   ├── dity-calculator.tsx
│   ├── tle-calculator.tsx
│   ├── mortgage-calculator.tsx
│   ├── cost-of-living.tsx
│   ├── rent-vs-buy.tsx
│   ├── closing-costs.tsx
│   ├── neighborhood-compare.tsx
│   ├── neighborhood-quiz.tsx
│   ├── neighborhoods.tsx
│   ├── neighborhood/[id].tsx
│   ├── employer-map.tsx
│   ├── commute-finder.tsx
│   ├── schools.tsx
│   ├── wpafb.tsx
│   ├── military.tsx
│   ├── pcs-timeline.tsx
│   ├── on-base-vs-off.tsx
│   ├── relo-package.tsx
│   ├── temp-housing.tsx
│   ├── va-lender.tsx
│   ├── lender.tsx
│   ├── local-services.tsx
│   ├── open-houses.tsx
│   ├── first-30-days.tsx
│   ├── things-to-do.tsx
│   ├── day-trips.tsx
│   ├── dayton-events.tsx
│   ├── parks.tsx
│   ├── breweries.tsx
│   ├── golf.tsx
│   ├── listing.tsx
│   ├── edit-profile.tsx
│   ├── privacy-policy.tsx
│   └── terms-of-service.tsx
│
├── api/
│   ├── config.ts                Central config (reads all env vars)
│   ├── trestle.ts               Trestle RESO Web API client (OAuth2, ready)
│   ├── simplyrets.ts            SimplyRETS client (sandbox, used until Trestle)
│   ├── claude.ts                Claude AI (DaytonBot)
│   ├── leads.ts                 CRM webhook + Supabase lead capture
│   └── sms.ts                   Twilio SMS helper
│
├── shared/
│   ├── auth/
│   │   ├── AuthContext.tsx       Auth provider, save/unsave items
│   │   └── useGoogleAuth.ts      Google OAuth hook (pending config)
│   ├── components/              20+ shared UI components
│   ├── analytics/               PostHog wrapper
│   ├── search/                  Global search data
│   ├── theme/colors.ts           Brand palette (black, gold, white)
│   └── types/                   listing.ts, lead.ts
│
├── supabase/
│   ├── community_schema.sql     Community board tables (run ✅)
│   ├── leads_schema.sql         Leads table (run ✅ Apr 9 2026)
│   └── migrations/              Event and other migrations
│
├── assets/images/               icon.png, adaptive-icon.png, logos, headshots
├── content/                     neighborhoods.json, employers.json, col-cities.json
├── app.json                     Expo config — bundle ID, EAS project ID, privacy manifest
├── eas.json                     EAS build + submit profiles
├── .env                         Environment variables (DO NOT commit)
├── .env.example                 Template (safe to commit)
└── MAC-SETUP.md                 Mac environment setup guide
```

---

## Supabase Tables (all live, RLS enabled)

| Table | Purpose | Rows |
|---|---|---|
| `profiles` | User accounts + persona | 4 |
| `saved_items` | Bookmarked tools/listings | 3 |
| `local_services` | Service provider directory | 6 |
| `temp_housing` | Temp housing listings | 4 |
| `community_posts` | Community board posts | 2 |
| `community_replies` | Post replies | 0 |
| `post_upvotes` | Feedback upvotes | 1 |
| `leads` | Contact form submissions | 0 |
