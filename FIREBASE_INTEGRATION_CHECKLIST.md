# Firebase Integration Checklist for Perfectory Voice

Your Firebase project (`banglaquiz-sgw69`) is now fully wired into the app. Follow this checklist to ensure everything works end-to-end.

## ✅ What's Already Connected

- **Firebase SDK**: Installed and initialized with your credentials
- **Authentication**: Email/password + Google OAuth ready
- **Firestore Database**: Configured for user profiles and voice generation history
- **Realtime Database**: Connected for live updates (optional use)
- **Web Speech API**: Browser-native TTS for Bangla, English, Hindi
- **Credits System**: Tracks free tier (50 credits) and paid tiers

## 📋 Configuration Steps (Firebase Console)

### Step 1: Enable Authentication Methods

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **banglaquiz-sgw69**
3. Left sidebar → **Authentication** → **Sign-in method**
4. **Enable:**
   - ✅ Email/Password
   - ✅ Google

### Step 2: Set Authorized Domains

1. In **Authentication** → **Settings** → **Authorized Domains**
2. Add **all** these domains:
   ```
   localhost:3000
   127.0.0.1:3000
   [your-vercel-domain].vercel.app
   ```
   This prevents "Authorization domain not valid" errors.

### Step 3: Create Firestore Database

1. Left sidebar → **Firestore Database** → **Create Database**
2. Choose:
   - **Location**: Closest to your users (e.g., `us-central1`)
   - **Start in Test mode** for development (secure later)
3. Click **Create**

### Step 4: Add Security Rules

1. In **Firestore Database** → **Rules** tab
2. Replace all rules with:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{uid} {
      // Own profile: full access
      allow read, write: if request.auth.uid == uid;
      // Others can view if public
      allow read: if resource.data.isPublic == true;
    }

    // Generations collection
    match /generations/{docId} {
      // Owner can read
      allow read: if request.auth.uid == resource.data.uid;
      // Owner can create new
      allow create: if request.auth.uid == request.resource.data.uid;
      // Owner can update
      allow update: if request.auth.uid == resource.data.uid;
    }

    // Deny all by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click **Publish**

### Step 5: Create Realtime Database (Optional)

1. Left sidebar → **Realtime Database** → **Create Database**
2. Choose same location as Firestore
3. **Security Rules**:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

## 🧪 Testing the Connection

### Test 1: Sign Up with Email

1. Open your app at `http://localhost:3000/signup`
2. Fill in: Name, Email, Password (6+ chars)
3. Click **Create Account**
4. ✅ Success: Redirected to dashboard with 50 free credits

**Check in Firebase:**
- **Authentication** → **Users**: New user appears
- **Firestore** → **users** collection: New document with user's profile

### Test 2: Generate Voice

1. On dashboard, click **Voice Generator**
2. Select language (Bangla, English, or Hindi)
3. Type text: "Hello, this is a test"
4. Click **Generate Voice**
5. ✅ Success: Voice plays, credits deduct by 1

**Check in Firebase:**
- **Firestore** → **generations** collection: New document appears with the generation data
- User's **credits** field should decrease

### Test 3: View Profile

1. Click your avatar/name in header → **Profile**
2. ✅ Recent generations display from Firestore
3. Click username link → public profile view

### Test 4: Google Sign-In

1. Log out (click avatar → Logout)
2. Go to `/login`
3. Click **Sign in with Google**
4. ✅ Success: New user created in Firestore with Google data

## 🚨 Troubleshooting

### "Authorization domain not valid"
- **Fix**: Add your domain to Authorized Domains in Firebase Console → Authentication → Settings

### "No such document" when viewing profile
- **Fix**: Ensure user is logged in and Firestore rules allow the read

### Credits not deducting after generation
- **Problem**: User might not be logged in, or Firestore write failed
- **Fix**: Check browser console for errors, verify Firestore rules allow write

### Google sign-in shows blank popup
- **Problem**: Domain not authorized, or missing Google OAuth config
- **Fix**: Re-add domain to Authorized Domains, refresh page

### "Project not set up" error
- **Problem**: Firebase SDK initialization failed
- **Fix**: Verify `NEXT_PUBLIC_FIREBASE_API_KEY` is set in environment

## 📊 Firestore Collection Schema

### `users` Collection
```typescript
{
  uid: string,                    // Firebase UID
  email: string,
  name: string,
  username: string,               // slugified, unique
  bio: string,
  photoURL: string,               // Avatar URL
  plan: "free" | "monthly" | "yearly",
  credits: number,                // Used for rate limiting
  isPublic: boolean,              // Profile visibility
  createdAt: Timestamp
}
```

### `generations` Collection
```typescript
{
  uid: string,                    // User who generated
  text: string,                   // Input text
  language: "en" | "bn" | "hi",   // Language code
  voice: string,                  // Browser voice URI
  pitch: number,                  // 0.5 - 2.0
  rate: number,                   // 0.1 - 10.0
  createdAt: Timestamp
}
```

## 🔄 Data Flow Diagram

```
User Signup
  ↓
Firebase Auth creates user
  ↓
ensureUserProfile() creates Firestore doc
  ↓
User gets 50 free credits
  ↓
User logs in → AuthContext loads profile
  ↓
User generates voice
  ↓
spendCredit(uid, 1) decrements credits
  ↓
saveGeneration() stores to Firestore
  ↓
Dashboard fetches recent generations via getUserGenerations()
```

## 🔐 Security Best Practices

1. **Test Mode Rules**: Only for development. Switch to Production rules before deploying to production.
2. **API Keys**: Your `apiKey` is public (designed for client-side Firebase), but it's scoped to your project only.
3. **CORS**: Add your domain to authorized domains to prevent CORS errors.
4. **Row-level Security**: Firestore rules ensure users can only access their own data (except public profiles).

## 📦 Deployment to Vercel

1. In Vercel project settings, add authorized domain for your Vercel URL
2. Deploy your Next.js app
3. Visit your production URL and test the full flow
4. Monitor Firebase console for any rule violations or errors

## 🎯 Next Steps

1. ✅ Complete the checklist above
2. Test auth and generation flow locally
3. Deploy to Vercel
4. Monitor Firestore usage in Firebase Console
5. (Optional) Integrate Stripe for paid plans

---

For detailed Firebase docs, see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
