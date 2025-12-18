# 🚀 Prosperly - Quick Setup Guide

Get Prosperly running in 10 minutes!

---

## Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account (free tier works)
- Expo Go app on your phone (for testing)
- Code editor (VS Code recommended)

---

## Setup Steps

### 1. Get the Code

```bash
# If from GitHub:
git clone [REPOSITORY_URL]
cd prosperly-mobile/frontend

# If from zip:
unzip prosperly-code.zip
cd frontend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Supabase

**Create Project:**
1. Go to https://supabase.com
2. Click "New Project"
3. Name it "prosperly" (or your choice)
4. Choose a database password
5. Select a region
6. Click "Create Project" (takes ~2 minutes)

**Get Credentials:**
1. Go to Project Settings → API
2. Copy "Project URL"
3. Copy "anon public" key

**Run Database Schema:**
1. In Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy entire contents of `supabase-loans-schema.sql`
4. Paste and click "Run"
5. Should see success message
6. Repeat with `supabase-ai-messaging-extension.sql`

### 4. Configure Environment

```bash
# Create .env file from example
cp .env.example .env

# Edit .env and add your Supabase credentials:
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY-HERE
```

### 5. Start Development Server

```bash
npx expo start
```

You'll see QR code and options:
- Press `w` for web browser
- Press `i` for iOS simulator (Mac only)
- Press `a` for Android emulator
- Scan QR with Expo Go app on phone

### 6. Test the App

**Login with demo account:**
```
Email: demo@prosperly.com
Password: Demo123456!
```

You should see:
- Animated splash screen
- Onboarding (first time)
- Login screen
- Dashboard with $2,500 outstanding

---

## Troubleshooting

### "Module not found" errors
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npx expo start -c
```

### "Supabase connection failed"
- Check .env file has correct URL and key
- Verify schema was run successfully
- Check Supabase project status

### Expo Go connection issues
- Make sure phone and computer on same WiFi
- Try tunnel mode: `npx expo start --tunnel`
- Use web for testing: press `w`

### TypeScript errors
```bash
# Restart TypeScript server in VS Code
# Cmd+Shift+P → "Restart TS Server"
```

---

## Next Steps

### Add Real Users
1. Go to Supabase Dashboard → Authentication
2. Create new users
3. They can sign up via the app

### Customize Branding
1. Replace logo: `/assets/logos/prosperly-logo.png`
2. Update colors: `/src/constants/colors.ts`
3. Update app name: `app.json`

### Deploy to Devices
```bash
# iOS (requires Apple Developer account)
eas build --platform ios

# Android
eas build --platform android
```

### Add Features
- See `/app/LOAN_SYSTEM_IMPLEMENTATION_PROGRESS.md`
- Priority: Complete loan wizard step components
- Then: Loan detail screen
- Then: AI message integration

---

## File Structure Quick Reference

```
frontend/
├── app/                    # Screens (routes)
│   ├── (auth)/            # Login/Signup
│   ├── (onboarding)/      # First-time flow
│   └── (tabs)/            # Main app
│       └── dashboard.tsx  # Home screen
│
├── src/
│   ├── components/        # Reusable UI
│   ├── services/          # Business logic
│   │   └── loan.service.ts  # Loan CRUD
│   ├── contexts/          # State management
│   │   └── AuthContext.tsx  # Auth state
│   └── types/             # TypeScript types
│
├── assets/                # Images, fonts
├── .env                   # YOUR credentials
└── app.json              # Expo config
```

---

## Important Commands

```bash
# Start dev server
npx expo start

# Start with tunnel (for remote testing)
npx expo start --tunnel

# Clear cache
npx expo start -c

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android

# Type check
npm run tsc

# Build for production
eas build --platform all
```

---

## Getting Help

**Documentation:**
- `/app/PROSPERLY_COMPLETE_MASTER_DOCUMENT.md` - Full overview
- `/app/HANDOFF_PACKAGE.md` - Complete handoff guide
- Expo docs: https://docs.expo.dev
- Supabase docs: https://supabase.com/docs

**Common Issues:**
- Auth not working? Check AuthGuard logic
- Database errors? Verify RLS policies
- Styling issues? Check Typography/Colors constants

---

## Quick Checklist

- [ ] Node.js 18+ installed
- [ ] Supabase project created
- [ ] Database schemas run
- [ ] .env file configured
- [ ] Dependencies installed
- [ ] Dev server running
- [ ] Can see app in browser/device
- [ ] Can login with demo credentials
- [ ] Dashboard shows data

---

**Time to Complete:** 10-15 minutes  
**Difficulty:** Easy  
**Support:** See documentation files in `/app/`

Ready to build! 🚀
