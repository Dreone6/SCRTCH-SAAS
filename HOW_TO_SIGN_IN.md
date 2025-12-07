# 🔐 How to Sign In to Prosperly

## ✅ TEST ACCOUNT CREATED FOR YOU!

I've created a test account you can use immediately:

```
Email: test@prosperly.com
Password: Test123456!
```

---

## 📱 Sign In Steps

### What You Should See:

1. **Animated Splash Screen** (6 seconds)
   - Large Prosperly logo animating

2. **Sign-In Options Screen**
   - Large Prosperly logo at top
   - "How would you like to sign in?" heading
   - Multiple buttons:
     - 🟢 Sign in with Biometrics (if available)
     - ⚫ Sign in with Apple (Coming Soon)
     - ⚪ Sign in with Google (Coming Soon)
     - 🔵 **Sign in with email** ← CLICK THIS ONE

3. **Click "Sign in with email"**
   - This takes you to the email/password form
   - You'll see a back arrow if you need to go back

4. **Enter Credentials**
   - Email: `test@prosperly.com`
   - Password: `Test123456!`
   - Click "Sign In" button

5. **Dashboard Should Load**
   - You'll see your dashboard with stats
   - Welcome message with your name

---

## 🆕 Or Create Your Own Account

### Option A: Quick Signup

1. From the sign-in options screen
2. Scroll down and click "Sign Up"
3. Click "Sign up with email"
4. Fill in:
   - Your name
   - Your email
   - Password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
   - Confirm password
5. Click "Create Account"
6. Check your email for verification (from Supabase)
7. Come back and sign in

### Option B: Use Test Account (Faster)

Just use the credentials above to test immediately!

---

## 🐛 If Sign In "Goes Nowhere"

### Common Issues:

**1. Clicking Wrong Button**
- ❌ "Sign in with Apple" → Shows "Coming Soon"
- ❌ "Sign in with Google" → Shows "Coming Soon"
- ✅ "Sign in with email" → Opens login form

**2. Network Issues**
- The app needs internet to connect to Supabase
- Check your phone's internet connection
- Try refreshing the page

**3. JavaScript Errors**
- Open browser console (if using web preview)
- Look for red error messages
- Share any errors you see

**4. Form Not Submitting**
- Make sure you filled both email AND password
- Click the blue "Sign In" button at the bottom
- Watch for error messages under the fields

---

## 🔍 Debugging Steps

If nothing happens when you try to sign in:

1. **Try the test account first:**
   ```
   test@prosperly.com
   Test123456!
   ```

2. **Check if you're on the right screen:**
   - You should see input fields for email and password
   - NOT just the buttons screen

3. **Look for error messages:**
   - Red text under the input fields
   - Alert popups
   - Console errors (F12 in browser)

4. **Try clearing and re-entering:**
   - Clear both fields
   - Type email slowly
   - Type password slowly
   - Click Sign In

---

## ✅ What Should Happen After Sign In

Once you successfully sign in:

1. Screen transitions smoothly
2. You see the **Dashboard** with:
   - "Welcome back, [Your Name]"
   - Total Lent: $0.00
   - Total Borrowed: $0.00
   - Total Outstanding: $0.00
   - Quick action buttons
   - Empty transactions list

3. Bottom navigation appears:
   - Dashboard
   - Transactions
   - Add (big plus button)
   - Rating
   - Profile

---

## 🎯 Quick Test Flow

**Fastest way to test everything:**

1. Open app → Wait for splash
2. Click **"Sign in with email"**
3. Enter `test@prosperly.com`
4. Enter `Test123456!`
5. Click **"Sign In"**
6. ✅ You should see the dashboard!

---

## 💡 Pro Tips

- **First time?** → Use test account (test@prosperly.com)
- **Want your own?** → Create account, verify email, then sign in
- **Biometrics?** → Only works in Expo Go app, not web browser
- **Stuck?** → Try refreshing the page and starting over

---

## 🆘 Still Not Working?

If you're still having issues, please share:
1. What device are you using? (iPhone, Android, Computer)
2. What method? (Web browser or Expo Go app)
3. What exactly happens when you click Sign In?
4. Any error messages you see?
5. Screenshot if possible

---

## 🎉 Once You're In...

Try these features:
- Add a lend transaction
- Add a borrow transaction  
- View your Prosperly Rating
- Upload a profile picture
- Check out the settings

Have fun testing! 🚀
