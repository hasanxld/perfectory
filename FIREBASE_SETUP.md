# Firebase Setup Guide for Perfectory Voice

Your Firebase project is already configured with your credentials:
- **Project ID**: banglaquiz-sgw69
- **Auth Domain**: banglaquiz-sgw69.firebaseapp.com
- **Firestore Database**: Default database
- **Realtime Database**: banglaquiz-sgw69-default-rtdb

## Required Setup Steps

### 1. Enable Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **banglaquiz-sgw69**
3. Navigate to **Authentication** → **Sign-in method**
4. Enable these providers:
   - **Email/Password** ✓
   - **Google** ✓

### 2. Set Authorized Domains

1. In **Authentication** → **Settings** → **Authorized domains**
2. Add these domains:
   - `localhost:3000` (local dev)
   - `127.0.0.1:3000` (local dev)
   - Your Vercel deployment domain (e.g., `perfectory-voice.vercel.app`)

### 3. Create Firestore Database

1. Go to **Firestore Database** in the Firebase Console
2. Click **Create Database**
3. Choose:
   - **Location**: Select closest to you (e.g., us-central1)
   - **Security rules**: Start in **Test mode** for development (switch to **Production mode** rules later)

4. **Collection Structure** (auto-created by the app):
   ```
   users/
   └── {uid}/
       ├── uid: string
       ├── email: string
       ├── name: string
       ├── username: string
       ├── bio: string
       ├── photoURL: string
       ├── plan: "free" | "monthly" | "yearly"
       ├── credits: number
       ├── isPublic: boolean
       └── createdAt: Timestamp

   generations/
   └── {generationId}/
       ├── uid: string
       ├── text: string
       ├── language: "en" | "bn" | "hi"
       ├── voice: string
       ├── pitch: number
       ├── rate: number
       └── createdAt: Timestamp
   ```

### 4. Set Firestore Security Rules

Replace your Firestore rules with:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own profile
    match /users/{uid} {
      allow read: if request.auth.uid == uid || resource.data.isPublic == true;
      allow write: if request.auth.uid == uid;
    }

    // Users can read public profiles
    match /users/{uid} {
      allow read: if true;
      allow write: if request.auth.uid == uid;
    }

    // Generations are readable by owner and public readers
    match /generations/{docId} {
      allow read: if request.auth.uid == resource.data.uid;
      allow create: if request.auth.uid == request.resource.data.uid;
      allow write: if request.auth.uid == resource.data.uid;
    }

    // Default: deny all
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 5. Enable Realtime Database

1. Go to **Realtime Database** in Firebase Console
2. Click **Create Database** (or use the default one)
3. Choose:
   - **Location**: Same as Firestore
   - **Security rules**: Start in **Test mode**

4. **Security Rules**:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

## Development & Testing

### Local Testing with Emulators

To test locally without hitting production:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize in your project directory
firebase init emulators

# Start emulators
firebase emulators:start
```

The app auto-detects emulators in development mode.

### Reset Data

In Firebase Console → Database section, you can delete collections or documents as needed during development.

## Production Deployment

1. **Secure your rules**: Switch Firestore and RTDB from Test mode to Production mode
2. **Add your Vercel domain** to Authorized Domains in Authentication settings
3. Deploy your Next.js app to Vercel
4. Test auth flow on production URL

## Troubleshooting

### Google Sign-in Not Working
- Check your Vercel domain is in **Authorized Domains**
- Ensure **Google OAuth provider** is enabled in Authentication

### Firestore Queries Failing
- Check **Security Rules** allow read/write for your use case
- Verify the collection path matches (`/users`, `/generations`)
- Ensure indexes are created (Firestore prompts you if needed)

### Credits Not Deducting
- Verify user is logged in (`useAuth()` returns valid `user`)
- Check Firestore rule allows write to `/users/{uid}`
- Ensure `spendCredit()` is called after successful generation

## Environment Variables

The app reads Firebase config directly (hardcoded safe for client-side Firebase SDK).
Optional override:
```
NEXT_PUBLIC_FIRESTORE_DB_ID=my-custom-db
```

For server-side operations (admin functions), add:
```
FIREBASE_ADMIN_KEY=<service-account-json>
```

## Support

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication Setup](https://firebase.google.com/docs/auth/web/start)
