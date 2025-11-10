# KeyStorm - AI Agent Development Guide

## Project Overview

KeyStorm is a modern, AI-powered touch typing tutor built with Next.js 15, React 19, and TypeScript. It generates personalized typing lessons based on user-selected themes using Google's Gemini AI with TOON format for optimal token efficiency.

## Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router
- **Runtime**: Bun (>=1.3.2)
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Motion (Framer Motion)
- **AI**: Google Gemini 2.5 Flash Lite with TOON format (30-60% token reduction)
- **Auth**: NextAuth.js with passwordless email codes
- **State Management**: Zustand with persist middleware
- **Storage**: Upstash Redis (login codes), Zustand (user preferences, lesson state, progress)

### Core Concepts

#### State Management
All application state is managed through Zustand stores:

- **useLessonStore**: Manages lessons, level loading, completion flags, and completed levels
- **useUserStore**: Manages user name and theme preferences (persisted to localStorage)

Previous sessionStorage usage has been eliminated in favor of centralized state management.

#### Learning Progression
1. **Landing** (`/landing`) - Authentication or guest mode
2. **Start** (`/start`) - Name/theme selection
3. **Learn** (`/learn`) - Keyboard positioning guide
4. **Letters** (`/practice/letters`) - Level 1: Individual letter practice
5. **Words** (`/practice`) - Level 2: Simple lowercase words
6. **Shift Tutorial** (`/learn/shift`) - Shift key positioning guide
7. **Capitals** (`/practice/capitals`) - Level 3: Capitalized words
8. **Sentences** (`/practice`) - Level 4: Basic sentences with punctuation
9. **Numbers Tutorial** (`/learn/numbers`) - Number row positioning guide
10. **Numbers** (`/practice`) - Level 5: Numbers and basic symbols
11. **Mixed** (`/practice`) - Level 6: Mixed case with numbers
12. **Punctuation Tutorial** (`/learn/punctuation`) - Punctuation marks guide
13. **Punctuation** (`/practice`) - Level 7: Complex punctuation practice
14. **Paragraphs** (`/practice`) - Level 8: Short paragraphs
15. **Advanced** (`/practice`) - Level 9: Long paragraphs with advanced vocabulary
16. **Expert** (`/practice`) - Level 10: Expert-level complex content
17. **Summary** (`/practice/summary`) - Performance metrics

#### Lesson Structure
```typescript
type LessonType = 
    | 'letters'           // Level 1
    | 'words'             // Level 2
    | 'capitals'          // Level 3
    | 'sentences'         // Level 4
    | 'numbers'           // Level 5
    | 'mixed'             // Level 6
    | 'punctuation'       // Level 7
    | 'paragraphs'        // Level 8
    | 'advanced'          // Level 9
    | 'expert'            // Level 10

type Lesson = {
  content: string[];      // Array of items to type
  level: number;          // 1-10
  type: LessonType;
};
```

## Key Components

### State Stores

#### useLessonStore (`src/store/useLessonStore.ts`)
Manages all lesson-related state:
- **lessons**: Array of loaded lessons
- **loadedLevels**: Set of level numbers already fetched
- **completionFlags**: Tracks completion of special levels (letters, capitals, numbers, punctuation)
- **completedLevels**: Array of performance summaries for completed levels
- **loadLevel(level)**: Lazily loads a level from JSON file
- **getLesson(level)**: Returns cached lesson if already loaded
- **setCompletionFlag(flag, value)**: Updates completion status
- **addCompletedLevel(summary)**: Adds level performance data
- **resetProgress()**: Clears completion state

#### useUserStore (`src/store/useUserStore.ts`)
Manages user profile with localStorage persistence:
- **name**: User's name or nickname
- **theme**: Selected learning theme
- **setName(name)**: Updates user name
- **setTheme(theme)**: Updates theme
- **clearProfile()**: Resets to defaults

### Tutorial Pages

#### Shift Key Tutorial (`/learn/shift`)
- Explains left vs. right Shift key usage
- Step-by-step examples for capital letters
- Visual hand positioning guidance
- Enter key to continue

#### Numbers Tutorial (`/learn/numbers`)
- Number row finger mapping (1-0)
- Which finger reaches which numbers
- Index fingers cover two numbers each (4+5, 6+7)
- Visual number row reference
- Sets `numbersCompleted` flag on exit

