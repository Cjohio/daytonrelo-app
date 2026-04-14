# Dayton Relo — App Store + Play Store Launch Checklist

**Target launch: ~Apr 21 2026 (1 week out)**
**Audit date: Apr 14 2026**
**Audit status: GREEN with 6 manual tasks remaining**

Generated from a full audit of `dayton-relo-app/` on Apr 14 2026. All green items below are verified. Red / yellow items need Chris's action because they require accounts, credentials, or external-system setup that Claude cannot do.

---

## 🟢 GREEN — verified working during audit

### Codebase health
- [x] **TypeScript compiles clean** — `npx tsc --noEmit` shows 0 errors on app code (supabase/functions/ excluded because they run on Deno, not bundled)
- [x] **expo-doctor 17/17 checks pass**
- [x] **No duplicate native modules** (was: expo-application/constants/file-system duplicated — fixed by `npx expo install --fix`)
- [x] **Expo SDK 54 dependency alignment complete** (was: 7 packages on wrong major versions — fixed)
- [x] **Peer deps installed** — `react-native-svg` (for PostHog), `react-native-worklets` (for Reanimated)
- [x] **Production builds strip console.log** via `babel-plugin-transform-remove-console` (keeps error/warn). Already configured in `babel.config.js`.
- [x] **Restaurant logos for /eats tab** — 12 PNGs bundled at `assets/images/restaurants/`, wired into `app/(tabs)/eats.tsx` with gold letter-badge fallback for the 6 missing

### Assets (store submission requirements)
- [x] **App icon 1024×1024** — regenerated from logo on #0A0A0A background, saved to `assets/images/icon.png`
- [x] **Android adaptive-icon foreground 1024×1024 transparent** — regenerated at 65% safe-zone scale, saved to `assets/images/adaptive-icon.png`
- [x] **Favicon 48×48** (was missing entirely — generated)
- [x] **Splash screen** — `logo-black.png` on `#0A0A0A` background, resizeMode contain (already configured)
- [x] **Original rectangular icons backed up** to `.assets-archive/` (gitignored)

### app.json store-submission fields
- [x] **name**: "Dayton Relo"
- [x] **slug**: "dayton-relo-app"
- [x] **version**: "1.0.0"
- [x] **iOS bundle identifier**: `com.daytonrelo.app`
- [x] **iOS buildNumber**: 1
- [x] **iOS permissions descriptions** — NSLocationWhenInUseUsageDescription, NSPhotoLibraryUsageDescription, NSCameraUsageDescription all present with clear user-facing text
- [x] **iOS encryption disclosure** — ITSAppUsesNonExemptEncryption: false, usesNonExemptEncryption: false
- [x] **iOS privacy manifests** — UserDefaults + FileTimestamp API reasons declared, NSPrivacyTracking: false
- [x] **Android package**: `com.daytonrelo.app`
- [x] **Android versionCode**: 1
- [x] **Android permissions explicit** — INTERNET, ACCESS_NETWORK_STATE, RECEIVE_BOOT_COMPLETED, VIBRATE, POST_NOTIFICATIONS (no wildcard/untyped perms)
- [x] **Deep-link scheme**: `daytonrelo://` (used for OAuth callback + share links)
- [x] **EAS projectId set**: `bede7d37-349f-444c-8719-1a8c30876024`

### Backend / Supabase
- [x] **Supabase project ACTIVE_HEALTHY** — project `balotlqhkvyulcarezkg` in us-east-1, Postgres 17.6.1
- [x] **RLS enabled on all 20 tables**
- [x] **Edge Functions deployed** — `notify-lead` (Twilio SMS, JWT verified) and `daytonbot` (chat, JWT verified), both ACTIVE
- [x] **Twilio credentials off the client** — moved to Supabase Vault, `notify-lead` Edge Function invokes server-side. No Twilio secrets in app bundle.
- [x] **Claude API key off the client** — moved to Supabase Vault, `daytonbot` Edge Function invokes Anthropic server-side
- [x] **Supabase client config** uses AsyncStorage for session persistence, autoRefreshToken, detectSessionInUrl=false (correct for React Native)

### Website-side dependencies
- [x] **Privacy Policy live** — https://daytonrelo.com/privacy.html (200 OK, 10KB)
- [x] **Terms of Service live** — https://daytonrelo.com/terms.html (200 OK, 12KB)
- [x] **In-app privacy + terms screens** — `app/privacy-policy.tsx` and `app/terms-of-service.tsx` exist

### Git
- [x] **App repo has GitHub remote** — github.com/Cjohio/daytonrelo-app, on `main` branch, up to date
- [x] **Website repo deployed** — github.com/Cjohio/daytonrelo.git → Vercel → daytonrelo.com

