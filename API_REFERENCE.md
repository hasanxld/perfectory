# Perfectory Voice — API & Firestore Reference

## Authentication Context (`useAuth`)

```typescript
import { useAuth } from "@/lib/auth-context"

const {
  user,              // Firebase User | null
  profile,           // UserProfile | null
  loading,           // boolean
  refreshProfile,    // () => Promise<void>
  loginEmail,        // (email, password) => Promise<void>
  signupEmail,       // (name, email, password) => Promise<void>
  loginGoogle,       // () => Promise<void>
  logout,            // () => Promise<void>
} = useAuth()
```

### Usage Example

```tsx
import { useAuth } from "@/lib/auth-context"

export function MyComponent() {
  const { user, profile, loginEmail, logout } = useAuth()

  if (!user) {
    return <p>Please log in</p>
  }

  return (
    <div>
      <p>Welcome, {profile?.name}</p>
      <button onClick={() => logout()}>Sign out</button>
    </div>
  )
}
```

---

## User Profile Operations (`user-store.ts`)

### Types

```typescript
type UserProfile = {
  uid: string
  email: string | null
  name: string
  username: string              // unique slug
  bio: string
  photoURL: string              // avatar URL
  plan: "free" | "monthly" | "yearly"
  credits: number               // remaining credits
  isPublic: boolean
  createdAt?: Timestamp
}

const STARTING_CREDITS = 50     // free tier credit amount
```

### Functions

#### `ensureUserProfile(params)`
Auto-creates user doc on first login.
```typescript
const profile = await ensureUserProfile({
  uid: "user123",
  email: "user@example.com",
  name: "John Doe",
  photoURL: "https://..."
})
```

#### `getUserProfile(uid)`
Fetch a user's profile by UID.
```typescript
const profile = await getUserProfile("user123")
if (profile) {
  console.log(profile.name, profile.credits)
}
```

#### `getProfileByUsername(username)`
Fetch by public username slug.
```typescript
const profile = await getProfileByUsername("john-doe")
// Used on public profile page: /u/john-doe
```

#### `updateUserProfile(uid, data)`
Update any profile fields.
```typescript
await updateUserProfile(user.uid, {
  name: "Jane Doe",
  bio: "Love creating voices!",
  isPublic: true
})
```

#### `spendCredit(uid, amount = 1)`
Deduct credits (called after generation).
```typescript
await spendCredit(user.uid, 1)  // use 1 credit
```

#### `addCredits(uid, amount)`
Add credits (used for upgrades/purchases).
```typescript
await addCredits(user.uid, 100) // add 100 credits for monthly plan
```

---

## Voice Generation (`generation-store.ts`)

### Types

```typescript
type VoiceGeneration = {
  id?: string
  uid: string
  text: string
  language: "en" | "bn" | "hi"
  voice: string                 // browser voice URI
  pitch: number                 // 0.5 - 2.0
  rate: number                  // 0.1 - 10.0
  createdAt?: Timestamp
}
```

### Functions

#### `saveGeneration(uid, data)`
Save a completed generation to Firestore history.
```typescript
const genId = await saveGeneration(user.uid, {
  text: "Hello world",
  language: "en",
  voice: "Google UK English Male",
  pitch: 1.0,
  rate: 1.0
})
```

#### `getUserGenerations(uid, maxResults = 20)`
Fetch user's recent generations (private, ordered by newest).
```typescript
const gens = await getUserGenerations(user.uid, 10)
gens.forEach(g => {
  console.log(g.text, g.language)
})
```

#### `getPublicGenerations(uid, maxResults = 10)`
Fetch generations for public display (respects privacy).
```typescript
const gens = await getPublicGenerations("user123", 5)
```

---

## Text-to-Speech Hook (`use-tts`)

```typescript
import { useTTS, LANGUAGES, type LangCode } from "@/lib/use-tts"

const tts = useTTS()

// Properties
tts.supported          // boolean: browser supports Web Speech API
tts.speaking           // boolean: currently speaking

// Methods
tts.voicesForLang(lang: LangCode)
  // Returns array of available voices for language

tts.speak({
  text: string,
  lang: LangCode,
  voiceURI?: string,
  pitch?: number,       // 0.5 - 2.0
  rate?: number,        // 0.1 - 10.0
  volume?: number       // 0 - 1
})
  // Start speaking

tts.stop()
  // Stop current speech

// Constants
LANGUAGES
  // ["en-US", "bn-BD", "hi-IN"]
```