#### Punctuation Tutorial (`/learn/punctuation`)
- Common punctuation marks and locations
- Shift requirements for symbols
- Right pinky keys (;:'/?"-)
- Practice examples with explanations
- Sets `punctuationCompleted` flag on exit

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

### Lazy Loading Strategy
**Early Lessons (1-4):**
- For **default theme**: Load from `public/lessons/1-4.json` 
- For **custom theme**: Generate via Gemini API (cached in Redis)
- Loaded when user clicks "Start" on `/start` page

**Advanced Lessons (5-10):**
- Always loaded from `public/lessons/5-10.json`
- Fetched **on-demand** as user completes earlier levels
- `loadLevel(n)` checks cache first, then fetches if needed
- Prevents unnecessary API calls and reduces initial bundle size

**Benefits:**
- AI-generated lessons only for early levels (cost-efficient)
- Later levels use curated JSON content (consistent quality)
- No upfront loading of all 10 levels (faster startup)
- Progressive loading matches user pace

## Development Patterns

### TOON Format for AI Prompts
KeyStorm uses TOON (Token-Oriented Object Notation) for Gemini API requests, achieving 30-60% token reduction compared to JSON:

```toon
letters[26]:
a
s
d
...

words[20]:
islam
faith
...
```

Benefits:
- Reduced API costs (fewer tokens)
- Improved LLM accuracy (explicit structure)
- Faster responses (less data to process)
- Same information, 40-60% fewer tokens

### Code Style
- Arrow functions preferred over function declarations
- `type` over `interface`
- No inline comments (self-documenting code)
- Small, testable utility functions
- Biome for linting/formatting

### State Management Patterns
- Use Zustand stores for global state
- React hooks for local component state
- No sessionStorage or localStorage (except via Zustand persist)
- Completion flags manage tutorial/level progression

### API Routes
- `/api/auth/[...nextauth]` - NextAuth handler
- `/api/auth/request-code` - Email OTP generation
- `/api/generate-lessons` - Theme-based lesson creation (TOON format, early levels only)

### Security Features
- Rate limiting on auth (5 attempts/5min per email)
- Theme validation (no inappropriate content)
- Timing-safe hash comparison for login codes
- SHA-256 hashing for sensitive data

## Common Tasks

### Adding a New Level Type
1. Add type to `src/types/lesson.ts`
2. Update `getLevelDescription()` in `lib/lesson/descriptions.ts`
3. Modify Gemini prompt in `lib/lesson/generator.ts` (use TOON format)
4. Update validation in `validateToonResponse()` and `parseToonResponse()`
5. Add tutorial page if needed (`/learn/*`)
6. Create JSON file in `public/lessons/{level}.json`

### Modifying Keyboard Layout
- Edit `KEYBOARD_ROWS` in `lib/constants.ts`
- Update `FINGER_POSITIONS` for color mapping
- Adjust `getKeyPosition()` in `lib/keyboard.ts`

### Changing Audio Feedback
- Modify frequencies/durations in `useAudioContext.ts`
- All sounds use Web Audio API oscillators
- Keep durations <300ms for responsive feel

### Customizing Lesson Generation
- Edit TOON format prompts in `lib/lesson/generator.ts`
- Adjust validation rules in `validateToonResponse()` and `parseToonResponse()`
- Consider rate limits (3 retries, 90s timeout)
- Use `GeminiModel.FlashLiteV2_5` for cost efficiency
- TOON format automatically reduces token usage by 30-60%

### Updating Default Lessons
- Edit individual level files in `public/lessons/*.json` (1.json through 10.json)
- Validate JSON structure matches Lesson type
- Redeploy to apply changes

### Adding Store Fields
1. Add field to store type in `useLessonStore.ts` or `useUserStore.ts`
2. Add setter/getter methods
3. For persistence, use Zustand's `persist` middleware
4. Update components to use new store methods

## Testing

### Manual Testing Checklist
1. Guest flow: landing → start → learn → letters → words → shift tutorial → capitals → ... → expert → summary
2. Auth flow: sign in → personalized theme → full 10-level progression
3. Tutorial pages: shift, numbers, punctuation guides
4. Error states: wrong keys, backspace, skipping levels
5. Audio: error sound, success sound, confetti sound
6. Responsive: mobile, tablet, desktop layouts
7. All 10 levels complete successfully
8. State persistence: refresh page, state should be maintained (user profile only)

### Debug Shortcuts
- **Ctrl+Shift+D**: Skip to last item in level (dev mode or `?debug=true`)

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

### Static Files
Ensure all files in `public/lessons/*.json` are included in deployment.

## Common Pitfalls

1. **Store Hydration**: Zustand persist stores may not be available immediately on mount - check for undefined
2. **Audio Context**: Must be initialized after user gesture (handled in useEffect)
3. **Keyboard Position Calculation**: X/Y coordinates depend on row-specific offsets
4. **Rate Limiting**: Redis errors fallback to in-memory store (see `lib/redis.ts`)
5. **Theme Validation**: Regex requires word boundaries for blocked terms
6. **TOON Parsing**: Ensure proper line-by-line parsing for TOON format responses
7. **Lazy Loading**: Always check if lesson exists before rendering, show loading state
8. **Completion Flags**: Tutorial pages must set completion flags to allow progression

## Extension Points

### Adding Authentication Providers
- Edit `authOptions` in `src/auth.ts`
- Add provider to `next-auth/providers`
- Update UI in `app/landing/page.tsx`

### Custom Lesson Algorithms
- Implement in `lib/lesson/generator.ts`
- Can replace Gemini with custom logic
- Must return same `Lesson` structure
- Consider using TOON format for token efficiency

### Analytics Integration
- Hook into `useTypingGame` for keystroke data
- Track level completion via `useLessonStore.addCompletedLevel`
- Monitor API calls in `lib/gemini.ts`
- Track TOON token savings vs JSON baseline

### Adding More Tutorial Pages
1. Create page in `src/app/learn/[topic]/page.tsx`
2. Use `<LearnLayout>` with `completionFlag` prop
3. Add route mapping in `getNextLevelRoute()` in descriptions
4. Update store with new completion flag if needed

## TOON Format Details

### Why TOON?
- **30-60% fewer tokens** compared to JSON
- **Better LLM accuracy** with explicit structure
- **Faster responses** with less data transfer
- **Lower costs** on token-based pricing

### TOON Syntax
```toon
# Arrays with length markers
items[3]:
value1
value2
value3

# Objects with key-value pairs
user:
  name: Alice
  age: 30
  active: true

# Tabular data (most efficient)
users[2]{id,name,role}:
1,Alice,admin
2,Bob,user
```

### Implementation
- Convert JSON to TOON before sending to LLM
- Parse TOON response back to typed objects
- Handle both formats for backwards compatibility

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Gemini API Reference](https://ai.google.dev/docs)
- [NextAuth.js Guide](https://next-auth.js.org)
- [Zustand Documentation](https://zustand-demo.pmnd.rs)
- [TOON Format Specification](https://github.com/toon-format/toon)

---

**Last Updated**: 2025-11-09  
**Version**: 1.3.0