---

## 🟡 YELLOW — need attention this week but not blockers

### Security hardening (Supabase advisor warnings)
- [ ] **Enable leaked-password protection** in Supabase → Auth → Policies. One click, no code change. Checks new passwords against HaveIBeenPwned.
- [ ] **Fix 5 functions with mutable search_path** — low-severity search-path injection theoretical risk. Functions: `generate_content_id`, `update_updated_at`, `prune_chat_rate_limits`, `check_community_post_rate_limit`, `update_reply_count`, `update_upvote_count`. One-line `SET search_path = public` per function.
- [ ] **Tighten overly-permissive RLS policies** — 8 Mission Control tables (brand_assets, content_assets, content_items, content_item_tags, content_tags, content_versions, post_results, social_accounts) have `authenticated_full_access` policies where any signed-in user can write. These tables are only used by the WEBSITE (mission-control admin dashboard) — NOT by the app — so it's low launch-day risk, but any user who figures out the Supabase URL could corrupt content. Add admin-only check (e.g. `auth.email() = 'chris@cjohio.com'`) before launch or lock behind service_role.
- [ ] **Trestle client_secret is bundled** as `EXPO_PUBLIC_TRESTLE_CLIENT_SECRET` — anyone can extract it from the app binary. If Trestle allows a proxy pattern, move the token exchange into a Supabase Edge Function and call that from the app instead.

### Known runtime notes
- [ ] **SimplyRETS sandbox returns no openHouses data** — the `open-houses.tsx` screen uses a `fakeWindow()` display-only generator as placeholder. Before launch either (a) upgrade to SimplyRETS paid plan with real openhouses endpoint, or (b) make the "fake" nature obvious in UI.
- [ ] **2 npm audit vulnerabilities** (1 moderate, 1 critical) — run `npm audit` to see which packages. May auto-fix without breakage.

---

## 🔴 RED — MUST complete before submitting to stores

### Apple App Store Connect
- [ ] **Apple Developer account active** — $99/year, chris@cjohio.com
- [ ] **Create app in App Store Connect** — bundle ID `com.daytonrelo.app`, name "Dayton Relo"
- [ ] **Fill in `eas.json` submit config**:
  - `ascAppId` → the numeric App Store Connect App ID (from the app record)
  - `appleTeamId` → Apple Developer Team ID (10-char)
- [ ] **App Store screenshots** — iPhone 6.9" (iPhone 15 Pro Max / 16 Pro Max), iPhone 6.7" (older), iPad if targeting iPad. 3–10 screenshots per device class.
- [ ] **App Store metadata** — short description (170 chars), long description (4000 chars), keywords (100 chars comma-sep), support URL, marketing URL, promotional text, copyright string, age rating questionnaire
- [ ] **App privacy labels** — declare what data is collected (Supabase profile: name/email/phone; PostHog analytics: anonymous usage). Answer "Do you link data to user?" Yes for profile, No for analytics
- [ ] **Demo credentials for review** — create a reviewer test account (e.g. `review@daytonrelo.com`) so Apple can log in to review the app

