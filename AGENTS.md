# KeyStorm - AI Agent Development Guide

## Project Overview

KeyStorm is a modern, AI-powered touch typing tutor built with Next.js 15, React 19, and TypeScript. It generates personalized typing lessons based on user-selected themes using Google's Gemini AI.

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Runtime**: Bun (>=1.3.2)
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Motion (Framer Motion)
- **AI**: Google Gemini 2.5 Flash Lite
- **Auth**: NextAuth.js with passwordless email codes
- **Storage**: Upstash Redis (login codes), localStorage (user preferences), sessionStorage (lesson state)

### Core Concepts

#### Learning Progression
1. **Landing** (`/landing`) - Authentication or guest mode
2. **Start** (`/start`) - Name/theme selection
3. **Learn** (`/learn`) - Keyboard positioning guide
4. **Letters** (`/practice/letters`) - Level 1: Individual letter practice
5. **Practice** (`/practice`) - Levels 2-4: Words, sentences, paragraphs
6. **Summary** (`/practice/summary`) - Performance metrics

#### Lesson Structure
```typescript
type Lesson = {
  content: string[];      // Array of items to type
  level: number;          // 1-4
  type: 'letters' | 'words' | 'sentences' | 'paragraphs';
};
```

## Key Components

### Audio System (`hooks/useAudioContext.ts`)
- `playErrorSound()` - Wrong keystroke (200Hz sine)
- `playSuccessSound()` - Correct keystroke (523Hz sine)
- `playConfettiSound()` - Level completion (ascending tones)

### Typing Game (`hooks/useTypingGame.ts`)
- Manages game state: `ready`, `playing`, `finished`
- Tracks errors, backspace count, WPM, accuracy
- Accepts optional `onSuccess` callback for correct keystrokes

### Keyboard Visual (`components/typing/KeyboardVisual.tsx`)
- SVG-based keyboard with finger overlays
- Active finger: opacity 0.95, inactive: 0.15
- Color-coded by finger (8 colors from `FINGER_POSITIONS`)

### Storage Strategy
- **localStorage**: User name, theme preferences (persistent)
- **sessionStorage**: Current lessons, progress state (per-session)
- **Redis**: Login codes (10min TTL, rate-limited)

## Development Patterns

### Code Style
- Arrow functions preferred over function declarations
- `type` over `interface`
- No inline comments (self-documenting code)
- Small, testable utility functions
- Biome for linting/formatting

### State Management
- React hooks for local state
- SessionStorage for cross-page state
- No global state management library

### API Routes
- `/api/auth/[...nextauth]` - NextAuth handler
- `/api/auth/request-code` - Email OTP generation
- `/api/generate-lessons` - Theme-based lesson creation

### Security Features
- Rate limiting on auth (5 attempts/5min per email)
- Theme validation (no inappropriate content)
- Timing-safe hash comparison for login codes
- SHA-256 hashing for sensitive data

## Common Tasks

### Adding a New Level Type
1. Add type to `src/types/lesson.ts`
2. Update `getLevelDescription()` in `lib/lesson-descriptions.ts`
3. Modify Gemini prompt in `lib/lesson-generator.ts`
4. Update validation in `validateResponse()`

### Modifying Keyboard Layout
- Edit `KEYBOARD_ROWS` in `lib/constants.ts`
- Update `FINGER_POSITIONS` for color mapping
- Adjust `getKeyPosition()` in `lib/keyboard.ts`

### Changing Audio Feedback
- Modify frequencies/durations in `useAudioContext.ts`
- All sounds use Web Audio API oscillators
- Keep durations <300ms for responsive feel

### Customizing Lesson Generation
- Edit prompts in `lib/lesson-generator.ts`
- Adjust validation rules in `validateResponse()`
- Consider rate limits (3 retries, 60s timeout)
- Use `GeminiModel.FlashLiteV2_5` for cost efficiency

## Testing

### Manual Testing Checklist
1. Guest flow: landing → start → learn → letters → practice → summary
2. Auth flow: sign in → personalized theme → full progression
3. Error states: wrong keys, backspace, skipping levels
4. Audio: error sound, success sound, confetti sound
5. Responsive: mobile, tablet, desktop layouts

### Unit Tests
- `lib/keyboard.test.ts` - Keyboard utility functions
- Run with: `bun test`

## Deployment

### Environment Variables
```bash
GEMINI_API_KEY=           # Required: Google AI API key
NEXTAUTH_SECRET=          # Required: Random string for JWT signing
UPSTASH_REDIS_REST_URL=   # Required for production auth
UPSTASH_REDIS_REST_TOKEN= # Required for production auth
RESEND_API_KEY=           # Optional locally (logs to console)
EMAIL_FROM=               # Email sender address
```

### Build Commands
```bash
bun install              # Install dependencies
bun run dev              # Development server
bun run build            # Production build
bun run start            # Production server
bun run lint             # Run Biome linter
```

## Common Pitfalls

1. **SessionStorage Clearing**: Letters progress resets if user navigates back to `/start`
2. **Audio Context**: Must be initialized after user gesture (handled in useEffect)
3. **Keyboard Position Calculation**: X/Y coordinates depend on row-specific offsets
4. **Rate Limiting**: Redis errors fallback to in-memory store (see `lib/redis.ts`)
5. **Theme Validation**: Regex requires word boundaries for blocked terms

## Extension Points

### Adding Authentication Providers
- Edit `authOptions` in `src/auth.ts`
- Add provider to `next-auth/providers`
- Update UI in `app/landing/page.tsx`

### Custom Lesson Algorithms
- Implement in `lib/lesson-generator.ts`
- Can replace Gemini with custom logic
- Must return same `Lesson[]` structure

### Analytics Integration
- Hook into `useTypingGame` for keystroke data
- Track level completion in `useLevelProgression`
- Monitor API calls in `lib/gemini.ts`

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Gemini API Reference](https://ai.google.dev/docs)
- [NextAuth.js Guide](https://next-auth.js.org)

---

**Last Updated**: 2025-11-08  
**Version**: 1.1.0
