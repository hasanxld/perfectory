# Perfectory Voice — AI Text-to-Speech Generator

A modern, full-featured **text-to-voice generator** supporting Bangla, English, and Hindi with an advanced gradient UI, Firebase authentication, and a credit-based system.

## 🎨 Design Features

- **Gradient Theme**: Cyan-to-purple gradient with smooth borders and cutting-edge UI design
- **Share Tech Font**: Monospace tech-forward typography across the entire site
- **Solar Icons**: https://iconbuddy.com/solar icons via Iconify CDN
- **Responsive Design**: Mobile, tablet, and desktop optimized
- **Animated Elements**: Waveform visualization, smooth transitions, and line-based animations
- **Glassmorphism Cards**: Semi-transparent gradient containers with border effects

## 🎤 Core Features

### Pages Included

1. **Home Page** (`/`)
   - Hero with waveform animation
   - Feature showcase with 3-column bento grid
   - Language cards (Bangla, English, Hindi)
   - Call-to-action buttons

2. **Voice Generator** (`/generator`)
   - Text input with live character count
   - Language selection (Bangla, English, Hindi)
   - Voice controls: Speed, Pitch, Volume
   - Waveform visualization
   - Sample text insertion
   - Credits display and usage tracking
   - Browser Web Speech API integration

3. **Plans Page** (`/plans`)
   - Free plan: 50 credits forever
   - Monthly plan: $9/mo with 1,000 credits/month
   - Yearly plan: $90/year with 15,000 credits/year (17% discount)
   - Feature comparison across tiers
   - "Popular" badge on recommended plan

4. **Authentication**
   - **Login Page** (`/login`): Email + password, Google OAuth
   - **Signup Page** (`/signup`): Create account with name, email, password
   - Guest users see limited UI (no generator access)
   - Authenticated users unlock full features

5. **Dashboard** (`/dashboard`)
   - Personalized welcome greeting
   - Quick stats (credits, generations, plan info)
   - Auth-guarded route

6. **Edit Profile** (`/profile/edit`)
   - Update user details
   - Manage preferences
   - Auth-guarded route

7. **Public Profile** (`/u/[username]`)
   - View user's public profile
   - See profile badge if user has monthly+ plan
   - Public profile visit system

### Header & Navigation

- **Guest Mode**: Home, Generator (limited), Plans, Login, Sign Up buttons
- **Authenticated Mode**: Home, Generator (full), Plans, Dashboard, Profile, Logout
- **Hamburger Menu**: Collapsible sidebar on mobile
- **Responsive Header**: Adapts from desktop to mobile layouts

### Footer

- Product links (Generator, Plans, Dashboard)
- Account links (Login, Sign Up, Edit Profile)
- Language options (Bangla, English, Hindi badges)
- Copyright and "Made with gradient love" tagline

## 🔐 Authentication & Database

### Firebase Setup

The app uses **Firebase** for authentication and data storage:

- **Firestore Database**: User profiles, generation history, credit tracking
- **Firebase Auth**: Email/password and Google OAuth
- **Real-time Sync**: User data updates across sessions

**Required Env Var:**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=<your-firebase-api-key>
```

Other Firebase config values are hardcoded in `lib/firebase.ts` with your project ID: `perfectory-voice`

### Firestore Collections

- **users**: User profiles (name, email, credits, plan, profile_visibility)
- **generations**: Saved voice generations (text, language, voice_settings, created_at)
- **profiles**: Public profile data (username, bio, location, social links)

## 💰 Credits System

- **Free Plan Users**: 50 starting credits
- **Each Generation**: Costs 1 credit
- **Upgrade Path**: Users can upgrade from Free to Monthly or Yearly
- **Real-time Tracking**: Credits display in header and generator page
- **Out of Credits**: Prompt to upgrade or purchase more

## 🎙️ Voice Generation

Uses **Browser Web Speech API** (no external TTS service required):

- **Bangla**: Native system voices (availability depends on OS)
- **English**: Multiple system voices available
- **Hindi**: Native system voices (availability depends on OS)

**Note**: Voice availability varies by device/browser. Users are prompted to install language packs in OS settings for best results.

### Voice Controls

- **Language**: Switch between Bangla, English, Hindi
- **Speed**: 0.5x to 2.0x (adjustable slider)
- **Pitch**: 0.5 to 2.0 (adjustable slider)
- **Volume**: 0 to 1.0 (adjustable slider)
- **Playback**: Listen before saving

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 with custom gradient theme
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication
- **Icons**: @iconify/react (Solar icon set from CDN)
- **TTS**: Browser Web Speech API
- **Fonts**: Share Tech (Google Fonts)

## 📱 Responsive Design

- **Mobile (320-480px)**: Single column, hamburger menu, full-width cards
- **Tablet (768-1024px)**: 2-column layouts, collapsible sidebar
- **Desktop (1200px+)**: 3-column grids, full navigation bar

## 🚀 Getting Started

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Add your Firebase API key to environment variables:
   ```bash
   # In .env.local or Vercel project settings
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
   ```

4. Start the dev server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
pnpm build
pnpm start
```