### Google Play Console
- [ ] **Play Console account** — $25 one-time, chris@cjohio.com
- [ ] **Create app in Play Console** — package name `com.daytonrelo.app`
- [ ] **Generate Google service account JSON** — required for `eas submit -p android`. Save as `google-service-account.json` in repo root (already in .gitignore via `*.json`? — verify) OR use an EAS secret.
- [ ] **Play Store graphic assets** — 512×512 hi-res icon, 1024×500 feature graphic, 2–8 phone screenshots (1080×1920 minimum)
- [ ] **Play Store listing** — title (50 chars), short description (80 chars), full description (4000 chars), contact email, privacy policy URL (use https://daytonrelo.com/privacy.html)
- [ ] **Data safety form** — Play Console equivalent of Apple privacy labels
- [ ] **Content rating questionnaire**

### Supabase OAuth redirect URLs
- [ ] **Add production redirect URI** to Supabase → Auth → URL Configuration → Redirect URLs:
  - `daytonrelo://auth/callback` (standalone production build)
  - `exp://192.168.*.*:*/--/auth/callback` (Expo Go dev — for you and any testers)
  - Already present → confirm before first TestFlight build

### EAS Build
- [ ] **Log in to EAS CLI** — `eas login`
- [ ] **Confirm EAS project link** — `eas whoami` matches `owner: "wolfbot"` in app.json OR update owner to match Chris's current Expo account. ⚠️ `wolfbot` was the old Windows setup account — verify this is still the correct/active account before the first build, or you'll push to someone else's project.
- [ ] **Run a preview build** first — `eas build --profile preview --platform ios` and `--platform android`. Install on physical devices to smoke-test before production submission.
- [ ] **Run production builds** — `eas build --profile production --platform all`
- [ ] **Submit to stores** — `eas submit -p ios --latest` and `eas submit -p android --latest`

---

## Smoke-test checklist for the preview build (test on device before store)

Pick up a real iPhone and an Android device. Verify:

- [ ] App launches, shows splash, lands on persona selector or home
- [ ] Persona selection persists across app restarts (AsyncStorage)
- [ ] Sign up with email → confirmation email arrives → login works
- [ ] Google sign-in flows end-to-end (tests deep link back from browser)
- [ ] DaytonBot chat responds (tests Supabase Edge Function + Claude API)
- [ ] Lead form on Contact submits successfully (tests notify-lead → SMS)
- [ ] Save a listing → sign out → sign back in → listing still saved (tests saved_items table)
- [ ] Community: post a message → another account sees it → upvote works
- [ ] Calculators: BAH, Mortgage, Rent-vs-Buy, TLE, DITY, Closing Costs, Cost of Living — all compute
- [ ] Open Houses list loads (even if fake windows)
- [ ] Neighborhood pages load, images render
- [ ] Eats tab: all 12 logos render for matched restaurants, fallback badge for the 6 others
- [ ] Push notification permission requested only on the screen where it makes sense (not at cold start)
- [ ] Event reminders fire at the scheduled time (can test with a short trigger)
- [ ] Privacy Policy + Terms screens accessible from profile/settings
- [ ] Deep link: open `daytonrelo://listing?mlsId=XXX` in a second app — Dayton Relo opens to the listing

---

## Audit summary — what was broken, what's fixed

### Fixed in this audit (Apr 14 2026)

1. **`bah-calculator.tsx`** — missing `Ionicons` import would have crashed the screen on first render. Added.
2. **`edit-profile.tsx`** — referenced personas `"corporate"` and `"general"` that don't exist in the Persona type. Aligned to `"relocation"` / `"discover"`.
3. **`listing.tsx`** — `listing` possibly null was not guarded in `handleSave`. Added null check.
4. **`mortgage-calculator.tsx`** — non-existent `hint` prop on `ResultRow`. Removed.
5. **`open-houses.tsx`** — arithmetic on string `mlsId`. Fixed with numeric coercion.
6. **`lib/notifications.ts`** + **`shared/notifications.ts`** — expo-notifications SDK 54 now requires `{ type: SchedulableTriggerInputTypes.DATE | .TIME_INTERVAL }` on triggers AND `shouldShowBanner` + `shouldShowList` on the handler config. Event reminders would have failed silently or thrown. Fixed.
7. **`shared/analytics/index.ts`** — PostHog's `JsonType` rejects `undefined` values in property objects but the app's `EventProperties` type allowed them. Added `sanitize()` helper to strip undefineds before capture. Would have caused analytics calls to throw at runtime (swallowed by try/catch but silently dropping events).
8. **`app/(tabs)/chat.tsx`** — `sendAgentSMS` was called with a string, but its signature takes a `LeadFormData` object. Fixed by constructing a minimal LeadFormData for the chat escalation path.
9. **`app/(tabs)/community.tsx`** — referenced `profile.community_display_name` which wasn't on the Profile type. Added as optional field.
10. **`app/(tabs)/explore.tsx`** — `fetchListings(?, ?)` with optional args was passed to TextInput.onSubmitEditing and TouchableOpacity.onPress, which expect different signatures. Wrapped with arrow functions.
11. **`tsconfig.json`** — Supabase Edge Functions (Deno runtime) were being type-checked against React Native tsconfig, producing false errors for `Deno` and `jsr:` imports. Excluded them.
12. **Dependency alignment** — 7 Expo packages on wrong major versions (expo-application 55 vs expected 7, expo-device 55 vs 8, expo-file-system 55 vs 19, expo-store-review 8 vs 9, expo-web-browser 14 vs 15, expo-notifications 0.29 vs 0.32, react-native-webview 13.16 vs 13.15). Triplicated duplicate native modules. All fixed by `npx expo install --fix`.
13. **Peer dependencies installed** — `react-native-svg` (required by PostHog RN) and `react-native-worklets` (required by Reanimated). Would crash on first chart render and first animation outside Expo Go.
14. **App icon + adaptive icon + favicon** — regenerated as proper 1024×1024 squares from the rectangular logo with padding. Original rectangular logos backed up to `.assets-archive/` (gitignored). Without this, `eas build` would have failed at the asset validation step.

### Known still-open items
- See YELLOW + RED sections above. None block local dev or an internal build; all block store submission or tighten post-launch security.

---

*Last updated: Apr 14 2026 by Claude Opus 4.6 audit session*
