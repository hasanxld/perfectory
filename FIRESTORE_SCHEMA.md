# Perfectory Voice - Firestore Database Schema

This document outlines the Firestore database structure for Perfectory Voice.

## Collections

### Users Collection

**Path:** `/users/{userId}`

Stores user account information and settings.

```
{
  uid: string                    // Firebase Auth UID
  email: string                  // User email
  name: string                   // Display name
  username: string               // Unique username (slug)
  bio: string                    // User bio
  photoURL: string               // Profile image URL
  plan: "free" | "monthly" | "yearly"  // Subscription plan
  credits: number                // Remaining credits
  isPublic: boolean              // Public profile visibility
  createdAt: Timestamp           // Account creation date
  updatedAt: Timestamp           // Last update date
}
```

---

### Generations Subcollection

**Path:** `/users/{userId}/generations/{generationId}`

Stores each voice generation/creation.

```
{
  text: string                   // Original text
  language: string               // Language code (en-US, bn-BD, hi-IN)
  voice: string                  // Voice URI/ID
  pitch: number                  // Pitch value (0.5-2.0)
  speed: number                  // Speech rate (0.5-2.0)
  volume: number                 // Volume (0-1)
  audioUrl: string               // URL to generated audio (optional)
  duration: number               // Audio duration in seconds (optional)
  creditsUsed: number            // Credits spent (usually 1)
  createdAt: Timestamp           // Generation timestamp
}
```

---

### Favorite Voices Subcollection

**Path:** `/users/{userId}/favoriteVoices/{voiceId}`

Stores saved voice presets for quick reuse.

```
{
  name: string                   // Preset name
  language: string               // Language code
  voice: string                  // Voice URI/ID
  pitch: number                  // Pitch setting
  speed: number                  // Speed setting
  volume: number                 // Volume setting
  createdAt: Timestamp           // When saved
}
```

---

### Subscriptions Collection

**Path:** `/subscriptions/{userId}`

Stores subscription details and billing info.

```
{
  userId: string                 // Reference to user
  plan: "free" | "pro" | "enterprise"
  monthlyCredits: number         // Credits per month
  price: number                  // Monthly price in cents
  stripeSubscriptionId: string   // Stripe subscription ID (optional)
  active: boolean                // Is subscription active
  startDate: Timestamp           // Subscription start
  renewalDate: Timestamp         // Next renewal date
  cancelledAt: Timestamp         // Cancellation date (optional)
}
```

---

### Public Generations Collection

**Path:** `/publicGenerations/{userId}_{generationId}`

Stores shared/published voice generations.

```
{
  userId: string                 // Original creator's ID
  generationId: string           // Reference to generation
  title: string                  // Custom title (optional)
  description: string            // Description (optional)
  publishedAt: Timestamp         // When published
  views: number                  // View count
}
```

---

### Analytics Collection

**Path:** `/analytics/{docId}`

Tracks user events and usage.

```
{
  userId: string                 // User who triggered event
  event: string                  // Event type (e.g., "generation_created", "credits_purchased")
  metadata: object               // Event-specific data
  timestamp: Timestamp           // When event occurred
}
```

---

## Indexes

For optimal query performance, create these composite indexes:

1. **Users by Plan:**
   - Collection: `users`
   - Fields: `plan` (Ascending), `createdAt` (Descending)

2. **Generations by User and Date:**
   - Collection: `users/{userId}/generations`
   - Fields: `createdAt` (Descending)

3. **Public Generations by Views:**
   - Collection: `publicGenerations`
   - Fields: `publishedAt` (Descending), `views` (Descending)

4. **Analytics by Event and Date:**
   - Collection: `analytics`
   - Fields: `event` (Ascending), `timestamp` (Descending)

---

## Access Patterns

### Common Queries

```typescript
// Get user profile
const user = await getUserProfile(userId)

// Get user's generation history (latest 50)
const generations = await getGenerationHistory(userId, 50)

// Get user's favorite voices
const favorites = await getFavoriteVoices(userId)

// Deduct credits after generation
await spendCredit(userId, 1)

// Save a generation
const generationId = await saveGeneration(userId, {
  text: "...",
  language: "en-US",
  voice: "...",
  pitch: 1.0,
  speed: 1.0,
  volume: 1.0
})
```

---

## Security Rules (Recommended)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Users can only access their own generations
    match /users/{userId}/generations/{generationId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Users can only access their own favorite voices
    match /users/{userId}/favoriteVoices/{voiceId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Subscriptions are private
    match /subscriptions/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Public generations are readable by anyone
    match /publicGenerations/{document=**} {
      allow read: if true;
      allow write: if request.auth.uid != null;
    }

    // Analytics tracking
    match /analytics/{document=**} {
      allow write: if request.auth.uid != null;
      allow read: if false; // Admin only
    }
  }
}
```

---

## Usage in Code

All Firestore operations are available through the `user-store.ts` module:

```typescript
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  saveGeneration,
  getGenerationHistory,
  saveFavoriteVoice,
  getFavoriteVoices,
  spendCredit,
  addCredits,
} from "@/lib/user-store"
```

See `lib/user-store.ts` and `lib/firestore-services.ts` for complete API reference.
