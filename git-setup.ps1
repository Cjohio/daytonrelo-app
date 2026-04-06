# ─────────────────────────────────────────────────────────────
#  Dayton Relo — Git Setup Script
#  Run this ONCE from PowerShell after moving the project:
#
#    cd C:\Users\wolfb\dayton-relo-app
#    .\git-setup.ps1
# ─────────────────────────────────────────────────────────────

Write-Host "🏠 Dayton Relo — Initializing Git..." -ForegroundColor Yellow

# Step 1: Init + config
git init
git branch -m main
git config user.name  "Dayton Relo"
git config user.email "hello@daytonrelo.com"

# Commit 1: Project scaffold (config + tooling)
Write-Host "`n📦 Commit 1: Project scaffold" -ForegroundColor Cyan
git add package.json app.json tsconfig.json babel.config.js metro.config.js tailwind.config.js global.css .gitignore .env.example
git commit -m "feat: initial Expo + NativeWind project scaffold

- Expo SDK 52 + Expo Router 4
- NativeWind v4 (Tailwind CSS) configured
- TypeScript with path aliases
- Environment variable template (.env.example)"

# Commit 2: Shared theme + types
Write-Host "`n🎨 Commit 2: Brand theme + types" -ForegroundColor Cyan
git add shared/theme/ shared/types/
git commit -m "feat: luxury brand design system + TypeScript types

- Colors: black / white / gold (#C9A84C) palette
- Listing types (SimplyRETS schema)
- Lead form types + CRM payload interface"

# Commit 3: API layer
Write-Host "`n🔌 Commit 3: API layer" -ForegroundColor Cyan
git add api/
git commit -m "feat: API layer — SimplyRETS IDX, lead webhook, Twilio SMS

- SimplyRETS client with Dayton-area defaults + rental support
- CRM webhook (Zapier-compatible POST)
- Twilio SMS agent notifications on lead submit
- All secrets via EXPO_PUBLIC_ env vars"

# Commit 4: Shared components
Write-Host "`n🧩 Commit 4: Shared components" -ForegroundColor Cyan
git add shared/components/
git commit -m "feat: shared UI components — luxury black/gold design

- QuickActionTile: black card, gold icon, gold accent bar
- Header: black bar, gold DAYTON RELO wordmark
- GoldButton: filled (#C9A84C) and outline variants
- ListingCard: photo + price + specs for IDX listings
- LeadCaptureForm: full form with employer chips + timeline picker
- ChatWidget: FAB with Intercom/Tidio placeholder"

# Commit 5: Navigation + home screen
Write-Host "`n🏠 Commit 5: Navigation + home screen" -ForegroundColor Cyan
git add app/_layout.tsx "app/(tabs)/_layout.tsx" "app/(tabs)/index.tsx"
git commit -m "feat: root stack + tab navigator + home screen

- Root layout: black headers, gold tint, safe area
- Tab bar: 4 tabs (Home/Explore/Tools/Contact), gold active state
- Home screen: hero on black, market stats strip, 2x2 quick action grid,
  IDX placeholder, 'Why Dayton Relo' section, floating chat widget"

# Commit 6: Tab screens
Write-Host "`n📋 Commit 6: Tab screens" -ForegroundColor Cyan
git add "app/(tabs)/explore.tsx" "app/(tabs)/tools.tsx" "app/(tabs)/contact.tsx"
git commit -m "feat: explore, tools, and contact tab screens

- Explore: sale/rent toggle, city chips, SimplyRETS search, listing grid
- Tools: card directory linking to all feature screens + external resources
- Contact: agent card, quick contact buttons, full lead capture form"

# Commit 7: Feature screens
Write-Host "`n🛠️  Commit 7: Feature screens" -ForegroundColor Cyan
git add app/military.tsx app/bah-calculator.tsx app/neighborhood-quiz.tsx app/employer-map.tsx
git commit -m "feat: military, BAH calc, neighborhood quiz, employer map screens

- Military/VA: benefits breakdown, WPAFB neighborhood table, resource links
- BAH Calculator: 2025 DFAS rates for all pay grades (ZIP 45431),
  dependency toggle, max home price estimate
- Neighborhood Quiz: 5-question scored quiz, ranked results with score bars
- Employer Map: 7 major employers with commute data, list + map placeholder"

# Commit 8: Content data
Write-Host "`n📊 Commit 8: Content data" -ForegroundColor Cyan
git add content/ web/
git commit -m "content: neighborhoods.json + employers.json for Dayton metro

- 7 neighborhoods: Beavercreek, Fairborn, Kettering, Centerville,
  Huber Heights, Oakwood, Xenia — with prices, schools, military flags
- 7 employers: WPAFB, L3Harris, Kettering Health, Premier Health,
  CareSource, Reynolds & Reynolds, Wright State"

# Commit 9: Setup docs
Write-Host "`n📖 Commit 9: Setup docs" -ForegroundColor Cyan
git add SETUP.md git-setup.ps1
git commit -m "docs: SETUP.md and git-setup.ps1 for onboarding"

Write-Host "`n✅ Done! Git log:" -ForegroundColor Green
git log --oneline
