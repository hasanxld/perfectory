# Deployment Guide — Perfectory Voice

## Local Development

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Set Up Environment Variables
Your Firebase credentials are already hardcoded (safe for client-side use).

Optional: Add custom database ID
```bash
echo 'NEXT_PUBLIC_FIRESTORE_DB_ID=my-custom-db' > .env.local
```

### 3. Start Development Server
```bash
pnpm dev
```

Visit `http://localhost:3000`

### 4. Firebase Emulators (Optional, for offline testing)
```bash
npm install -g firebase-tools
firebase emulators:start
```

The app auto-detects emulators in dev mode.

---

## Firebase Configuration (Required Before Deployment)

### Step 1: Authorize Your Domain

1. Go to [Firebase Console](https://console.firebase.google.com)
2. **Authentication** → **Settings** → **Authorized domains**
3. Add your Vercel domain:
   ```
   your-app.vercel.app
   ```

### Step 2: Enable Auth Providers

In **Authentication** → **Sign-in method**:
- ✅ Email/Password
- ✅ Google

### Step 3: Security Rules

Switch Firestore and RTDB from Test mode to Production rules:

**Firestore:**
```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
      allow read: if resource.data.isPublic == true;
    }
    match /generations/{docId} {
      allow read: if request.auth.uid == resource.data.uid;
      allow create: if request.auth.uid == request.resource.data.uid;
      allow update: if request.auth.uid == resource.data.uid;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Realtime Database:**
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

---

## Deploy to Vercel

### Option 1: Using Git (Recommended)

1. Push to GitHub:
```bash
git add .
git commit -m "feat: Perfectory Voice with Firebase"
git push origin main
```

2. Connect to Vercel:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repo
   - Select project root
   - Click **Deploy**

3. Vercel automatically detects Next.js and builds it

### Option 2: Using Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow prompts to link and deploy.

---

## Post-Deployment Checklist

- [ ] Firebase console has your Vercel domain in Authorized Domains
- [ ] Firebase Auth is enabled (Email/Password + Google)
- [ ] Firestore Database is created with correct rules
- [ ] Realtime Database is created with correct rules
- [ ] Test signup at `https://your-app.vercel.app/signup`
- [ ] Test login at `https://your-app.vercel.app/login`
- [ ] Test voice generation after logging in
- [ ] Check Firebase console → Firestore for new user doc
- [ ] Check Firebase console → Realtime DB for generation history

---

## Monitoring

### Firebase Console

- **Authentication** → **Users**: Track sign-ups
- **Firestore** → **Data Browser**: Check user docs, generations
- **Firestore** → **Usage**: Monitor read/write counts

### Vercel Analytics

- **Deployment** page: Check build logs
- **Analytics**: Monitor page views, API routes
- **Deployments**: Rollback if needed

---

## Environment Variables (If Using Admin SDK)

If you add server-side operations, add to Vercel project settings:

```
FIREBASE_ADMIN_KEY=<service-account-json>
```

Steps:
1. Firebase Console → **Project Settings** → **Service Accounts**
2. Generate new key (private key JSON)
3. Copy entire JSON
4. Vercel project → **Settings** → **Environment Variables**
5. Add `FIREBASE_ADMIN_KEY` with the JSON value

---

## Scaling & Performance

### Firestore Indexes

Firestore will prompt you to create indexes for queries. The app uses:
- `users` collection (no special index needed)
- `generations` by `(uid, createdAt)` descending

Auto-create when you see the prompt in Firebase console.

### Caching

The app uses Next.js caching by default. To adjust:
- Edit profile pages have `"use cache"` directive
- Adjust in `app/u/[username]/page.tsx` if needed

### Rate Limiting

Currently using Firestore's `credits` field. For production with high load:
1. Add Upstash Redis for rate limiting
2. Track generation count per hour
3. Return 429 status if exceeded

---

## Troubleshooting Deployment Issues

### "Unauthorized domain" Error
- ✅ Add Vercel domain to Firebase → Authentication → Authorized Domains
- ✅ Wait 5 mins for DNS to propagate
- ✅ Clear browser cache and refresh

### "Module not found" Error
- ✅ Check `pnpm install` completed successfully
- ✅ Verify all imports use correct paths (`@/lib/...`)
- ✅ Check build logs in Vercel console

### Firestore Queries Return Empty
- ✅ Check Firestore rules allow read
- ✅ Verify user is logged in (`useAuth().user` not null)
- ✅ Check data exists in Firestore console

### Voice Generation Not Working
- ✅ Check browser supports Web Speech API (Chrome, Edge, Safari)
- ✅ Ensure user has credits
- ✅ Check browser console for TTS errors
- ✅ Test locally first before blaming deployment

### Slow Performance

1. Check Firestore indexes are created
2. Monitor Firestore usage (tab open per user session = 1 listener)
3. Consider pagination for generation history
4. Add Redis caching for profiles if needed

---

## Custom Domain

To use your own domain:

1. Vercel project → **Settings** → **Domains**
2. Add your domain
3. Follow DNS instructions
4. Firebase console → add domain to Authorized Domains

---

## SSL/HTTPS

Vercel automatically provides HTTPS. No additional setup needed.

---

## Rollback

If deployment breaks:

1. Vercel project → **Deployments**
2. Click previous working deployment
3. Click **...** → **Promote to Production**

---

## Support & Resources

- [Vercel Docs](https://vercel.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

---

## Estimated Costs

**Firebase Pricing (as of 2024):**
- Firestore: First 1M reads/day free
- Realtime Database: First 100 connections free
- Authentication: First 50k users/month free
- Storage: First 5 GB free

For a small app with < 10k users/month, you should stay in the free tier.

---

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Add your domain to Firebase Authorized Domains
3. ✅ Test full auth + generation flow
4. (Optional) Add Stripe for premium plans
5. (Optional) Add email notifications for low credits
6. Monitor Firebase usage in console

---

Good luck! 🚀
