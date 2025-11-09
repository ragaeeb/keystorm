# KeyStorm

[![wakatime](https://wakatime.com/badge/user/a0b906ce-b8e7-4463-8bce-383238df6d4b/project/78e2efdc-b5e4-4e88-872f-11bf8cbabe4a.svg)](https://wakatime.com/badge/user/a0b906ce-b8e7-4463-8bce-383238df6d4b/project/78e2efdc-b5e4-4e88-872f-11bf8cbabe4a)
[![codecov](https://codecov.io/gh/ragaeeb/keystorm/graph/badge.svg?token=SW2BBXUEWS)](https://codecov.io/gh/ragaeeb/keystorm)
[![Vercel Deploy](https://deploy-badge.vercel.app/vercel/keystorm)](https://keystorm.vercel.app)
[![typescript](https://badgen.net/badge/icon/typescript?icon=typescript&label&color=blue)](https://www.typescriptlang.org)
[![Node.js CI](https://github.com/ragaeeb/keystorm/actions/workflows/build.yml/badge.svg)](https://github.com/ragaeeb/keystorm/actions/workflows/build.yml)
![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white)
![GitHub License](https://img.shields.io/github/license/ragaeeb/keystorm)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, AI-powered touch typing tutor that generates personalized lessons based on your interests.

## Features

- **Progressive Learning Path**: Master typing through four stages - individual letters, words, sentences, and paragraphs
- **AI-Generated Content**: Personalized typing content generated based on your chosen theme using Google's Gemini AI
- **Real-Time Feedback**: Visual keyboard highlighting, WPM tracking, accuracy metrics, and error counting
- **Responsive Design**: Optimized layout that fits any screen size without scrolling
- **Color-Coded Keyboard**: Interactive keyboard with color-coded finger positions and tooltips
- **Audio Feedback**: Sound cues for typing errors to reinforce correct technique
- **Passwordless Authentication**: Secure email-based one-time codes via NextAuth.js
- **Guest Mode**: Practice with curated Islamic lessons without signing in

## Tech Stack

- **Framework**: Next.js 16 with React 19
- **Runtime**: Bun (>=1.3.2)
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Animations**: Motion (Framer Motion)
- **AI**: Google Gemini API (2.5 Flash Lite V2)
- **Authentication**: NextAuth.js with Resend email delivery
- **Storage**: Upstash Redis (auth codes), localStorage (preferences), sessionStorage (lessons)
- **Language**: TypeScript with full type safety

## Getting Started

### Prerequisites

- Bun 1.3.2 or higher
- Google Gemini API key
- Upstash Redis database (for passwordless auth codes)
- Resend API key (optional locally; required for production email delivery)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ragaeeb/keystorm.git
cd keystorm
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cat <<'ENV' > .env.local
GEMINI_API_KEY=your_api_key_here
NEXTAUTH_SECRET=generate_a_long_random_string
UPSTASH_REDIS_REST_URL=https://your-upstash-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM="KeyStorm <login@yourdomain.com>"
ENV
```

> 💡 **Development Tip**: If you skip the Resend API key locally, one-time codes are logged to the terminal for easy testing.

4. Run the development server:
```bash
bun run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Authentication Flow

1. **Landing Page**: Request a passwordless sign-in code or continue as guest
2. **Email Code**: Receive a 6-digit code via email (10-minute expiration)
3. **Verification**: Enter the code to authenticate

### Learning Flow

1. **Onboarding** (`/start`): Enter an optional name and choose your theme
   - Authenticated users: Generate custom lessons based on any family-friendly theme
   - Guest users: Use curated Islamic lessons
2. **Keyboard Guide** (`/learn`): Learn proper finger positioning with color-coded zones
3. **Letter Practice** (`/practice/letters`): Type individual letters with visual keyboard guidance
4. **Word Practice** (`/practice`): Progress through increasingly complex exercises:
   - **Level 2**: Themed vocabulary words
   - **Level 3**: Complete sentences
   - **Level 4**: Full paragraphs with alliterations
5. **Summary** (`/practice/summary`): Review your performance metrics and statistics

## Project Structure

```text
keystorm/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/route.ts  # NextAuth handler
│   │   │   │   └── request-code/route.ts   # OTP generation
│   │   │   ├── generate-lessons/
│   │   │   │   └── route.ts               # AI lesson generation
│   │   │   └── og/route.tsx               # Open Graph image
│   │   ├── landing/
│   │   │   ├── layout.tsx                 # SEO metadata
│   │   │   ├── metadata.ts                # Landing page metadata
│   │   │   └── page.tsx                   # Landing page
│   │   ├── learn/page.tsx                 # Keyboard positioning guide
│   │   ├── practice/
│   │   │   ├── letters/page.tsx           # Letter-only practice
│   │   │   ├── page.tsx                   # Main practice interface
│   │   │   └── summary/page.tsx           # Performance summary
│   │   ├── start/page.tsx                 # Theme selection
│   │   ├── layout.tsx                     # Root layout
│   │   ├── page.tsx                       # Redirect to landing
│   │   └── providers.tsx                  # Client providers
│   ├── components/
│   │   ├── landing/                       # Landing page components
│   │   ├── seo/
│   │   │   └── json-ld.tsx               # Structured data
│   │   ├── summary/                       # Summary page components
│   │   ├── typing/
│   │   │   ├── KeyboardVisual.tsx        # Visual keyboard
│   │   │   ├── FingerLegend.tsx          # Finger position legend
│   │   │   ├── HandsOverlay.tsx          # SVG hands overlay
│   │   │   ├── StatsDisplay.tsx          # Real-time stats
│   │   │   └── TextDisplay.tsx           # Typing text display
│   │   └── ui/                           # shadcn/ui components
│   ├── hooks/
│   │   ├── useAudioContext.ts            # Audio feedback
│   │   ├── useGameStats.ts               # WPM/accuracy calculations
│   │   └── useTypingGame.ts              # Typing game logic
│   ├── lib/
│   │   ├── lesson/
│   │   │   ├── descriptions.ts           # Level descriptions
│   │   │   ├── generator.ts              # AI lesson generation
│   │   │   └── normalizer.ts             # Content normalization
│   │   ├── constants.ts                  # Keyboard layout constants
│   │   ├── default-lessons.ts            # Guest lessons
│   │   ├── gemini.ts                     # Gemini API client
│   │   ├── keyboard.ts                   # Keyboard utilities
│   │   ├── redis.ts                      # Auth code storage
│   │   ├── stats.ts                      # Statistics helpers
│   │   ├── theme-validation.ts           # Theme safety checks
│   │   └── user-profile.ts               # localStorage helpers
│   ├── types/
│   │   ├── lesson.ts                     # Lesson type definitions
│   │   └── summary.ts                    # Summary type definitions
│   ├── auth.ts                           # NextAuth configuration
│   └── proxy.ts                          # CORS middleware
├── package.json
├── tsconfig.json
├── biome.json                            # Biome configuration
└── README.md
```

## API Endpoints

### POST `/api/auth/request-code`

Generates and sends a 6-digit one-time password via email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true
}
```

**Rate Limiting**: 5 requests per 5 minutes per email address

### POST `/api/auth/[...nextauth]`

NextAuth.js authentication handler for verifying one-time codes.

### POST `/api/generate-lessons`

Generates personalized typing lessons based on a theme using Gemini AI.

**Authentication**: Requires valid NextAuth session

**Request Body:**
```json
{
  "theme": "Science"
}
```

**Response:**
```json
{
  "lessons": [
    {
      "type": "letters",
      "level": 1,
      "content": ["s", "c", "i", "e", "n", ...]
    },
    {
      "type": "words",
      "level": 2,
      "content": ["atom", "molecule", "electron", ...]
    },
    {
      "type": "sentences",
      "level": 3,
      "content": ["Science explores the natural world.", ...]
    },
    {
      "type": "paragraphs",
      "level": 4,
      "content": ["Scientists study phenomena through...", ...]
    }
  ]
}
```

**Theme Validation**: 3-64 characters, alphanumeric with spaces/hyphens, family-friendly content check

### GET `/api/og`

Generates Open Graph preview image for social media sharing.

**Response**: 1200x630px PNG image

## Storage Strategy

### localStorage (Persistent)
- User display name
- Selected theme preferences

### sessionStorage (Per-Session)
- Current lesson content
- Letter practice completion status
- Practice session summary

### Redis (10-minute TTL)
- One-time authentication codes (SHA-256 hashed)
- Rate limiting counters

## Security Features

- **Rate Limiting**: 5 authentication attempts per 5 minutes per email
- **Timing-Safe Comparison**: Constant-time hash comparison for login codes
- **Theme Validation**: Regex-based content filtering for family-friendly themes
- **SHA-256 Hashing**: Secure storage of authentication codes
- **CORS Protection**: Origin validation for API endpoints
- **Input Sanitization**: Zod schema validation on all API inputs

## Performance Optimizations

- Memoized React components with `React.memo`
- Efficient event handlers with `useCallback` and `useMemo`
- Optimized SVG rendering for keyboard visualization
- Debounced API calls with retry logic
- Arrow functions throughout for cleaner syntax
- Turbopack for fast development builds
- Edge runtime for Open Graph image generation

## SEO Features

- **Metadata**: Comprehensive title, description, keywords
- **Open Graph**: Social media preview cards with custom image
- **Twitter Cards**: Optimized Twitter sharing previews
- **JSON-LD**: Structured data for search engines
- **Canonical URLs**: Proper URL canonicalization
- **Robots.txt**: Search engine crawling directives
- **Sitemap**: Auto-generated XML sitemap

## Development

### Available Scripts

- `bun run dev` - Start development server with Turbopack
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run Biome linter
- `bun run format` - Format code with Biome
- `bun test` - Run unit tests

### Code Style

- TypeScript with strict mode enabled
- Arrow functions preferred over function declarations
- Type definitions using `type` over `interface`
- No inline comments (self-documenting code)
- Biome for linting and formatting
- Small, testable utility functions

### Testing

Run the test suite:
```bash
bun test
```

Tests include:
- Unit tests for keyboard utilities (`lib/keyboard.test.ts`)
- API route tests (`app/api/generate-lessons/route.test.ts`)
- 100% coverage for critical paths

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google AI API key for lesson generation |
| `NEXTAUTH_SECRET` | Yes | Random string for JWT signing (32+ chars) |
| `UPSTASH_REDIS_REST_URL` | Yes | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | Upstash Redis authentication token |
| `RESEND_API_KEY` | No* | Resend API key for email delivery |
| `EMAIL_FROM` | Yes | Sender email address for auth codes |
| `ALLOWED_ORIGINS` | No | Comma-separated CORS allowed origins |

\* Required in production; optional locally (codes logged to console)

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in project settings
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
bun run build
bun run start
```

## Common Issues

### SessionStorage Clearing
Letters progress resets if user navigates back to `/start`. This is intentional to allow theme changes.

### Audio Context
Audio feedback requires user gesture before initialization. Handled automatically in `useAudioContext`.

### Keyboard Position Calculation
X/Y coordinates depend on row-specific offsets. See `lib/keyboard.ts` for details.

### Rate Limiting
Redis errors automatically fallback to in-memory storage. Check `lib/redis.ts` for implementation.

### Theme Validation
Regex requires word boundaries for blocked terms. See `lib/theme-validation.ts` for rules.

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for new functionality
4. Commit your changes (`git commit -m 'Add feature description'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a pull request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Keyboard layout image from [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Keyboard_layout_english_fingers.png) (CC BY-SA 3.0)
- [shadcn/ui](https://ui.shadcn.com) for beautiful component primitives
- [Google Gemini](https://ai.google.dev) for AI-powered content generation
- [Upstash](https://upstash.com) for serverless Redis
- [Resend](https://resend.com) for transactional email delivery

## Support

For issues, questions, or suggestions, please open an issue on [GitHub](https://github.com/ragaeeb/keystorm/issues).

---

Made with ❤️ by [Ragaeeb Haq](https://github.com/ragaeeb)