## 📁 Project Structure

```
/app
  /generator     - Voice generator page + layout
  /plans         - Pricing page
  /login         - Login page
  /signup        - Sign up page
  /dashboard     - User dashboard
  /profile/edit  - Edit profile page
  /u/[username]  - Public profile page
  layout.tsx     - Root layout with fonts & auth provider
  globals.css    - Theme, animations, gradient definitions
  page.tsx       - Home page

/components
  icon.tsx       - Solar icon component
  ui-kit.tsx     - Reusable UI primitives (GButton, GInput, GCard)
  site-shell.tsx - Header, sidebar, footer wrapper
  auth-shell.tsx - Centered auth layout
  logo.tsx       - Brand logo component
  require-auth.tsx - Route guard for protected pages
  google-button.tsx - Google OAuth button with logo

/lib
  firebase.ts    - Firebase initialization
  auth-context.tsx - React Context for auth state
  user-store.ts  - Firestore helper functions
  use-tts.ts     - Web Speech API hook
  utils.ts       - Tailwind cn() utility
```

## 🎨 Design System

### Colors

- **Primary**: Cyan (#06B6D4) → Purple (#A855F7) gradient
- **Background**: Dark navy (#0F1419)
- **Borders**: Semi-transparent white/cyan
- **Accents**: Bright cyan (#00D9FF) for highlights

### Typography

- **Font Family**: Share Tech (monospace, tech-forward)
- **Heading**: 32px-48px, bold
- **Body**: 14px-16px, regular
- **Code**: monospace, smaller sizes

### Components

- **GButton**: Gradient button with cut corners and hover effects
- **GInput**: Styled input with border radius and gradient borders
- **GCard**: Container with gradient border and semi-transparent background

## 🔄 User Flow

### New User (Guest)
1. Land on home page
2. Browse features and pricing
3. Try generator (limited preview)
4. Click "Get Started" → redirects to signup
5. Create account with name, email, password
6. Receive 50 free credits
7. Access full generator

### Returning User (Logged In)
1. Log in with email/password or Google
2. Dashboard shows remaining credits and stats
3. Navigate to generator
4. Generate voice with language/voice options
5. Save generation to profile
6. View usage history
7. Upgrade plan when credits run low

## 📚 API Routes

All auth and data operations go through Firebase Client SDK. No custom backend needed for MVP. When scaling, add:

- `/api/auth/...` - Custom auth endpoints
- `/api/generations/...` - Generation history API
- `/api/profile/...` - Profile management API

## 🚨 Known Limitations

1. **Voice Availability**: Depends on device OS and installed language packs
2. **Storage**: No persistent audio file storage (Web Speech plays in-browser only)
3. **Billing**: Plans are demo only (select a plan to instantly grant credits)
4. **Profile**: Public profile system is basic (can be expanded)

## 🔮 Future Enhancements

- [ ] Persistent audio file storage with Vercel Blob
- [ ] Advanced voice cloning / custom voices
- [ ] Batch text generation
- [ ] Export to MP3/WAV formats
- [ ] Real Stripe integration for billing
- [ ] Social sharing and voice recommendations
- [ ] Analytics dashboard for premium users
- [ ] Multiple language content in one generation

## 📄 License

MIT — Feel free to use for commercial or personal projects.

---

Built with **gradient love** • Perfectory Voice © 2026
