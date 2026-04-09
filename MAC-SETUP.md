# Dayton Relo App — Mac Setup Guide

> Run these commands in **Terminal** (Cmd+Space → type "Terminal").
> Last verified: April 9, 2026

---

## Step 1: Install Homebrew (Mac package manager)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After install, run the two PATH commands it gives you. They look like:

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

Verify:
```bash
brew --version
```

---

## Step 2: Install Node.js

```bash
brew install node
```

Verify:
```bash
node --version   # should be 22+
npm --version    # should be 10+
```

---

## Step 3: Install Git

```bash
brew install git
git config --global user.name "Chris"
git config --global user.email "chris@cjohio.com"
```

---

## Step 4: Install Expo CLI + EAS CLI

```bash
npm install -g expo-cli eas-cli
```

Verify:
```bash
npx expo --version
eas --version
```

---

## Step 5: Log in to EAS (Expo Application Services)

```bash
eas login
```

Use the **wolfbot** account (chris@cjohio.com). Verify with:

```bash
eas whoami   # should output: wolfbot
```

> ⚠️ If `eas whoami` shows anything other than `wolfbot`, update `app.json → "owner"` to match, or log in to the correct account. The EAS project is registered under `wolfbot`.

---

## Step 6: Set up GitHub authentication

GitHub push/pull uses HTTPS + the `gh` CLI for authentication:

```bash
brew install gh
gh auth login --hostname github.com --git-protocol https --web
```

Follow the browser prompts (Continue as Cjohio → Authorize). After that, `git push` works automatically from this repo.

---

## Step 7: Install Xcode (required for iOS builds)

1. Open the **App Store** → search **Xcode** → install (large download, ~12 GB)
2. After install:

```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -runFirstLaunch
```

---

## Step 8: Install Watchman (makes Expo faster)

```bash
brew install watchman
```

---

## Step 9: Install project dependencies

```bash
cd ~/Documents/Claude/Claude/Projects/Set\ up\ open\ clay\ discord/dayton-relo-app
npm install
```

---

## Step 10: Start the app

```bash
npx expo start --clear
```

Scan the QR code with **Expo Go** on your phone.

---

## Step 11: Install VS Code (optional)

```bash
brew install --cask visual-studio-code
code .
```

---

## All-at-once install (after Homebrew is done)

```bash
brew install node git watchman
npm install -g expo-cli eas-cli
brew install gh
gh auth login --hostname github.com --git-protocol https --web
xcode-select --install
brew install --cask visual-studio-code
cd ~/Documents/Claude/Claude/Projects/Set\ up\ open\ clay\ discord/dayton-relo-app
npm install
npx expo start --clear
```

---

## Troubleshooting

**"command not found: brew"** — Close Terminal, reopen, and try again. If still broken, re-run the Homebrew PATH commands from Step 1.

**"permission denied"** — Prefix with `sudo` (e.g., `sudo npm install -g expo-cli`).

**Expo won't start** — Make sure you're in the app folder and have run `npm install`.

**iOS simulator won't open** — Full Xcode from the App Store is required (Step 7).

**`git push` asks for a password** — Run `gh auth login` (Step 6) to set up credential helper.

**`eas build` fails with "account not found"** — Run `eas login` and make sure you're logged in as `wolfbot`.
