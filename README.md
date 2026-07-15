# Perfectory Voice — AI Text to Speech Generator

Transform your text into natural speech in **Bangla, English, and Hindi** with advanced voice controls and a beautiful, gradient-based UI. Generate unlimited speeches with our free tier and upgrade for higher limits.

**Live Demo**: Deploy on Vercel (see DEPLOYMENT.md)

---

## 🎯 Features

✨ **Multi-Language Support**
- Bangla (bn-BD)
- English (en-US)
- Hindi (hi-IN)

🎚️ **Advanced Voice Controls**
- Language selection with regional flags
- Multiple voice options per language
- Pitch control (0.5x - 2.0x)
- Speech rate control (0.1x - 10.0x)
- Volume adjustment

🔐 **User Accounts & Authentication**
- Email/password signup
- Google OAuth integration
- Profile customization
- Public profiles for sharing

💳 **Credits System**
- Free tier: 50 credits
- Monthly plan: 500 credits
- Yearly plan: 2000 credits
- 1 credit = 1 generation

📱 **Fully Responsive Design**
- Mobile-first design
- Tablet optimized
- Desktop experience
- Smooth animations & transitions

🎨 **Premium UI**
- Gradient background with animated waveform
- Share Tech font throughout
- Solar (Iconify) icons
- Border-based "cutting" design
- Dark theme by default

💾 **Generation History**
- Save all generations to Firestore
- View recent generations on dashboard
- Public generation display on profiles

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (or npm/yarn)

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit `http://localhost:3000`

---

## 📋 Firebase Setup (Required)

Your app is pre-configured with Firebase project: `banglaquiz-sgw69`

### Quick Setup Checklist

In [Firebase Console](https://console.firebase.google.com):

**1. Enable Authentication:**
- Email/Password ✅
- Google OAuth ✅

**2. Add Authorized Domains:**
```
localhost:3000
127.0.0.1:3000
your-vercel-domain.vercel.app
```

**3. Create Firestore Database** (Test mode for dev)

**4. Apply Security Rules** (see FIREBASE_SETUP.md)

For **detailed setup**, see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) and [FIREBASE_INTEGRATION_CHECKLIST.md](./FIREBASE_INTEGRATION_CHECKLIST.md).

---

## 📁 Project Structure

```
app/
├── page.tsx              # Home
├── login/                # Email login
├── signup/               # Email signup
├── generator/            # Voice generator
├── dashboard/            # User dashboard
├── plans/                # Pricing
├── profile/edit/         # Edit profile
├── u/[username]/         # Public profile
└── layout.tsx

components/
├── site-shell.tsx        # Header, sidebar, footer
├── ui-kit.tsx            # UI primitives
├── icon.tsx              # Solar icons

lib/
├── firebase.ts           # Firebase setup
├── auth-context.tsx      # Auth (useAuth)
├── user-store.ts         # Firestore users
├── generation-store.ts   # Firestore generations
└── use-tts.ts            # Web Speech API
```

---

## 🛠️ Available Scripts

```bash
pnpm dev              # Dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Lint code
```

---

## 💻 Tech Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS v4
- **Database**: Firebase + Firestore
- **Auth**: Firebase Auth
- **TTS**: Web Speech API (browser native)
- **Icons**: Iconify + Solar set
- **Font**: Google Share Tech

---

## 🔑 Core APIs

### Authentication

```typescript
import { useAuth } from "@/lib/auth-context"

const { user, profile, loginEmail, signupEmail, loginGoogle, logout } = useAuth()
```

### Voice Generation

```typescript
import { useTTS } from "@/lib/use-tts"

const tts = useTTS()
tts.speak({ text, lang: "en-US", rate: 1.2, pitch: 1.0 })
```

### Firestore Operations

```typescript
import { spendCredit, saveGeneration } from "@/lib/user-store"

await spendCredit(user.uid, 1)
await saveGeneration(user.uid, { text, language, voice, pitch, rate })
```

Full API reference: [API_REFERENCE.md](./API_REFERENCE.md)

---

## 🚀 Deployment

### Deploy to Vercel

```bash
vercel
```

**Before deploying:**
1. Add your Vercel domain to Firebase Authorized Domains
2. Switch Firestore rules to Production mode
3. Test auth flow locally

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full instructions.

---

## 🔐 Security

✅ Firestore Security Rules (row-level access)
✅ Firebase Auth (hashed passwords + OAuth)
✅ API Keys scoped to client SDK
✅ HTTPS on Vercel

---

## 📚 Documentation

- **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** — Firebase configuration guide
- **[FIREBASE_INTEGRATION_CHECKLIST.md](./FIREBASE_INTEGRATION_CHECKLIST.md)** — Step-by-step checklist
- **[API_REFERENCE.md](./API_REFERENCE.md)** — Complete API reference
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** — Deploy to Vercel

---

## 🐛 Troubleshooting

**Voice not working?**
- Check browser supports Web Speech API (Chrome, Edge, Safari)
- Verify user is logged in
- Check browser console for errors

**Firebase errors?**
- "Unauthorized domain" → Add domain to Firebase Auth settings
- "Permission denied" → Check Firestore security rules
- See FIREBASE_INTEGRATION_CHECKLIST.md for full troubleshooting

---

## 💡 What's Next

- [ ] Add Stripe for paid plans
- [ ] Email notifications
- [ ] Audio file download
- [ ] Advanced analytics

---

**Built with [Next.js](https://nextjs.org/), [Firebase](https://firebase.google.com/), and [v0](https://v0.app)** 🚀
