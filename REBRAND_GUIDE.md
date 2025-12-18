# 🔄 Rebranding Guide: Prosperly → scrtch

**Date:** December 18, 2024  
**Task:** Rebrand all Prosperly references to scrtch

---

## 📋 Files That Need Rebranding

### 1. App Configuration

**File: `/app/frontend/app.json`**
```json
{
  "expo": {
    "name": "scrtch",  // Change from "Prosperly"
    "slug": "scrtch",  // Change from "prosperly"
    "scheme": "scrtch",  // Change from "prosperly"
    "ios": {
      "bundleIdentifier": "com.scrtch.app"  // Change from "com.prosperly.app"
    },
    "android": {
      "package": "com.scrtch.app"  // Change from "com.prosperly.app"
    }
  }
}
```

### 2. Package Name

**File: `/app/frontend/package.json`**
```json
{
  "name": "scrtch-mobile",  // Change from "prosperly-mobile"
  "description": "scrtch - Track lending, preserve relationships"
}
```

### 3. Brand Colors

**File: `/app/frontend/src/constants/colors.ts`**

Current:
```typescript
export const Colors = {
  prosperlyBlue: '#186EDE',
  prosperlyNavy: '#0A1A3A',
  prosperlyMint: '#37D0A4',
  prosperlySlate: '#E8EDF3',
  prosperlyGold: '#FFD93D',
  // ...
};
```

Rebrand to:
```typescript
export const Colors = {
  scrtchBlue: '#186EDE',      // Or new brand color
  scrtchNavy: '#0A1A3A',      // Or new brand color
  scrtchMint: '#37D0A4',      // Or new brand color
  scrtchSlate: '#E8EDF3',     // Or new brand color
  scrtchGold: '#FFD93D',      // Or new brand color
  
  // Keep old names as aliases during transition
  prosperlyBlue: '#186EDE',   // Deprecated
  prosperlyNavy: '#0A1A3A',   // Deprecated
  // ...
};
```

### 4. Logo & Assets

**Files to Replace:**
- `/app/frontend/assets/logos/prosperly-logo.png` → `scrtch-logo.png`
- App icon (if exists)
- Splash screen graphics

**Where Logo Appears:**
- Splash screen
- Login/Signup screens
- Onboarding slides
- Dashboard header
- Email templates (future)

### 5. Text Content

**Files with "Prosperly" text references:**

**Onboarding:**
- `/app/frontend/app/(onboarding)/index.tsx`
- Change slide content if mentions "Prosperly"

**Agreement Document:**
- `/app/frontend/src/services/loan.service.ts`
- Function: `generateAgreementText()`
- Line: "Generated on [date] via Prosperly App"
- Change to: "Generated on [date] via scrtch App"

**Database Templates:**
- `/app/frontend/supabase-ai-messaging-extension.sql`
- Message templates don't mention brand name (good!)

### 6. TypeScript Types

**File: `/app/frontend/src/types/index.ts`**
- Type names don't use brand name (good!)
- Interface `ProsperlyRating` → Keep or rename to `TrustRating`

### 7. Environment Variables

**File: `/app/frontend/.env`**
- No brand-specific env vars (good!)

### 8. Documentation

All markdown files in `/app/`:
- PROSPERLY_COMPLETE_MASTER_DOCUMENT.md
- PROSPERLY_COMPLETE_BREAKDOWN.md
- HANDOFF_PACKAGE.md
- etc.

**Options:**
1. Keep "Prosperly" in historical docs
2. Find/replace all to "scrtch"
3. Add note: "Originally built as Prosperly, rebranded to scrtch"

---

## 🔍 Search & Replace Commands

### Quick Find All Instances

```bash
# Find all "Prosperly" references
cd /app/frontend
grep -r "Prosperly" --include="*.ts" --include="*.tsx" --include="*.json"

# Find all "prosperly" (lowercase)
grep -r "prosperly" --include="*.ts" --include="*.tsx" --include="*.json"

# Count occurrences
grep -r "Prosperly" --include="*.ts" --include="*.tsx" | wc -l
```

### Automated Replace (USE WITH CAUTION)

```bash
# Backup first!
cd /app/frontend
tar -czf ../prosperly-backup.tar.gz .

# Replace in all TypeScript files
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/Prosperly/scrtch/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/prosperly/scrtch/g'

# Replace in JSON files
find . -name "*.json" | xargs sed -i 's/Prosperly/scrtch/g'
find . -name "*.json" | xargs sed -i 's/prosperly/scrtch/g'

# Verify changes
git diff
```

---

## 🎨 Brand Color Update (Optional)

If scrtch has different brand colors:

**Update: `/app/frontend/src/constants/colors.ts`**