### Usage Example

```tsx
"use client"
import { useTTS } from "@/lib/use-tts"

export function TtsDemo() {
  const tts = useTTS()

  const handleSpeak = () => {
    tts.speak({
      text: "Hello world",
      lang: "en-US",
      rate: 1.2,
      pitch: 1.0
    })
  }

  return (
    <div>
      {!tts.supported && <p>Your browser does not support TTS</p>}
      <button onClick={handleSpeak}>
        {tts.speaking ? "Speaking..." : "Speak"}
      </button>
      <button onClick={() => tts.stop()}>Stop</button>
    </div>
  )
}
```

---

## Required Auth Guard (`require-auth`)

Wrap protected pages to require authentication:

```typescript
import { RequireAuth } from "@/components/require-auth"

export default function ProtectedPage() {
  return (
    <RequireAuth>
      <YourContent />
    </RequireAuth>
  )
}
```

If user is not logged in, they're redirected to `/login`.

---

## UI Components

### GButton
Gradient "cutting" style button.
```tsx
<GButton>Click me</GButton>
<GButton variant="outline" size="sm">Small</GButton>
<GButton disabled>Disabled</GButton>
```

### GCard
Border-based gradient container.
```tsx
<GCard className="p-6">
  <h2>Title</h2>
  <p>Content</p>
</GCard>
```

### GTextarea
Multi-line input with cutting style.
```tsx
<GTextarea
  value={text}
  onChange={(e) => setText(e.target.value)}
  placeholder="Enter text..."
/>
```

### Icon
Solar icon component (from Iconify).
```tsx
import { Icon } from "@/components/icon"

<Icon name="microphone-3-bold" size={24} className="text-brand-1" />
```

**Popular icons:**
- `microphone-3-bold` — voice
- `bolt-bold` — credits
- `user-circle-bold` — profile
- `arrow-right-broken` — forward
- `eye-bold` — visible
- `eye-closed-bold` — hidden

Full icon list: [Iconify Solar set](https://icon-sets.iconify.design/solar/)

---

## Firestore Real-time Listeners (Advanced)

For live updates, use Firestore listeners:

```typescript
import { db } from "@/lib/firebase"
import { doc, onSnapshot } from "firebase/firestore"

const unsubscribe = onSnapshot(doc(db, "users", uid), (snap) => {
  if (snap.exists()) {
    console.log("User data:", snap.data())
  }
})

// Cleanup
return () => unsubscribe()
```

---

## Error Handling

Always wrap async operations in try-catch:

```typescript
try {
  await spendCredit(user.uid, 1)
  await saveGeneration(user.uid, genData)
} catch (err) {
  console.error("Generation failed:", err)
  setError("Failed to save generation. Please try again.")
}
```

Common Firestore errors:
- `permission-denied`: User doesn't have access (check Firestore rules)
- `not-found`: Document/collection doesn't exist
- `unavailable`: Network or Firebase service down

---

## Environment Variables

Optional overrides (defaults work fine):

```
# Firestore
NEXT_PUBLIC_FIRESTORE_DB_ID=my-custom-db

# Admin SDK (server-side, if needed)
FIREBASE_ADMIN_KEY=<service-account-json>
```

---

## Rate Limiting & Quotas

**Free plan**: 50 credits / user
- 1 generation = 1 credit
- Monthly plan: 500 credits
- Yearly plan: 2000 credits

Track usage in Firestore console. Implement rate limiting in your upgrade/subscription logic.

---

## Useful Firebase Console Links

- [Your Project](https://console.firebase.google.com/project/banglaquiz-sgw69)
- [Firestore Data Browser](https://console.firebase.google.com/project/banglaquiz-sgw69/firestore/data)
- [Authentication Users](https://console.firebase.google.com/project/banglaquiz-sgw69/authentication/users)
- [Realtime Database](https://console.firebase.google.com/project/banglaquiz-sgw69/database)

---

## Tips & Best Practices

1. **Always await Firestore calls**: Firebase operations are async
2. **Check user auth before operations**: `if (!user) return`
3. **Refresh profile after credit spend**: `await refreshProfile()`
4. **Disable buttons while loading**: Use state flags
5. **Log errors to console**: `console.error("[v0]", err)` for debugging
6. **Handle offline gracefully**: Firestore SDK queues writes, but test offline UX
