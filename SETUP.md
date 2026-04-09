# Dayton Relo App — Setup Guide

## 1. Move the project to its final location

Open **PowerShell** and run:

```powershell
# Move from the workspace folder to C:\Users\wolfb\dayton-relo-app
Move-Item "C:\Users\wolfb\Set up open clay discord\dayton-relo-app" "C:\Users\wolfb\dayton-relo-app"
cd C:\Users\wolfb\dayton-relo-app
```

---

## 2. Install dependencies

```powershell
npm install
```

---

## 3. Configure environment variables

```powershell
Copy-Item .env.example .env
notepad .env
```

Fill in:
| Variable | Where to get it |
|---|---|
| `EXPO_PUBLIC_SIMPLYRETS_USER` | [simplyrets.com/accounts](https://simplyrets.com/accounts) |
| `EXPO_PUBLIC_SIMPLYRETS_PASSWORD` | Same as above |
| `EXPO_PUBLIC_CRM_WEBHOOK_URL` | Your Zapier webhook URL |
| `EXPO_PUBLIC_TWILIO_ACCOUNT_SID` | [console.twilio.com](https://console.twilio.com) |
| `EXPO_PUBLIC_TWILIO_AUTH_TOKEN` | Same as above |
| `EXPO_PUBLIC_TWILIO_FROM_NUMBER` | Your Twilio number |
| `EXPO_PUBLIC_AGENT_PHONE` | Your cell number (receives lead SMS) |

> **Note:** The app works without any of these set. SimplyRETS sandbox data loads by default.

---

## 4. Start the app

```powershell
# Start on all platforms
npm start

# Or target a specific platform
npm run android
npm run ios
npm run web
```

Scan the QR code with the **Expo Go** app on your phone.

---

## 5. Initialize git (run once)

```powershell
git init
git add .
git commit -m "feat: initial Dayton Relo project scaffold"

git add app/_layout.tsx "app/(tabs)/_layout.tsx" "app/(tabs)/index.tsx"
git commit -m "feat: root layout + tab navigator with luxury black/gold design"

git add "app/(tabs)/explore.tsx" "app/(tabs)/tools.tsx" "app/(tabs)/contact.tsx"
git commit -m "feat: explore (IDX), tools, and contact tab screens"

git add app/military.tsx app/bah-calculator.tsx app/neighborhood-quiz.tsx app/employer-map.tsx
git commit -m "feat: military VA guide, BAH calculator, neighborhood quiz, employer map"

git add shared/ api/
git commit -m "feat: shared components, theme, types, and API layer (SimplyRETS, leads, SMS)"

git add content/
git commit -m "content: neighborhoods and employers data for Dayton metro"
```

---

## 6. Connect Live Chat (optional)

### Intercom
```powershell
npm install @intercom/intercom-react-native
```
Add your App ID to `.env`:
```
EXPO_PUBLIC_INTERCOM_APP_ID=your_app_id
```
Then uncomment the Intercom lines in `shared/components/ChatWidget.tsx`.

### Tidio
```powershell
npm install @tidio/tidio-react-native
```
Add your key to `.env` and uncomment the Tidio lines in `ChatWidget.tsx`.

---

## 7. Wire in live IDX listings

Once your SimplyRETS production credentials are in `.env`, replace the
placeholder in `app/(tabs)/index.tsx` with a call to `simplyRetsApi.getFeatured()`.
The full API client is ready in `api/simplyrets.ts`.

---

## Project Structure

```
dayton-relo-app/
├── app/
│   ├── _layout.tsx           Root stack + status bar
│   ├── (tabs)/
│   │   ├── _layout.tsx       Tab bar (Home, Explore, Tools, Contact)
│   │   ├── index.tsx         Home screen
│   │   ├── explore.tsx       IDX listing search
│   │   ├── tools.tsx         Tool directory
│   │   └── contact.tsx       Lead capture + agent card
│   ├── military.tsx          Military & VA guide
│   ├── bah-calculator.tsx    BAH calculator (WPAFB rates baked in)
│   ├── neighborhood-quiz.tsx 5-question neighborhood matcher
│   └── employer-map.tsx      Employer directory + commute info
│
├── api/
│   ├── config.ts             Central API config (reads .env)
│   ├── simplyrets.ts         IDX feed client
│   ├── leads.ts              CRM webhook + SMS orchestration
│   └── sms.ts                Twilio SMS helper
│
├── shared/
│   ├── components/
│   │   ├── QuickActionTile.tsx
│   │   ├── Header.tsx
│   │   ├── LeadCaptureForm.tsx
│   │   ├── ListingCard.tsx
│   │   ├── ChatWidget.tsx
│   │   └── GoldButton.tsx
│   ├── theme/colors.ts       Brand color palette
│   └── types/
│       ├── listing.ts        SimplyRETS listing types
│       └── lead.ts           Lead form types + CRM payload
│
├── content/
│   ├── neighborhoods.json    7 Dayton neighborhoods with data
│   └── employers.json        7 major Dayton employers
│
├── assets/images/            Icons, splash, adaptive icon
├── web/index.html            Web shell
├── global.css                Tailwind base
├── tailwind.config.js        Brand colors + NativeWind preset
├── babel.config.js           NativeWind Babel transform
├── metro.config.js           NativeWind Metro plugin
├── app.json                  Expo config
├── tsconfig.json             TypeScript paths
└── .env.example              Environment variable template
```