```typescript
export const Colors = {
  // New scrtch brand colors
  scrtchPrimary: '#YOUR_COLOR',
  scrtchSecondary: '#YOUR_COLOR',
  scrtchAccent: '#YOUR_COLOR',
  
  // Semantic colors (update hex values)
  primary: '#YOUR_COLOR',
  secondary: '#YOUR_COLOR',
  
  // Keep structure
  white: '#FFFFFF',
  black: '#000000',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    // ...
  }
};
```

**Then update all component imports:**
```typescript
// Old
color: Colors.prosperlyBlue

// New
color: Colors.scrtchPrimary
// OR
color: Colors.primary
```

---

## 📱 App Store / Play Store

**Bundle Identifiers:**
- iOS: `com.scrtch.app`
- Android: `com.scrtch.app`

**App Names:**
- Display name: "scrtch"
- Subtitle: "Track lending, preserve relationships"

**Keywords (ASO):**
- scrtch
- lending tracker
- IOU app
- debt tracker
- loan management
- peer to peer lending

---

## 🗄️ Database Rebrand

**Supabase Project:**
- Project name: "scrtch" (if creating new)
- Database name: Can keep or rename
- Tables: No brand name in table names (good!)

**Message Templates:**
- Check `message_templates` table
- Templates don't mention brand (good!)

---

## 🌐 URLs & Domains

**Current:**
- Demo: https://money-friend.preview.emergentagent.com

**Future (Your Domain):**
- https://scrtch.app
- https://app.scrtch.app
- https://api.scrtch.app

**Update in:**
- App config
- Deep linking
- OAuth redirects
- Email templates

---

## 📋 Rebrand Checklist

### Code Changes
- [ ] app.json (name, slug, bundle IDs)
- [ ] package.json (name, description)
- [ ] colors.ts (rename color constants)
- [ ] Replace logo files
- [ ] Update splash screen
- [ ] Update icon
- [ ] Search/replace "Prosperly" → "scrtch"
- [ ] Update agreement text generation
- [ ] Update any hardcoded text

### Documentation
- [ ] Update README
- [ ] Update HANDOFF_PACKAGE.md
- [ ] Add rebrand note to docs
- [ ] Update screenshots (if any)

### Configuration
- [ ] Update .env.example
- [ ] Update app store metadata
- [ ] Update deep link scheme
- [ ] Update OAuth redirects

### Assets
- [ ] New logo (PNG, SVG)
- [ ] New app icon (1024x1024)
- [ ] New splash screen
- [ ] New screenshots for stores
- [ ] Brand guidelines document

### Testing
- [ ] Build and test app
- [ ] Verify all screens show new brand
- [ ] Check deep links work
- [ ] Test push notifications
- [ ] Verify OAuth flows

---

## 🚀 Quick Rebrand Script

**Save as: `/app/rebrand.sh`**

```bash
#!/bin/bash

echo "🔄 Starting scrtch rebrand..."

# Backup
cd /app/frontend
tar -czf ../prosperly-backup-$(date +%Y%m%d).tar.gz .

# Replace in code files
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.expo/*" \
  -exec sed -i 's/Prosperly/scrtch/g' {} +

find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.expo/*" \
  -exec sed -i 's/prosperly/scrtch/g' {} +

# Rename logo file (if new logo exists)
# mv assets/logos/prosperly-logo.png assets/logos/scrtch-logo.png

echo "✅ Rebrand complete!"
echo "⚠️  Manual steps still needed:"
echo "   - Replace logo files in assets/"
echo "   - Update brand colors in colors.ts"
echo "   - Test the app thoroughly"
```

---

## ⚠️ Important Notes

**DON'T Break:**
1. Database table names (no brand in them)
2. Environment variable names
3. Third-party API configurations
4. Authentication flows

**DO Update:**
1. User-facing text
2. Logo and graphics
3. App store metadata
4. Marketing materials
5. Documentation

**KEEP For History:**
1. Git commit messages can reference "Prosperly"
2. Internal documentation can note the rebrand
3. Database migrations can reference original names

---

## 📧 GitHub Repository Name

**Create as:**
```
github.com/YOUR-ORG/scrtch-mobile
```

Not "sntch-mobile" or "prosperly-mobile"

---

## ⏰ Rebrand Timeline

**Phase 1 (1-2 hours):**
- Update app.json
- Update package.json
- Search/replace text
- Update colors.ts

**Phase 2 (2-4 hours):**
- Replace logo files
- Update splash screen
- Create new app icon
- Test thoroughly

**Phase 3 (Ongoing):**
- Update documentation
- Create brand guidelines
- Update marketing materials
- App store submissions

---

**Status:** Ready to rebrand!  
**Difficulty:** Low-Medium  
**Time Estimate:** 4-6 hours for complete rebrand

---

*Prosperly → scrtch: Same great code, fresh new brand!*
