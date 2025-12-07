# 📱 Prosperly - Mobile Testing Guide

## Option 1: Use Web Preview on Mobile Browser

The easiest way to test Prosperly on your mobile device:

1. **Open your mobile browser** (Safari on iPhone, Chrome on Android)
2. **Go to:** http://10.100.21.9:3000
3. The app will load in your browser
4. Test all features including biometric authentication

**Note:** Biometric authentication (Face ID/Touch ID) may not work in mobile browsers. For full testing, use Option 2.

---

## Option 2: Use Expo Go App (Recommended for Full Testing)

To test native features like Face ID/Touch ID, you need the Expo Go app:

### Step 1: Install Expo Go
- **iPhone:** Download from App Store: https://apps.apple.com/app/expo-go/id982107779
- **Android:** Download from Play Store: https://play.google.com/store/apps/details?id=host.exp.exponent

### Step 2: Connect to Prosperly

**Method A: Manual URL Entry**
1. Open Expo Go app
2. Tap "Enter URL manually"
3. Enter: `exp://10.100.21.9:8081`
4. Tap "Connect"

**Method B: Generate QR Code (if available)**
1. The development server should display a QR code
2. Scan it with your phone camera (iPhone) or Expo Go app (Android)
3. App will load automatically

---

## What to Test on Mobile

### ✅ Authentication Flow
- [ ] Open app - see animated splash screen (6 seconds)
- [ ] See sign-in options screen with large logo
- [ ] Tap "Sign in with Biometrics" (if available on device)
- [ ] Test Face ID or Touch ID
- [ ] Try "Sign in with email"
- [ ] Test signup flow

### ✅ Dashboard
- [ ] View stats cards
- [ ] Check outstanding amount card
- [ ] Test quick action buttons
- [ ] View recent transactions
- [ ] Pull to refresh

### ✅ Add Transaction
- [ ] Tap "Lend Money" button
- [ ] Fill form with touch keyboard
- [ ] Select due date with date picker
- [ ] Choose reminder frequency
- [ ] Save transaction

### ✅ Transactions List
- [ ] View all transactions
- [ ] Filter by Lent/Borrowed
- [ ] Tap transaction to see details
- [ ] Mark as paid
- [ ] Record partial payment

### ✅ Prosperly Rating
- [ ] View rating screen
- [ ] See star rating
- [ ] Check payment statistics
- [ ] Read improvement tips

### ✅ Profile
- [ ] Tap avatar to upload photo
- [ ] Test image picker
- [ ] View profile settings
- [ ] Sign out

---

## Troubleshooting

### Can't Connect to App?

**Check Network:**
- Ensure your phone and development server are on the same network
- Try accessing http://10.100.21.9:3000 in your mobile browser first
- If that doesn't work, the server IP may be different

**Alternative URLs to Try:**
- `exp://localhost:8081` (if on same device)
- `exp://[your-server-ip]:8081`

### Biometric Authentication Not Working?

**Requirements:**
- Must use Expo Go app (not mobile browser)
- Device must have Face ID/Touch ID enabled
- Must grant permissions when prompted

**Fallback:**
- If biometrics don't work, use "Sign in with email"
- All other features will work normally

---

## Current Server Info

**Web Preview:** http://10.100.21.9:3000
**Expo Server:** exp://10.100.21.9:8081

**Development Mode:** Tunnel enabled for external access

---

## Known Issues

1. **QR Code Not Displaying:** The QR code may not show in the terminal. Use manual URL entry instead.
2. **Hot Reload:** Changes to code require manual refresh in Expo Go
3. **Notifications:** Push notifications need additional setup for production

---

## Next Steps After Testing

1. Report any bugs or UI issues
2. Test on both iOS and Android if possible
3. Verify biometric authentication works
4. Check that logo is appropriately sized
5. Confirm all buttons and navigation work smoothly

---

## Need Help?

If you encounter issues:
1. Check that both devices are on the same WiFi network
2. Try restarting the Expo Go app
3. Restart the development server: `sudo supervisorctl restart expo`
4. Check logs: `sudo tail -f /var/log/supervisor/expo.out.log`
